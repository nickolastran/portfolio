// Freeform crossword generator: every new word has to cross one already on the
// board, the way you'd build a puzzle by hand on graph paper. Plain JS so the
// check next to it runs under bare node.
import { EASY, HARD } from "../constants/crossword-words.mjs";

export const MODES = {
    easy: { bank: EASY, count: 7, size: 9 },
    hard: { bank: HARD, count: 14, size: 13 },
};

const parse = (bank) =>
    bank
        .trim()
        .split("\n")
        .map((line) => {
            const [answer, ...clue] = line.trim().split(" ");
            return { answer, clue: clue.join(" ") };
        });

const STEP = { across: [0, 1], down: [1, 0] };

function attempt(pool, count, size, rand) {
    const cells = new Map(); // "r,c" -> { ch, dirs }
    const placed = [];
    let box = null;
    const get = (r, c) => cells.get(`${r},${c}`);

    // Crossings for a placement, or -1 when it would clash, touch a parallel
    // word, or push the board past `size`.
    const score = (answer, r, c, dir) => {
        const [dr, dc] = STEP[dir];
        const n = answer.length;
        if (get(r - dr, c - dc) || get(r + dr * n, c + dc * n)) return -1;
        let cross = 0;
        for (let k = 0; k < n; k++) {
            const rr = r + dr * k;
            const cc = c + dc * k;
            const cell = get(rr, cc);
            if (cell) {
                if (cell.ch !== answer[k] || cell.dirs.includes(dir)) return -1;
                cross++;
            } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
        }
        if (box) {
            const r1 = Math.max(box.r1, r + dr * (n - 1));
            const c1 = Math.max(box.c1, c + dc * (n - 1));
            if (r1 - Math.min(box.r0, r) >= size || c1 - Math.min(box.c0, c) >= size) return -1;
        }
        return cross;
    };

    const place = (word, r, c, dir) => {
        const [dr, dc] = STEP[dir];
        for (let k = 0; k < word.answer.length; k++) {
            const key = `${r + dr * k},${c + dc * k}`;
            const cell = cells.get(key) ?? { ch: word.answer[k], dirs: [] };
            cell.dirs.push(dir);
            cells.set(key, cell);
        }
        const end = [r + dr * (word.answer.length - 1), c + dc * (word.answer.length - 1)];
        box = box
            ? { r0: Math.min(box.r0, r), c0: Math.min(box.c0, c), r1: Math.max(box.r1, end[0]), c1: Math.max(box.c1, end[1]) }
            : { r0: r, c0: c, r1: end[0], c1: end[1] };
        placed.push({ ...word, r, c, dir });
    };

    const first = pool.find((w) => w.answer.length <= size);
    place(first, 0, 0, rand() < 0.5 ? "across" : "down");

    for (const word of pool) {
        if (placed.length >= count) break;
        if (word === first) continue;
        let best = null;
        for (const [key, cell] of cells) {
            if (cell.dirs.length > 1) continue;
            const dir = cell.dirs[0] === "across" ? "down" : "across";
            const [cr, cc] = key.split(",").map(Number);
            const [dr, dc] = STEP[dir];
            for (let k = 0; k < word.answer.length; k++) {
                if (word.answer[k] !== cell.ch) continue;
                const r = cr - dr * k;
                const c = cc - dc * k;
                const s = score(word.answer, r, c, dir) + rand() * 0.5;
                if (s >= 1 && (!best || s > best.s)) best = { r, c, dir, s };
            }
        }
        if (best) place(word, best.r, best.c, best.dir);
    }
    return { placed, box };
}

/** A fresh puzzle: answers shifted to start at 0,0 and numbered in reading order. */
export function generate(mode, rand = Math.random) {
    const { bank, count, size } = MODES[mode];
    const words = parse(bank);
    let best = null;
    for (let i = 0; i < 40 && !(best?.placed.length >= count); i++) {
        // Fisher–Yates, so every puzzle draws a different slice of the bank.
        const pool = [...words];
        for (let j = pool.length - 1; j > 0; j--) {
            const k = Math.floor(rand() * (j + 1));
            [pool[j], pool[k]] = [pool[k], pool[j]];
        }
        const out = attempt(pool, count, size, rand);
        if (!best || out.placed.length > best.placed.length) best = out;
    }
    const { placed, box } = best;
    const starts = [...new Set(placed.map((w) => (w.r - box.r0) * size + (w.c - box.c0)))].sort((a, b) => a - b);
    return {
        w: box.c1 - box.c0 + 1,
        h: box.r1 - box.r0 + 1,
        words: placed
            .map((w) => ({
                answer: w.answer,
                clue: w.clue,
                dir: w.dir,
                r: w.r - box.r0,
                c: w.c - box.c0,
                num: starts.indexOf((w.r - box.r0) * size + (w.c - box.c0)) + 1,
            }))
            .sort((a, b) => a.num - b.num),
    };
}
