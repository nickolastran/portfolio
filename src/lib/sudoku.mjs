// Sudoku engine: board geometry, a solver that works like a person (easiest
// technique first, logging the hardest one it needed), and a seeded generator
// that keeps carving clues until the puzzle grades into the tier asked for.
// Plain JS so the check next to it runs under bare node and the worker can
// import it as-is.

/* ---------- Board geometry ---------- */

export const ALL = 0x1ff;
export const bit = (d) => 1 << (d - 1);
export const popcount = (m) => {
    let n = 0;
    for (; m; n++) m &= m - 1;
    return n;
};
export const digitsOf = (m) => {
    const out = [];
    for (let d = 1; d <= 9; d++) if (m & bit(d)) out.push(d);
    return out;
};

export const rowOf = (i) => Math.floor(i / 9);
export const colOf = (i) => i % 9;
export const boxOf = (i) => 3 * Math.floor(rowOf(i) / 3) + Math.floor(colOf(i) / 3);

// 27 units: rows 0-8, columns 9-17, boxes 18-26.
export const UNITS = [
    ...Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, k) => r * 9 + k)),
    ...Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, k) => k * 9 + c)),
    ...Array.from({ length: 9 }, (_, b) =>
        Array.from({ length: 9 }, (_, k) => (3 * Math.floor(b / 3) + Math.floor(k / 3)) * 9 + 3 * (b % 3) + (k % 3)),
    ),
];
export const UNITS_OF = Array.from({ length: 81 }, (_, i) => [rowOf(i), 9 + colOf(i), 18 + boxOf(i)]);
export const PEERS = Array.from({ length: 81 }, (_, i) => [
    ...new Set(UNITS_OF[i].flatMap((u) => UNITS[u]).filter((j) => j !== i)),
]);
const SEES = new Uint8Array(81 * 81);
PEERS.forEach((ps, i) => ps.forEach((j) => (SEES[i * 81 + j] = 1)));
export const sees = (a, b) => SEES[a * 81 + b] === 1;

export const unitName = (u) => `${["row", "column", "box"][Math.floor(u / 9)]} ${(u % 9) + 1}`;

/** Pencil marks for every empty cell: whatever no peer already holds. */
export function candidates(grid) {
    return grid.map((v, i) => {
        if (v) return 0;
        let m = ALL;
        for (const p of PEERS[i]) if (grid[p]) m &= ~bit(grid[p]);
        return m;
    });
}

/* ---------- Techniques ---------- */

export const TECHNIQUES = {
    nakedSingle: {
        name: "Naked single",
        level: 1,
        about: "A cell where every digit but one already appears in its row, column, or box. The one left over must go there.",
    },
    hiddenSingle: {
        name: "Hidden single",
        level: 1,
        about: "A digit that has only one possible cell left in a row, column, or box, even if that cell has other candidates.",
    },
    nakedPair: {
        name: "Naked pair",
        level: 2,
        about: "Two cells in a unit that share the same two candidates. Those two digits must go in those two cells, so they can be crossed off everywhere else in the unit.",
    },
    hiddenPair: {
        name: "Hidden pair",
        level: 2,
        about: "Two digits that can only go in the same two cells of a unit. Those cells must hold those digits, so any other candidates in them can go.",
    },
    pointing: {
        name: "Pointing pair",
        level: 2,
        about: "When a digit's spots inside a box all sit on one row or column, the digit must land on that line within the box, so it can be removed from the rest of the line.",
    },
    boxLine: {
        name: "Box-line reduction",
        level: 2,
        about: "When a digit's spots in a row or column all fall inside one box, the digit must be there, so it can be removed from the rest of that box.",
    },
    nakedTriple: {
        name: "Naked triple",
        level: 3,
        about: "Three cells in a unit whose candidates, taken together, are just three digits. Those digits are spoken for and can be removed from the rest of the unit.",
    },
    hiddenTriple: {
        name: "Hidden triple",
        level: 3,
        about: "Three digits confined to the same three cells of a unit. Every other candidate in those cells can be removed.",
    },
    xWing: {
        name: "X-Wing",
        level: 3,
        about: "A digit with exactly two spots in each of two rows, lined up in the same two columns, forms a rectangle. It must take opposite corners, so it can be removed from the rest of those columns (or the same with rows and columns swapped).",
    },
    swordfish: {
        name: "Swordfish",
        level: 4,
        about: "The X-Wing idea across three rows and three columns: if a digit's spots in three rows all fall in the same three columns, it can be removed from the rest of those columns.",
    },
    xyWing: {
        name: "XY-Wing",
        level: 4,
        about: "A two-candidate pivot XY sees two wings, XZ and YZ. Whichever digit the pivot takes, one wing becomes Z, so any cell seeing both wings can't be Z.",
    },
    coloring: {
        name: "Simple coloring",
        level: 4,
        about: "Follow a digit through units where it has exactly two spots, alternating two colors. One color is all true and the other all false, so a cell that sees both colors, or a color that contradicts itself, gives eliminations.",
    },
};

