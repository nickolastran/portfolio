"use client";

import { ChevronLeft, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { tint } from "./backdrop";
import { addTile, canMove, newGrid, SIZE, slide } from "./engine.mjs";
import { cn } from "../../lib/utils";
import "./merge.css";

type Tile = { id: number; v: number };
type Game = { grid: (Tile | null)[]; score: number; nextId: number };
type Dir = "left" | "right" | "up" | "down";

const GAME_KEY = "merge-game";
const BEST_KEY = "merge-best";
const KEYS: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
// Font size by digit count, as a share of the board's width.
const FONT = [0, 12, 12, 10, 8, 6.5, 5.5];

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const fresh = (): Game => ({ grid: newGrid(), score: 0, nextId: 3 });

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

function MergeGame() {
    const [game, setGame] = useState<Game>(() => {
        const saved = load<Game | null>(GAME_KEY, null);
        return saved?.grid?.length === SIZE * SIZE ? saved : fresh();
    });
    const [best, setBest] = useState(() => load(BEST_KEY, 0));
    // The last move's merges and new tile, for their animations.
    const [last, setLast] = useState<{ merged: number[]; added: number | null }>({ merged: [], added: null });
    const scoreRef = useRef<HTMLParagraphElement>(null);
    const swipe = useRef<{ x: number; y: number } | null>(null);

    const { grid, score } = game;
    const over = !canMove(grid);

    useEffect(() => save(GAME_KEY, over ? null : game), [game, over]);

    const move = (dir: Dir) => {
        if (over) return;
        const res = slide(grid, dir);
        if (!res.moved) return;
        const total = score + res.points;
        setGame({ grid: addTile(res.grid, game.nextId), score: total, nextId: game.nextId + 1 });
        if (total > best) {
            setBest(total);
            save(BEST_KEY, total);
        }
        setLast({ merged: res.merged, added: game.nextId });
        if (res.points && !calm())
            scoreRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 250, easing: "ease-out" });
    };

    const restart = () => {
        if (score && !over && !confirm("Start a new game?")) return;
        setGame(fresh());
        setLast({ merged: [], added: null });
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || !KEYS[e.key]) return;
            e.preventDefault();
            move(KEYS[e.key]);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const onUp = (e: React.PointerEvent) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const [dx, dy] = [e.clientX - s.x, e.clientY - s.y];
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };

    // Sorted by id so tiles keep their place in the DOM and their slide.
    const tiles = grid
        .flatMap((t, i) => (t ? [{ ...t, r: Math.floor(i / SIZE), c: i % SIZE }] : []))
        .sort((a, b) => a.id - b.id);

    return (
        <div className="mx-auto max-w-md px-4 pb-12 pt-24">
            <header className="flex items-center gap-1">
                <Link
                    href="/games"
                    title="Games"
                    aria-label="Back to games"
                    className="-ml-3 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                >
                    <ChevronLeft size={22} />
                </Link>
                <h1 className="mr-auto text-2xl font-bold text-white">Merge</h1>
                <span className="flex items-center gap-1.5 text-sm tabular-nums text-neutral-500" title="Best" aria-label={`Best ${best}`}>
                    <Trophy size={16} aria-hidden />
                    {best}
                </span>
                <button
                    title="New game"
                    aria-label="New game"
                    onClick={restart}
                    className="-mr-2 ml-2 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200"
                >
                    <RotateCcw size={18} />
                </button>
            </header>

            <p ref={scoreRef} className="mb-3 mt-4 text-center text-5xl font-bold tabular-nums text-white" aria-live="polite" aria-label={`Score ${score}`}>
                {score}
            </p>

            <div
                role="img"
                aria-label={`Board: ${grid.map((t) => t?.v ?? "empty").join(", ")}`}
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    swipe.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerUp={onUp}
                onPointerCancel={() => (swipe.current = null)}
                className="@container relative aspect-square touch-none select-none rounded-xl bg-neutral-900 p-1"
            >
                <div className="relative size-full">
                    <div className="grid size-full grid-cols-4">
                        {grid.map((_, i) => (
                            <div key={i} className="p-1">
                                <div className="size-full rounded-lg bg-neutral-800/60" />
                            </div>
                        ))}
                    </div>
                    {tiles.map((t) => (
                        <div
                            key={t.id}
                            className="absolute left-0 top-0 size-1/4 p-1"
                            style={{ transform: `translate(${t.c * 100}%, ${t.r * 100}%)`, transition: "transform 110ms ease-in-out" }}
                        >
                            {/* Keyed by value, so a merge remounts it and the pop replays.
                                ponytail: the absorbed tile vanishes instead of sliding under;
                                keep it around for 110ms if that ever looks abrupt. */}
                            <div
                                key={t.v}
                                className={cn(
                                    "grid size-full place-items-center rounded-lg font-bold leading-none tabular-nums",
                                    t.id === last.added && "merge-in",
                                    last.merged.includes(t.id) && "merge-pop",
                                )}
                                style={{ ...tint(t.v), fontSize: `${FONT[Math.min(String(t.v).length, 6)]}cqw` }}
                            >
                                {t.v}
                            </div>
                        </div>
                    ))}
                </div>
                {over && (
                    <div className="absolute inset-0 grid place-items-center rounded-xl bg-neutral-950/70">
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white">No moves left</p>
                            <button onClick={restart} className="mt-3 rounded-lg bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-white" autoFocus>
                                Play again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const noop = () => () => {};

export default function Merge() {
    // Random tiles and localStorage only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    return mounted ? <MergeGame /> : null;
}
