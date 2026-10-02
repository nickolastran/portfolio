// Run: node src/lib/crossword.test.mjs
// Generates a pile of puzzles and checks each one reads like a real crossword:
// every run of 2+ letters on the board is an intended answer (no accidental
// words from touching tiles), everything is connected, and it fits the size.
import assert from "node:assert";

import { generate, MODES } from "./crossword.mjs";

for (const mode of Object.keys(MODES)) {
    const { count, size } = MODES[mode];
    let short = 0;
    for (let n = 0; n < 300; n++) {
        const { w, h, words } = generate(mode);
        assert.ok(w <= size && h <= size, `${mode}: ${w}x${h} over ${size}`);
        if (words.length < count) short++;
        assert.equal(new Set(words.map((x) => x.answer)).size, words.length, "duplicate answer");

        const grid = Array.from({ length: h }, () => Array(w).fill(" "));
        for (const { answer, r, c, dir } of words)
            [...answer].forEach((ch, k) => {
                const [rr, cc] = dir === "across" ? [r, c + k] : [r + k, c];
                assert.ok(grid[rr][cc] === " " || grid[rr][cc] === ch, "letter clash");
                grid[rr][cc] = ch;
            });

        const runs = (lines) => lines.flatMap((l) => l.join("").split(" ").filter((s) => s.length > 1));
        const cols = Array.from({ length: w }, (_, c) => grid.map((row) => row[c]));
        const want = (dir) => words.filter((x) => x.dir === dir).map((x) => x.answer).sort();
        assert.deepEqual(runs(grid).sort(), want("across"), `${mode}: stray across run`);
        assert.deepEqual(runs(cols).sort(), want("down"), `${mode}: stray down run`);

        // Connected: flood fill from the first letter reaches every letter.
        const filled = grid.flatMap((row, r) => row.map((ch, c) => (ch === " " ? null : `${r},${c}`))).filter(Boolean);
        const seen = new Set([filled[0]]);
        for (const cell of seen) {
            const [r, c] = cell.split(",").map(Number);
            for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
                if (grid[nr]?.[nc] && grid[nr][nc] !== " ") seen.add(`${nr},${nc}`);
        }
        assert.equal(seen.size, filled.length, "disconnected");

        // Numbers run 1..k in reading order.
        const nums = [...new Set(words.map((x) => x.num))];
        assert.deepEqual(nums, nums.map((_, i) => i + 1), "numbering");
    }
    console.log(`${mode}: ok, ${short}/300 came up short of ${count} words`);
}
