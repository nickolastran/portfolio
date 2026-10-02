// Run: node src/constants/crosswords.test.mjs
// Every word in each grid needs exactly one clue, and the grid must be a
// symmetric square — catches a clue keyed to the wrong number after an edit.
import assert from "node:assert";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./crosswords.ts", import.meta.url), "utf8");
for (const [, name, body] of src.matchAll(/const (\w+): Puzzle = \{([\s\S]*?)\n\};/g)) {
    const rows = [...body.match(/rows: \[([\s\S]*?)\]/)[1].matchAll(/"([A-Z#]+)"/g)].map((m) => m[1]);
    const keys = (dir) =>
        [...body.match(new RegExp(`${dir}: \\{([\\s\\S]*?)\\n    \\}`))[1].matchAll(/^\s+(\d+):/gm)].map((m) => +m[1]);
    const n = rows.length;
    const at = (r, c) => (r < 0 || c < 0 || r >= n || c >= n ? "#" : rows[r][c]);
    const want = { across: [], down: [] };
    let num = 0;
    for (let r = 0; r < n; r++) {
        assert.equal(rows[r].length, n, `${name} row ${r} length`);
        for (let c = 0; c < n; c++) {
            assert.equal(at(r, c) === "#", at(n - 1 - r, n - 1 - c) === "#", `${name} symmetry at ${r},${c}`);
            if (at(r, c) === "#") continue;
            const a = at(r, c - 1) === "#" && at(r, c + 1) !== "#";
            const d = at(r - 1, c) === "#" && at(r + 1, c) !== "#";
            if (a || d) num++;
            if (a) want.across.push(num);
            if (d) want.down.push(num);
        }
    }
    assert.deepEqual(keys("across"), want.across, `${name} across clues`);
    assert.deepEqual(keys("down"), want.down, `${name} down clues`);
    console.log(`${name}: ok (${want.across.length + want.down.length} words)`);
}
