import type GamefieldModel from "../model/GamefieldModel";

import { BoosterType, CellType, GameStatus, ISuperCellData, SuperCellType } from "../../../shared/types";
import { checkCombinationsAvailability } from "./helpers/checkCombinationsAvailability";
import { simulateCellsGravity } from "../../../utils/simulateCellsGravity";
import { getCellsAmountByType } from "./helpers/getCellsAmountByType";
import { useTeleportBooster } from "./helpers/useTeleportBooster";
import { checkCombination } from "./helpers/checkCombinations";
import { shuffleGamefield } from "./helpers/shuffleGamefield";
import { useBombBooster } from "./helpers/useBombBooster";
import { destroyColumn } from "./helpers/destroyColumn";
import { destroyRow } from "./helpers/destroyRow";
import { destroyAll } from "./helpers/destroyAll";

type BoosterWaitingForCellData = { cellRow: number, cellColumn: number };

export default class GamefieldPresenter {
    private readonly model: GamefieldModel;

    private readonly superCellsActions: Record<SuperCellType, ISuperCellData> = {
        [SuperCellType.HORIZONTAL_ROCKET]: { action: (row: number, column: number) => destroyRow(this.model.gamefield, row), createCombinationLength: 5 },
        [SuperCellType.VERTICAL_ROCKET]: { action: (row: number, column: number) => destroyColumn(this.model.gamefield, column), createCombinationLength: 6 },
        [SuperCellType.BOMB]: { action: (row: number, column: number) => useBombBooster(this.model.gamefield, row, column, 4), createCombinationLength: 7 },
        [SuperCellType.DESTROY_ALL_FIELD]: { action: (row: number, column: number) => destroyAll(this.model.gamefield), createCombinationLength: 9 }
    }

    public boosterWaitingForCell: BoosterWaitingForCellData | null = null;

    public constructor(model: GamefieldModel) {
        this.model = model;
    }

    public createGamefield(): void {
        const gamefield = this.getRandomGamefield(this.model.gamefieldHeight, this.model.gamefieldWidth);

        this.model.gamefield = gamefield;
        this.model.beforeNormalizedGamefield = gamefield;
    }

    public onCellClicked(i: number, j: number): void {
        if (this.model.gamefieldNormalizingInProgress || this.model.gameStatus !== GameStatus.IN_PROGRESS) {
            return;
        }

        if (this.model.selectedBoosterData) {
            if (this.model.selectedBoosterData.isWaitingForCell && !this.boosterWaitingForCell) {
                this.boosterWaitingForCell = { cellRow: i, cellColumn: j };
                cc.systemEvent.emit('hover_cell', i, j);
                return;
            }

            this.useBooster(this.model.selectedBooster, i, j);
            return;
        }

        const superCellAction = this.superCellsActions[this.model.gamefield[i][j]];
        const beforeNormalizedGamefield = superCellAction ? superCellAction.action(i, j) : checkCombination(this.model.gamefield, i, j);

        if (beforeNormalizedGamefield === null) {
            return;
        }

        const combinationLength = getCellsAmountByType(beforeNormalizedGamefield, CellType.EMPTY);
        const superCell = this.getSuperCellByCombiinationLength(combinationLength);

        if (superCell && !superCellAction) {
            beforeNormalizedGamefield[i][j] = superCell;
        }

        this.model.makeTurn();
        this.model.addScore(combinationLength);
        this.model.updateGamefield(beforeNormalizedGamefield, this.normalizeGamefield(beforeNormalizedGamefield));
    }

    public setGamefieldNormalizingInProgress(value: boolean): void {
        this.model.setNormalizingInProgress(value);

        if (!value) {
            if (!checkCombinationsAvailability(this.model.gamefield)) {
                if (this.model.gamefieldShufflesAmount > 0) {
                    this.shuffleGamefield();
                    this.model.gamefieldShufflesAmount--;
                } else {
                    this.model.forceSetGameStatus(GameStatus.LOSE);
                }
            }
        }
    }

