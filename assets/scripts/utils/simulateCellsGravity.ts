export function simulateCellsGravity(cells: number[][], emptyCell = -1): number[][] {
    for (let i = cells.length - 1; i >= 0; i--) {
        for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j] !== emptyCell) {
                continue;
            }

            let k = i;
            while (k > 0 && cells[k - 1][j] === emptyCell) {
                k--;
            }

            if (k > 0) {
                const topCell = cells[k - 1][j];
                cells[k - 1][j] = emptyCell;
                cells[i][j] = topCell;
            }
        }
    }

    return cells;
}