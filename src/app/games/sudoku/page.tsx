import { Jost, Marcellus } from "next/font/google";

import Sudoku from "../../../components/sudoku";

export const metadata = { title: "Lumen Sudoku - Nickolas Tran" };

// Engraved capitals for names, like an old star atlas; a clean geometric face
// for digits and controls.
const atlas = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-atlas" });
const ui = Jost({ subsets: ["latin"], variable: "--font-ui" });

export default function SudokuPage() {
    return (
        <main className={`${atlas.variable} ${ui.variable}`}>
            <Sudoku />
        </main>
    );
}