// Tried in this order at every step, easiest first.
const ORDER = [
    ["nakedSingle", nakedSingle],
    ["hiddenSingle", hiddenSingle],
    ["pointing", pointing],
    ["boxLine", boxLine],
    ["nakedPair", (s) => nakedSubset(s, 2)],
    ["hiddenPair", (s) => hiddenSubset(s, 2)],
    ["nakedTriple", (s) => nakedSubset(s, 3)],
    ["hiddenTriple", (s) => hiddenSubset(s, 3)],
    ["xWing", (s) => fish(s, 2)],
    ["swordfish", (s) => fish(s, 3)],
    ["xyWing", xyWing],
    ["coloring", coloring],
];

function combos(arr, k, start = 0, pick = [], out = []) {
    if (pick.length === k) out.push(pick.slice());
    else
        for (let i = start; i <= arr.length - (k - pick.length); i++) {
            pick.push(arr[i]);
            combos(arr, k, i + 1, pick, out);
            pick.pop();
        }
    return out;
}

// Each technique returns a step or null. A step either places a digit
// ({ cell, digit }) or eliminates candidates ({ elim: [[cell, mask], ...] }).
const empties = (s, unit) => UNITS[unit].filter((c) => !s.grid[c]);
const withDigit = (s, cells, d) => cells.filter((c) => s.cands[c] & bit(d));

function nakedSingle(s) {
    for (let c = 0; c < 81; c++)
        if (!s.grid[c] && popcount(s.cands[c]) === 1) return { cell: c, digit: digitsOf(s.cands[c])[0] };
    return null;
}

function hiddenSingle(s) {
    // Boxes first: that's where people tend to spot them.
    for (const u of [18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]) {
        const cells = empties(s, u);
        for (let d = 1; d <= 9; d++) {
            const at = withDigit(s, cells, d);
            if (at.length === 1) return { cell: at[0], digit: d, unit: u };
        }
    }
    return null;
}

function nakedSubset(s, n) {
    for (let u = 0; u < 27; u++) {
        const cells = empties(s, u);
        const small = cells.filter((c) => popcount(s.cands[c]) <= n);
        for (const group of combos(small, n)) {
            const mask = group.reduce((m, c) => m | s.cands[c], 0);
            if (popcount(mask) !== n) continue;
            const elim = cells.filter((c) => !group.includes(c) && s.cands[c] & mask).map((c) => [c, mask]);
            if (elim.length) return { elim, unit: u, cells: group, digits: digitsOf(mask) };
        }
    }
    return null;
}

function hiddenSubset(s, n) {
    for (let u = 0; u < 27; u++) {
        const cells = empties(s, u);
        const spots = {};
        for (let d = 1; d <= 9; d++) {
            const at = withDigit(s, cells, d);
            if (at.length >= 2 && at.length <= n) spots[d] = at;
        }
        for (const ds of combos(Object.keys(spots).map(Number), n)) {
            const group = [...new Set(ds.flatMap((d) => spots[d]))];
            if (group.length !== n) continue;
            const keep = ds.reduce((m, d) => m | bit(d), 0);
            const elim = group.filter((c) => s.cands[c] & ~keep).map((c) => [c, ALL & ~keep]);
            if (elim.length) return { elim, unit: u, cells: group, digits: ds };
        }
    }
    return null;
}

// A digit's spots in one unit all lie inside another unit, so the digit can
// leave the rest of that other unit. Box -> line is "pointing", line -> box is
// box-line reduction.
function confined(s, from, to) {
    for (const u of from) {
        const cells = empties(s, u);
        for (let d = 1; d <= 9; d++) {
            const at = withDigit(s, cells, d);
            if (at.length < 2) continue;
            for (const v of to(at[0])) {
                if (v === u || !at.every((c) => UNITS_OF[c].includes(v))) continue;
                const elim = withDigit(s, empties(s, v), d)
                    .filter((c) => !UNITS[u].includes(c))
                    .map((c) => [c, bit(d)]);
                if (elim.length) return { elim, unit: u, other: v, cells: at, digits: [d] };
            }
        }
    }
    return null;
}
function pointing(s) {
    return confined(s, [18, 19, 20, 21, 22, 23, 24, 25, 26], (c) => UNITS_OF[c].slice(0, 2));
}
function boxLine(s) {
    return confined(s, [...Array(18).keys()], (c) => [UNITS_OF[c][2]]);
}

