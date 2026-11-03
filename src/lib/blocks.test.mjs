// Run: node src/lib/blocks.test.mjs
import assert from "node:assert";

import { canMove, COLORS, deal, dims, fits, place, randomPiece, SIZE, solvable } from "./blocks.mjs";

const empty = () => Array(SIZE * SIZE).fill(0);
const bar = { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: 1 };
const dot = { cells: [[0, 0]], color: 2 };

// Pieces: normalized to 0,0, at most 5 wide or tall, colored.
for (let n = 0; n < 500; n++) {
    const p = randomPiece();
    const { h, w } = dims(p);
    assert.ok(h <= 5 && w <= 5);
    assert.equal(Math.min(...p.cells.map(([r]) => r)), 0);
    assert.equal(Math.min(...p.cells.map(([, c]) => c)), 0);
    assert.ok(p.color >= 1);
}
assert.equal(deal().length, 3);

// One color per shape: every color shows up, and a color never spans two
// shapes (rotations of one shape share a sorted row/column profile).
const profile = (p) => {
    const { h, w } = dims(p);
    const rows = Array.from({ length: h }, (_, r) => p.cells.filter(([y]) => y === r).length);
    const cols = Array.from({ length: w }, (_, c) => p.cells.filter(([, x]) => x === c).length);
    return [rows, cols].map((l) => l.sort().join("")).sort().join("|");
};
const shapeOf = new Map();
for (let n = 0; n < 3000; n++) {
    const p = randomPiece();
    shapeOf.set(p.color, [...(shapeOf.get(p.color) ?? []), profile(p)]);
}
assert.equal(shapeOf.size, COLORS, "every shape's color appears");
for (const [color, profiles] of shapeOf) assert.equal(new Set(profiles).size, 1, `color ${color} spans shapes`);

// Fitting: inside the board, on empty squares only.
assert.ok(fits(empty(), bar, 0, 4));
assert.ok(!fits(empty(), bar, 0, 5), "off the right edge");
assert.ok(!fits(empty(), dot, -1, 0), "off the top");
const one = empty();
one[2] = 3;
assert.ok(!fits(one, bar, 0, 0), "overlaps a block");

// Placing: blocks land, a point each.
let res = place(empty(), bar, 3, 2);
assert.deepEqual([26, 27, 28, 29].map((i) => res.board[i]), [1, 1, 1, 1]);
assert.equal(res.points, 4);
assert.equal(res.cleared.length, 0);

// A row and a column filled by the same drop both clear: 15 squares, 2 lines.
const cross = empty();
for (let k = 0; k < SIZE; k++) if (k !== 5) (cross[5 * SIZE + k] = 4), (cross[k * SIZE + 5] = 4);
res = place(cross, dot, 5, 5);
assert.equal(res.cleared.length, 15);
assert.equal(res.lines, 2);
assert.ok(res.board.every((v) => v === 0));
assert.equal(res.points, 1 + 10 * 4);

// No room anywhere: game over.
const full = Array(SIZE * SIZE).fill(1);
assert.ok(!canMove(full, dot));
full[63] = 0;
assert.ok(canMove(full, dot));
assert.ok(!canMove(full, bar));

// Solvable: counts clears between drops and tries every order.
const hole = Array(SIZE * SIZE).fill(1);
hole[0] = 0;
assert.ok(!solvable(hole, [bar, bar]), "no room, and nothing to clear it");
assert.ok(solvable(hole, [bar, dot]), "listed second, but the dot goes first, clears the board, then the bar fits");

// Every deal can be fully placed: on a board missing one square, and on random
// crowded boards. Timed, since this runs whenever a new round is dealt.
assert.ok(solvable(hole, deal(hole)));
let rng = 1;
const rand = () => ((rng = (rng * 16807) % 2147483647) - 1) / 2147483646;
const started = performance.now();
let slowest = 0;
for (let n = 0; n < 300; n++) {
    const board = Array.from({ length: SIZE * SIZE }, () => (rand() < 0.3 + (n % 5) * 0.1 ? 1 : 0));
    const t = performance.now();
    const pieces = deal(board, rand);
    slowest = Math.max(slowest, performance.now() - t);
    const dots = pieces.every((p) => p.cells.length === 1);
    assert.ok(solvable(board, pieces) || (dots && board.filter((v) => !v).length < 3), "deal can't be finished");
}
console.log(`blocks: 300 crowded deals in ${Math.round(performance.now() - started)} ms, slowest ${Math.round(slowest)} ms`);

console.log("blocks: all checks passed");
