import { BoosterType, GameStatus, GamefieldModelEvents, IBoosterData } from "../../../shared/types";
import { checkCombinationsAvailability } from "../presenter/helpers/checkCombinationsAvailability";

export default class GamefieldModel {
    public readonly eventDispatcher: EventTarget = new EventTarget();

    public readonly gamefieldWidth: number;
    public readonly gamefieldHeight: number;
    public readonly targetScore: number;
    public readonly availableTurns: number;
    public readonly availableBoosters: Record<BoosterType, IBoosterData>;

    public gamefield: number[][];
    public beforeNormalizedGamefield: number[][];
    public turns: number;
    public score: number;

    public gameStatus: GameStatus = GameStatus.IN_PROGRESS;
    public gamefieldNormalizingInProgress: boolean = false;
    public gamefieldShufflesAmount: number = 3;

    public lastUsedBooster: BoosterType | null = null;
    public selectedBooster: BoosterType | null = null;

    get selectedBoosterData(): IBoosterData | null {
        if (this.selectedBooster === null) {
            return null;
        }

        return this.availableBoosters[this.selectedBooster] ?? null;
    }

    public constructor(gamefieldWidth: number, gamefieldHeight: number, availableTurns: number, targetScore: number) {
        this.gamefieldWidth = gamefieldWidth;
        this.gamefieldHeight = gamefieldHeight;
        this.targetScore = targetScore;

        this.availableTurns = availableTurns;
        this.availableBoosters = {
            [BoosterType.BOMB]: { amount: 3 },
            [BoosterType.TELEPORT]: { amount: 5, isWaitingForCell: true }
        }

        this.turns = availableTurns;
        this.score = 0;
    }

    public updateGamefield(beforeNormalizedGamefield: number[][], normalizedGamefield: number[][]): void {
        this.beforeNormalizedGamefield = beforeNormalizedGamefield;
        this.gamefield = normalizedGamefield;

        this.calculateGameStatus();
        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.GAMEFIELD_UPDATED));
    }

    public makeTurn(): void {
        this.turns--;
        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.MAKE_TURN));
    }

    public addScore(value: number): void {
        this.score += value;
        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.UPDATE_SCORE));
    }

    public useBooster(boosterType: BoosterType): void {
        if (this.availableBoosters[boosterType]?.amount <= 0) {
            return;
        }

        this.availableBoosters[boosterType].amount--;

        this.lastUsedBooster = this.selectedBooster;
        this.selectedBooster = null;

        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.BOOSTER_USED));
    }

    public setNormalizingInProgress(value: boolean): void {
        this.gamefieldNormalizingInProgress = value;

        if (!value) {
            this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.GAMEFIELD_NORMALIZED));
        }
    }

    public selectBooster(boosterType: BoosterType | null): void {
        if (boosterType === null) {
            this.selectedBooster = null;
            return;
        }

        if (this.availableBoosters[boosterType]?.amount <= 0) {
            return;
        }

        this.selectedBooster = boosterType;
    }

    public reset(): void {
        this.turns = this.availableTurns;
        this.score = 0;
        this.gameStatus = GameStatus.IN_PROGRESS;
        this.gamefieldShufflesAmount = 3;

        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.GAMEFIELD_RESET));
    }

    public forceSetGameStatus(gameStatus: GameStatus): void {
        this.gameStatus = gameStatus;
        this.eventDispatcher.dispatchEvent(new Event(GamefieldModelEvents.GAMEFIELD_NORMALIZED));
    }

    private calculateGameStatus(): void {
        if ((!this.turns && this.score <= this.targetScore) || !checkCombinationsAvailability(this.gamefield)) {
            this.gameStatus = GameStatus.LOSE;
            return;
        }

        if (this.score >= this.targetScore) {
            this.gameStatus = GameStatus.WIN;
            return;
        }

        this.gameStatus = GameStatus.IN_PROGRESS;
    }
}