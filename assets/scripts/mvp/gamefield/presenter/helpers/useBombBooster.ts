export function useBombBooster(gamefield: number[][], useCellRow: number, useCellColumn: number, radius = 3, explosedCellValue = -1): number[][] {
    const newGamefield = gamefield.map((row) => row.slice());

    for (let i = useCellRow - Math.floor(radius / 2); i <= useCellRow + Math.floor(radius / 2); i++) {
        for (let j = useCellColumn - Math.floor(radius / 2); j <= useCellColumn + Math.floor(radius / 2); j++) {
            if (i >= 0 && i < newGamefield.length && j >= 0 && j < newGamefield[i].length) {
                newGamefield[i][j] = explosedCellValue;
            }
        }
    }

    return newGamefield;
}