import { paint } from "../palette";

// A Merge board mid-game: 0 is empty.
const BOARD = [2, 0, 4, 0, 0, 8, 2, 0, 16, 4, 32, 2, 128, 64, 8, 4];

/** Each doubling is the next palette color: a 2 is color 1, a 4 color 2, and so on. */
export const tint = (v: number) => ({ backgroundColor: paint(Math.log2(v)), color: "#0a0a0a" });

export default function MergeBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 grid w-48 rotate-6 grid-cols-4 gap-1.5 rounded-xl bg-neutral-950/60 p-1.5 opacity-50 transition-opacity duration-300 group-hover:opacity-80 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {BOARD.map((v, i) => (
                <span
                    key={i}
                    className={`grid aspect-square place-items-center rounded-md text-sm font-bold ${v ? "" : "bg-neutral-800/60"}`}
                    style={v ? tint(v) : undefined}
                >
                    {v || ""}
                </span>
            ))}
        </div>
    );
}
