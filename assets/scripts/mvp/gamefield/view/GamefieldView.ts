import type GamefieldPresenter from "../presenter/GamefieldPresenter";
import type GamefieldModel from "../model/GamefieldModel";

import { simulateCellsGravity } from "../../../utils/simulateCellsGravity";
import { CellType, GamefieldModelEvents } from "../../../shared/types";
import Cell from "./components/Cell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DefaultGameView extends cc.Component {
    @property(cc.Layout)
    private readonly gameFieldGridLayout: cc.Layout = null;

    @property(cc.Prefab)
    private readonly cellPrefab: cc.Prefab = null;

    @property
    private readonly fallCellDuration: number = 0.5;

    private presenter: GamefieldPresenter = null;
    private model: GamefieldModel = null;
    private cells: Cell[][] = [];

    public init(model: GamefieldModel, presenter: GamefieldPresenter): void {
        this.model = model;
        this.presenter = presenter;

        this.model.eventDispatcher.addEventListener(GamefieldModelEvents.GAMEFIELD_UPDATED, this.onGamefieldUpdated.bind(this));
        this.model.eventDispatcher.addEventListener(GamefieldModelEvents.GAMEFIELD_RESET, this.onGamefieldReset.bind(this));

        cc.systemEvent.on('hover_cell', this.hoverCell, this);
        cc.systemEvent.on('unhover_cell', this.unhoverCell, this);

        this.presenter.createGamefield();
        this.renderGamefield(this.model.gamefield);
    }

    public onDestroy(): void {
        this.model.eventDispatcher.removeEventListener(GamefieldModelEvents.GAMEFIELD_UPDATED, this.onGamefieldUpdated.bind(this));
        this.model.eventDispatcher.removeEventListener(GamefieldModelEvents.GAMEFIELD_RESET, this.onGamefieldReset.bind(this));
    }

    public onCellClicked(i: number, j: number): void {
        this.presenter.onCellClicked(i, j);

        if (this.presenter.boosterWaitingForCell) {
            this.setCellHover(this.presenter.boosterWaitingForCell.cellRow, this.presenter.boosterWaitingForCell.cellColumn, true);
        }
    }

    public setCellHover(i: number, j: number, value: boolean): void {
        this.cells[i][j]?.setHover(value);
    }

    private renderGamefield(gamefield: number[][]): void {
        if (this.cells.length === 0) {
            this.cells = Array(gamefield.length).fill(null).map(() => Array(gamefield[0].length).fill(null));

            for (let i = gamefield.length - 1; i >= 0; i--) {
                for (let j = gamefield[i].length - 1; j >= 0; j--) {
                    const cell = this.createCell(this.gameFieldGridLayout.node, gamefield[i][j], i, j);
                    this.cells[i][j] = cell.getComponent(Cell);
                }
            }

            return;
        }

        for (let i = 0; i < gamefield.length; i++) {
            for (let j = 0; j < gamefield[i].length; j++) {
                this.cells[i][j].setState(gamefield[i][j]);
            }
        }
    }

    private onGamefieldUpdated(): void {
        this.normalizeGamefield(this.model.beforeNormalizedGamefield, this.model.gamefield, () => this.presenter.setGamefieldNormalizingInProgress(false));
        this.renderGamefield(this.model.beforeNormalizedGamefield);
    }

    private onGamefieldReset(): void {
        this.renderGamefield(this.model.gamefield);
        this.presenter.setGamefieldNormalizingInProgress(false);
    }

    private createCell(parent: cc.Node, type: CellType, row: number, col: number): Cell {
        const cell = cc.instantiate(this.cellPrefab).getComponent(Cell);
        cell.setState(type);

        cell.node.parent = parent;
        cell.node.on(cc.Node.EventType.TOUCH_START, () => this.onCellClicked(row, col), this);

        return cell;
    }

    private hoverCell(row: number, column: number): void {
        this.cells[row][column]?.setHover(true);
    }

    private unhoverCell(row: number, column: number): void {
        this.cells[row][column]?.setHover(false);
    }

    private normalizeGamefield(beforeNormalizedGamefield: number[][], normalizedGamefield: number[][], callback?: () => void): void {
        this.presenter.setGamefieldNormalizingInProgress(true);

        const animateCellsFall = (): Promise<void> => {
            return new Promise<void>((resolve) => {
                let cellsInFalling = 0;

                for (let i = 0; i < beforeNormalizedGamefield.length; i++) {
                    for (let j = 0; j < beforeNormalizedGamefield[i].length; j++) {
                        if (beforeNormalizedGamefield[i][j] === CellType.EMPTY || this.cells[i][j] === null) {
                            continue;
                        }

                        let fallDistance = 0;
                        for (let k = i; k < beforeNormalizedGamefield.length; k++) {
                            if (beforeNormalizedGamefield[k][j] === CellType.EMPTY) {
                                fallDistance++;
                            }
                        }

                        if (i == 0 || fallDistance > 0) {
                            const cellSpriteNode = this.cells[i][j].SpriteRenderer.node;

                            const targetYPosition = cellSpriteNode.position.y - fallDistance * (this.gameFieldGridLayout.cellSize.height + this.gameFieldGridLayout.spacingY);
                            const fallTime = fallDistance * this.fallCellDuration;

                            cellsInFalling++;

                            this.animateCell(cellSpriteNode, targetYPosition, fallTime, () => {
                                cellsInFalling--;
                                if (cellsInFalling === 0) {
                                    resolve();
                                }
                            });
                        }
                    }
                }

                if (cellsInFalling === 0) {
                    resolve();
                }
            });
        }

        const createNewCells = (): Promise<void> => {
            return new Promise<void>((resolve) => {
                const afterGravityApplyGamefield = simulateCellsGravity(beforeNormalizedGamefield);

                const rowsWithEmptyCells: number[] = [];
                let cellsInFalling = 0;

                for (let i = this.cells.length - 1; i >= 0; i--) {
                    for (let j = 0; j < this.cells[i].length; j++) {
                        const cell = this.cells[i][j];

                        cell.SpriteRenderer.node.setPosition(cc.Vec2.ZERO);
                        cell.setState(normalizedGamefield[i][j]);

                        if (afterGravityApplyGamefield[i][j] === CellType.EMPTY) {
                            if (rowsWithEmptyCells.length === 0 || rowsWithEmptyCells[rowsWithEmptyCells.length - 1] !== i) {
                                rowsWithEmptyCells.push(i);
                            }

                            const startFallYPosition = cell.SpriteRenderer.node.position.y + (i + rowsWithEmptyCells.length) * (this.gameFieldGridLayout.cellSize.height + this.gameFieldGridLayout.spacingY);
                            const fallTime = (i + rowsWithEmptyCells.length) * this.fallCellDuration;

                            cell.SpriteRenderer.node.setPosition(cc.v2(cell.SpriteRenderer.node.position.x, startFallYPosition));
                            cellsInFalling++;

                            this.animateCell(cell.SpriteRenderer.node, 0, fallTime, () => {
                                cellsInFalling--;
                                if (cellsInFalling === 0) {
                                    resolve();
                                }
                            });
                        }
                    }
                }

                if (cellsInFalling === 0) {
                    resolve();
                }
            });
        }

        animateCellsFall().then(() => {
            createNewCells().then(() => {
                callback?.();
            });
        });
    }

    private animateCell(cellSpriteNode: cc.Node, targetYPosition: number, fallTime: number, resolve: () => void): void {
        cc.tween()
            .target(cellSpriteNode)
            .to(fallTime, { position: cc.v2(cellSpriteNode.position.x, targetYPosition) })
            .call(() => {
                resolve();
            })
            .start();
    }
}
