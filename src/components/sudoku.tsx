"use client";

import { ChartColumn, CheckCheck, Eraser, Focus, Lightbulb, Pause, Pencil, Play, Redo2, Settings as Gear, Sparkles, Telescope, Undo2 } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { boxOf, colOf, describeHint, digitsOf, findHint, hashSeed, rowOf, UNITS } from "../lib/sudoku.mjs";
import {
    applyHint,
    completeUnits,
    conflicts,
    constellation,
    couldHold,
    createGame,
    erase,
    fillCandidates,
    isLocked,
    isSolved,
    place,
    redo,
    remaining,
    streaks,
    toggleNote,
    undo,
} from "../lib/sudoku-game.mjs";
import { chime } from "../lib/sudoku-sound";
import * as store from "../lib/sudoku-store";
import { type Difficulty, type Game, LEVELS, type Puzzle, type Slot, time } from "../lib/sudoku-store";
import { ChartDialog, DoneDialog, LABEL, SettingsDialog, Sky, StatsDialog } from "./sudoku-dialogs";
import "./sudoku.css";

type Kind = Slot["kind"];

function runWorker(difficulty: Difficulty, seed: number) {
    return new Promise<Puzzle>((resolve, reject) => {
        const w = new Worker(new URL("../lib/sudoku-worker.mjs", import.meta.url), { type: "module" });
        w.onmessage = (e) => {
            resolve(e.data);
            w.terminate();
        };
        w.onerror = (e) => {
            reject(e);
            w.terminate();
        };
        w.postMessage({ difficulty, seed });
    });
}

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const filling = new Set<Difficulty>();
const NO_CELLS = new Set<number>();

