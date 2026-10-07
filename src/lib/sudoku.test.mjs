// Run: node src/lib/sudoku.test.mjs
// Checks the engine end to end: each technique fires on a position built to
// need it, generated puzzles land in their tier with one solution, dailies are
// deterministic, and the board state's undo/redo and note clean-up behave.
import assert from "node:assert";

import { ALL, bit, countSolutions, DIFFICULTIES, findHint, generate, hashSeed, next, PEERS, solve, TIERS } from "./sudoku.mjs";
import { applyHint, conflicts, constellation, createGame, erase, fillCandidates, place, redo, streaks, toggleNote, undo } from "./sudoku-game.mjs";

const at = (r, c) => r * 9 + c;
const blank = () => ({ grid: Array(81).fill(0), cands: Array(81).fill(ALL) });
const drop = (s, d, cells) => cells.forEach((c) => (s.cands[c] &= ~bit(d)));
const row = (r) => Array.from({ length: 9 }, (_, c) => at(r, c));
const col = (c) => Array.from({ length: 9 }, (_, r) => at(r, c));
const only = (s, d, line, keep) => drop(s, d, line.filter((c) => !keep.includes(c)));

/* ---------- Technique detection ---------- */

const SOLVED = [
    5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3,
    7, 9, 1, 7, 1, 3, 9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7, 9,
];
assert.ok(solve(SOLVED).solved, "reference grid is valid");

const cases = {
    nakedSingle: () => {
        const grid = Object.assign(SOLVED.slice(), { 40: 0 });
        return { grid, cands: Object.assign(Array(81).fill(0), { 40: bit(SOLVED[40]) }) };
    },
    hiddenSingle: () => {
        const s = blank();
        drop(s, 3, [1, 2, 9, 10, 11, 18, 19, 20]); // box 1 keeps 3 only in its corner
        return s;
    },
    nakedPair: () => {
        const s = blank();
        s.cands[0] = s.cands[1] = bit(1) | bit(2);
        return s;
    },
    hiddenPair: () => {
        const s = blank();
        only(s, 1, row(0), [at(0, 0), at(0, 5)]);
        only(s, 2, row(0), [at(0, 0), at(0, 5)]);
        return s;
    },
    pointing: () => {
        const s = blank();
        drop(s, 4, [9, 10, 11, 18, 19, 20]); // box 1's 4s all on row 1
        return s;
    },
    boxLine: () => {
        const s = blank();
        drop(s, 4, row(0).slice(3)); // row 1's 4s all inside box 1
        return s;
    },
    nakedTriple: () => {
        const s = blank();
        [s.cands[0], s.cands[1], s.cands[2]] = [bit(1) | bit(2), bit(2) | bit(3), bit(1) | bit(3)];
        return s;
    },
    hiddenTriple: () => {
        const s = blank();
        for (const d of [1, 2, 3]) only(s, d, row(0), [at(0, 0), at(0, 4), at(0, 8)]);
        return s;
    },
    xWing: () => {
        const s = blank();
        for (const r of [1, 4]) only(s, 5, row(r), [at(r, 2), at(r, 7)]);
        return s;
    },
    swordfish: () => {
        const s = blank();
        only(s, 5, row(0), [at(0, 0), at(0, 3)]);
        only(s, 5, row(3), [at(3, 3), at(3, 6)]);
        only(s, 5, row(6), [at(6, 0), at(6, 6)]);
        return s;
    },
    xyWing: () => {
        const s = blank();
        s.cands[at(0, 0)] = bit(1) | bit(2);
        s.cands[at(0, 4)] = bit(1) | bit(3);
        s.cands[at(4, 0)] = bit(2) | bit(3);
        return s;
    },
    coloring: () => {
        // A four-link chain for 7: (1,1)-col-(7,1)-row-(7,7)-col-(2,7).
        const s = blank();
        only(s, 7, col(0), [at(0, 0), at(6, 0)]);
        only(s, 7, row(6), [at(6, 0), at(6, 6)]);
        only(s, 7, col(6), [at(6, 6), at(1, 6)]);
        return s;
    },
};

for (const [id, build] of Object.entries(cases)) {
    const step = next(build());
    assert.equal(step?.id, id, `${id}: found ${step?.id}`);
}

// The chain above should trap 7 out of row 2, box 1 (sees both colors).
assert.ok(next(cases.coloring()).elim.some(([c]) => c === at(1, 1)), "coloring: (2,2) sees both colors");
// And the XY-Wing clears 3 where the wings cross.
assert.deepEqual(next(cases.xyWing()).elim, [[at(4, 4), bit(3)]], "xyWing: only (5,5) sees both wings");

/* ---------- Generation and grading ---------- */

for (const difficulty of DIFFICULTIES) {
    const { level, clues: [lo, hi] } = TIERS[difficulty];
    for (let n = 1; n <= 6; n++) {
        const p = generate(difficulty, n * 104729 + level);
        const tag = `${difficulty} #${n}`;
        assert.equal(countSolutions(p.puzzle), 1, `${tag}: not unique`);
        assert.ok(p.clues >= lo && p.clues <= hi, `${tag}: ${p.clues} clues`);
        assert.equal(p.puzzle.filter(Boolean).length, p.clues);
        p.puzzle.forEach((v, i) => assert.equal(v === 0, p.puzzle[80 - i] === 0, `${tag}: not symmetric`));

        const full = solve(p.puzzle);
        assert.ok(full.solved, `${tag}: logic can't finish it`);
        assert.deepEqual(full.grid, p.solution, `${tag}: logic found another answer`);
        assert.equal(full.level, level, `${tag}: graded ${full.level}`);
        if (level > 1) assert.ok(!solve(p.puzzle, level - 1).solved, `${tag}: easier techniques suffice`);
        assert.ok(p.techniques.some((id) => full.used.includes(id)));
    }
}
assert.equal(countSolutions(Array(81).fill(0)), 2, "empty grid has many solutions");

