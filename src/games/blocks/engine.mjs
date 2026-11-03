// Blocks engine: drop pieces on an 8x8 board; every full row and column
// clears. Plain JS so the check next to it runs under bare node.

export const SIZE = 8;

/* One entry per shape, as [row, col] cells; pieces come in any rotation. */
const SHAPES = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 1], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
];
/* Every shape has its own color, 1..COLORS, whatever its rotation. */
export const COLORS = SHAPES.length;

/**
 * Shifts cells so the piece's top-left corner is 0,0.
 * @param {number[][]} cells
 * @returns {[number, number][]}
 */
function normalize(cells) {
    const r0 = Math.min(...cells.map(([r]) => r));
    const c0 = Math.min(...cells.map(([, c]) => c));
    return cells.map(([r, c]) => /** @type {[number, number]} */ ([r - r0, c - c0])).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** A random shape in a random rotation, in that shape's color. */
export function randomPiece(rand = Math.random) {
    const k = Math.floor(rand() * SHAPES.length);
    let cells = SHAPES[k];
    for (let n = Math.floor(rand() * 4); n > 0; n--) cells = cells.map(([r, c]) => [c, -r]);
    return { cells: normalize(cells), color: k + 1 };
}


export const dims = (piece) => ({
    h: Math.max(...piece.cells.map(([r]) => r)) + 1,
    w: Math.max(...piece.cells.map(([, c]) => c)) + 1,
});

/** Whether the piece fits with its top-left corner at r, c. */
export const fits = (board, piece, r, c) =>
    piece.cells.every(([dr, dc]) => {
        const rr = r + dr;
        const cc = c + dc;
        return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && !board[rr * SIZE + cc];
    });

export function canMove(board, piece) {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (fits(board, piece, r, c)) return true;
    return false;
}

/**
 * Drops a piece that fits, then clears every full row and column. A point per
 * block placed, plus 10 x lines² for clears, so clearing several at once pays.
 */
export function place(board, piece, r, c) {
    const next = board.slice();
    for (const [dr, dc] of piece.cells) next[(r + dr) * SIZE + c + dc] = piece.color;
    const full = [];
    for (let i = 0; i < SIZE; i++) {
        const row = Array.from({ length: SIZE }, (_, k) => i * SIZE + k);
        const col = Array.from({ length: SIZE }, (_, k) => k * SIZE + i);
        if (row.every((j) => next[j])) full.push(row);
        if (col.every((j) => next[j])) full.push(col);
    }
    const cleared = [...new Set(full.flat())];
    for (const j of cleared) next[j] = 0;
    return { board: next, cleared, lines: full.length, points: piece.cells.length + 10 * full.length ** 2 };
}

/** Whether every piece can be placed, in some order, counting clears between drops. */
export function solvable(board, pieces) {
    if (!pieces.length) return true;
    return pieces.some((p, i) => {
        const rest = pieces.filter((_, j) => j !== i);
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++) if (fits(board, p, r, c) && solvable(place(board, p, r, c).board, rest)) return true;
        return false;
    });
}

/** Three pieces that can all be placed on `board`, so every round is winnable. */
export function deal(board = Array(SIZE * SIZE).fill(0), rand = Math.random) {
    for (let n = 0; n < 50; n++) {
        const pieces = [randomPiece(rand), randomPiece(rand), randomPiece(rand)];
        if (solvable(board, pieces)) return pieces;
    }
    // ponytail: a board too crowded for 50 random draws gets three single
    // blocks, which fit whenever anything can; pick smarter pieces if it feels cheap.
    const dot = { cells: [/** @type {[number, number]} */ ([0, 0])], color: 1 };
    return [dot, dot, dot];
}
