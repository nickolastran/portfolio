"use client";

import { ChevronLeft, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { canMove, deal, dims, fits, place, randomPiece, SIZE } from "../lib/blocks.mjs";
import { cn } from "../lib/utils";

type Piece = ReturnType<typeof randomPiece>;
type Game = { board: number[]; pieces: (Piece | null)[]; score: number };
type Spot = [number, number];

// One color per shape: hues spread evenly around the wheel, alternating light
// and dark so neighbors still read as different.
const paint = (n: number) => `oklch(${n % 2 ? 0.72 : 0.84} 0.16 ${n * 24})`;
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
type Flash = { id: number; colors: Record<number, number>; delays: Record<number, number>; color: number; points: number; lines: number; x: number; y: number };
const GAME_KEY = "blocks-game";
const BEST_KEY = "blocks-best";

const fresh = (): Game => ({ board: Array(SIZE * SIZE).fill(0), pieces: deal(), score: 0 });
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function load<T>(key: string, fallback: T): T {
    try {
        return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
    } catch {
        return fallback;
    }
}

function save(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

/** Top-left spot that centers the piece on square r, c, kept on the board. */
function center(p: Piece, r: number, c: number): Spot {
    const { h, w } = dims(p);
    return [clamp(r - (h >> 1), 0, SIZE - h), clamp(c - (w >> 1), 0, SIZE - w)];
}

/** A piece drawn as a little grid; `cell` is any CSS length. */
function Shape({ piece, cell }: { piece: Piece; cell: string }) {
    const { h, w } = dims(piece);
    return (
        <div className="grid gap-[2px]" style={{ gridTemplate: `repeat(${h}, ${cell}) / repeat(${w}, ${cell})` }}>
            {piece.cells.map(([r, c]) => (
                <span
                    key={`${r},${c}`}
                    className="rounded-[3px] shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)]"
                    style={{ gridRow: r + 1, gridColumn: c + 1, backgroundColor: paint(piece.color) }}
                />
            ))}
        </div>
    );
}

function BlocksGame() {
    const [game, setGame] = useState<Game>(() => {
        const saved = load<Game | null>(GAME_KEY, null);
        return saved?.board?.length === SIZE * SIZE && saved.pieces?.length === 3 ? saved : fresh();
    });
    const [best, setBest] = useState(() => load(BEST_KEY, 0));
    const [sel, setSel] = useState<number | null>(null);
    const [at, setAt] = useState<Spot | null>(null);
    const [drag, setDrag] = useState<{ x: number; y: number; cell: number } | null>(null);
    const [flash, setFlash] = useState<Flash | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const scoreRef = useRef<HTMLParagraphElement>(null);
    const press = useRef<{ x: number; y: number; lift: number; moved: boolean } | null>(null);
    const dragged = useRef(false);
    const flashes = useRef(0);

    const { board, pieces, score } = game;
    const over = pieces.every((p) => !p || !canMove(board, p));
    const piece = sel === null ? null : pieces[sel];
    const preview = piece && at && fits(board, piece, ...at) ? place(board, piece, ...at) : null;
    // Squares under the piece; outlined where it can't go, tinted where it can.
    const ghost = new Set(
        piece && at
            ? piece.cells.flatMap(([r, c]) => {
                  const [rr, cc] = [at[0] + r, at[1] + c];
                  return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE ? [rr * SIZE + cc] : [];
              })
            : [],
    );

    useEffect(() => save(GAME_KEY, game), [game]);

    const pick = (i: number | null, spot: Spot | null = null) => {
        setSel(i);
        setAt(spot);
    };

    const drop = (i: number, [r, c]: Spot) => {
        const p = pieces[i];
        if (!p || !fits(board, p, r, c)) return false;
        const res = place(board, p, r, c);
        const left = pieces.map((q, j) => (j === i ? null : q));
        const next = { board: res.board, pieces: left.some(Boolean) ? left : deal(res.board), score: score + res.points };
        setGame(next);
        if (next.score > best) {
            setBest(next.score);
            save(BEST_KEY, next.score);
        }
        if (res.lines) celebrate(p, [r, c], res);
        pick(null);
        return true;
    };

    // A clear: squares flash and pop in a sweep outward from the drop, the points
    // rise out of the cleared lines, the board glows, and the score bumps.
    const celebrate = (p: Piece, [r, c]: Spot, res: ReturnType<typeof place>) => {
        const id = ++flashes.current;
        const landed = p.cells.map(([dr, dc]) => [r + dr, c + dc]);
        const away = (j: number) => Math.min(...landed.map(([y, x]) => Math.abs(y - Math.floor(j / SIZE)) + Math.abs(x - (j % SIZE))));
        const mean = (f: (j: number) => number) => ((res.cleared.reduce((sum, j) => sum + f(j), 0) / res.cleared.length + 0.5) / SIZE) * 100;
        setFlash({
            id,
            colors: Object.fromEntries(res.cleared.map((j) => [j, board[j] || p.color])),
            delays: Object.fromEntries(res.cleared.map((j) => [j, away(j) * 40])),
            color: p.color,
            points: res.points,
            lines: res.lines,
            x: mean((j) => j % SIZE),
            y: mean((j) => Math.floor(j / SIZE)),
        });
        setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), 1000);
        if (calm()) return;
        const glow = paint(p.color);
        boardRef.current?.animate(
            [
                { boxShadow: `0 0 0 2px ${glow}, 0 0 ${24 + 16 * res.lines}px ${glow}` },
                { boxShadow: "0 0 0 0 transparent" },
            ],
            { duration: 700, easing: "ease-out" },
        );
        if (res.lines > 1)
            boardRef.current?.animate(
                [{ transform: "none" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "none" }],
                { duration: 350 },
            );
        scoreRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 350, easing: "ease-out" });
    };

    const restart = () => {
        if (score && !over && !confirm("Start a new game?")) return;
        setGame(fresh());
        pick(null);
    };

    /* ---------- Dragging from the tray ---------- */

    // Where a piece centered on the point x, y would sit, in board squares.
    const spotAt = (p: Piece, x: number, y: number): Spot => {
        const rect = boardRef.current!.getBoundingClientRect();
        const { h, w } = dims(p);
        const cell = rect.width / SIZE;
        return [Math.round((y - rect.top) / cell - h / 2), Math.round((x - rect.left) / cell - w / 2)];
    };

    const onDown = (e: React.PointerEvent, i: number) => {
        dragged.current = false;
        if (!pieces[i] || over) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        // On touch the piece rides above the finger so you can see where it goes.
        const cell = boardRef.current!.getBoundingClientRect().width / SIZE;
        press.current = { x: e.clientX, y: e.clientY, lift: e.pointerType === "touch" ? cell * 2 : 0, moved: false };
    };

    const onMove = (e: React.PointerEvent, i: number) => {
        const p = press.current;
        if (!p || (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6)) return;
        p.moved = true;
        const y = e.clientY - p.lift;
        setSel(i);
        setDrag({ x: e.clientX, y, cell: boardRef.current!.getBoundingClientRect().width / SIZE });
        setAt(spotAt(pieces[i]!, e.clientX, y));
    };

    const onUp = (i: number) => {
        const moved = press.current?.moved;
        press.current = null;
        if (!moved) return;
        dragged.current = true;
        setDrag(null);
        if (!at || !drop(i, at)) pick(null);
    };

    // Taps and keyboard: select, or deselect when picked again.
    const onTap = (i: number) => {
        if (dragged.current) return;
        if (pieces[i] && !over) pick(sel === i ? null : i);
    };

    /* ---------- Keyboard ---------- */

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const arrow = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, Spot>)[e.key];
            if (/^[1-3]$/.test(e.key) && pieces[+e.key - 1] && !over) pick(+e.key - 1, center(pieces[+e.key - 1]!, 3, 3));
            else if (sel === null || !piece) return;
            else if (e.key === "Escape") pick(null);
            else if (e.key === "Enter") {
                if (at) drop(sel, at);
            }
            else if (arrow) {
                const [r, c] = at ?? center(piece, 3, 3);
                const { h, w } = dims(piece);
                setAt([clamp(r + arrow[0], 0, SIZE - h), clamp(c + arrow[1], 0, SIZE - w)]);
            } else return;
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    /* ---------- Render ---------- */

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
                <h1 className="mr-auto text-2xl font-bold text-white">Blocks</h1>
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
                ref={boardRef}
                role="img"
                aria-label={`Board, ${board.filter(Boolean).length} of ${SIZE * SIZE} squares filled`}
                onPointerLeave={(e) => e.pointerType === "mouse" && !drag && setAt(null)}
                className="relative grid aspect-square touch-none grid-cols-8 gap-1 rounded-xl bg-neutral-900 p-1.5"
            >
                {board.map((v, i) => {
                    const clearing = !!preview?.cleared.includes(i);
                    const color = clearing ? piece!.color : v || flash?.colors[i] || (preview && ghost.has(i) ? piece!.color : 0);
                    return (
                        <div
                            key={i}
                            onPointerEnter={(e) => e.pointerType === "mouse" && piece && setAt(center(piece, Math.floor(i / SIZE), i % SIZE))}
                            onClick={() => sel !== null && piece && drop(sel, center(piece, Math.floor(i / SIZE), i % SIZE))}
                            className={cn(
                                "rounded-[4px]",
                                color ? "shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)]" : "bg-neutral-800/60",
                                preview && ghost.has(i) && !clearing && "opacity-50",
                                !preview && ghost.has(i) && "ring-2 ring-inset ring-white/40",
                                !v && flash?.colors[i] && "blocks-pop",
                            )}
                            style={
                                color
                                    ? ({ backgroundColor: paint(color), "--d": `${flash?.delays[i] ?? 0}ms`, "--glow": paint(flash?.color ?? color) } as React.CSSProperties)
                                    : undefined
                            }
                        />
                    );
                })}
                {flash && (
                    <span
                        key={flash.id}
                        aria-hidden
                        className="blocks-points pointer-events-none absolute z-10 font-black text-white"
                        style={{
                            left: `${flash.x}%`,
                            top: `${flash.y}%`,
                            fontSize: `${Math.min(2 + flash.lines * 0.5, 3.5)}rem`,
                            textShadow: `0 0 20px ${paint(flash.color)}, 0 2px 0 rgb(0 0 0 / 0.4)`,
                        }}
                    >
                        +{flash.points}
                    </span>
                )}
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

            <div className="mt-4 grid grid-cols-3 gap-2">
                {pieces.map((p, i) => (
                    <button
                        key={i}
                        disabled={!p}
                        aria-label={p ? `Piece ${i + 1}, ${p.cells.length} blocks` : `Piece ${i + 1}, used`}
                        aria-pressed={sel === i}
                        onPointerDown={(e) => onDown(e, i)}
                        onPointerMove={(e) => onMove(e, i)}
                        onPointerUp={() => onUp(i)}
                        onPointerCancel={() => onUp(i)}
                        onClick={() => onTap(i)}
                        className={cn(
                            "@container grid aspect-square touch-none place-items-center rounded-xl",
                            sel === i && !drag ? "bg-neutral-800" : "hover:bg-neutral-900",
                            p && !canMove(board, p) && "opacity-30",
                        )}
                    >
                        {p && !(drag && sel === i) && <Shape piece={p} cell="16cqw" />}
                    </button>
                ))}
            </div>

            {drag && piece && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed z-50"
                    style={{ left: drag.x - (dims(piece).w * drag.cell) / 2, top: drag.y - (dims(piece).h * drag.cell) / 2 }}
                >
                    <Shape piece={piece} cell={`${drag.cell - 2}px`} />
                </div>
            )}
        </div>
    );
}

const noop = () => () => {};

export default function Blocks() {
    // Random pieces and localStorage only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    return mounted ? <BlocksGame /> : null;
}