// Dailies: same date and tier, same puzzle.
const seed = hashSeed("2026-10-07:hard");
assert.deepEqual(generate("hard", seed).puzzle, generate("hard", seed).puzzle);
assert.notDeepEqual(generate("hard", seed).puzzle, generate("hard", hashSeed("2026-10-08:hard")).puzzle);
assert.deepEqual(constellation(seed), constellation(seed));

/* ---------- Hints ---------- */

{
    const p = generate("easy", 7);
    const h = findHint(p.puzzle, p.solution);
    assert.ok(["nakedSingle", "hiddenSingle"].includes(h.id));
    assert.equal(p.puzzle[h.cell], 0);
    assert.equal(h.digit, p.solution[h.cell]);
    // A wrong entry is ignored by the solver and can be the hinted cell.
    const wrong = p.puzzle.slice();
    const cell = wrong.indexOf(0);
    wrong[cell] = (p.solution[cell] % 9) + 1;
    const fix = findHint(wrong, p.solution);
    assert.equal(fix.digit, p.solution[fix.cell]);
}

/* ---------- Board state ---------- */

{
    const p = generate("medium", 11);
    const empty = p.puzzle.indexOf(0);
    const d = p.solution[empty];
    let g = createGame(p.puzzle, p.solution);

    // Givens are locked.
    const given = p.puzzle.findIndex(Boolean);
    assert.equal(place(g, given, 1), g);

    // Notes, then a placement that clears that digit from every peer.
    g = fillCandidates(g);
    const peerWithD = PEERS[empty].find((c) => g.notes[c] & bit(d));
    assert.ok(peerWithD !== undefined, "some peer has the digit as a candidate");
    g = place(g, empty, d);
    assert.equal(g.values[empty], d);
    assert.equal(g.notes[empty], 0);
    assert.equal(g.notes[peerWithD] & bit(d), 0, "placed digit leaves peers' notes");

    // With auto-remove off the notes stay.
    const kept = place(fillCandidates(createGame(p.puzzle, p.solution)), empty, d, { autoRemove: false });
    assert.ok(kept.notes[peerWithD] & bit(d));

    // Erasing with auto-candidates on puts the candidates back.
    const back = erase(g, empty, { auto: true });
    assert.ok(back.notes[peerWithD] & bit(d));
    assert.ok(back.notes[empty] & bit(d));

    // Undo/redo walks the full history, notes included.
    let h = createGame(p.puzzle, p.solution);
    h = toggleNote(h, empty, 3);
    h = toggleNote(h, empty, 5);
    h = place(h, empty, d);
    assert.equal(h.past.length, 3);
    h = undo(h);
    assert.equal(h.values[empty], 0);
    assert.equal(h.notes[empty], bit(3) | bit(5));
    h = undo(undo(h));
    assert.equal(h.notes[empty], 0);
    assert.equal(undo(h), h, "nothing left to undo");
    h = redo(redo(h));
    assert.equal(h.notes[empty], bit(3) | bit(5));
    h = redo(h);
    assert.equal(h.values[empty], d);
    assert.equal(redo(h), h, "nothing left to redo");
    h = undo(h);
    h = toggleNote(h, empty, 7);
    assert.equal(h.future.length, 0, "a new move clears redo");

    // Duplicates are flagged on both cells.
    const dupe = Object.assign(p.puzzle.slice(), { [empty]: p.puzzle[PEERS[empty].find((c) => p.puzzle[c])] });
    assert.equal(conflicts(dupe).size, 2);

    // Same digit again clears it; wrong digits count as mistakes.
    const wrong = (d % 9) + 1;
    let m = place(createGame(p.puzzle, p.solution), empty, wrong);
    assert.equal(m.mistakes, 1);
    m = place(m, empty, wrong);
    assert.equal(m.values[empty], 0);

    // Hints lock their cell, and undo takes the lock back with the digit.
    let k = applyHint(createGame(p.puzzle, p.solution), empty, d);
    assert.equal(place(k, empty, wrong), k);
    k = undo(k);
    assert.equal(k.values[empty], 0);
    assert.deepEqual(k.hinted, []);
}

/* ---------- Daily streaks ---------- */

assert.deepEqual(streaks([], "2026-10-07"), { current: 0, longest: 0 });
// Today not done yet: yesterday's run still counts. Month boundary included.
assert.deepEqual(streaks(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-06", "2026-09-30"], "2026-10-07"), { current: 1, longest: 3 });
assert.deepEqual(streaks(["2026-10-05", "2026-10-06", "2026-10-07"], "2026-10-07"), { current: 3, longest: 3 });
assert.deepEqual(streaks(["2026-10-04", "2026-10-05"], "2026-10-07"), { current: 0, longest: 2 }, "a missed day breaks it");

console.log("sudoku: all checks passed");
