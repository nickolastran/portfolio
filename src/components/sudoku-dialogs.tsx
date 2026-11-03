import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { TECHNIQUES } from "../lib/sudoku.mjs";
import { streaks } from "../lib/sudoku-game.mjs";
import { type Difficulty, LEVELS, type Settings, type Slot, type TierStats, time } from "../lib/sudoku-store";

type Id = keyof typeof TECHNIQUES;
export const LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };

/* Native <dialog>: focus trap, Escape and the backdrop come for free. */
function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const d = ref.current;
        if (open && !d?.open) d?.showModal();
        if (!open && d?.open) d.close();
    }, [open]);
    return (
        <dialog ref={ref} className="sudoku-dialog" aria-label={title} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
            <header>
                <h2>{title}</h2>
                <button className="icon-btn" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                </button>
            </header>
            {open && children}
        </dialog>
    );
}

const SWITCHES: [keyof Settings, string][] = [
    ["conflicts", "Highlight conflicts"],
    ["sameDigits", "Highlight matching digits"],
    ["autoRemove", "Auto-remove notes"],
    ["lens", "Start with Lens on"],
    ["showTimer", "Timer"],
    ["sound", "Sound"],
];

export function SettingsDialog({ open, onClose, settings, onChange }: { open: boolean; onClose: () => void; settings: Settings; onChange: (s: Settings) => void }) {
    return (
        <Dialog open={open} onClose={onClose} title="Settings">
            <ul className="rows">
                {SWITCHES.map(([key, label]) => (
                    <li key={key}>
                        <label>
                            {label}
                            <input
                                type="checkbox"
                                role="switch"
                                checked={settings[key]}
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
        ["Best", (d) => (stats[d].best == null ? "–" : time(stats[d].best!))],
        ["Average", (d) => (stats[d].wins ? time(Math.round(stats[d].total / stats[d].wins)) : "–")],
        ["Win streak", (d) => stats[d].streak],
        ["Longest", (d) => stats[d].longest],
        ["Daily streak", (d) => streaks(daily[d], date).current],
        ["Longest daily", (d) => streaks(daily[d], date).longest],
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
        </Dialog>
    );
}

export function DoneDialog({ open, onClose, slot, onNext }: { open: boolean; onClose: () => void; slot: Slot; onNext?: () => void }) {
    const { puzzle, game, seconds, hints, learned } = slot;
    const needed = [...(puzzle.techniques as Id[])].sort((a, b) => TECHNIQUES[a].level - TECHNIQUES[b].level);
    return (
        <Dialog open={open} onClose={onClose} title="Solved">
            <dl className="summary">
                {[
                    ["Time", time(seconds)],
                    ["Difficulty", LABEL[puzzle.difficulty]],
                    ["Hints", hints.length],
                    ["Mistakes", game.mistakes],
                ].map(([k, v]) => (
                    <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                    </div>
                ))}
            </dl>
            <h3>Techniques</h3>
            <ul className="chips">
                {needed.map((id) => (
                    <li key={id}>{TECHNIQUES[id].name}</li>
                ))}
            </ul>
            {learned.length > 0 && (
                <dl className="learned">
                    {(learned as Id[]).map((id) => (
                        <div key={id}>
                            <dt>{TECHNIQUES[id].name}</dt>
                            <dd>{TECHNIQUES[id].about}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {onNext && (
                <button className="btn primary wide" onClick={onNext}>
                    New puzzle
                </button>
            )}
        </Dialog>
    );
}
