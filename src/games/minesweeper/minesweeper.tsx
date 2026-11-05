"use client";

import { Bomb, ChevronLeft, Flag, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { board, chord, FLAG, generate, HIDDEN, lost, MODES, OPEN, reveal, won } from "./engine.mjs";
import { cn } from "../../lib/utils";
import { paint } from "../palette";

type Mode = keyof typeof MODES;
type Board = ReturnType<typeof board>;
type Saved = { mines: number[]; shown: number[]; seconds: number };
type Best = Record<Mode, number | null>;

const NAMES: Record<Mode, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
// The classic number hues (1 blue, 2 green, 3 red, 4 violet...) taken from the shared palette; 8 is gray.
const NUM_COLORS = ["", paint(10), paint(6), paint(1), paint(13), paint(2), paint(8), paint(14), "#d4d4d4"];
const BEST_KEY = "minesweeper-best";
const ICON = "size-[55%]";
// Status colors, from the same palette: red for flags and mines, green for a win.
const RED = paint(1);
const GREEN = paint(6);

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveKey = (mode: Mode) => `minesweeper-${mode}`;

function load<T>(key: string, fallback: T): T {
    try {
        return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
    } catch {
        return fallback;
    }
}

function save(key: string, value: unknown) {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

function Game({ mode, best, onWin, onNew }: { mode: Mode; best: number | null; onWin: (seconds: number) => void; onNew: () => void }) {
    const { w, h, mines: count } = MODES[mode];
    const [saved] = useState(() => {
        const s = load<Saved | null>(saveKey(mode), null);
        return s?.mines?.length === w * h && s.shown?.length === w * h ? s : null;
    });
    // No mines until the first click, so it always lands on open ground.
    const [b, setB] = useState<Board | null>(() => (saved ? board(w, h, saved.mines) : null));
    const [shown, setShown] = useState<number[]>(() => saved?.shown ?? Array(w * h).fill(HIDDEN));
    const [seconds, setSeconds] = useState(saved?.seconds ?? 0);
    const [flagging, setFlagging] = useState(false);
    const [cur, setCur] = useState<number | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
    const held = useRef(false);
    const touch = useRef(false);

    const dead = !!b && lost(b, shown);
    const cleared = !!b && won(b, shown);
    const over = dead || cleared;
    const left = count - shown.filter((s) => s === FLAG).length;

    useEffect(() => {
        if (!b || over) return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [b, over]);

    // A finished game isn't kept: the next visit deals a new one.
    useEffect(() => save(saveKey(mode), b && !over ? { mines: b.mines, shown, seconds } : null), [mode, b, shown, seconds, over]);

    const glow = (keyframes: Keyframe[], duration: number) => !calm() && boardRef.current?.animate(keyframes, { duration, easing: "ease-out" });

    const act = (i: number, flag = flagging) => {
        if (over) return;
        // Open numbers chord in either mode; hidden squares open or take a flag.
        if (shown[i] === HIDDEN && flag) return setShown(shown.map((v, j) => (j === i ? FLAG : v)));
        if (shown[i] === FLAG) return flag && setShown(shown.map((v, j) => (j === i ? HIDDEN : v)));
        const g = b ?? generate(mode, i);
        if (!b) setB(g);
        const next = shown[i] === OPEN ? chord(g, shown, i) : reveal(g, shown, [i]);
        if (won(g, next)) {
            setShown(next.map((v, j) => (g.mines[j] ? FLAG : v)));
            onWin(seconds);
            glow([{ boxShadow: `0 0 0 2px ${GREEN}, 0 0 48px ${GREEN}` }, { boxShadow: "0 0 0 0 transparent" }], 900);
        } else {
            setShown(next);
            if (lost(g, next))
                glow([{ transform: "none" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-3px)" }, { transform: "none" }], 350);
        }
    };

    const restart = () => {
        if (b && !over && !confirm("Start a new game?")) return;
        save(saveKey(mode), null);
        onNew();
    };

    /* ---------- Touch: long-press does the other action ---------- */

    const release = () => {
        if (press.current) clearTimeout(press.current.timer);
        press.current = null;
    };

    const onDown = (e: React.PointerEvent, i: number) => {
        touch.current = e.pointerType === "touch";
        held.current = false;
        if (!touch.current) return;
        press.current = {
            x: e.clientX,
            y: e.clientY,
            timer: setTimeout(() => {
                held.current = true;
                navigator.vibrate?.(15);
                act(i, !flagging);
            }, 350),
        };
    };

    // Moving the finger means scrolling the board, not pressing.
    const onMove = (e: React.PointerEvent) => {
        if (press.current && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8) release();
    };

    /* ---------- Keyboard ---------- */

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const arrow = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, number[]>)[e.key];
            if (e.key === " ") setFlagging((f) => !f);
            else if (arrow) {
                const i = cur ?? Math.floor(h / 2) * w + Math.floor(w / 2);
                const r = Math.min(h - 1, Math.max(0, Math.floor(i / w) + (cur === null ? 0 : arrow[0])));
                const c = Math.min(w - 1, Math.max(0, (i % w) + (cur === null ? 0 : arrow[1])));
                setCur(r * w + c);
            } else if (cur !== null && e.key === "Enter") act(cur);
            else if (cur !== null && e.key.toLowerCase() === "f") act(cur, !flagging);
            else if (e.key === "Escape") setCur(null);
            else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    /* ---------- Render ---------- */

    const label = (i: number) => {
        const s = shown[i];
        const what = s === FLAG ? "flagged" : s === HIDDEN ? "hidden" : b?.mines[i] ? "mine" : b?.nums[i] || "empty";
        return `Row ${Math.floor(i / w) + 1}, column ${(i % w) + 1}, ${what}`;
    };

    return (
        <>
            <div className="mt-6 flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-sm tabular-nums text-neutral-400" aria-label={`${left} mines left`}>
                    <Bomb size={16} aria-hidden />
                    {left}
                </span>
                <span className="text-sm tabular-nums text-neutral-400">{time(seconds)}</span>
            </div>

            <div className="mt-2 max-w-full overflow-x-auto overscroll-x-contain">
                <div
                    ref={boardRef}
                    role="grid"
                    aria-label={`${NAMES[mode]} board`}
                    onContextMenu={(e) => e.preventDefault()}
                    className="mx-auto grid w-fit select-none gap-[2px] rounded-xl bg-neutral-900 p-1.5 [-webkit-touch-callout:none]"
                    style={
                        {
                            // Squares fill the column up to 40px; Hard scrolls sideways on a phone.
                            "--cell": `clamp(20px, calc((100cqw - 12px) / ${w} - 2px), 40px)`,
                            gridTemplateColumns: `repeat(${w}, var(--cell))`,
                        } as React.CSSProperties
                    }
                >
                    {shown.map((s, i) => {
                        const mine = !!b?.mines[i];
                        const n = b?.nums[i] ?? 0;
                        return (
                            <button
                                key={i}
                                tabIndex={-1}
                                aria-label={label(i)}
                                onPointerDown={(e) => onDown(e, i)}
                                onPointerMove={onMove}
                                onPointerUp={release}
                                onPointerCancel={release}
                                onPointerLeave={release}
                                onContextMenu={() => !touch.current && act(i, true)}
                                onClick={() => (held.current ? (held.current = false) : act(i))}
                                className={cn(
                                    "grid size-[var(--cell)] place-items-center rounded-[4px] font-bold leading-none",
                                    s === OPEN
                                        ? mine
                                            ? "text-neutral-950"
                                            : "bg-neutral-800/40"
                                        : cn("bg-neutral-700 shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)]", !over && "hover:bg-neutral-600"),
                                    cur === i && "ring-2 ring-inset ring-white/70",
                                )}
                                style={{ fontSize: "calc(var(--cell) * 0.55)", color: s === OPEN && !mine ? NUM_COLORS[n] : undefined, backgroundColor: s === OPEN && mine ? RED : undefined }}
                            >
                                {s === OPEN ? (
                                    mine ? <Bomb className={ICON} /> : n || ""
                                ) : s === FLAG ? (
                                    dead && !mine ? <X className={ICON} color={RED} /> : <Flag className={ICON} color={cleared ? GREEN : RED} />
                                ) : (
                                    dead && mine && <Bomb className={cn(ICON, "text-neutral-400")} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex min-h-10 items-center gap-2">
                {over ? (
                    <>
                        <p className="mr-auto text-sm" aria-live="polite">
                            {cleared ? [`Cleared in ${time(seconds)}`, best != null && `Best ${time(best)}`].filter(Boolean).join(" · ") : "Boom"}
                        </p>
                        <button onClick={onNew} className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-white" autoFocus>
                            Play again
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            title="Flag mode (Space)"
                            aria-label="Flag mode"
                            aria-pressed={flagging}
                            onClick={() => setFlagging((f) => !f)}
                            className={cn(
                                "grid size-10 place-items-center rounded-lg",
                                flagging ? "bg-neutral-800" : "text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200",
                            )}
                            style={flagging ? { color: RED } : undefined}
                        >
                            <Flag size={18} />
                        </button>
                        <button
                            title="New game"
                            aria-label="New game"
                            onClick={restart}
                            className="-mr-2 ml-auto grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

const noop = () => () => {};

export default function Minesweeper() {
    // Random boards and localStorage only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    const [mode, setMode] = useState<Mode>("easy");
    const [round, setRound] = useState(0);
    const [best, setBest] = useState<Best | null>(null);
    const shown = best ?? (mounted ? load<Best>(BEST_KEY, { easy: null, medium: null, hard: null }) : null);

    const onWin = (seconds: number) => {
        const prev = load<Best>(BEST_KEY, { easy: null, medium: null, hard: null });
        const next = { ...prev, [mode]: Math.min(prev[mode] ?? Infinity, seconds) };
        save(BEST_KEY, next);
        setBest(next);
    };

    return (
        <div className="@container mx-auto max-w-4xl px-4 pb-12 pt-24">
            <div className="mx-auto w-fit min-w-full max-w-full sm:min-w-80">
                <header className="flex items-center">
                    <Link
                        href="/games"
                        title="Games"
                        aria-label="Back to games"
                        className="-ml-3 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                    >
                        <ChevronLeft size={22} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Minesweeper</h1>
                </header>
                <div role="tablist" className="mt-6 inline-flex rounded-lg border border-neutral-800 p-0.5">
                    {(Object.keys(NAMES) as Mode[]).map((m) => (
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
                            {NAMES[m]}
                        </button>
                    ))}
                </div>
                {mounted ? (
                    <Game key={`${mode}-${round}`} mode={mode} best={shown?.[mode] ?? null} onWin={onWin} onNew={() => setRound((r) => r + 1)} />
                ) : (
                    <div className="h-96" />
                )}
            </div>
        </div>
    );
}
