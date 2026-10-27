"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { TECHNIQUES } from "../lib/sudoku.mjs";
import { constellation, streaks } from "../lib/sudoku-game.mjs";
import { type ChartEntry, type Difficulty, LEVELS, type Settings, type Slot, type TierStats, time } from "../lib/sudoku-store";

type Id = keyof typeof TECHNIQUES;
export const LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };

/* Native <dialog>: focus trap, Escape and the backdrop come for free. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const d = ref.current;
        if (open && !d?.open) d?.showModal();
        if (!open && d?.open) d.close();
    }, [open]);
    return (
        <dialog ref={ref} className="lumen-dialog" aria-label={title} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
            <div className="dialog-body">
                <header className="dialog-head">
                    <h2>{title}</h2>
                    <button className="icon-btn" aria-label="Close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </header>
                {open && children}
            </div>
        </dialog>
    );
}

/** A puzzle's constellation, drawn in cell units over a 9x9 field. */
export function Sky({ seed, className }: { seed: number; className: string }) {
    const { stars, edges } = constellation(seed);
    return (
        <svg className={className} viewBox="0 0 9 9" aria-hidden>
            {edges.map(([a, b], k) => (
                <line
                    key={k}
                    className="sky-line"
                    x1={stars[a].x}
                    y1={stars[a].y}
                    x2={stars[b].x}
                    y2={stars[b].y}
                    pathLength={1}
                    style={{ "--k": k } as React.CSSProperties}
                />
            ))}
            {stars.map((s, k) => (
                <circle key={k} className="sky-star" cx={s.x} cy={s.y} r={0.07 + 0.05 * s.mag} style={{ "--k": k } as React.CSSProperties} />
            ))}
        </svg>
    );
}

const SWITCHES: [keyof Settings, string][] = [
    ["conflicts", "Highlight conflicts"],
    ["autoRemove", "Remove notes when a digit is placed"],
    ["sameDigits", "Highlight matching digits"],
    ["showTimer", "Show timer"],
    ["sound", "Sound"],
    ["lens", "Start with Focus Lens on"],
];

