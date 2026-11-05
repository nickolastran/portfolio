"use client";

import { ChevronLeft, Pause, Play, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { act, H, landing, newGame, speed, W } from "./engine.mjs";
import { dims } from "../blocks/engine.mjs";
import { cn } from "../../lib/utils";
import { paint } from "../palette";

type Piece = { cells: [number, number][]; color: number };
type Game = { board: number[]; cur: { piece: Piece; r: number; c: number }; next: Piece; score: number; lines: number; cleared: number; over: boolean };
type Action = "left" | "right" | "rotate" | "down" | "drop";

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const GAME_KEY = "stack-game";
const BEST_KEY = "stack-best";
// No color fade (globals.css): a falling piece would leave a trail.
const BLOCK = "rounded-[4px] shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)] transition-none";

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

function Shape({ piece, cell }: { piece: Piece; cell: string }) {
    const { h, w } = dims(piece);
    return (
        <div className="grid gap-[2px]" style={{ gridTemplate: `repeat(${h}, ${cell}) / repeat(${w}, ${cell})` }}>
            {piece.cells.map(([r, c]) => (
                <span key={`${r},${c}`} className={BLOCK} style={{ gridRow: r + 1, gridColumn: c + 1, backgroundColor: paint(piece.color) }} />
            ))}
        </div>
    );
}

function StackGame() {
    const [game, setGame] = useState<Game>(() => {
        const saved = load<Game | null>(GAME_KEY, null);
        return saved?.board?.length === W * H && saved.cur && !saved.over ? { ...saved, cleared: 0 } : newGame();
    });
    const [best, setBest] = useState(() => load(BEST_KEY, 0));
    // Always starts paused, so a refresh or a new tab never drops pieces unseen.
    const [playing, setPlaying] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);
    const scoreRef = useRef<HTMLParagraphElement>(null);
    const touch = useRef<{ x: number; y: number; y0: number; t: number; moved: boolean } | null>(null);

    const { board, cur, next, score, lines, over } = game;
    const live = playing && !over;
    const step = (a: Action) => live && setGame((g: Game) => act(g, a));

    // Gravity, faster every 10 lines.
    const level = Math.floor(lines / 10);
    useEffect(() => {
        if (!live) return;
        const t = setInterval(() => setGame((g: Game) => act(g, "down")), speed(level * 10));
        return () => clearInterval(t);
    }, [live, level]);

    useEffect(() => save(GAME_KEY, over ? null : game), [game, over]);

    useEffect(() => {
        if (score <= best) return;
        setBest(score);
        save(BEST_KEY, score);
    }, [score, best]);

    // A clear: the board glows, shakes for more than one row, and the score bumps.
    useEffect(() => {
        if (!game.cleared || calm()) return;
        boardRef.current?.animate(
            [{ boxShadow: `0 0 0 2px #fff8, 0 0 ${16 + 16 * game.cleared}px #fff6` }, { boxShadow: "0 0 0 0 transparent" }],
            { duration: 600, easing: "ease-out" },
        );
        if (game.cleared > 1)
            boardRef.current?.animate(
                [{ transform: "none" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "none" }],
                { duration: 350 },
            );
        scoreRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 350, easing: "ease-out" });
    }, [game]);

    // Leaving the tab pauses.
    useEffect(() => {
        const stop = () => setPlaying(false);
        const onVis = () => document.hidden && stop();
        window.addEventListener("blur", stop);
        document.addEventListener("visibilitychange", onVis);
        return () => {
            window.removeEventListener("blur", stop);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, []);

    const restart = () => {
        if (score && !over && !confirm("Start a new game?")) return;
        setGame(newGame());
        setPlaying(true);
    };

    /* ---------- Keyboard ---------- */

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const a = ({ ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", x: "rotate", ArrowDown: "down", " ": "drop" } as Record<string, Action>)[e.key];
            if (over && (e.key === "Enter" || e.key === " ")) restart();
            else if (!playing && (e.key === "Enter" || e.key === " ")) setPlaying(true);
            else if (e.key === "Escape" || e.key === "p") setPlaying((p) => !p);
            else if (a && live) step(a);
            else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    /* ---------- Touch: drag to move, tap to turn, flick down to drop ---------- */

    const cellPx = () => boardRef.current!.getBoundingClientRect().width / W;

    const onDown = (e: React.PointerEvent) => {
        if (!live) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        touch.current = { x: e.clientX, y: e.clientY, y0: e.clientY, t: performance.now(), moved: false };
    };

    const onMove = (e: React.PointerEvent) => {
        const p = touch.current;
        if (!p) return;
        const cell = cellPx();
        for (; e.clientX - p.x >= cell; p.x += cell, p.moved = true) step("right");
        for (; p.x - e.clientX >= cell; p.x -= cell, p.moved = true) step("left");
        for (; e.clientY - p.y >= cell; p.y += cell, p.moved = true) step("down");
    };

    const onUp = (e: React.PointerEvent) => {
        const p = touch.current;
        touch.current = null;
        if (!p) return;
        if (!p.moved) step("rotate");
        else if (e.clientY - p.y0 > cellPx() * 2 && performance.now() - p.t < 250) step("drop");
    };

    /* ---------- Render ---------- */

    const ghostR = landing(game);
    const at = (r: number) => new Map(cur.piece.cells.map(([dr, dc]) => [(r + dr) * W + cur.c + dc, cur.piece.color]));
    const falling = at(cur.r);
    const ghost = at(ghostR);

    return (
        <div className="@container mx-auto max-w-md px-4 pb-12 pt-24">
            <header className="flex items-center gap-1">
                <Link
                    href="/games"
                    title="Games"
                    aria-label="Back to games"
                    className="-ml-3 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                >
                    <ChevronLeft size={22} />
                </Link>
                <h1 className="mr-auto text-2xl font-bold text-white">Stack</h1>
                <span className="mr-2 flex items-center gap-1.5 text-sm tabular-nums text-neutral-500" title="Best" aria-label={`Best ${best}`}>
                    <Trophy size={16} aria-hidden />
                    {best}
                </span>
                <button
                    title={playing ? "Pause (Esc)" : "Play"}
                    aria-label={playing ? "Pause" : "Play"}
                    disabled={over}
                    onClick={() => setPlaying((p) => !p)}
                    className="grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200 disabled:opacity-30"
                >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                    title="New game"
                    aria-label="New game"
                    onClick={restart}
                    className="-mr-2 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                >
                    <RotateCcw size={18} />
                </button>
            </header>

            <div
                className="mx-auto w-fit"
                style={{ "--cell": `min(34px, (100cqw - 12px) / ${W} - 4px, (100svh - 300px) / ${H})` } as React.CSSProperties}
            >
                <div className="mb-3 mt-4 flex h-14 items-center justify-between">
                    <p ref={scoreRef} className="text-4xl font-bold tabular-nums text-white" aria-live="polite" aria-label={`Score ${score}`}>
                        {score}
                    </p>
                    <div aria-label="Next piece">
                        <Shape piece={next} cell="10px" />
                    </div>
                </div>

                <div
                    ref={boardRef}
                    role="img"
                    aria-label={`Board, ${board.filter(Boolean).length} squares filled`}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={() => (touch.current = null)}
                    className="relative grid touch-none select-none gap-1 rounded-xl bg-neutral-900 p-1.5"
                    style={{ gridTemplate: `repeat(${H}, var(--cell)) / repeat(${W}, var(--cell))` }}
                >
                    {board.map((v, i) => {
                        const color = v || falling.get(i);
                        return (
                            <div
                                key={i}
                                className={cn(color ? BLOCK : "rounded-[4px] bg-neutral-800/60 transition-none", !color && ghost.has(i) && live && "ring-2 ring-inset ring-white/25")}
                                style={color ? { backgroundColor: paint(color) } : undefined}
                            />
                        );
                    })}
                    {(over || !playing) && (
                        <div className="absolute inset-0 grid place-items-center rounded-xl bg-neutral-950/70">
                            <div className="text-center">
                                {over && <p className="text-lg font-semibold text-white">Game over</p>}
                                <button
                                    onClick={over ? restart : () => setPlaying(true)}
                                    className="mt-3 rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white"
                                    autoFocus
                                >
                                    {over ? "Play again" : score ? "Resume" : "Play"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const noop = () => () => {};

export default function Stack() {
    // Random pieces and localStorage only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    return mounted ? <StackGame /> : null;
}
