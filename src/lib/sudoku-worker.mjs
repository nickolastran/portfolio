// Puzzle generation off the main thread: one message in, one puzzle out.
import { generate } from "./sudoku.mjs";

self.onmessage = (e) => self.postMessage(generate(e.data.difficulty, e.data.seed));
