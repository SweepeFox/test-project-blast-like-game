export function destroyColumn(matrix: number[][], column: number, emptyCellValue: number = -1): number[][] {
    const resultMatrix = matrix.map((row) => row.slice());

    for (let i = 0; i < resultMatrix.length; i++) {
        resultMatrix[i][column] = emptyCellValue;
    }

    return resultMatrix;
}