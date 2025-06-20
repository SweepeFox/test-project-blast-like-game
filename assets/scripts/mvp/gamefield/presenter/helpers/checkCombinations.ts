export function checkCombination(matrix: number[][], fromRow: number, fromColumn: number, onCombinationValue = -1): number[][] | null {
    const resultMatrix = matrix.map((row) => row.slice());
    const fromCellType = matrix[fromRow][fromColumn];

    const combinationCells: Set<string> = new Set();
    combinationCells.add(`${fromRow},${fromColumn}`);

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    let newCellsAdded = true;
    while (newCellsAdded) {
        newCellsAdded = false;
        combinationCells.forEach(cell => {
            const [row, column] = cell.split(',').map(Number);
            for (const direction of directions) {
                let newRow = row + direction[0];
                let newColumn = column + direction[1];

                while (newRow >= 0 && newRow < matrix.length && newColumn >= 0 && newColumn < matrix[0].length) {
                    if (matrix[newRow][newColumn] === fromCellType) {
                        const newCell = `${newRow},${newColumn}`;
                        if (!combinationCells.has(newCell)) {
                            combinationCells.add(newCell);
                            newCellsAdded = true;
                        }
                        newRow += direction[0];
                        newColumn += direction[1];
                    } else {
                        break;
                    }
                }
            }
        });
    }

    if (combinationCells.size < 2) {
        return null;
    }

    combinationCells.forEach(cell => {
        const [row, column] = cell.split(',').map(Number);
        resultMatrix[row][column] = onCombinationValue;
    });

    return resultMatrix;
}