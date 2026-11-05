// Run: node src/games/minesweeper/engine.test.mjs
import assert from "node:assert";

import { around, board, chord, FLAG, generate, HIDDEN, layMines, lost, MODES, OPEN, reveal, solvable, won } from "./engine.mjs";

// Neighbors: 3 in a corner, 5 on an edge, 8 inside.
assert.equal(around(9, 9, 0).length, 3);
assert.equal(around(9, 9, 4).length, 5);
assert.equal(around(9, 9, 40).length, 8);
assert.deepEqual(around(3, 3, 4).sort((a, b) => a - b), [0, 1, 2, 3, 5, 6, 7, 8]);

// A 4x3 board, mine top-right:
//   0 0 1 *
//   0 0 1 1
//   0 0 0 0
const b = board(4, 3, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
assert.deepEqual(b.nums, [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0], "the mine square itself counts 0");
const none = Array(12).fill(HIDDEN);

// Flood: a zero opens everything up to the numbers, never the mine.
let shown = reveal(b, none, [0]);
assert.ok(won(b, shown) && !lost(b, shown), "one click clears it");
assert.equal(shown[3], HIDDEN);

// Flags stay shut, and the flood doesn't pass through them.
const flagged = none.slice();
flagged[2] = FLAG;
assert.equal(reveal(b, flagged, [0])[2], FLAG);

// Opening the mine loses.
assert.ok(lost(b, reveal(b, none, [3])));

// Chord: an open 1 with its mine flagged opens the rest around it; without the flag it does nothing.
shown = none.slice();
shown[2] = OPEN;
assert.equal(chord(b, shown, 2), shown, "no flag yet");
shown[3] = FLAG;
const chorded = chord(b, shown, 2);
assert.ok(won(b, chorded), "the chord floods the zeros too");
// A wrong flag makes the chord open a mine.
shown = none.slice();
shown[2] = OPEN;
shown[6] = FLAG;
assert.ok(lost(b, chord(b, shown, 2)));

// A forced guess: two squares, one mine, nothing to tell them apart.
//   1 *      (start in the bottom row; the top two read the same)
//   1 1
const guess = board(2, 2, [0, 1, 0, 0]);
assert.ok(!solvable(guess, 2));
assert.ok(solvable(b, 0));

// Mines: the right count, never on or next to the first click.
for (const mode of Object.keys(MODES)) {
    const { w, h, mines } = MODES[mode];
    for (const start of [0, w * h - 1, Math.floor(h / 2) * w + Math.floor(w / 2)]) {
        const m = layMines(w, h, mines, start);
        assert.equal(m.filter(Boolean).length, mines);
        assert.ok([start, ...around(w, h, start)].every((i) => !m[i]), `${mode}: mine at the first click`);
    }
}

// Every dealt board clears without guessing. Timed, since it runs on the first click.
let rng = 1;
const rand = () => ((rng = (rng * 16807) % 2147483647) - 1) / 2147483646;
for (const mode of Object.keys(MODES)) {
    const { w, h, mines } = MODES[mode];
    const started = performance.now();
    let slowest = 0;
    for (let n = 0; n < 30; n++) {
        const start = Math.floor(rand() * w * h);
        const t = performance.now();
        const g = generate(mode, start, rand);
        slowest = Math.max(slowest, performance.now() - t);
        assert.equal(g.mines.filter(Boolean).length, mines);
        assert.ok(solvable(g, start), `${mode} board needs a guess`);
    }
    console.log(`minesweeper: 30 ${mode} boards in ${Math.round(performance.now() - started)} ms, slowest ${Math.round(slowest)} ms`);
}

console.log("minesweeper: all checks passed");