    public selectBooster(boosterType: BoosterType | null): void {
        this.model.selectBooster(boosterType);

        if (!boosterType) {
            cc.systemEvent.emit('unhover_cell', this.boosterWaitingForCell.cellRow, this.boosterWaitingForCell.cellColumn);
            this.boosterWaitingForCell = null;
        }
    }

    private shuffleGamefield(): void {
        const shuffledGamefield = shuffleGamefield(this.model.gamefield);
        this.model.updateGamefield(shuffledGamefield, shuffledGamefield);
    }

    private useBooster(boosterType: BoosterType, cellRow: number, cellColumn: number): void {
        const isWaitingForCell = this.model.availableBoosters[boosterType]?.isWaitingForCell;

        if (isWaitingForCell) {
            if (this.boosterWaitingForCell?.cellColumn === cellColumn && this.boosterWaitingForCell?.cellRow === cellRow) {
                return;
            }
        }

        switch (boosterType) {
            case BoosterType.BOMB: {
                const afterExplosionGamefield = useBombBooster(this.model.gamefield, cellRow, cellColumn, 5);

                this.model.addScore(getCellsAmountByType(afterExplosionGamefield));
                this.model.updateGamefield(afterExplosionGamefield, this.normalizeGamefield(afterExplosionGamefield));
                this.model.useBooster(boosterType);

                break;
            }
            case BoosterType.TELEPORT: {
                const afterTeleportGamefield = useTeleportBooster(this.model.gamefield, this.boosterWaitingForCell.cellRow, this.boosterWaitingForCell.cellColumn, cellRow, cellColumn);

                this.model.updateGamefield(afterTeleportGamefield, this.normalizeGamefield(afterTeleportGamefield));
                this.model.useBooster(boosterType);
                break;
            }
        }

        if (isWaitingForCell) {
            cc.systemEvent.emit('unhover_cell', this.boosterWaitingForCell.cellRow, this.boosterWaitingForCell.cellColumn);
            this.boosterWaitingForCell = null;
        }
    }

    public restart(): void {
        this.model.reset();

        const gamefield = this.getRandomGamefield(this.model.gamefieldHeight, this.model.gamefieldWidth);
        this.model.updateGamefield(gamefield, gamefield);
    }

    private normalizeGamefield(gamefield: number[][]): number[][] {
        const normalizeGamefield = simulateCellsGravity([...gamefield.map(row => [...row])]);

        for (let i = normalizeGamefield.length - 1; i >= 0; i--) {
            for (let j = 0; j < normalizeGamefield[i].length; j++) {
                if (normalizeGamefield[i][j] === CellType.EMPTY) {
                    normalizeGamefield[i][j] = this.getRandomCellType();
                }
            }
        }

        return normalizeGamefield;
    }

    private getRandomGamefield(rows: number, columns: number): number[][] {
        const gamefield: number[][] = [];

        for (let i = 0; i < rows; i++) {
            gamefield[i] = [];

            for (let j = 0; j < columns; j++) {
                gamefield[i][j] = this.getRandomCellType();
            }
        }

        return gamefield;
    }

    private getRandomCellType(): CellType {
        const cellTypes: CellType[] = Object.values(CellType).filter(val => typeof val === 'number' && val >= 0) as CellType[];
        return cellTypes[Math.floor(Math.random() * cellTypes.length)];
    }

    private getSuperCellByCombiinationLength(combinationLength: number): SuperCellType | null {
        const sortedMaxSuperCells = Object.entries(this.superCellsActions).sort((a, b) => b[1].createCombinationLength - a[1].createCombinationLength);
        for (const [type, data] of sortedMaxSuperCells) {
            if (combinationLength >= data.createCombinationLength) {
                return Number(type) as SuperCellType;
            }
        }

        return null;
    }
}