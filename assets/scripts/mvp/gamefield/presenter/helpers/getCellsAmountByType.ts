export function getCellsAmountByType(maxtrix: number[][], cellType: number = -1): number {
    return maxtrix.reduce((acc, row) => acc + row.filter(cell => cell === cellType).length, 0);
}