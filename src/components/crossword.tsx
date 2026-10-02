"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { generate } from "../lib/crossword.mjs";
import { cn } from "../lib/utils";
import "./crossword.css";

type Mode = "easy" | "hard";
type Dir = "across" | "down";
type Word = { answer: string; clue: string; dir: Dir; r: number; c: number; num: number; cells: number[] };
type Stats = Record<Mode, { solved: number; best: number | null }>;
type Raw = { w: number; h: number; words: Omit<Word, "cells">[] };
type Saved = { raw: Raw; fill: string[]; hinted: number[]; seconds: number };

const STATS_KEY = "crossword-stats";
const MODES: Record<Mode, string> = { easy: "Easy", hard: "Hard" };
const BLURB: Record<Mode, string> = {
    easy: "Seven everyday words.",
    hard: "Fourteen longer words with trickier clues.",
};

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const flip = (d: Dir): Dir => (d === "across" ? "down" : "across");

function readStats(): Stats {
    const empty = { easy: { solved: 0, best: null }, hard: { solved: 0, best: null } };
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

/* Lays the generated answers onto a flat grid, with a one-square paper margin
   around the letters so the board never sits flush against its edge. */
function layout(raw: Raw) {
    const W = raw.w + 2;
    const H = raw.h + 2;
    const sol: string[] = Array(W * H).fill("");
    const at: Record<Dir, number[]> = { across: [], down: [] };
    const nums: number[] = [];
    const words: Word[] = raw.words.map((w, wi) => {
        const cells = [...w.answer].map((ch, k) => {
            const i = (w.r + 1 + (w.dir === "down" ? k : 0)) * W + w.c + 1 + (w.dir === "across" ? k : 0);
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

function Board({ mode, onSolve, onNext }: { mode: Mode; onSolve: (seconds: number, hints: number) => void; onNext: () => void }) {
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
    const progress = letters.filter((i) => fill[i]).length;

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

    const marker = (w: Word, i = 0) => (
        <div
            key={`${w.num}${w.dir}${solved}`}
            aria-hidden
            className={cn(
                "pointer-events-none z-20 rounded-[3px] bg-[#ffe45e] mix-blend-multiply",
                w.dir === "across" ? "marker-x" : "marker-y",
            )}
            style={{
                gridRow: `${Math.floor(w.cells[0] / W) + 1} / span ${w.dir === "down" ? w.cells.length : 1}`,
                gridColumn: `${(w.cells[0] % W) + 1} / span ${w.dir === "across" ? w.cells.length : 1}`,
                animationDelay: `${i * 90}ms`,
            }}
        />
    );

    const clueList = (dir: Dir) => (
        <div>
            <h3 className="font-semibold text-[#1c2a7a] mb-2">{dir === "across" ? "Across" : "Down"}</h3>
            <ol className="space-y-0.5">
                {order
                    .filter((w) => w.dir === dir)
                    .map((w) => {
                        const done = w.cells.every((j) => fill[j]);
                        return (
                            <li key={w.num}>
                                <button
                                    onClick={() => go(w.cells.find((j) => !fill[j]) ?? w.cells[0], dir)}
                                    className={cn(
                                        "w-full text-left flex gap-3 rounded-[4px] px-2 py-1 text-[15px] leading-snug text-neutral-800 hover:bg-[#eef3fa]",
                                        w === word && "bg-[#ffe45e] hover:bg-[#ffe45e]",
                                        done && w !== word && "text-neutral-400 line-through decoration-neutral-300",
                                    )}
                                >
                                    <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{w.num}</span>
                                    <span>{w.clue}</span>
                                </button>
                            </li>
                        );
                    })}
            </ol>
        </div>
    );

    const tool = "rounded-md border border-[#c9d6e8] bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-[#1c2a7a] hover:text-[#1c2a7a] disabled:opacity-40 disabled:hover:border-[#c9d6e8] disabled:hover:text-neutral-700";

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
            <div className="@container min-w-0">
                <div className="sticky top-20 lg:top-4 z-30 mb-3 flex items-stretch rounded-lg border border-[#c9d6e8] bg-white/95 backdrop-blur">
                    <button aria-label="Previous clue" onClick={() => jump(-1)} className="px-2 text-neutral-400 hover:text-[#1c2a7a]">
                        <ChevronLeft size={18} />
                    </button>
                    <p className="flex-1 py-2.5 text-[15px] text-neutral-800">
                        <span className="font-semibold text-[#1c2a7a] mr-2 whitespace-nowrap">
                            {word.num} {word.dir}
                        </span>
                        {word.clue}
                    </p>
                    <button aria-label="Next clue" onClick={() => jump(1)} className="px-2 text-neutral-400 hover:text-[#1c2a7a]">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div
                    className="graph-paper relative grid rounded-[3px] ring-1 ring-[#c9d6e8] mx-auto w-fit"
                    style={
                        {
                            // Whole-pixel squares that fit the column and the screen height, so
                            // cell borders land on the graph lines and stay crisp.
                            "--cell": `round(down, min(52px, 100cqw / ${W}, (100svh - 240px) / ${H}), 1px)`,
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
                                    "cell relative z-10 bg-white",
                                    i === cur.i && "cell-active z-30",
                                )}
                                style={{ gridRow: Math.floor(i / W) + 1, gridColumn: (i % W) + 1 }}
                            >
                                {nums[i] && (
                                    <span
                                        className="absolute left-[7%] top-[4%] leading-none text-[#1c2a7a]/70 pointer-events-none font-medium"
                                        style={{ fontSize: "max(7px, calc(var(--cell) * 0.24))" }}
                                    >
                                        {nums[i]}
                                    </span>
                                )}
                                <span
                                    key={fill[i]}
                                    aria-hidden
                                    className={cn(
                                        "ink pointer-events-none absolute inset-0 grid place-items-center pt-[10%] leading-none",
                                        hinted.has(i) ? "text-[#8b93a1]" : "text-[#1c2a7a]",
                                        wrong && "text-[#d93d3d]",
                                    )}
                                    style={{ fontSize: "calc(var(--cell) * 0.62)", fontFamily: "var(--font-ink)" }}
                                >
                                    {fill[i]}
                                </span>
                                {wrong && (
                                    <span aria-hidden className="pointer-events-none absolute left-[18%] right-[18%] top-1/2 h-[2px] -rotate-[30deg] rounded bg-[#d93d3d]" />
                                )}
                                <input
                                    ref={(el) => {
                                        refs.current[i] = el;
                                    }}
                                    value={fill[i]}
                                    aria-label={`${nums[i] ? `${nums[i]}, ` : ""}row ${Math.floor(i / W)}, column ${i % W}`}
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
                                    className="absolute inset-0 size-full bg-transparent text-transparent caret-transparent outline-none cursor-pointer"
                                />
                            </div>
                        );
                    })}
                    {solved ? order.map(marker) : marker(word)}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-auto text-sm text-neutral-500 tabular-nums">
                        {time(seconds)}
                        <span className="mx-2 text-neutral-300">/</span>
                        {progress} of {letters.length} squares
                    </span>
                    <button className={tool} disabled={solved} onClick={hint}>
                        Hint
                    </button>
                    <button className={tool} disabled={solved} onClick={() => setChecked(true)}>
                        Check
                    </button>
                    <button className={tool} disabled={solved} onClick={reveal}>
                        Reveal
                    </button>
                    <button onClick={newPuzzle} className="rounded-md bg-[#1c2a7a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2a3a96]">
                        New puzzle
                    </button>
                </div>
            </div>

            <div className="space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide lg:sticky lg:top-4">
                {solved && (
                    <div className="rounded-lg border border-[#1c2a7a] bg-[#f3f6fd] p-4">
                        <p className="text-lg text-[#1c2a7a]" style={{ fontFamily: "var(--font-ink)" }}>
                            {gaveUp ? "Here's the answer key." : `Solved in ${time(seconds)}${hinted.size ? ` with ${hinted.size} hint${hinted.size > 1 ? "s" : ""}` : ""}.`}
                        </p>
                        <button onClick={newPuzzle} className="mt-3 rounded-md bg-[#1c2a7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a3a96]">
                            Next puzzle
                        </button>
                    </div>
                )}
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
            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-3">
                <div role="tablist" className="inline-flex rounded-lg border border-[#c9d6e8] bg-white p-1">
                    {(Object.keys(MODES) as Mode[]).map((m) => (
                        <button
                            key={m}
                            role="tab"
                            aria-selected={m === mode}
                            onClick={() => setMode(m)}
                            className={cn(
                                "rounded-md px-4 py-1.5 text-sm font-medium",
                                m === mode ? "bg-[#1c2a7a] text-white" : "text-neutral-600 hover:text-[#1c2a7a]",
                            )}
                        >
                            {MODES[m]}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-neutral-500 pb-2">
                    {BLURB[mode]}
                    {shown && shown[mode].solved > 0 &&
                        ` You've solved ${shown[mode].solved}${shown[mode].best != null ? `, best time ${time(shown[mode].best!)}` : ""}.`}
                </p>
            </div>
            {mounted ? (
                <Board key={`${mode}-${round}`} mode={mode} onSolve={onSolve} onNext={() => setRound((r) => r + 1)} />
            ) : (
                <div className="mt-8 h-96 rounded-lg border border-[#c9d6e8] graph-paper" />
            )}
        </>
    );
}
