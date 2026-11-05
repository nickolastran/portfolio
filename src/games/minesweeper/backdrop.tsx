import { paint } from "../palette";

// A Minesweeper board mid-game: # is hidden, F a flag, digits are open squares.
const BOARD = ["##1000##", "#F1001F#", "##211122", "###1####", "1121####", "000F####", "0012####", "0001####"];
const NUM_COLORS = ["", paint(10), paint(6), paint(1)];

export default function MinesweeperBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 grid w-56 rotate-6 grid-cols-8 gap-1 rounded-xl bg-neutral-950/60 p-1.5 opacity-50 transition-opacity duration-300 group-hover:opacity-80 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {[...BOARD.join("")].map((ch, i) => (
                <span
                    key={i}
                    className={`grid aspect-square place-items-center rounded-[3px] text-xs font-bold ${ch === "#" || ch === "F" ? "bg-neutral-700 shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)]" : "bg-neutral-800/40"}`}
                    style={{ color: ch === "F" ? paint(1) : NUM_COLORS[+ch] }}
                >
                    {ch === "F" ? "⚑" : ch === "#" || ch === "0" ? "" : ch}
                </span>
            ))}
        </div>
    );
}