function Lumen() {
    const [date] = useState(store.today);
    const [settings, setSettings] = useState(store.loadSettings);
    const [stats, setStats] = useState(store.loadStats);
    const [daily, setDaily] = useState(store.loadDaily);
    const [chart, setChart] = useState(store.loadChart);
    const [{ kind, difficulty }, setMode] = useState(store.loadLast);
    const [slot, setSlot] = useState<Slot | null>(() => store.loadSlot(store.slotKey(kind, difficulty, date)));
    const [selected, setSelected] = useState(40);
    const [noteMode, setNoteMode] = useState(false);
    const [lens, setLens] = useState(settings.lens);
    const [lastDigit, setLastDigit] = useState(0);
    const [paused, setPaused] = useState(false);
    const [notice, setNotice] = useState("");
    const [shimmer, setShimmer] = useState<{ id: number; order: Map<number, number> } | null>(null);
    const [dialog, setDialog] = useState<"settings" | "stats" | "chart" | "done" | null>(null);
    const [checkMenu, setCheckMenu] = useState(false);
    const pool = useRef(store.loadPool());
    const request = useRef(0);
    const boardRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

    /* ---------- Puzzles in and out ---------- */

    const refill = (d: Difficulty) => {
        if (pool.current[d] || filling.has(d)) return;
        filling.add(d);
        runWorker(d, randomSeed())
            .then((p) => {
                pool.current[d] = p;
                store.savePool(pool.current);
            })
            .catch(() => {})
            .finally(() => filling.delete(d));
    };

    const bump = (d: Difficulty, f: (s: store.TierStats) => store.TierStats) =>
        setStats((prev) => {
            const next = { ...prev, [d]: f(prev[d]) };
            store.saveStats(next);
            return next;
        });

    // Deals a fresh puzzle into the slot: the date's seed for a daily, else
    // the pre-generated one if it's ready.
    const deal = (k: Kind, d: Difficulty) => {
        const token = ++request.current;
        const ready = k === "classic" ? pool.current[d] : undefined;
        if (ready) {
            delete pool.current[d];
            store.savePool(pool.current);
        }
        const job = ready ? Promise.resolve(ready) : runWorker(d, k === "daily" ? hashSeed(`${date}:${d}`) : randomSeed());
        job.then((puzzle) => {
            if (token !== request.current) return;
            const game = createGame(puzzle.puzzle, puzzle.solution);
            setSlot({ key: store.slotKey(k, d, date), kind: k, date, puzzle, game, seconds: 0, auto: false, hints: [], marks: {}, solved: false, learned: [] });
            setSelected(game.values.indexOf(0));
            bump(d, (s) => ({ ...s, played: s.played + 1 }));
            if (k === "classic") refill(d);
        }).catch(() => token === request.current && setNotice("Couldn't make a puzzle. Reload the page to try again."));
    };

    const open = (k: Kind, d: Difficulty) => {
        request.current++;
        setMode({ kind: k, difficulty: d });
        store.saveLast(k, d);
        const saved = store.loadSlot(store.slotKey(k, d, date));
        setSlot(saved);
        setPaused(false);
        setNotice("");
        setNoteMode(false);
        if (saved) setSelected(Math.max(0, saved.game.values.indexOf(0)));
        else deal(k, d);
    };

    // First visit to a slot, and topping up the pool. Both resolve later, from
    // the worker, so nothing here sets state synchronously.
    useEffect(() => {
        store.pruneDailies(date);
        if (!slot) deal(kind, difficulty);
        LEVELS.forEach(refill);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (slot) store.saveSlot(slot);
    }, [slot]);

    const newPuzzle = () => {
        if (slot && !slot.solved && slot.game.past.length) {
            if (!confirm("Start a new puzzle? This one will count as unfinished.")) return;
            bump(difficulty, (s) => ({ ...s, streak: 0 }));
        }
        setDialog(null);
        setSlot(null);
        setPaused(false);
        setNotice("");
        deal("classic", difficulty);
    };

    /* ---------- Timer ---------- */

    const running = !!slot && !slot.solved && !paused;
    useEffect(() => {
        if (!running) return;
        const tick = setInterval(() => setSlot((s) => s && { ...s, seconds: s.seconds + 1 }), 1000);
        const away = () => document.hidden && setPaused(true);
        document.addEventListener("visibilitychange", away);
        return () => {
            clearInterval(tick);
            document.removeEventListener("visibilitychange", away);
        };
    }, [running]);

    /* ---------- Moves ---------- */

    const g = slot?.game;
    const live = !!slot && !slot.solved && !paused;
    const change = (patch: Partial<Slot>) => setSlot((s) => s && { ...s, ...patch });

    const finish = (game: Game, patch: Partial<Slot>) => {
        if (!slot) return;
        const hints = patch.hints ?? slot.hints;
        const used = [...new Set([...slot.puzzle.techniques, ...hints.filter((h) => h !== "solution")])];
        const seen = store.loadSeen();
        const learned = used.filter((id) => !seen.includes(id));
        store.saveSeen([...seen, ...learned]);
        change({ ...patch, game, solved: true, learned });

        const secs = slot.seconds;
        bump(difficulty, (s) => ({
            ...s,
            wins: s.wins + 1,
            total: s.total + secs,
            best: Math.min(s.best ?? Infinity, secs),
            streak: s.streak + 1,
            longest: Math.max(s.longest, s.streak + 1),
        }));
        if (slot.kind === "daily") {
            const next = { ...daily, [difficulty]: [...daily[difficulty], date] };
            setDaily(next);
            store.saveDaily(next);
        }
        if (settings.sound) chime.solve();
        setNotice(`Solved in ${time(secs)}. ${constellation(slot.puzzle.seed).name} appears over the board.`);
        setTimeout(() => setDialog("done"), reducedMotion() ? 0 : 2800);
    };

    // Every board change goes through here: completion effects, then save.
    const commit = (next: Game, patch: Partial<Slot> = {}, digit = 0) => {
        if (!slot || !g || next === g) return;
        setNotice("");
        if (isSolved(next)) return finish(next, patch);
        change({ ...patch, game: next });
        const before = completeUnits(g);
        const fresh: number[] = completeUnits(next).filter((u: number) => !before.includes(u));
        if (fresh.length) {
            const order = new Map<number, number>();
            for (const u of fresh) UNITS[u].forEach((c, k) => order.set(c, Math.min(order.get(c) ?? k, k)));
            const id = Date.now();
            setShimmer({ id, order });
            setTimeout(() => setShimmer((sh) => (sh?.id === id ? null : sh)), 1800);
            if (settings.sound) chime.unit();
        } else if (digit && settings.sound) chime.place(digit);
    };

    const input = (d: number) => {
        setLastDigit(d);
        if (!live || !g) return;
        if (noteMode) commit(toggleNote(g, selected, d));
        else commit(place(g, selected, d, { autoRemove: settings.autoRemove, auto: slot.auto }), {}, d);
    };

    const clear = () => live && g && commit(erase(g, selected, { auto: slot.auto }));
    const back = () => live && g && commit(undo(g));
    const forward = () => live && g && commit(redo(g));

    const toggleAuto = () => {
        if (!live || !g) return;
        if (slot.auto) change({ auto: false });
        else commit(fillCandidates(g), { auto: true });
    };

    const hint = () => {
        if (!live || !g) return;
        const h = findHint(g.values, g.solution);
        if (!h) return;
        const marks = { ...slot.marks };
        delete marks[h.cell];
        setSelected(h.cell);
        commit(applyHint(g, h.cell, h.digit), { hints: [...slot.hints, h.id ?? "solution"], marks });
        setNotice(describeHint(h));
    };

    const checkCell = () => {
        setCheckMenu(false);
        if (!live || !g) return;
        const v = g.values[selected];
        if (!v || isLocked(g, selected)) return setNotice("Select a cell you've filled in, then check it.");
        if (v === g.solution[selected]) return setNotice("That digit is correct.");
        change({ marks: { ...slot.marks, [selected]: v } });
        setNotice("That digit is wrong. It's marked with a slash.");
    };

    const checkPuzzle = () => {
        setCheckMenu(false);
        if (!live || !g) return;
        const wrong = g.values.flatMap((v: number, i: number) => (v && v !== g.solution[i] ? [i] : []));
        change({ marks: { ...slot.marks, ...Object.fromEntries(wrong.map((i: number) => [i, g.values[i]])) } });
        setNotice(
            wrong.length
                ? `${wrong.length} ${wrong.length === 1 ? "digit is" : "digits are"} wrong, marked with a slash.`
                : "Everything you've placed so far is correct.",
        );
    };

    const updateSettings = (s: store.Settings) => {
        setSettings(s);
        store.saveSettings(s);
    };

    const saveToChart = () => {
        if (!slot || chart.some((e) => e.key === `${slot.key}:${slot.puzzle.seed}`)) return;
        const next = [
            ...chart,
            {
                key: `${slot.key}:${slot.puzzle.seed}`,
                seed: slot.puzzle.seed,
                name: constellation(slot.puzzle.seed).name,
                difficulty: slot.puzzle.difficulty,
                date,
                seconds: slot.seconds,
            },
        ];
        setChart(next);
        store.saveChart(next);
    };

    /* ---------- Keyboard ---------- */

    const go = (i: number) => {
        setSelected(i);
        if (boardRef.current?.contains(document.activeElement)) cellRefs.current[i]?.focus();
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (dialog) return;
            const t = e.target as HTMLElement;
            if (t.closest("input, select, textarea")) return;
            const onControl = t.closest("button, a") && !t.closest(".board");
            const k = e.key.toLowerCase();
            const mod = e.ctrlKey || e.metaKey;

            if (mod && k === "z") (e.shiftKey ? forward : back)();
            else if (mod && k === "y") forward();
            else if (mod || e.altKey) return;
            else if (/^(Digit|Numpad)[1-9]$/.test(e.code)) {
                const d = Number(e.code.at(-1));
                if (e.shiftKey && live && g) commit(toggleNote(g, selected, d));
                else input(d);
            } else if (k === "backspace" || k === "delete" || k === "0") clear();
            else if ((k === " " && !onControl) || k === "n") setNoteMode((m) => !m);
            else {
                const step = { arrowup: -9, w: -9, arrowdown: 9, s: 9, arrowleft: -1, a: -1, arrowright: 1, d: 1 }[k];
                if (!step || paused) return;
                const r = rowOf(selected);
                const c = colOf(selected);
                go(Math.abs(step) === 9 ? ((r + step / 9 + 9) % 9) * 9 + c : r * 9 + ((c + step + 9) % 9));
            }
            e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    /* ---------- Render ---------- */

    const theme = settings.theme;
    const doneToday = (d: Difficulty) => daily[d].includes(date);
    const streak = streaks(daily[difficulty], date).current;

    const header = (
        <header className="lumen-head">
            <h1>Lumen Sudoku</h1>
            <nav aria-label="Lumen Sudoku" className="head-tools">
                <button className="icon-btn" aria-label="Star Chart" onClick={() => setDialog("chart")}>
                    <Telescope size={20} />
                </button>
                <button className="icon-btn" aria-label="Statistics" onClick={() => setDialog("stats")}>
                    <ChartColumn size={20} />
                </button>
                <button className="icon-btn" aria-label="Settings" onClick={() => setDialog("settings")}>
                    <Gear size={20} />
                </button>
            </nav>
        </header>
    );

    const modes = (
        <div className="modes">
            <div className="segmented" role="group" aria-label="Puzzle type">
                {(["daily", "classic"] as const).map((k) => (
                    <button key={k} aria-pressed={kind === k} onClick={() => kind !== k && open(k, difficulty)}>
                        {k === "daily" ? "Daily" : "Classic"}
                    </button>
                ))}
            </div>
            <div className="segmented" role="group" aria-label="Difficulty">
                {LEVELS.map((d) => (
                    <button key={d} aria-pressed={difficulty === d} onClick={() => difficulty !== d && open(kind, d)}>
                        {LABEL[d]}
                        {kind === "daily" && doneToday(d) && (
                            <span className="solved-star" role="img" aria-label="solved today">
                                ✦
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    const blurb =
        kind === "daily"
            ? `The daily puzzle for ${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.${streak ? ` ${streak}-day streak.` : ""}`
            : "A fresh puzzle whenever you want one.";

    const vals: number[] = g?.values ?? [];
    const selDigit = vals[selected] ?? 0;
    const lensDigit = selDigit || lastDigit;
    const holdable: boolean[] | null = lens && lensDigit && g ? couldHold(vals, lensDigit) : null;
    const clash: Set<number> = g && settings.conflicts ? conflicts(vals) : NO_CELLS;
    const left: number[] = g ? remaining(vals) : Array(10).fill(9);
    const sameBand = (i: number) => rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected);

    const board = (
        <div className="board-frame">
            <div
                ref={boardRef}
                role="grid"
                aria-label={`Sudoku board${paused ? ", hidden while paused" : ""}`}
                inert={paused || !g}
                className={`board${paused ? " veiled" : ""}${holdable ? " lensed" : ""}`}
            >
                {Array.from({ length: 9 }, (_, r) => (
                    <div role="row" key={r} className="board-row">
                        {Array.from({ length: 9 }, (_, c) => {
                            const i = r * 9 + c;
                            const v = vals[i] ?? 0;
                            const given = !!g?.givens[i];
                            const hinted = !!g?.hinted.includes(i);
                            const notes = g?.notes[i] ?? 0;
                            const wrong = !!v && slot?.marks[i] === v;
                            const conflict = clash.has(i);
                            const same = settings.sameDigits && !!v && v === selDigit && i !== selected;
                            const order = shimmer?.order.get(i);
                            const label = [
                                `Row ${r + 1}, column ${c + 1}`,
                                v ? `${v}${given ? ", given" : hinted ? ", hint" : ""}` : "empty",
                                notes ? `notes ${digitsOf(notes).join(" ")}` : "",
                                conflict ? "conflict" : "",
                                wrong ? "incorrect" : "",
                            ]
                                .filter(Boolean)
                                .join(", ");
                            return (
                                <button
                                    key={i}
                                    ref={(el) => {
                                        cellRefs.current[i] = el;
                                    }}
                                    role="gridcell"
                                    aria-label={label}
                                    aria-selected={i === selected}
                                    tabIndex={i === selected ? 0 : -1}
                                    onClick={() => go(i)}
                                    onFocus={() => setSelected(i)}
                                    className={[
                                        "cell",
                                        given ? "given" : hinted ? "hinted" : v ? "entry" : "",
                                        i === selected && "selected",
                                        i !== selected && sameBand(i) && "band",
                                        same && "same",
                                        conflict && "conflict",
                                        wrong && "wrong",
                                        holdable && !holdable[i] && "dim",
                                        c % 3 === 2 && c < 8 && "edge-r",
                                        r % 3 === 2 && r < 8 && "edge-b",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    {order !== undefined && (
                                        <span key={shimmer!.id} className="glint" aria-hidden style={{ "--k": order } as React.CSSProperties} />
                                    )}
                                    {v ? (
                                        <span className="digit">{v}</span>
                                    ) : notes ? (
                                        <span className="notes" aria-hidden>
                                            {Array.from({ length: 9 }, (_, k) => (
                                                <span key={k} className={notes & (1 << k) && k + 1 === lensDigit ? "hot" : undefined}>
                                                    {notes & (1 << k) ? k + 1 : ""}
                                                </span>
                                            ))}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            {slot?.solved && <Sky seed={slot.puzzle.seed} className="sky drawing" />}
            {!g && (
                <div className="board-cover" role="status">
                    <span className="pulse-star" aria-hidden>
                        ✦
                    </span>
                    Charting a new sky
                </div>
            )}
            {paused && g && (
                <div className="board-cover">
                    <p>Paused</p>
                    <button className="btn primary" onClick={() => setPaused(false)} autoFocus>
                        Resume
                    </button>
                </div>
            )}
        </div>
    );

    const tool = (label: string, Icon: typeof Undo2, onClick: () => void, opts: { pressed?: boolean; disabled?: boolean } = {}) => (
        <button className="tool" aria-pressed={opts.pressed} disabled={opts.disabled ?? !live} onClick={onClick}>
            <Icon size={20} aria-hidden />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="lumen-page" data-theme={theme}>
            <div className="lumen">
                {header}
                {modes}
                <p className="blurb">{blurb}</p>

                <div className="status">
                    <div className="clock">
                        <button
                            className="icon-btn"
                            aria-label={paused ? "Resume" : "Pause"}
                            disabled={!slot || slot.solved}
                            onClick={() => setPaused((p) => !p)}
                        >
                            {paused ? <Play size={18} /> : <Pause size={18} />}
                        </button>
                        {settings.showTimer && slot && (
                            <span className="time" aria-label={`Time ${time(slot.seconds)}`}>
                                {time(slot.seconds)}
                            </span>
                        )}
                    </div>
                    {slot?.solved && (
                        <button className="btn" onClick={() => setDialog("done")}>
                            Summary
                        </button>
                    )}
                    {kind === "classic" && (
                        <button className="btn primary" onClick={newPuzzle}>
                            New puzzle
                        </button>
                    )}
                </div>

                {board}
                {slot?.solved && <p className="sky-name">{constellation(slot.puzzle.seed).name}</p>}
                <p className="notice" aria-live="polite">
                    {notice}
                </p>

                <div className="tools">
                    {tool("Undo", Undo2, back, { disabled: !live || !g?.past.length })}
                    {tool("Redo", Redo2, forward, { disabled: !live || !g?.future.length })}
                    {tool("Erase", Eraser, clear)}
                    {tool("Notes", Pencil, () => setNoteMode((m) => !m), { pressed: noteMode, disabled: false })}
                    {tool("Auto", Sparkles, toggleAuto, { pressed: !!slot?.auto })}
                    {tool("Hint", Lightbulb, hint)}
                    <div
                        className="check"
                        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setCheckMenu(false)}
                        onKeyDown={(e) => e.key === "Escape" && setCheckMenu(false)}
                    >
                        {tool("Check", CheckCheck, () => setCheckMenu((m) => !m), { pressed: checkMenu })}
                        {checkMenu && (
                            <div className="check-menu">
                                <button onClick={checkCell}>Check cell</button>
                                <button onClick={checkPuzzle}>Check puzzle</button>
                            </div>
                        )}
                    </div>
                    {tool("Lens", Focus, () => setLens((l) => !l), { pressed: lens, disabled: false })}
                </div>

                <div className={`pad${noteMode ? " noting" : ""}`} role="group" aria-label={noteMode ? "Notes" : "Digits"}>
                    {Array.from({ length: 9 }, (_, k) => k + 1).map((d) => (
                        <button
                            key={d}
                            className={left[d] <= 0 ? "spent" : undefined}
                            aria-label={`${noteMode ? "Note" : "Place"} ${d}, ${Math.max(0, left[d])} left`}
                            onClick={() => input(d)}
                        >
                            <span className="pad-digit">{d}</span>
                            <span className="pad-left" aria-hidden>
                                {Math.max(0, left[d])}
                            </span>
                        </button>
                    ))}
                </div>
                <p className="keys">
                    Keys: 1–9 to place, Shift+digit for a note, arrows or WASD to move, Space or N for notes, Backspace to erase,
                    Ctrl+Z to undo.
                </p>
            </div>

            <SettingsDialog open={dialog === "settings"} onClose={() => setDialog(null)} settings={settings} onChange={updateSettings} />
            <StatsDialog open={dialog === "stats"} onClose={() => setDialog(null)} stats={stats} daily={daily} date={date} />
            <ChartDialog open={dialog === "chart"} onClose={() => setDialog(null)} entries={chart} />
            {slot?.solved && (
                <DoneDialog
                    open={dialog === "done"}
                    onClose={() => setDialog(null)}
                    slot={slot}
                    saved={chart.some((e) => e.key === `${slot.key}:${slot.puzzle.seed}`)}
                    onSave={saveToChart}
                    onNext={slot.kind === "classic" ? newPuzzle : undefined}
                />
            )}
        </div>
    );
}

const noop = () => () => {};

export default function Sudoku() {
    // localStorage and Workers only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    return mounted ? <Lumen /> : <div className="lumen-page" data-theme="system" />;
}
