# [nickolas tran's resume](https://nickolastran.vercel.app/)

my personal portfolio 
## Lumen Sudoku (`/games/sudoku`)

A night-sky Sudoku with daily puzzles, four technique-graded difficulties, hints that explain themselves, and a constellation for every solve. Everything runs in the browser and saves to localStorage.

```bash
npm install
npm run dev                    # http://localhost:3000/games/sudoku
node src/lib/sudoku.test.mjs   # engine checks, ~3 s
npm run build                  # production build
```

| File | What it is |
|---|---|
| `src/lib/sudoku.mjs` | Engine: board geometry, human-style solver, grader, seeded generator, hints |
| `src/lib/sudoku-game.mjs` | Game state: placing, notes, undo/redo, conflicts, daily streaks, constellations |
| `src/lib/sudoku-worker.mjs` | Web Worker that runs the generator off the main thread |
| `src/lib/sudoku-store.ts` | localStorage: saved games, stats, settings, Star Chart, pre-generated puzzles |
| `src/lib/sudoku-sound.ts` | Web Audio chimes (off by default) |
| `src/components/sudoku.tsx`, `sudoku-dialogs.tsx`, `sudoku.css` | The UI |

**How difficulty works.** The solver tries techniques easiest first and records the hardest one it needed. Easy uses only singles. Medium adds pairs, pointing pairs and box-line reduction. Hard adds triples and X-Wing. Expert needs Swordfish, XY-Wing or simple coloring, and the tests confirm that the Hard set alone gets stuck. The generator removes clues in mirrored pairs, and only while the puzzle stays solvable by its tier's techniques, which also guarantees a unique solution. It keeps going until the puzzle grades into the tier with a clue count in range. Daily puzzles come from a seed built from the local date and difficulty, so everyone gets the same puzzle on the same date.

The engine files are plain JS so the tests run under bare Node with no test runner, the same setup as the crossword.
