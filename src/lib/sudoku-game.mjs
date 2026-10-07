// Board state for a game in progress: digits, pencil marks, hint locks, and an
// undo/redo history of all three. Every action returns a new game object and
// leaves the old one alone, so React state and saved JSON both just work.
import { bit, candidates, hashSeed, mulberry32, PEERS, UNITS } from "./sudoku.mjs";

export function createGame(puzzle, solution) {
    return {
        givens: puzzle.slice(),
        solution: solution.slice(),
        values: puzzle.slice(),
        notes: Array(81).fill(0),
        hinted: /** @type {number[]} */ ([]),
        past: /** @type {{ values: number[], notes: number[], hinted: number[] }[]} */ ([]),
        future: /** @type {{ values: number[], notes: number[], hinted: number[] }[]} */ ([]),
        mistakes: 0,
    };
}

const snapshot = (g) => ({ values: g.values, notes: g.notes, hinted: g.hinted });
const commit = (g, next) => ({ ...g, ...next, past: [...g.past, snapshot(g)], future: [] });

export const isLocked = (g, cell) => g.givens[cell] !== 0 || g.hinted.includes(cell);
export const isSolved = (g) => g.values.every((v, i) => v === g.solution[i]);

const without = (notes, cell, d) => {
    const next = notes.slice();
    for (const p of PEERS[cell]) next[p] &= ~bit(d);
    return next;
};

/**
 * Puts `d` in `cell`, or clears it if it's already there. With `autoRemove`
 * (or auto-candidates on) the digit leaves the notes of every peer.
 */
export function place(g, cell, d, { autoRemove = true, auto = false } = {}) {
    if (isLocked(g, cell)) return g;
    if (g.values[cell] === d) return erase(g, cell, { auto });
    const values = g.values.slice();
    values[cell] = d;
    const notes = autoRemove || auto ? without(g.notes, cell, d) : g.notes.slice();
    notes[cell] = 0;
    return { ...commit(g, { values, notes }), mistakes: g.mistakes + (d !== g.solution[cell]) };
}

export function toggleNote(g, cell, d) {
    if (isLocked(g, cell) || g.values[cell]) return g;
    const notes = g.notes.slice();
    notes[cell] ^= bit(d);
    return commit(g, { notes });
}

/**
 * Clears a digit, else the notes. With auto-candidates on, the cell gets its
 * candidates back, and so does every peer the digit was blocking.
 */
export function erase(g, cell, { auto = false } = {}) {
    if (isLocked(g, cell)) return g;
    const d = g.values[cell];
    if (!d) return g.notes[cell] ? commit(g, { notes: Object.assign(g.notes.slice(), { [cell]: 0 }) }) : g;
    const values = g.values.slice();
    values[cell] = 0;
    const notes = g.notes.slice();
    if (auto) {
        const legal = candidates(values);
        notes[cell] = legal[cell];
        for (const p of PEERS[cell]) if (legal[p] & bit(d)) notes[p] |= bit(d);
    }
    return commit(g, { values, notes });
}

/** Auto-candidates: every empty cell gets exactly its legal digits. */
export const fillCandidates = (g) => commit(g, { notes: candidates(g.values) });

/** A hint is a correct digit that then stays locked, like a given. */
export function applyHint(g, cell, d) {
    const values = g.values.slice();
    values[cell] = d;
    const notes = without(g.notes, cell, d);
    notes[cell] = 0;
    return commit(g, { values, notes, hinted: [...g.hinted, cell] });
}

export function undo(g) {
    if (!g.past.length) return g;
    return { ...g, ...g.past.at(-1), past: g.past.slice(0, -1), future: [...g.future, snapshot(g)] };
}

export function redo(g) {
    if (!g.future.length) return g;
    return { ...g, ...g.future.at(-1), future: g.future.slice(0, -1), past: [...g.past, snapshot(g)] };
}

/** Cells whose digit repeats somewhere in their row, column, or box. */
export function conflicts(values) {
    const bad = new Set();
    for (const unit of UNITS)
        for (const a of unit)
            for (const b of unit) if (a < b && values[a] && values[a] === values[b]) bad.add(a).add(b);
    return bad;
}

/** Indexes of units filled in correctly. */
export const completeUnits = (g) =>
    UNITS.flatMap((cells, u) => (cells.every((c) => g.values[c] === g.solution[c]) ? [u] : []));

/** How many of each digit 1-9 are still to place (index 0 unused). */
export function remaining(values) {
    const left = Array(10).fill(9);
    for (const v of values) if (v) left[v]--;
    return left;
}

/** Empty cells where `d` isn't ruled out by a digit already on the board. */
export function couldHold(values, d) {
    const legal = candidates(values);
    return values.map((v, i) => v === d || (!v && (legal[i] & bit(d)) !== 0));
}

/* ---------- Daily streaks ---------- */

const DAY = 86_400_000;
const dayNum = (date) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY);

/**
 * Streaks from the "YYYY-MM-DD" dates a daily was solved. The current one
 * counts back from today, or from yesterday while today's is still open.
 */
export function streaks(dates, today) {
    const days = [...new Set(dates.map(dayNum))].sort((a, b) => a - b);
    let longest = 0;
    let run = 0;
    days.forEach((d, i) => {
        run = i && days[i - 1] === d - 1 ? run + 1 : 1;
        longest = Math.max(longest, run);
    });
    const have = new Set(days);
    let current = 0;
    for (let d = have.has(dayNum(today)) ? dayNum(today) : dayNum(today) - 1; have.has(d); d--) current++;
    return { current, longest };
}

/* ---------- Constellations ---------- */

const ADJ = ["Quiet", "Wandering", "Silver", "Lantern", "Hollow", "Drifting", "Ember", "Patient", "Northern", "Veiled", "Distant", "Gilded", "Sleeping", "Tidal", "Hidden", "Lucent"];
const NOUN = ["Heron", "Kite", "Lyre", "Fox", "Compass", "Moth", "Anchor", "Crown", "Serpent", "Lamp", "Bell", "Archer", "Wren", "Key", "Whale", "Loom"];

/**
 * The puzzle's own constellation: 6-9 stars, spread apart and joined by a
 * minimum spanning tree (plus maybe one loop), the way star maps draw them.
 * Stars sit on the grid's inner intersections, 1 to 8 in cell units, so they
 * never cover a digit.
 */
export function constellation(seed) {
    const rng = mulberry32(hashSeed(`stars:${seed}`));
    const want = 6 + Math.floor(rng() * 4);
    const stars = [];
    for (let tries = 0; stars.length < want && tries < 500; tries++) {
        const p = { x: 1 + Math.floor(rng() * 8), y: 1 + Math.floor(rng() * 8), mag: rng() };
        if (stars.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= 2)) stars.push(p);
    }
    const dist = (a, b) => Math.hypot(stars[a].x - stars[b].x, stars[a].y - stars[b].y);
    /** @type {[number, number][]} */
    const edges = [];
    const inTree = [0];
    while (inTree.length < stars.length) {
        /** @type {[number, number] | null} */
        let best = null;
        for (const a of inTree)
            for (let b = 0; b < stars.length; b++)
                if (!inTree.includes(b) && (!best || dist(a, b) < dist(best[0], best[1]))) best = [a, b];
        if (!best) break;
        edges.push(best);
        inTree.push(best[1]);
    }
    if (rng() < 0.4 && stars.length > 3) edges.push([inTree.at(-1), inTree.at(-3)]);
    const name = `The ${ADJ[Math.floor(rng() * ADJ.length)]} ${NOUN[Math.floor(rng() * NOUN.length)]}`;
    return { name, stars, edges };
}
