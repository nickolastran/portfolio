"use client";

import { CheckCheck, ChevronLeft, ChevronRight, Eye, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { generate } from "./engine.mjs";
import { cn } from "../../lib/utils";

type Mode = "easy" | "medium" | "hard";
type Dir = "across" | "down";
type Word = { answer: string; clue: string; dir: Dir; r: number; c: number; num: number; cells: number[] };
type Stats = Record<Mode, { solved: number; best: number | null }>;
type Raw = { w: number; h: number; words: Omit<Word, "cells">[] };
type Saved = { raw: Raw; fill: string[]; hinted: number[]; seconds: number };

const STATS_KEY = "crossword-stats";
const MODES: Record<Mode, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
// Collapsed 1px borders: each square draws its top/left inside and its
// right/bottom outside, so shared edges overlap instead of doubling.
const SQUARE = "shadow-[inset_1px_1px_0_#525252,1px_0_0_#525252,0_1px_0_#525252,1px_1px_0_#525252]";

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const flip = (d: Dir): Dir => (d === "across" ? "down" : "across");

function readStats(): Stats {
    const empty = { easy: { solved: 0, best: null }, medium: { solved: 0, best: null }, hard: { solved: 0, best: null } };
    try {
        return { ...empty, ...JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}") };
    } catch {
        return empty;
    }
}

// The puzzle in progress, per mode, so a refresh picks up where you left off.
const saveKey = (mode: Mode) => `crossword-${mode}`;

function load(mode: Mode): Saved | null {
    try {
        const saved = JSON.parse(localStorage.getItem(saveKey(mode)) ?? "null");
        return Array.isArray(saved?.raw?.words) ? saved : null;
    } catch {
        return null;
    }
}

function forget(mode: Mode) {
    try {
        localStorage.removeItem(saveKey(mode));
    } catch {}
}

/* Lays the generated answers onto a flat grid. */
function layout(raw: Raw) {
    const W = raw.w;
    const H = raw.h;
    const sol: string[] = Array(W * H).fill("");
    const at: Record<Dir, number[]> = { across: [], down: [] };
    const nums: number[] = [];
    const words: Word[] = raw.words.map((w, wi) => {
        const cells = [...w.answer].map((ch, k) => {
            const i = (w.r + (w.dir === "down" ? k : 0)) * W + w.c + (w.dir === "across" ? k : 0);
            sol[i] = ch;
            at[w.dir][i] = wi;
            return i;
        });
        nums[cells[0]] = w.num;
        return { ...w, cells };
    });
    const order = [...words.filter((w) => w.dir === "across"), ...words.filter((w) => w.dir === "down")];
    return { raw, W, H, sol, at, nums, words, order };
}

function Board({ mode, best, onSolve, onNext }: { mode: Mode; best: number | null; onSolve: (seconds: number, hints: number) => void; onNext: () => void }) {
    // Board only mounts on the client, so the random puzzle never meets SSR.
    const [saved] = useState(() => load(mode));
    const [puzzle] = useState(() => layout(saved?.raw ?? generate(mode)));
    const { W, H, sol, at, nums, words, order } = puzzle;
    const [fill, setFill] = useState<string[]>(() =>
        saved?.fill?.length === sol.length ? saved.fill : sol.map(() => ""),
    );
    const [hinted, setHinted] = useState<Set<number>>(() => new Set(saved?.hinted));
    const [cur, setCur] = useState({ i: order[0].cells[0], dir: order[0].dir });
    const [checked, setChecked] = useState(false);
    const [gaveUp, setGaveUp] = useState(false);
    const [seconds, setSeconds] = useState(saved?.seconds ?? 0);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const letters = useMemo(() => sol.flatMap((ch, i) => (ch ? [i] : [])), [sol]);
    const solved = letters.every((i) => fill[i] === sol[i]);
    const word = words[at[cur.dir][cur.i] ?? at[flip(cur.dir)][cur.i]];

    useEffect(() => {
        if (solved) return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [solved]);

    // A finished or revealed puzzle isn't kept: the next visit deals a new one.
    useEffect(() => {
        if (solved || gaveUp) return forget(mode);
        try {
            const save: Saved = { raw: puzzle.raw, fill, hinted: [...hinted], seconds };
            localStorage.setItem(saveKey(mode), JSON.stringify(save));
        } catch {}
    }, [mode, puzzle, fill, hinted, seconds, solved, gaveUp]);

    const newPuzzle = () => {
        forget(mode);
        onNext();
    };

    const commit = (next: string[], hints = hinted.size) => {
        setFill(next);
        if (!gaveUp && !solved && letters.every((i) => next[i] === sol[i])) onSolve(seconds, hints);
    };

    // Squares outside the current direction's words fall back to the other one.
    const go = (i: number, dir: Dir = cur.dir) => {
        setCur({ i, dir: at[dir][i] === undefined ? flip(dir) : dir });
        refs.current[i]?.focus();
    };

    const jump = (delta: number) => {
        const next = order[(order.indexOf(word) + delta + order.length) % order.length];
        go(next.cells.find((j) => !fill[j]) ?? next.cells[0], next.dir);
    };

    const type = (ch: string) => {
        // Hinted letters are locked in; typing just moves past them.
        if (!hinted.has(cur.i)) commit(fill.map((v, j) => (j === cur.i ? ch : v)));
        const k = word.cells.indexOf(cur.i);
        if (k < word.cells.length - 1) go(word.cells[k + 1], word.dir);
        else jump(1);
    };

    // Next lettered square in a direction, hopping over blank paper.
    const step = (dr: number, dc: number) => {
        for (let r = Math.floor(cur.i / W) + dr, c = (cur.i % W) + dc; r >= 0 && r < H && c >= 0 && c < W; r += dr, c += dc)
            if (sol[r * W + c]) return go(r * W + c, dr ? "down" : "across");
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        const k = e.key;
        const arrow = ({ ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] } as Record<string, number[]>)[k];
        if (/^[a-z]$/i.test(k) && !e.metaKey && !e.ctrlKey) type(k.toUpperCase());
        else if (k === "Backspace") {
            const pos = word.cells.indexOf(cur.i);
            const target = fill[cur.i] || pos === 0 ? cur.i : word.cells[pos - 1];
            if (!hinted.has(target)) commit(fill.map((v, j) => (j === target ? "" : v)));
            if (target !== cur.i) go(target, word.dir);
        } else if (arrow) {
            const along = word.dir === "across" ? arrow[0] === 0 : arrow[1] === 0;
            const other = flip(word.dir);
            if (!along && at[other][cur.i] !== undefined) go(cur.i, other);
            else step(arrow[0], arrow[1]);
        } else if (k === "Tab" || k === "Enter") jump(e.shiftKey ? -1 : 1);
        else if (k === " ") go(cur.i, flip(word.dir));
        else return; // let the browser handle it (mobile keyboards fire onChange)
        e.preventDefault();
    };

    const hint = () => {
        // This square, else this answer, else anywhere still wrong.
        const i = [cur.i, ...word.cells, ...letters].find((j) => fill[j] !== sol[j]);
        if (i === undefined) return;
        setHinted((h) => new Set(h).add(i));
        commit(fill.map((v, j) => (j === i ? sol[j] : v)), hinted.size + 1);
        go(i, word.dir);
    };

    const reveal = () => {
        setGaveUp(true);
        setHinted(new Set(letters.filter((i) => fill[i] !== sol[i])));
        setFill([...sol]);
    };

    const clueList = (dir: Dir) => (
        <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500">{dir === "across" ? "Across" : "Down"}</h3>
            <ol>
                {order
                    .filter((w) => w.dir === dir)
                    .map((w) => (
                        <li key={w.num}>
                            <button
                                onClick={() => go(w.cells.find((j) => !fill[j]) ?? w.cells[0], dir)}
                                className={cn(
                                    "flex w-full gap-3 rounded-md px-2 py-1 text-left text-[15px] leading-snug hover:bg-neutral-800/60",
                                    w === word ? "bg-blue-400/15 hover:bg-blue-400/15" : w.cells.every((j) => fill[j]) && "text-neutral-500",
                                )}
                            >
                                <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{w.num}</span>
                                <span>{w.clue}</span>
                            </button>
                        </li>
                    ))}
            </ol>
        </div>
    );

    const tool = (label: string, Icon: typeof Eye, onClick: () => void) => (
        <button
            title={label}
            aria-label={label}
            disabled={solved}
            onClick={onClick}
            className="grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
        >
            <Icon size={20} />
        </button>
    );

    const done = gaveUp
        ? "Revealed"
        : [`Solved in ${time(seconds)}`, hinted.size && `${hinted.size} hint${hinted.size > 1 ? "s" : ""}`, best != null && `Best ${time(best)}`]
              .filter(Boolean)
              .join(" · ");

    return (
        <div className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="@container min-w-0">
                <div className="sticky top-20 z-30 mb-3 flex items-stretch rounded-lg border border-neutral-800 bg-neutral-900/95 backdrop-blur lg:top-4">
                    <button aria-label="Previous clue" onClick={() => jump(-1)} className="px-2 text-neutral-500 hover:text-neutral-200">
                        <ChevronLeft size={18} />
                    </button>
                    <p className="flex-1 py-2.5 text-[15px]" aria-live="polite">
                        {solved ? (
                            done
                        ) : (
                            <>
                                <span className="mr-2 whitespace-nowrap font-semibold text-blue-400">
                                    {word.num} {word.dir}
                                </span>
                                {word.clue}
                            </>
                        )}
                    </p>
                    <button aria-label="Next clue" onClick={() => jump(1)} className="px-2 text-neutral-500 hover:text-neutral-200">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div
                    className="relative mx-auto grid w-fit"
                    style={
                        {
                            // Whole-pixel squares that fit the column and the screen height, so
                            // the borders stay crisp.
                            "--cell": `round(down, min(52px, 100cqw / ${W}, (100svh - 260px) / ${H}), 1px)`,
                            gridTemplateColumns: `repeat(${W}, var(--cell))`,
                            gridTemplateRows: `repeat(${H}, var(--cell))`,
                        } as React.CSSProperties
                    }
                >
                    {letters.map((i) => {
                        const wrong = checked && fill[i] && fill[i] !== sol[i];
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "relative",
                                    SQUARE,
                                    i === cur.i ? "bg-blue-400/30" : !solved && word.cells.includes(i) ? "bg-blue-400/15" : "bg-neutral-900",
                                )}
                                style={{ gridRow: Math.floor(i / W) + 1, gridColumn: (i % W) + 1 }}
                            >
                                {nums[i] && (
                                    <span
                                        className="pointer-events-none absolute left-[7%] top-[4%] leading-none text-neutral-500"
                                        style={{ fontSize: "max(7px, calc(var(--cell) * 0.24))" }}
                                    >
                                        {nums[i]}
                                    </span>
                                )}
                                <span
                                    aria-hidden
                                    className={cn(
                                        "pointer-events-none absolute inset-0 grid place-items-center pt-[8%] font-medium leading-none",
                                        wrong ? "text-red-400" : hinted.has(i) ? "text-neutral-500" : "text-neutral-100",
                                    )}
                                    style={{ fontSize: "calc(var(--cell) * 0.55)" }}
                                >
                                    {fill[i]}
                                </span>
                                {wrong && (
                                    <span aria-hidden className="pointer-events-none absolute left-[18%] right-[18%] top-1/2 h-[2px] -rotate-[30deg] rounded bg-red-400" />
                                )}
                                <input
                                    ref={(el) => {
                                        refs.current[i] = el;
                                    }}
                                    value={fill[i]}
                                    aria-label={`${nums[i] ? `${nums[i]}, ` : ""}row ${Math.floor(i / W) + 1}, column ${(i % W) + 1}`}
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    onKeyDown={onKeyDown}
                                    onChange={(e) => {
                                        const ch = e.target.value.slice(-1).toUpperCase();
                                        if (/[A-Z]/.test(ch)) type(ch);
                                    }}
                                    onMouseDown={(e) => {
                                        // Clicking the active square again switches direction.
                                        e.preventDefault();
                                        go(i, document.activeElement === e.currentTarget ? flip(word.dir) : cur.dir);
                                    }}
                                    className="absolute inset-0 size-full cursor-pointer bg-transparent text-transparent caret-transparent outline-none"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center gap-1">
                    <span className="mr-auto text-sm tabular-nums">{time(seconds)}</span>
                    {tool("Hint", Lightbulb, hint)}
                    {tool("Check", CheckCheck, () => setChecked(true))}
                    {tool("Reveal", Eye, reveal)}
                    <button onClick={newPuzzle} className="ml-2 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-white">
                        New puzzle
                    </button>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-neutral-500">
                    Tap a square and type. Tap it again or press Space to switch direction. Tab jumps to the next clue, and arrows move between
                    squares.
                </p>
            </div>

            <div className="scrollbar-hide space-y-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                {clueList("across")}
                {clueList("down")}
            </div>
        </div>
    );
}

const noop = () => () => {};

export default function Crossword() {
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    const [mode, setMode] = useState<Mode>("easy");
    const [round, setRound] = useState(0);
    const [stats, setStats] = useState<Stats | null>(null);
    const shown = stats ?? (mounted ? readStats() : null);

    const onSolve = (seconds: number, hints: number) => {
        const prev = readStats();
        const s = prev[mode];
        // Hinted solves still count, but only clean ones can set a best time.
        const next = { ...prev, [mode]: { solved: s.solved + 1, best: hints ? s.best : Math.min(s.best ?? Infinity, seconds) } };
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(next));
        } catch {}
        setStats(next);
    };

    return (
        <>
            <div role="tablist" className="mt-6 inline-flex rounded-lg border border-neutral-800 p-0.5">
                {(Object.keys(MODES) as Mode[]).map((m) => (
                    <button
                        key={m}
                        role="tab"
                        aria-selected={m === mode}
                        onClick={() => setMode(m)}
                        className={cn(
                            "rounded-md px-3 py-1 text-sm",
                            m === mode ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-200",
                        )}
                    >
                        {MODES[m]}
                    </button>
                ))}
            </div>
            {mounted ? (
                <Board key={`${mode}-${round}`} mode={mode} best={shown?.[mode].best ?? null} onSolve={onSolve} onNext={() => setRound((r) => r + 1)} />
            ) : (
                <div className="mt-4 h-96" />
            )}
        </>
    );
}
