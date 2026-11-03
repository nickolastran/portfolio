"use client";

import { ChartColumn, CheckCheck, ChevronLeft, Eraser, Focus, Lightbulb, Pause, Pencil, Play, Redo2, Settings as Gear, Sparkles, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { boxOf, colOf, describeHint, digitsOf, findHint, hashSeed, rowOf } from "./engine.mjs";
import {
    applyHint,
    completeUnits,
    conflicts,
    couldHold,
    createGame,
    erase,
    isLocked,
    isSolved,
    place,
    redo,
    remaining,
    setAuto,
    toggleNote,
    undo,
} from "./game.mjs";
import { chime } from "./sound";
import * as store from "./store";
import { type Difficulty, type Game, LEVELS, type Puzzle, type Slot, time } from "./store";
import { DoneDialog, LABEL, SettingsDialog, StatsDialog } from "./dialogs";
import "./sudoku.css";

type Kind = Slot["kind"];

function runWorker(difficulty: Difficulty, seed: number) {
    return new Promise<Puzzle>((resolve, reject) => {
        const w = new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
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
const filling = new Set<Difficulty>();
const NO_CELLS = new Set<number>();

function Game() {
    const [date] = useState(store.today);
    const [settings, setSettings] = useState(store.loadSettings);
    const [stats, setStats] = useState(store.loadStats);
    const [daily, setDaily] = useState(store.loadDaily);
    const [{ kind, difficulty }, setMode] = useState(store.loadLast);
    const [slot, setSlot] = useState<Slot | null>(() => store.loadSlot(store.slotKey(kind, difficulty, date)));
    const [selected, setSelected] = useState(40);
    const [noteMode, setNoteMode] = useState(false);
    const [lens, setLens] = useState(settings.lens);
    const [lastDigit, setLastDigit] = useState(0);
    const [paused, setPaused] = useState(false);
    const [notice, setNotice] = useState("");
    const [dialog, setDialog] = useState<"settings" | "stats" | "done" | null>(null);
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
            setSlot({ key: store.slotKey(k, d, date), kind: k, date, puzzle, game, seconds: 0, hints: [], marks: {}, solved: false, learned: [] });
            setSelected(game.values.indexOf(0));
            bump(d, (s) => ({ ...s, played: s.played + 1 }));
            if (k === "classic") refill(d);
        }).catch(() => token === request.current && setNotice("Couldn't make a puzzle. Reload to try again."));
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
        setDialog("done");
    };

    // Every board change goes through here: completion effects, then save.
    const commit = (next: Game, patch: Partial<Slot> = {}, digit = 0) => {
        if (!slot || !g || next === g) return;
        setNotice("");
        if (isSolved(next)) return finish(next, patch);
        change({ ...patch, game: next });
        if (!settings.sound) return;
        if (completeUnits(next).length > completeUnits(g).length) chime.unit();
        else if (digit) chime.place(digit);
    };

    const input = (d: number) => {
        setLastDigit(d);
        if (!live || !g) return;
        if (noteMode) commit(toggleNote(g, selected, d));
        else commit(place(g, selected, d, { autoRemove: settings.autoRemove }), {}, d);
    };

    const clear = () => live && g && commit(erase(g, selected));
    const back = () => live && g && commit(undo(g));
    const forward = () => live && g && commit(redo(g));

    const toggleAuto = () => live && g && commit(setAuto(g, !g.auto));

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
        if (!v || isLocked(g, selected)) return setNotice("Select a filled cell.");
        setNotice("");
        if (v !== g.solution[selected]) change({ marks: { ...slot.marks, [selected]: v } });
    };

    const checkPuzzle = () => {
        setCheckMenu(false);
        if (!live || !g) return;
        const wrong = g.values.flatMap((v: number, i: number) => (v && v !== g.solution[i] ? [i] : []));
        change({ marks: { ...slot.marks, ...Object.fromEntries(wrong.map((i: number) => [i, g.values[i]])) } });
        setNotice("");
    };

    const updateSettings = (s: store.Settings) => {
        setSettings(s);
        store.saveSettings(s);
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
            // Space always toggles notes, even with a button focused; Enter still clicks.
            else if (k === " " || k === "n") setNoteMode((m) => !m);
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

    const vals: number[] = g?.values ?? [];
    const selDigit = vals[selected] ?? 0;
    const lensDigit = selDigit || lastDigit;
    const holdable: boolean[] | null = lens && lensDigit && g ? couldHold(vals, lensDigit) : null;
    const clash: Set<number> = g && settings.conflicts ? conflicts(vals) : NO_CELLS;
    const left: number[] = g ? remaining(vals) : Array(10).fill(9);
    const sameBand = (i: number) => rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected);

    const segmented = <T extends string>(label: string, items: readonly T[], current: T, pick: (v: T) => void, name: (v: T) => string, done?: (v: T) => boolean) => (
        <div className="segmented" role="group" aria-label={label}>
            {items.map((v) => (
                <button key={v} aria-pressed={current === v} onClick={() => current !== v && pick(v)}>
                    {name(v)}
                    {done?.(v) && <span className="dot" role="img" aria-label="solved today" />}
                </button>
            ))}
        </div>
    );

    const tool = (label: string, Icon: typeof Undo2, onClick: () => void, opts: { pressed?: boolean; disabled?: boolean } = {}) => (
        <button className="icon-btn" title={label} aria-label={label} aria-pressed={opts.pressed} disabled={opts.disabled ?? !live} onClick={onClick}>
            <Icon size={20} aria-hidden />
        </button>
    );

    return (
        <div className="sudoku">
            <header className="bar">
                <Link href="/games" className="icon-btn back" title="Games" aria-label="Back to games">
                    <ChevronLeft size={22} />
                </Link>
                <h1>Sudoku</h1>
                {tool("Statistics", ChartColumn, () => setDialog("stats"), { disabled: false })}
                {tool("Settings", Gear, () => setDialog("settings"), { disabled: false })}
            </header>

            <div className="bar">
                {segmented("Puzzle type", ["daily", "classic"] as const, kind, (k) => open(k, difficulty), (k) => (k === "daily" ? "Daily" : "Classic"))}
                {segmented("Difficulty", LEVELS, difficulty, (d) => open(kind, d), (d) => LABEL[d], (d) => kind === "daily" && daily[d].includes(date))}
            </div>

            <div className="bar">
                {tool(paused ? "Resume" : "Pause", paused ? Play : Pause, () => setPaused((p) => !p), { disabled: !slot || slot.solved })}
                {settings.showTimer && slot && <span className="time">{time(slot.seconds)}</span>}
                <span className="grow" />
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

            <div className="board-frame">
                <div
                    ref={boardRef}
                    role="grid"
                    aria-label="Sudoku board"
                    aria-busy={!g}
                    inert={paused || !g}
                    className={`board${paused ? " veiled" : ""}${g ? "" : " loading"}`}
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
                {paused && g && (
                    <div className="cover">
                        <button className="btn primary" onClick={() => setPaused(false)} autoFocus>
                            Resume
                        </button>
                    </div>
                )}
            </div>

            <p className="notice" aria-live="polite">
                {notice}
            </p>

            <div className="tools">
                {tool("Undo", Undo2, back, { disabled: !live || !g?.past.length })}
                {tool("Redo", Redo2, forward, { disabled: !live || !g?.future.length })}
                {tool("Erase", Eraser, clear)}
                {tool("Notes", Pencil, () => setNoteMode((m) => !m), { pressed: noteMode, disabled: false })}
                {tool("Auto notes", Sparkles, toggleAuto, { pressed: !!g?.auto })}
                {tool("Hint", Lightbulb, hint)}
                <div
                    className="check"
                    onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setCheckMenu(false)}
                    onKeyDown={(e) => e.key === "Escape" && setCheckMenu(false)}
                >
                    {tool("Check", CheckCheck, () => setCheckMenu((m) => !m), { pressed: checkMenu })}
                    {checkMenu && (
                        <div className="menu">
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
                        {d}
                    </button>
                ))}
            </div>

            <SettingsDialog open={dialog === "settings"} onClose={() => setDialog(null)} settings={settings} onChange={updateSettings} />
            <StatsDialog open={dialog === "stats"} onClose={() => setDialog(null)} stats={stats} daily={daily} date={date} />
            {slot?.solved && (
                <DoneDialog open={dialog === "done"} onClose={() => setDialog(null)} slot={slot} onNext={slot.kind === "classic" ? newPuzzle : undefined} />
            )}
        </div>
    );
}

const noop = () => () => {};

export default function Sudoku() {
    // localStorage and Workers only exist in the browser, so the game mounts there.
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    return mounted ? <Game /> : <div className="sudoku" />;
}
