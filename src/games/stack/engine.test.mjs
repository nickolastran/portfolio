// Run: node src/games/stack/engine.test.mjs
import assert from "node:assert";

import { act, fits, H, landing, newGame, speed, turn, W } from "./engine.mjs";

const bar = { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: 4 };
const dot = { cells: [[0, 0]], color: 1 };
const empty = () => Array(W * H).fill(0);
const game = (piece, r = 0, c = 0, board = empty()) => ({ board, score: 0, lines: 0, cleared: 0, next: dot, over: false, cur: { piece, r, c } });
const repeat = (g, action, n) => Array.from({ length: n }).reduce((s) => act(s, action), g);

// A new game: piece centered at the top, a next piece waiting.
const g0 = newGame();
assert.ok(!g0.over && g0.cur.r === 0 && g0.next.cells.length);
assert.ok(fits(g0.board, g0.cur.piece.cells, 0, g0.cur.c));

// Walls stop sideways moves.
assert.equal(repeat(game(bar, 0, 2), "left", 10).cur.c, 0);
assert.equal(repeat(game(bar, 0, 2), "right", 10).cur.c, W - 4);

// Turning: four quarter turns come back around, and a turn against the right wall is pulled in.
assert.deepEqual(turn(turn(turn(turn(bar.cells)))).sort(), bar.cells.slice().sort());
const tall = { cells: turn(bar.cells), color: 4 };
const turned = act(game(tall, 4, W - 1), "rotate");
assert.equal(turned.cur.piece.cells.length, 4);
assert.ok(fits(turned.board, turned.cur.piece.cells, turned.cur.r, turned.cur.c), "turned piece fits");
assert.equal(turned.cur.c, W - 4);

// Hard drop lands on the floor, scores a point per block, and brings in the next piece.
let g = act(game(bar, 0, 0), "drop");
assert.deepEqual([0, 1, 2, 3].map((k) => g.board[(H - 1) * W + k]), [4, 4, 4, 4]);
assert.equal(g.score, 4);
assert.equal(g.cur.piece, dot);

// Down moves a row, and locks once it can't.
g = game(dot, H - 2, 0);
g = act(g, "down");
assert.equal(g.cur.r, H - 1);
g = act(g, "down");
assert.equal(g.board[(H - 1) * W], 1, "locked on the floor");

// A full row clears, everything above it falls one row, and it pays 1 + 10.
const almost = empty();
for (let k = 1; k < W; k++) almost[(H - 1) * W + k] = 2;
almost[(H - 2) * W + 5] = 3;
g = act(game(dot, 0, 0, almost), "drop");
assert.equal(g.cleared, 1);
assert.equal(g.lines, 1);
assert.equal(g.score, 11);
assert.equal(g.board[(H - 1) * W + 5], 3, "the block above fell into the cleared row");
assert.equal(g.board.filter(Boolean).length, 1);

// Two rows at once pay 10 x 2².
const two = empty();
for (let k = 1; k < W; k++) two[(H - 1) * W + k] = two[(H - 2) * W + k] = 2;
g = act(game({ cells: [[0, 0], [1, 0]], color: 5 }, 0, 0, two), "drop");
assert.equal(g.cleared, 2);
assert.equal(g.score, 2 + 40);

// The ghost: landing finds the top of the stack.
const ledge = empty();
ledge[10 * W + 2] = 1;
assert.equal(landing(game(bar, 0, 0, ledge)), 9);

// No room at the top: game over, and nothing moves after. Every row has a
// gap on the right so nothing clears; the dot fills the top-left corner.
const full = empty().map((_, i) => (i % W === W - 1 || i === 0 ? 0 : 1));
g = act(game(dot, 0, 0, full), "drop");
assert.ok(g.over);
assert.equal(act(g, "left"), g);

// Speed: never slower as lines go up, with a floor.
for (let n = 0; n < 300; n += 10) assert.ok(speed(n + 10) <= speed(n));
assert.equal(speed(10000), 80);

// A long random game never crashes or leaves a piece where it doesn't fit.
g = newGame();
for (let n = 0; n < 20000 && !g.over; n++) {
    g = act(g, ["left", "right", "rotate", "down", "drop"][n % 5]);
    if (!g.over) assert.ok(fits(g.board, g.cur.piece.cells, g.cur.r, g.cur.c));
}

console.log("stack: all checks passed");
