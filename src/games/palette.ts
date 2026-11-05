/**
 * The games' one palette. Color n: same chroma for all, hues 24° apart around
 * the wheel, lightness alternating so neighbors still read as different.
 * Blocks and Stack color by shape, Merge by doubling, Minesweeper by number.
 */
export const paint = (n: number) => `oklch(${n % 2 ? 0.72 : 0.84} 0.16 ${n * 24})`;
