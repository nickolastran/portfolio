"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PUZZLES, type Puzzle } from "../constants/crosswords";
import { cn } from "../lib/utils";

type Dir = "across" | "down";
type Word = { num: number; dir: Dir; cells: number[]; clue: string };

/* Numbers cells and slices the solution into words the way a printed grid
   does: a cell starts a word when the cell before it is a wall or a block. */
function build({ rows, across, down }: Puzzle) {
    const n = rows.length;
    const sol = rows.join("");
    const nums: number[] = [];
    const words: Word[] = [];
    const at: Record<Dir, number[]> = { across: [], down: [] };
    let num = 0;
    for (let i = 0; i < sol.length; i++) {
        if (sol[i] === "#") continue;
        const r = Math.floor(i / n);
        const c = i % n;
        const starts = {
            across: (c === 0 || sol[i - 1] === "#") && c + 1 < n && sol[i + 1] !== "#",
            down: (r === 0 || sol[i - n] === "#") && r + 1 < n && sol[i + n] !== "#",
        };
        if (!starts.across && !starts.down) continue;
        nums[i] = ++num;
        for (const dir of ["across", "down"] as const) {
            if (!starts[dir]) continue;
            const cells: number[] = [];
            for (
                let j = i;
                j < sol.length && sol[j] !== "#" && (dir === "down" || j < (r + 1) * n);
                j += dir === "across" ? 1 : n
            ) {
                cells.push(j);
                at[dir][j] = words.length;
            }
            words.push({ num, dir, cells, clue: (dir === "across" ? across : down)[num] });
        }
    }
    // Tab order: every across clue, then every down clue.
    const order = [...words.filter((w) => w.dir === "across"), ...words.filter((w) => w.dir === "down")];
    return { n, sol, nums, words, at, order };
}

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Board({ puzzle }: { puzzle: Puzzle }) {
    const { n, sol, nums, words, at, order } = useMemo(() => build(puzzle), [puzzle]);
    const [fill, setFill] = useState(() => Array.from(sol, () => ""));
    const [cur, setCur] = useState({ i: sol.search(/[A-Z]/), dir: "across" as Dir });
    const [checked, setChecked] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const word = words[at[cur.dir][cur.i]];
    const solved = fill.every((v, i) => sol[i] === "#" || v === sol[i]);

    useEffect(() => {
        if (solved) return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [solved]);

    const go = (i: number, dir: Dir = cur.dir) => {
        setCur({ i, dir });
        refs.current[i]?.focus();
    };

    const jump = (delta: number) => {
        const next = order[(order.indexOf(word) + delta + order.length) % order.length];
        go(next.cells.find((j) => !fill[j]) ?? next.cells[0], next.dir);
    };

    const type = (ch: string) => {
        setFill((f) => f.map((v, j) => (j === cur.i ? ch : v)));
        const k = word.cells.indexOf(cur.i);
        if (k < word.cells.length - 1) go(word.cells[k + 1]);
        else jump(1);
    };

    // Step to the next white square in a direction, hopping over blocks.
    const step = (dr: number, dc: number) => {
        let r = Math.floor(cur.i / n) + dr;
        let c = (cur.i % n) + dc;
        while (r >= 0 && r < n && c >= 0 && c < n) {
            if (sol[r * n + c] !== "#") return go(r * n + c);
            r += dr;
            c += dc;
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        const k = e.key;
        const arrow = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[k];
        if (/^[a-z]$/i.test(k) && !e.metaKey && !e.ctrlKey) type(k.toUpperCase());
        else if (k === "Backspace") {
            const k2 = word.cells.indexOf(cur.i);
            if (fill[cur.i] || k2 === 0) setFill((f) => f.map((v, j) => (j === cur.i ? "" : v)));
            else {
                const prev = word.cells[k2 - 1];
                setFill((f) => f.map((v, j) => (j === prev ? "" : v)));
                go(prev);
            }
        } else if (arrow) {
            const along = cur.dir === "across" ? arrow[0] === 0 : arrow[1] === 0;
            if (along) step(arrow[0], arrow[1]);
            else go(cur.i, cur.dir === "across" ? "down" : "across");
        } else if (k === "Tab" || k === "Enter") jump(e.shiftKey ? -1 : 1);
        else if (k === " ") go(cur.i, cur.dir === "across" ? "down" : "across");
        else return; // let the browser handle it (e.g. mobile keyboards fire onChange)
        e.preventDefault();
    };

    const clueList = (dir: Dir) => (
        <div className="min-h-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                {dir}
            </h3>
            <ol className="space-y-0.5">
                {words
                    .filter((w) => w.dir === dir)
                    .map((w) => (
                        <li key={w.num}>
                            <button
                                onClick={() => go(w.cells.find((j) => !fill[j]) ?? w.cells[0], dir)}
                                className={cn(
                                    "w-full text-left flex gap-2 rounded-md px-2 py-1 text-sm hover:bg-white/5",
                                    w === word && "bg-sky-500/20 text-white",
                                    w.cells.every((j) => fill[j]) && w !== word && "text-neutral-500",
                                )}
                            >
                                <span className="font-bold w-6 shrink-0 text-right">{w.num}</span>
                                <span>{w.clue}</span>
                            </button>
                        </li>
                    ))}
            </ol>
        </div>
    );

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                <span className="font-mono tabular-nums text-neutral-400 mr-auto">{time(seconds)}</span>
                {[
                    ["Check", () => setChecked(true)],
                    ["Reveal", () => setFill(Array.from(sol, (ch) => (ch === "#" ? "" : ch)))],
                    ["Clear", () => (setFill(Array.from(sol, () => "")), setChecked(false))],
                ].map(([label, fn]) => (
                    <button
                        key={label as string}
                        onClick={fn as () => void}
                        className="rounded-full border border-white/10 px-3 py-1 text-neutral-300 hover:bg-white/5"
                    >
                        {label as string}
                    </button>
                ))}
            </div>

            {solved && (
                <p className="mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-emerald-300 text-sm">
                    Solved in {time(seconds)}. Nice.
                </p>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className={cn("w-full shrink-0", n > 5 ? "lg:max-w-[540px]" : "max-w-[340px] mx-auto lg:mx-0")}>
                    <div className="sticky top-20 z-10 mb-2 rounded-lg bg-sky-500/20 px-3 py-2 text-sm text-white backdrop-blur">
                        <span className="font-bold mr-2">
                            {word.num}
                            {word.dir === "across" ? "A" : "D"}
                        </span>
                        {word.clue}
                    </div>
                    <div
                        className="@container grid aspect-square border-2 border-neutral-400 bg-neutral-400 gap-px"
                        style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                    >
                        {Array.from(sol, (ch, i) =>
                            ch === "#" ? (
                                <div key={i} className="bg-neutral-950" />
                            ) : (
                                <div key={i} className="relative">
                                    {nums[i] && (
                                        <span
                                            className="absolute left-[6%] top-[2%] leading-none text-neutral-600 pointer-events-none"
                                            style={{ fontSize: `${26 / n}cqw` }}
                                        >
                                            {nums[i]}
                                        </span>
                                    )}
                                    <input
                                        ref={(el) => {
                                            refs.current[i] = el;
                                        }}
                                        value={fill[i]}
                                        aria-label={`Row ${Math.floor(i / n) + 1}, column ${(i % n) + 1}`}
                                        autoComplete="off"
                                        autoCapitalize="characters"
                                        onKeyDown={onKeyDown}
                                        onChange={(e) => {
                                            const ch = e.target.value.slice(-1).toUpperCase();
                                            if (/[A-Z]/.test(ch)) type(ch);
                                        }}
                                        onMouseDown={(e) => {
                                            // Clicking the active square flips direction, like the NYT.
                                            e.preventDefault();
                                            const again = document.activeElement === e.currentTarget;
                                            go(i, again ? (cur.dir === "across" ? "down" : "across") : cur.dir);
                                        }}
                                        style={{ fontSize: `${58 / n}cqw` }}
                                        className={cn(
                                            "block size-full pt-[12%] text-center font-semibold uppercase caret-transparent outline-none cursor-pointer bg-neutral-100 text-neutral-900",
                                            word.cells.includes(i) && "bg-sky-200",
                                            i === cur.i && "bg-amber-300",
                                            checked && fill[i] && fill[i] !== ch && "text-red-600",
                                            solved && "text-sky-800",
                                        )}
                                    />
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 lg:max-h-[600px] lg:overflow-y-auto scrollbar-hide flex-1">
                    {clueList("across")}
                    {clueList("down")}
                </div>
            </div>
        </div>
    );
}

export default function Crossword() {
    const [mode, setMode] = useState<keyof typeof PUZZLES>("easy");
    return (
        <>
            <div className="mt-6 inline-flex rounded-full border border-white/10 p-1 text-sm">
                {(["easy", "hard"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                            "rounded-full px-4 py-1",
                            m === mode ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white",
                        )}
                    >
                        {m === "easy" ? "Easy · Mini" : "Hard · Daily"}
                    </button>
                ))}
            </div>
            {/* key remounts the board so switching modes starts fresh */}
            <Board key={mode} puzzle={PUZZLES[mode]} />
        </>
    );
}
