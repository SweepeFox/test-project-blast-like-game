export enum CellType {
    EMPTY = -1,
    RED = 0,
    YELLOW = 1,
    BLUE = 2,
    GREEN = 3,
    PURPLE = 4
}

export enum SuperCellType {
    HORIZONTAL_ROCKET = 5,
    VERTICAL_ROCKET,
    DESTROY_ALL_FIELD,
    BOMB
}

export enum GamefieldModelEvents {
    MAKE_TURN = 'makeTurn',
    UPDATE_SCORE = 'updateScore',

    GAMEFIELD_UPDATED = 'gamefieldUpdated',
    GAMEFIELD_NORMALIZED = 'gamefieldNormalized',
    GAMEFIELD_RESET = 'gamefieldReset',

    BOOSTER_USED = "boosterUsed"
}

export enum GameStatus {
    IN_PROGRESS = 'inProgress',
    WIN = 'win',
    LOSE = 'lose'
}

export enum BoosterType {
    BOMB = 'bomb',
    TELEPORT = 'teleport'
}

export interface IBoosterData {
    amount: number;
    isWaitingForCell?: boolean;
}

export interface ISuperCellData {
    action: (row: number, column: number) => number[][];
    createCombinationLength: number;
}