// X-Wing (n = 2) and Swordfish (n = 3): n lines whose spots for a digit fall in
// the same n cross lines claim the digit for those cross lines.
function fish(s, n) {
    for (let d = 1; d <= 9; d++)
        for (const [base, cross] of [
            [0, 9],
            [9, 0],
        ]) {
            const lines = [];
            for (let k = 0; k < 9; k++) {
                const at = withDigit(s, empties(s, base + k), d);
                if (at.length >= 2 && at.length <= n) lines.push({ k, cols: at.map((c) => (base ? rowOf(c) : colOf(c))) });
            }
            for (const group of combos(lines, n)) {
                const cols = [...new Set(group.flatMap((l) => l.cols))];
                if (cols.length !== n) continue;
                const rows = group.map((l) => l.k);
                const elim = cols
                    .flatMap((x) => withDigit(s, empties(s, cross + x), d))
                    .filter((c) => !rows.includes(base ? colOf(c) : rowOf(c)))
                    .map((c) => [c, bit(d)]);
                if (elim.length)
                    return { elim, cells: group.flatMap((l) => l.cols.map((x) => (base ? x * 9 + l.k : l.k * 9 + x))), digits: [d] };
            }
        }
    return null;
}

function xyWing(s) {
    const two = [];
    for (let c = 0; c < 81; c++) if (!s.grid[c] && popcount(s.cands[c]) === 2) two.push(c);
    for (const p of two) {
        const pm = s.cands[p];
        const wings = two.filter((w) => w !== p && sees(p, w) && popcount(s.cands[w] & pm) === 1 && s.cands[w] !== pm);
        for (const [a, b] of combos(wings, 2)) {
            const za = s.cands[a] & ~pm;
            if ((s.cands[a] & pm) === (s.cands[b] & pm) || za !== (s.cands[b] & ~pm)) continue;
            const elim = [];
            for (let c = 0; c < 81; c++)
                if (c !== a && c !== b && !s.grid[c] && s.cands[c] & za && sees(c, a) && sees(c, b)) elim.push([c, za]);
            if (elim.length) return { elim, cells: [p, a, b], digits: digitsOf(za) };
        }
    }
    return null;
}

function coloring(s) {
    for (let d = 1; d <= 9; d++) {
        const links = new Map();
        for (let u = 0; u < 27; u++) {
            const at = withDigit(s, empties(s, u), d);
            if (at.length !== 2) continue;
            for (const [x, y] of [at, [at[1], at[0]]]) {
                if (!links.has(x)) links.set(x, []);
                links.get(x).push(y);
            }
        }
        const color = new Map();
        for (const start of links.keys()) {
            if (color.has(start)) continue;
            const chain = [start];
            color.set(start, 0);
            for (let k = 0; k < chain.length; k++)
                for (const next of links.get(chain[k]))
                    if (!color.has(next)) {
                        color.set(next, 1 - color.get(chain[k]));
                        chain.push(next);
                    }
            if (chain.length < 3) continue; // a lone pair is just a hidden-single setup
            const side = [0, 1].map((k) => chain.filter((c) => color.get(c) === k));
            // Color wrap: two cells of one color see each other, so that color is false.
            for (const cells of side)
                if (cells.some((a) => cells.some((b) => a !== b && sees(a, b))))
                    return { elim: cells.map((c) => [c, bit(d)]), cells: chain, digits: [d] };
            // Color trap: a cell seeing both colors can't be the digit.
            const elim = [];
            for (let c = 0; c < 81; c++)
                if (!s.grid[c] && s.cands[c] & bit(d) && !color.has(c) && side.every((cells) => cells.some((x) => sees(c, x))))
                    elim.push([c, bit(d)]);
            if (elim.length) return { elim, cells: chain, digits: [d] };
        }
    }
    return null;
}

/* ---------- Solver ---------- */

function apply(s, step) {
    if (step.elim) for (const [c, m] of step.elim) s.cands[c] &= ~m;
    else {
        s.grid[step.cell] = step.digit;
        s.cands[step.cell] = 0;
        for (const p of PEERS[step.cell]) s.cands[p] &= ~bit(step.digit);
    }
}

/** The easiest step available from a { grid, cands } position, if any. */
export function next(s, maxLevel = 4) {
    for (const [id, find] of ORDER) {
        if (TECHNIQUES[id].level > maxLevel) continue;
        const step = find(s);
        if (step) return { id, ...step };
    }
    return null;
}

/**
 * Solve with techniques up to `maxLevel`. Every technique only removes
 * candidates, so once the easier ones stall, no reordering of them would get
 * further: the hardest level used is the least the puzzle needs.
 */
export function solve(grid, maxLevel = 4) {
    const s = { grid: grid.slice(), cands: candidates(grid) };
    const used = [];
    let level = 0;
    for (;;) {
        if (!s.grid.includes(0)) return { solved: true, level, used, grid: s.grid };
        const step = next(s, maxLevel);
        if (!step) return { solved: false, level, used, grid: s.grid };
        if (!used.includes(step.id)) used.push(step.id);
        level = Math.max(level, TECHNIQUES[step.id].level);
        apply(s, step);
    }
}

