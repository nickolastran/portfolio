// A board mid-game for the Sudoku card: givens, a few of your entries, one
// selected cell. 0 is empty.
const PUZZLE = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const ENTRIES: Record<number, number> = { 2: 4, 11: 2, 20: 8, 30: 7 };
const SELECTED = 21;

export default function SudokuBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-1/2 grid w-80 md:-right-12 md:w-[30rem] -translate-y-1/2 -rotate-6 grid-cols-3 gap-[2px] rounded-lg bg-neutral-600 p-[2px] opacity-40 transition-opacity duration-300 group-hover:opacity-70 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {Array.from({ length: 9 }, (_, b) => (
                <div key={b} className="grid grid-cols-3 gap-px bg-neutral-800">
                    {Array.from({ length: 9 }, (_, k) => {
                        const i = (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * 9 + (b % 3) * 3 + (k % 3);
                        const given = Number(PUZZLE[i]);
                        return (
                            <span
                                key={k}
                                className={`grid aspect-square place-items-center text-lg md:text-2xl ${i === SELECTED ? "bg-blue-400/25" : "bg-neutral-900"} ${given ? "font-semibold text-neutral-200" : "text-blue-400"}`}
                            >
                                {given || ENTRIES[i] || ""}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