export function SettingsDialog({ open, onClose, settings, onChange }: { open: boolean; onClose: () => void; settings: Settings; onChange: (s: Settings) => void }) {
    return (
        <Dialog open={open} onClose={onClose} title="Settings">
            <fieldset className="theme-pick">
                <legend>Theme</legend>
                {(["system", "night", "dawn"] as const).map((t) => (
                    <label key={t}>
                        <input type="radio" name="theme" checked={settings.theme === t} onChange={() => onChange({ ...settings, theme: t })} />
                        {{ system: "Match device", night: "Night", dawn: "Dawn" }[t]}
                    </label>
                ))}
            </fieldset>
            <ul className="switches">
                {SWITCHES.map(([key, label]) => (
                    <li key={key}>
                        <label>
                            {label}
                            <input
                                type="checkbox"
                                role="switch"
                                checked={settings[key] as boolean}
                                onChange={(e) => onChange({ ...settings, [key]: e.target.checked })}
                            />
                        </label>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}

export function StatsDialog({ open, onClose, stats, daily, date }: { open: boolean; onClose: () => void; stats: Record<Difficulty, TierStats>; daily: Record<Difficulty, string[]>; date: string }) {
    const rows: [string, (d: Difficulty) => string | number][] = [
        ["Played", (d) => stats[d].played],
        ["Win rate", (d) => (stats[d].played ? `${Math.round((100 * stats[d].wins) / stats[d].played)}%` : "–")],
        ["Best time", (d) => (stats[d].best == null ? "–" : time(stats[d].best!))],
        ["Average time", (d) => (stats[d].wins ? time(Math.round(stats[d].total / stats[d].wins)) : "–")],
        ["Win streak", (d) => stats[d].streak],
        ["Longest win streak", (d) => stats[d].longest],
        ["Daily streak", (d) => streaks(daily[d], date).current],
        ["Longest daily streak", (d) => streaks(daily[d], date).longest],
    ];
    return (
        <Dialog open={open} onClose={onClose} title="Statistics">
            <table className="stats">
                <thead>
                    <tr>
                        <td />
                        {LEVELS.map((d) => (
                            <th key={d} scope="col">
                                {LABEL[d]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([label, value]) => (
                        <tr key={label}>
                            <th scope="row">{label}</th>
                            {LEVELS.map((d) => (
                                <td key={d}>{value(d)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="fine">A win streak ends when you start a new puzzle without finishing the last one.</p>
        </Dialog>
    );
}

export function ChartDialog({ open, onClose, entries }: { open: boolean; onClose: () => void; entries: ChartEntry[] }) {
    return (
        <Dialog open={open} onClose={onClose} title="Star Chart">
            {entries.length ? (
                <ul className="chart">
                    {[...entries].reverse().map((e) => (
                        <li key={e.key}>
                            <Sky seed={e.seed} className="sky mini" />
                            <p className="chart-name">{e.name}</p>
                            <p className="fine">
                                {LABEL[e.difficulty]}, {time(e.seconds)}
                                <br />
                                {new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty">Every solved puzzle traces its own constellation. Save one from the finish screen to start your chart.</p>
            )}
        </Dialog>
    );
}

export function DoneDialog({
    open,
    onClose,
    slot,
    saved,
    onSave,
    onNext,
}: {
    open: boolean;
    onClose: () => void;
    slot: Slot;
    saved: boolean;
    onSave: () => void;
    onNext?: () => void;
}) {
    const { puzzle, game, seconds, hints, learned } = slot;
    const needed = [...(puzzle.techniques as Id[])].sort((a, b) => TECHNIQUES[a].level - TECHNIQUES[b].level);
    const hintCounts = [...new Set(hints)].map((id) => [id, hints.filter((h) => h === id).length] as const);
    return (
        <Dialog open={open} onClose={onClose} title="Puzzle solved">
            <div className="done-hero">
                <Sky seed={puzzle.seed} className="sky mini" />
                <div>
                    <p className="done-name">{constellation(puzzle.seed).name}</p>
                    <p className="fine">A new constellation, traced by this puzzle.</p>
                </div>
            </div>
            <dl className="done-stats">
                <div>
                    <dt>Time</dt>
                    <dd>{time(seconds)}</dd>
                </div>
                <div>
                    <dt>Difficulty</dt>
                    <dd>{LABEL[puzzle.difficulty]}</dd>
                </div>
                <div>
                    <dt>Hints</dt>
                    <dd>{hints.length}</dd>
                </div>
                <div>
                    <dt>Mistakes</dt>
                    <dd>{game.mistakes}</dd>
                </div>
            </dl>

            <section className="journal" aria-labelledby="journal-title">
                <h3 id="journal-title">Technique journal</h3>
                <p>This puzzle called for:</p>
                <ul className="chips">
                    {needed.map((id) => (
                        <li key={id}>{TECHNIQUES[id].name}</li>
                    ))}
                </ul>
                <p>
                    {hintCounts.length
                        ? `Hints you used: ${hintCounts.map(([id, n]) => `${id === "solution" ? "a straight reveal" : TECHNIQUES[id as Id].name}${n > 1 ? ` (${n})` : ""}`).join(", ")}.`
                        : "You solved it without hints."}
                </p>
                {learned.length > 0 && (
                    <>
                        <h4>New in your journal</h4>
                        <dl className="learned">
                            {(learned as Id[]).map((id) => (
                                <div key={id}>
                                    <dt>{TECHNIQUES[id].name}</dt>
                                    <dd>{TECHNIQUES[id].about}</dd>
                                </div>
                            ))}
                        </dl>
                    </>
                )}
            </section>

            <div className="dialog-actions">
                <button className="btn" disabled={saved} onClick={onSave}>
                    {saved ? "Saved to Star Chart" : "Save to Star Chart"}
                </button>
                {onNext && (
                    <button className="btn primary" onClick={onNext}>
                        New puzzle
                    </button>
                )}
            </div>
        </Dialog>
    );
}
