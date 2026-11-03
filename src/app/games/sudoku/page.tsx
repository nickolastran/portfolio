import Sudoku from "../../../games/sudoku/sudoku";

export const metadata = { title: "Sudoku - Nickolas Tran" };

export default function SudokuPage() {
    return (
        <main className="min-h-screen">
            <Sudoku />
        </main>
    );
}
