export function destroyAll(matrix: number[][], emptyCellValue: number = -1): number[][] {
    const resultMatrix = matrix.map((row) => row.slice());

    for (let i = 0; i < resultMatrix.length; i++) {
        for (let j = 0; j < resultMatrix[i].length; j++) {
            resultMatrix[i][j] = emptyCellValue;
        }
    }

    return resultMatrix;
}