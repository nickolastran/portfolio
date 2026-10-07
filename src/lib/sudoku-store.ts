// Everything Lumen Sudoku keeps between visits, in localStorage. Reads fall
// back to defaults when storage is empty, corrupt, or blocked.
import type { generate } from "./sudoku.mjs";
import type { createGame } from "./sudoku-game.mjs";

export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type Puzzle = Omit<ReturnType<typeof generate>, "difficulty"> & { difficulty: Difficulty };
export type Game = ReturnType<typeof createGame>;

export type Slot = {
    key: string;
    kind: "classic" | "daily";
    date: string;
    puzzle: Puzzle;
    game: Game;
    seconds: number;
    auto: boolean;
    /* Technique id per hint, or "solution" when logic had nothing. */
    hints: string[];
    /* Cells marked wrong by Check, with the digit that was wrong. */
    marks: Record<number, number>;
    solved: boolean;
    /* Techniques this solve showed the player for the first time. */
    learned: string[];
};

export type Settings = {
    theme: "system" | "night" | "dawn";
    conflicts: boolean;
    autoRemove: boolean;
    sameDigits: boolean;
    showTimer: boolean;
    sound: boolean;
    lens: boolean;
};

export type TierStats = { played: number; wins: number; best: number | null; total: number; streak: number; longest: number };
export type ChartEntry = { key: string; seed: number; name: string; difficulty: Difficulty; date: string; seconds: number };

export const DEFAULT_SETTINGS: Settings = {
    theme: "system",
    conflicts: true,
    autoRemove: true,
    sameDigits: true,
    showTimer: true,
    sound: false,
    lens: false,
};
const EMPTY_TIER: TierStats = { played: 0, wins: 0, best: null, total: 0, streak: 0, longest: 0 };
export const LEVELS: Difficulty[] = ["easy", "medium", "hard", "expert"];
const perTier = <T>(make: () => T) => Object.fromEntries(LEVELS.map((d) => [d, make()])) as Record<Difficulty, T>;

function read<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch {
        return fallback;
    }
}

function write(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

export const loadSettings = () => read("lumen-settings", DEFAULT_SETTINGS);
export const saveSettings = (s: Settings) => write("lumen-settings", s);

export const loadStats = () => read("lumen-stats", perTier(() => EMPTY_TIER));
export const saveStats = (s: Record<Difficulty, TierStats>) => write("lumen-stats", s);

/* Dates each tier's daily was solved, "YYYY-MM-DD". */
export const loadDaily = () => read("lumen-daily", perTier((): string[] => []));
export const saveDaily = (d: Record<Difficulty, string[]>) => write("lumen-daily", d);

export const loadChart = () => read<{ entries: ChartEntry[] }>("lumen-chart", { entries: [] }).entries;
export const saveChart = (entries: ChartEntry[]) => write("lumen-chart", { entries });

export const loadSeen = () => read<{ ids: string[] }>("lumen-seen", { ids: [] }).ids;
export const saveSeen = (ids: string[]) => write("lumen-seen", { ids });

/* One ready-made puzzle per tier, so "New puzzle" never waits. */
export const loadPool = () => read<Partial<Record<Difficulty, Puzzle>>>("lumen-pool", {});
export const savePool = (p: Partial<Record<Difficulty, Puzzle>>) => write("lumen-pool", p);

export const loadSlot = (key: string) => read<Slot | null>(`lumen-slot:${key}`, null);
export const saveSlot = (slot: Slot) => write(`lumen-slot:${slot.key}`, slot);

export const loadLast = () => read<{ kind: Slot["kind"]; difficulty: Difficulty }>("lumen-last", { kind: "daily", difficulty: "easy" });
export const saveLast = (kind: Slot["kind"], difficulty: Difficulty) => write("lumen-last", { kind, difficulty });

/** Yesterday's (and older) dailies can't be finished, so they're dropped. */
export function pruneDailies(today: string) {
    try {
        for (const key of Object.keys(localStorage))
            if (key.startsWith("lumen-slot:daily-") && !key.startsWith(`lumen-slot:daily-${today}`)) localStorage.removeItem(key);
    } catch {}
}

export const slotKey = (kind: Slot["kind"], difficulty: Difficulty, date: string) =>
    kind === "daily" ? `daily-${date}-${difficulty}` : `classic-${difficulty}`;

/** Local calendar date, so the daily turns over at the player's midnight. */
export function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const time = (s: number) =>
    s >= 3600
        ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
        : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
