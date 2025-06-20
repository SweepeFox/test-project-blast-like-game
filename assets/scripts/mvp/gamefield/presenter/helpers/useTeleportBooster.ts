export function useTeleportBooster(gamefield: number[][], teleportFromRow: number, teleportFromColumn: number, teleportToRow: number, teleportToColumn: number): number[][] {
    const newGamefield = gamefield.map((row) => row.slice());

    const temp = newGamefield[teleportFromRow][teleportFromColumn];
    newGamefield[teleportFromRow][teleportFromColumn] = newGamefield[teleportToRow][teleportToColumn];
    newGamefield[teleportToRow][teleportToColumn] = temp;

    return newGamefield;
}