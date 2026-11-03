// Puzzle generation off the main thread: one message in, one puzzle out.
import { generate } from "./engine.mjs";

self.onmessage = (e) => self.postMessage(generate(e.data.difficulty, e.data.seed));
