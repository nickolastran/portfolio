// A crossword mid-solve: uppercase squares are filled, lowercase still empty,
// "." is no square. PUZZLE is the active answer.
const CROSSWORD = [".ACRoss.", "..L...e.", ".PUZzle.", "..E..e..", "....gaME", ".....f.."];
const CLUES: Record<string, number> = { "0,1": 1, "0,2": 2, "0,6": 3, "2,1": 4, "2,5": 5, "4,4": 6 };

export default function CrosswordBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 grid w-56 rotate-6 grid-cols-8 opacity-40 transition-opacity duration-300 group-hover:opacity-70 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
        >
            {CROSSWORD.flatMap((row, r) =>
                [...row].map((ch, c) =>
                    ch === "." ? (
                        <span key={`${r},${c}`} />
                    ) : (
                        <span
                            key={`${r},${c}`}
                            className={`relative grid aspect-square place-items-center text-sm font-medium text-neutral-200 shadow-[inset_1px_1px_0_#525252,1px_0_0_#525252,0_1px_0_#525252,1px_1px_0_#525252] ${r === 2 ? (c === 4 ? "bg-blue-400/30" : "bg-blue-400/15") : "bg-neutral-900"}`}
                        >
                            <span className="absolute left-[7%] top-[3%] text-[8px] leading-none text-neutral-500">{CLUES[`${r},${c}`]}</span>
                            {ch === ch.toUpperCase() ? ch : ""}
                        </span>
                    ),
                ),
            )}
        </div>
    );
}
