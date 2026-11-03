# Games

Everything runs in the browser and saves to localStorage. The engine files are plain JS, so the tests run under bare Node with no test runner.

```bash
npm run dev                      # http://localhost:3000/games
node src/lib/sudoku.test.mjs     # sudoku engine, ~3 s
node src/lib/crossword.test.mjs  # crossword engine
node src/lib/blocks.test.mjs     # blocks engine
```

## Sudoku (`/games/sudoku`)

Daily and classic puzzles in four difficulties, with notes, auto notes, hints that explain themselves, check, undo/redo, a lens that dims cells that can't hold a digit, and per-difficulty stats.

| File | What it is |
|---|---|
| `src/lib/sudoku.mjs` | Engine: board geometry, human-style solver, grader, seeded generator, hints |
| `src/lib/sudoku-game.mjs` | Game state: placing, notes, undo/redo, conflicts, daily streaks |
| `src/lib/sudoku-worker.mjs` | Web Worker that runs the generator off the main thread |
| `src/lib/sudoku-store.ts` | localStorage: saved games, stats, settings, pre-generated puzzles |
| `src/lib/sudoku-sound.ts` | Web Audio chimes (off by default) |
| `src/components/sudoku.tsx`, `sudoku-dialogs.tsx`, `sudoku.css` | The UI |

**Difficulty.** The solver tries techniques easiest first and records the hardest one it needed. Easy uses only singles. Medium adds pairs, pointing pairs and box-line reduction. Hard adds triples and X-Wing. Expert needs Swordfish, XY-Wing or simple coloring, and the tests confirm the Hard set alone gets stuck. The generator removes clues in mirrored pairs, and only while the puzzle stays solvable by its tier's techniques, which also guarantees a unique solution. Daily puzzles are seeded from the local date and difficulty, so everyone gets the same puzzle on the same day.

## Blocks (`/games/blocks`)

Drop pieces on an 8x8 board; full rows and columns clear. Three pieces per round, a new three once all are placed, game over when none fit. A point per block, plus 10 x lines² per drop that clears. Drag a piece (on touch it rides above your finger), tap a piece then a square, or press 1-3, arrows, Enter.

| File | What it is |
|---|---|
| `src/lib/blocks.mjs` | Engine: shapes, rotations, fitting, placing, clearing, scoring |
| `src/components/blocks.tsx` | The UI; saves the game and best score to localStorage |
