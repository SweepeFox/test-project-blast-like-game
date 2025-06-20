export function shuffleGamefield(matrix: number[][]): number[][] {
    const newMatrix = matrix.map((row) => row.slice());

    for (let i = newMatrix.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newMatrix[i], newMatrix[j]] = [newMatrix[j], newMatrix[i]];
    }

    return newMatrix;
}