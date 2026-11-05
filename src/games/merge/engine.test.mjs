// Run: node src/games/merge/engine.test.mjs
import assert from "node:assert";

import { addTile, canMove, newGrid, SIZE, slide } from "./engine.mjs";

// Build a grid from rows of values (0 = empty); ids count up in reading order.
let ids = 0;
const grid = (rows) => rows.flat().map((v) => (v ? { id: ++ids, v } : null));
const values = (g) => Array.from({ length: SIZE }, (_, r) => g.slice(r * SIZE, r * SIZE + SIZE).map((t) => t?.v ?? 0));
const row = (vals, dir = "left") => {
    const res = slide(grid([vals, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), dir);
    return { ...res, row: values(res.grid)[0] };
};

// One line, slid left.
assert.deepEqual(row([2, 2, 2, 2]).row, [4, 4, 0, 0], "two pairs, two merges");
assert.equal(row([2, 2, 2, 2]).points, 8);
assert.deepEqual(row([2, 2, 4, 0]).row, [4, 4, 0, 0], "a new 4 doesn't merge again in the same move");
assert.deepEqual(row([4, 0, 4, 4]).row, [8, 4, 0, 0], "the pair nearest the edge merges first");
assert.deepEqual(row([0, 0, 0, 2]).row, [2, 0, 0, 0]);
assert.deepEqual(row([2, 4, 8, 16]).row, [2, 4, 8, 16]);
assert.equal(row([2, 4, 8, 16]).moved, false, "nothing moved, so no new tile");
assert.deepEqual(row([2, 2, 2, 0], "right").row, [0, 0, 2, 4], "sliding right merges from the right");

// Columns: up and down.
const col = grid([[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]]);
assert.deepEqual(values(slide(col, "up").grid).map((r) => r[0]), [4, 4, 0, 0]);
assert.deepEqual(values(slide(col, "down").grid).map((r) => r[0]), [0, 0, 4, 4]);

// Ids: a sliding tile keeps its id; a merge keeps the one nearer the edge.
const pair = grid([[0, 2, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
const [a, b] = [pair[1].id, pair[3].id];
const res = slide(pair, "left");
assert.equal(res.grid[0].id, a);
assert.deepEqual(res.merged, [a]);
assert.ok(!res.grid.some((t) => t?.id === b), "the absorbed tile is gone");

// New tiles land on empty squares only, and a full grid is left alone.
let g = Array(SIZE * SIZE).fill(null);
for (let n = 1; n <= SIZE * SIZE; n++) g = addTile(g, n);
assert.ok(g.every((t) => t && (t.v === 2 || t.v === 4)));
assert.equal(addTile(g, 99), g);
assert.equal(newGrid().filter(Boolean).length, 2);

// Game over: full, and no equal neighbors.
const stuck = grid([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]);
assert.ok(!canMove(stuck));
stuck[15] = { id: 999, v: 4 };
assert.ok(canMove(stuck), "a pair in the corner");

// Tiles are never lost or invented: every move keeps the total, plus the new tile.
g = newGrid();
let id = 3;
for (let n = 0; n < 5000 && canMove(g); n++) {
    const before = g.reduce((s, t) => s + (t?.v ?? 0), 0);
    const r = slide(g, /** @type {any} */ (["left", "up", "right", "down"][n % 4]));
    assert.equal(r.grid.reduce((s, t) => s + (t?.v ?? 0), 0), before);
    if (r.moved) g = addTile(r.grid, id++);
}

console.log("merge: all checks passed");
