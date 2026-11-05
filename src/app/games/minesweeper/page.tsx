import Minesweeper from "../../../games/minesweeper/minesweeper";

export const metadata = { title: "Minesweeper - Nickolas Tran" };

export default function MinesweeperPage() {
    return (
        <main className="min-h-screen">
            <Minesweeper />
        </main>
    );
}
