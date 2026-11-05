// Minesweeper engine: board geometry, flood fill, chording, and a generator
// that only deals boards logic can clear, so you never have to guess.
// Plain JS so the check next to it runs under bare node.

export const MODES = {
    easy: { w: 9, h: 9, mines: 10 },
    medium: { w: 16, h: 16, mines: 40 },
    hard: { w: 30, h: 16, mines: 99 },
};

/* What the player sees on each square. */
export const HIDDEN = 0;
export const OPEN = 1;
export const FLAG = 2;

/** The up to 8 squares touching i. */
export function around(w, h, i) {
    const r = Math.floor(i / w);
    const c = i % w;
    const out = [];
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if ((dr || dc) && rr >= 0 && rr < h && cc >= 0 && cc < w) out.push(rr * w + cc);
        }
    return out;
}

/**
 * A board from its mines (1 = mine): adds each square's neighbor count.
 * @param {number} w @param {number} h @param {number[]} mines
 */
export function board(w, h, mines) {
    return { w, h, mines, nums: mines.map((_, i) => around(w, h, i).filter((j) => mines[j]).length) };
}

/**
 * Opens squares, flooding out through zeros. Flags stay shut.
 * @param {ReturnType<typeof board>} b @param {number[]} shown @param {number[]} starts
 * @returns {number[]}
 */
export function reveal(b, shown, starts) {
    const next = shown.slice();
    const stack = [...starts];
    while (stack.length) {
        const i = stack.pop();
        if (next[i] !== HIDDEN) continue;
        next[i] = OPEN;
        if (!b.mines[i] && !b.nums[i]) stack.push(...around(b.w, b.h, i));
    }
    return next;
}

/**
 * Clicking an open number whose flags are all placed opens the rest around it.
 * @param {ReturnType<typeof board>} b @param {number[]} shown @param {number} i
 * @returns {number[]}
 */
export function chord(b, shown, i) {
    const near = around(b.w, b.h, i);
    if (shown[i] !== OPEN || !b.nums[i] || near.filter((j) => shown[j] === FLAG).length !== b.nums[i]) return shown;
    return reveal(b, shown, near);
}

export const lost = (b, shown) => shown.some((s, i) => s === OPEN && b.mines[i]);
export const won = (b, shown) => shown.every((s, i) => b.mines[i] || s === OPEN);

/**
 * Whether the board clears from `start` by logic alone: a number whose mines
 * are all found frees its other squares, one with as many hidden squares as
 * mines left flags them all, and where one number's hidden squares sit inside
 * another's, the difference is solved the same way.
 */
export function solvable(b, start) {
    const { w, h, nums } = b;
    let shown = reveal(b, Array(w * h).fill(HIDDEN), [start]);
    for (;;) {
        // Each open number: its unknown neighbors and how many mines are among them.
        const rules = [];
        shown.forEach((s, i) => {
            if (s !== OPEN || !nums[i]) return;
            const near = around(w, h, i);
            const cells = near.filter((j) => shown[j] === HIDDEN);
            if (cells.length) rules.push({ cells, need: nums[i] - near.filter((j) => shown[j] === FLAG).length });
        });
        const safe = new Set();
        const flag = new Set();
        const settle = (cells, need) => {
            if (need === 0) cells.forEach((j) => safe.add(j));
            else if (need === cells.length) cells.forEach((j) => flag.add(j));
        };
        for (const r of rules) settle(r.cells, r.need);
        // ponytail: pairwise subsets only, no global mine count or deeper search;
        // add those if boards ever feel too easy.
        if (!safe.size && !flag.size)
            for (const a of rules)
                for (const b2 of rules) {
                    if (a === b2 || a.cells.length >= b2.cells.length || !a.cells.every((j) => b2.cells.includes(j))) continue;
                    settle(b2.cells.filter((j) => !a.cells.includes(j)), b2.need - a.need);
                }
        if (!safe.size && !flag.size) return won(b, shown);
        shown = shown.map((s, i) => (flag.has(i) ? FLAG : s));
        shown = reveal(b, shown, [...safe]);
    }
}

/** Mines anywhere but `start` and its neighbors, so the first click opens an area. */
export function layMines(w, h, count, start, rand = Math.random) {
    const keep = new Set([start, ...around(w, h, start)]);
    const spots = Array.from({ length: w * h }, (_, i) => i).filter((i) => !keep.has(i));
    for (let i = spots.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    const mines = Array(w * h).fill(0);
    for (const i of spots.slice(0, count)) mines[i] = 1;
    return mines;
}

/** A board for `mode` that clears from the first click without guessing. */
export function generate(mode, start, rand = Math.random) {
    const { w, h, mines } = MODES[mode];
    let b = board(w, h, layMines(w, h, mines, start, rand));
    // ponytail: after 2000 misses, deal the last board even if it needs a guess.
    for (let n = 1; n < 2000 && !solvable(b, start); n++) b = board(w, h, layMines(w, h, mines, start, rand));
    return b;
}
