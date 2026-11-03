# Games

One folder per game, holding everything it needs. The routes in `src/app/games/<game>/page.tsx` just render it. Everything runs in the browser and saves to localStorage. Engines are plain JS, so their tests run under bare Node with no test runner.

```
src/games/<game>/
  <game>.tsx        the UI, default export
  engine.mjs        rules and generation, no React
  engine.test.mjs   assert-based checks: node src/games/<game>/engine.test.mjs
  backdrop.tsx      the faint board on its /games card
```

```bash
npm run dev                                # http://localhost:3000/games
node src/games/sudoku/engine.test.mjs      # ~3 s
node src/games/crossword/engine.test.mjs
node src/games/blocks/engine.test.mjs
```

Adding a game: make the folder, add `src/app/games/<game>/page.tsx`, and add a card in `src/app/games/page.tsx`.

## Sudoku

Daily and classic puzzles in four difficulties, with notes, auto notes, hints that explain themselves, check, undo/redo, a lens that dims cells that can't hold a digit, and per-difficulty stats.

| File | What it is |
|---|---|
| `engine.mjs` | Board geometry, human-style solver, grader, seeded generator, hints |
| `game.mjs` | Game state: placing, notes, auto notes, undo/redo, conflicts, daily streaks |
| `worker.mjs` | Web Worker that runs the generator off the main thread |
| `store.ts` | localStorage: saved games, stats, settings, pre-generated puzzles |
| `sound.ts` | Web Audio chimes (off by default) |
| `sudoku.tsx`, `dialogs.tsx`, `sudoku.css` | The UI |

**Difficulty.** The solver tries techniques easiest first and records the hardest one it needed. Easy uses only singles. Medium adds pairs, pointing pairs and box-line reduction. Hard adds triples and X-Wing. Expert needs Swordfish, XY-Wing or simple coloring, and the tests confirm the Hard set alone gets stuck. The generator removes clues in mirrored pairs, and only while the puzzle stays solvable by its tier's techniques, which also guarantees a unique solution. Daily puzzles are seeded from the local date and difficulty, so everyone gets the same puzzle on the same day.

## Crossword

A freeform crossword built fresh each time: every new word has to cross one already on the board. Easy is 7 everyday words, Hard is 14 longer ones with trickier clues, and Medium is 10 drawn from both. `words.mjs` holds the word banks, one `ANSWER clue` per line.

## Blocks

Drop pieces on an 8x8 board; full rows and columns clear. Three pieces per round, and every round dealt can be fully placed (the engine searches every order before dealing). Game over when none fit. A point per block, plus 10 x lines² per drop that clears. Each shape has its own color. Drag a piece (on touch it rides above your finger), tap a piece then a square, or press 1-3, arrows, Enter. `blocks.css` holds the clear animations.