/** Counts solutions by backtracking, stopping at `limit`. */
export function countSolutions(grid, limit = 2) {
    const g = grid.slice();
    let found = 0;
    const go = () => {
        let best = -1;
        let bestMask = 0;
        let bestN = 10;
        for (let c = 0; c < 81; c++) {
            if (g[c]) continue;
            let m = ALL;
            for (const p of PEERS[c]) if (g[p]) m &= ~bit(g[p]);
            const n = popcount(m);
            if (n < bestN) [best, bestMask, bestN] = [c, m, n];
            if (n === 0) return;
        }
        if (best < 0) return void found++;
        for (const d of digitsOf(bestMask)) {
            g[best] = d;
            go();
            if (found >= limit) break;
        }
        g[best] = 0;
    };
    go();
    return found;
}

/**
 * The next digit a person could find from here, and how. Wrong entries are
 * ignored (treated as empty), and the player's own notes aren't trusted.
 * Elimination steps on the way are returned in `via`, so the explanation can
 * mention them.
 */
export function findHint(values, solution) {
    const grid = values.map((v, i) => (v === solution[i] ? v : 0));
    const s = { grid, cands: candidates(grid) };
    const via = [];
    for (let step; (step = next(s, 4)); apply(s, step)) {
        if (!step.elim) return { ...step, digit: solution[step.cell], via };
        if (!via.includes(step.id)) via.push(step.id);
    }
    const cell = values.findIndex((v, i) => v !== solution[i]);
    return cell < 0 ? null : { id: null, cell, digit: solution[cell], via };
}

export function describeHint(h) {
    const where = `row ${rowOf(h.cell) + 1}, column ${colOf(h.cell) + 1}`;
    if (!h.id) return `No standard technique cracks this position, so here's ${h.digit} from the solution at ${where}.`;
    const lead = h.via.length
        ? `Once a ${h.via.map((id) => TECHNIQUES[id].name.toLowerCase()).join(" and a ")} clears some candidates, `
        : "";
    const body =
        h.id === "nakedSingle"
            ? `${h.digit} is the only digit that fits at ${where}`
            : `${where} is the only place left for ${h.digit} in ${unitName(h.unit)}`;
    const text = `${lead}${body}.`;
    return `${TECHNIQUES[h.id].name}: ${text[0].toUpperCase()}${text.slice(1)}`;
}

/* ---------- Generator ---------- */

/** Small, fast, seedable PRNG. Same seed, same puzzle, in every browser. */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** FNV-1a: turns "2026-10-07:hard" into a seed. */
export function hashSeed(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
    return h >>> 0;
}

function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function randomSolution(rng) {
    const g = Array(81).fill(0);
    const fill = (c) => {
        if (c === 81) return true;
        let m = ALL;
        for (const p of PEERS[c]) if (g[p]) m &= ~bit(g[p]);
        for (const d of shuffle(digitsOf(m), rng)) {
            g[c] = d;
            if (fill(c + 1)) return true;
        }
        g[c] = 0;
        return false;
    };
    fill(0);
    return g;
}

export const DIFFICULTIES = ["easy", "medium", "hard", "expert"];
export const TIERS = {
    easy: { level: 1, clues: [36, 40] },
    medium: { level: 2, clues: [30, 35] },
    hard: { level: 3, clues: [26, 30] },
    expert: { level: 4, clues: [22, 26] },
};

/**
 * A puzzle that needs exactly the tier's techniques. Clues come out in
 * mirrored pairs (180° symmetry), and only while the puzzle stays solvable
 * with the tier's techniques, which also keeps the solution unique: logic
 * that only ever removes impossible candidates can't arrive at two answers.
 */
export function generate(difficulty, seed) {
    const { level, clues: [lo, hi] } = TIERS[difficulty];
    const rng = mulberry32(seed);
    for (;;) {
        const solution = randomSolution(rng);
        const puzzle = solution.slice();
        const target = lo + Math.floor(rng() * (hi - lo + 1));
        let clues = 81;
        let result = null;
        for (const c of shuffle([...Array(41).keys()], rng)) {
            const pair = c === 40 ? [40] : [c, 80 - c];
            if (clues - pair.length < lo) continue;
            for (const p of pair) puzzle[p] = 0;
            const r = solve(puzzle, level);
            if (!r.solved) {
                for (const p of pair) puzzle[p] = solution[p];
                continue;
            }
            clues -= pair.length;
            result = r;
            if (clues <= target && r.level === level) break;
        }
        if (result?.level === level && clues <= hi) return { puzzle, solution, seed, difficulty, clues, techniques: result.used };
    }
}
