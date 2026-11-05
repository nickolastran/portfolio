import { paint } from "../palette";

// A Stack well mid-game: digits are palette colors (x2, to spread them around the wheel), 0 is empty. The 3 near the top is falling.
const WELL = ["00033000", "00003000", "00000000", "00000000", "00000000", "60000004", "66000744", "11155774"];

export default function StackBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 grid w-56 rotate-6 grid-cols-8 gap-1 rounded-xl bg-neutral-950/60 p-1.5 opacity-50 transition-opacity duration-300 group-hover:opacity-80 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {[...WELL.join("")].map((d, i) => (
                <span
                    key={i}
                    className={`aspect-square rounded-[3px] ${d === "0" ? "bg-neutral-800/60" : "shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)]"}`}
                    style={d === "0" ? undefined : { backgroundColor: paint(+d * 2) }}
                />
            ))}
        </div>
    );
}
