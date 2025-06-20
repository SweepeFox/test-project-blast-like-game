export function checkCombinationsAvailability(matrix: number[][]): boolean {
    const hasNeighborWithSameType = (i: number, j: number, cellType: number): boolean => {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const direction of directions) {
            const ni = i + direction[0];
            const nj = j + direction[1];
            if (ni >= 0 && ni < matrix.length && nj >= 0 && nj < matrix[ni].length) {
                if (matrix[ni][nj] === cellType) {
                    return true;
                }
            }
        }
        return false;
    }

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const cellType = matrix[i][j];
            if (hasNeighborWithSameType(i, j, cellType)) {
                return true;
            }
        }
    }

    return false;
}