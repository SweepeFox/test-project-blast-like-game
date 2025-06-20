export function destroyRow(matrix: number[][], rowIndex: number, emptyCellValue: number = -1): number[][] {
    const resultMatrix = matrix.map((row) => row.slice());

    for (let i = 0; i < resultMatrix[rowIndex].length; i++) {
        resultMatrix[rowIndex][i] = emptyCellValue;
    }

    return resultMatrix;
}