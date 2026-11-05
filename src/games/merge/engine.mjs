// Merge engine: slide every tile one way; two equal tiles that meet become
// one worth double. Tiles keep their ids so the UI can slide them.
// Plain JS so the check next to it runs under bare node.

export const SIZE = 4;

const range = [...Array(SIZE).keys()];
/* Each line's squares, starting from the edge the tiles slide toward. */
const LINES = {
    left: range.map((r) => range.map((c) => r * SIZE + c)),
    right: range.map((r) => range.map((c) => r * SIZE + SIZE - 1 - c)),
    up: range.map((c) => range.map((r) => r * SIZE + c)),
    down: range.map((c) => range.map((r) => (SIZE - 1 - r) * SIZE + c)),
};

/**
 * Slides every line toward `dir`. Each tile merges at most once per move, and
 * the pair nearest the edge goes first. Scores the value of every new tile.
 * @param {({ id: number, v: number } | null)[]} grid
 * @param {"left" | "right" | "up" | "down"} dir
 */
export function slide(grid, dir) {
    /** @type {({ id: number, v: number } | null)[]} */
    const next = Array(SIZE * SIZE).fill(null);
    /** @type {number[]} */
    const merged = [];
    let points = 0;
    for (const line of LINES[dir]) {
        const tiles = line.map((i) => grid[i]).filter((t) => t !== null);
        let k = 0;
        for (let j = 0; j < tiles.length; j++, k++) {
            const t = tiles[j];
            if (tiles[j + 1]?.v === t.v) {
                next[line[k]] = { id: t.id, v: t.v * 2 };
                merged.push(t.id);
                points += t.v * 2;
                j++;
            } else next[line[k]] = t;
        }
    }
    const moved = next.some((t, i) => t?.id !== grid[i]?.id || t?.v !== grid[i]?.v);
    return { grid: next, points, moved, merged };
}

/** A 2 (or one time in ten, a 4) on a random empty square. */
export function addTile(grid, id, rand = Math.random) {
    const empty = grid.flatMap((t, i) => (t ? [] : [i]));
    if (!empty.length) return grid;
    const next = grid.slice();
    next[empty[Math.floor(rand() * empty.length)]] = { id, v: rand() < 0.9 ? 2 : 4 };
    return next;
}

export const canMove = (grid) => ["left", "right", "up", "down"].some((d) => slide(grid, /** @type {any} */ (d)).moved);

/** Two starting tiles, ids 1 and 2. */
export const newGrid = (rand = Math.random) => addTile(addTile(Array(SIZE * SIZE).fill(null), 1, rand), 2, rand);
