// Stack engine: Blocks shapes fall onto an 8-wide well; full rows clear.
// Every move is a pure step from one game to the next, so the check next to
// it runs under bare node.

import { dims, randomPiece } from "../blocks/engine.mjs";

export const W = 8;
export const H = 16;

/** Quarter turn clockwise; stays anchored at 0,0. */
export const turn = (cells) => {
    const h = Math.max(...cells.map(([r]) => r)) + 1;
    return cells.map(([r, c]) => [c, h - 1 - r]);
};

/** Whether the cells fit with their top-left corner at r, c. */
export const fits = (board, cells, r, c) =>
    cells.every(([dr, dc]) => {
        const rr = r + dr;
        const cc = c + dc;
        return rr >= 0 && rr < H && cc >= 0 && cc < W && !board[rr * W + cc];
    });

/** The row the falling piece would land on. */
export function landing(g) {
    let r = g.cur.r;
    while (fits(g.board, g.cur.piece.cells, r + 1, g.cur.c)) r++;
    return r;
}

/** Milliseconds per row: a little faster every 10 lines. */
export const speed = (lines) => Math.max(80, Math.round(800 * 0.85 ** Math.floor(lines / 10)));

/** Brings the next piece in at the top; no room for it ends the game. */
function enter(g, rand) {
    const piece = g.next;
    const c = (W - dims(piece).w) >> 1;
    return { ...g, cur: { piece, r: 0, c }, next: randomPiece(rand), over: !fits(g.board, piece.cells, 0, c) };
}

export const newGame = (rand = Math.random) =>
    enter({ board: Array(W * H).fill(0), score: 0, lines: 0, cleared: 0, next: randomPiece(rand), over: false }, rand);

/**
 * Sets the piece down and clears full rows. A point per block, plus
 * 10 x rows² for clears, the same as Blocks.
 */
function lock(g, rand) {
    const { piece, r, c } = g.cur;
    const board = g.board.slice();
    for (const [dr, dc] of piece.cells) board[(r + dr) * W + c + dc] = piece.color;
    const rows = Array.from({ length: H }, (_, i) => board.slice(i * W, i * W + W));
    const kept = rows.filter((row) => row.some((v) => !v));
    const cleared = H - kept.length;
    const next = [...Array(cleared * W).fill(0), ...kept.flat()];
    return enter({ ...g, board: next, score: g.score + piece.cells.length + 10 * cleared ** 2, lines: g.lines + cleared, cleared }, rand);
}

/** One step: "left", "right", "rotate", "down" (a row, locking when it can't) or "drop" (all the way). */
export function act(g, action, rand = Math.random) {
    if (g.over) return g;
    const { piece, r, c } = g.cur;
    const at = (cells, rr, cc) => (fits(g.board, cells, rr, cc) ? { ...g, cleared: 0, cur: { piece: { ...piece, cells }, r: rr, c: cc } } : null);
    switch (action) {
        case "left":
            return at(piece.cells, r, c - 1) ?? g;
        case "right":
            return at(piece.cells, r, c + 1) ?? g;
        case "rotate": {
            // Pulled in off the right wall, then nudged a square or two if it's blocked.
            const cells = turn(piece.cells);
            const cc = Math.min(c, W - dims({ cells }).w);
            for (const k of [0, -1, 1, -2, 2]) {
                const next = at(cells, r, cc + k);
                if (next) return next;
            }
            return g;
        }
        case "down":
            return at(piece.cells, r + 1, c) ?? lock(g, rand);
        case "drop":
            return lock({ ...g, cur: { ...g.cur, r: landing(g) } }, rand);
        default:
            return g;
    }
}
