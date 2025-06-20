import type GamefieldModel from "../../gamefield/model/GamefieldModel";
import type HudPresenter from "../presenter/HudPresenter";
import type HudModel from "../model/HudModel";

import { GamefieldModelEvents, GameStatus } from "../../../shared/types";
import BoosterButton from "./components/BoosterButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HudView extends cc.Component {
    @property(cc.Label)
    private readonly turnsLabel: cc.Label = null;

    @property(cc.Label)
    private readonly scoreLabel: cc.Label = null;

    @property(cc.Node)
    private readonly winPopup: cc.Node = null;

    @property(cc.Node)
    private readonly losePopup: cc.Node = null;

    @property(BoosterButton)
    private readonly boostersButtons: BoosterButton[] = [];

    private gamefieldModel: GamefieldModel;
    private presenter: HudPresenter;
    private model: HudModel;

    public init(gamefieldModel: GamefieldModel, presenter: HudPresenter, model: HudModel) {
        this.gamefieldModel = gamefieldModel;
        this.presenter = presenter;
        this.model = model;

        for (const [boosterType, boosterData] of Object.entries(this.gamefieldModel.availableBoosters)) {
            const boosterButton = this.boostersButtons.find(b => b.boosterType === boosterType);
            if (!boosterButton) {
                continue;
            }

            boosterButton.init(boosterData.amount, () => this.onBoosterSelected(boosterButton));
        }

        this.gamefieldModel.eventDispatcher.addEventListener(GamefieldModelEvents.MAKE_TURN, this.onMakeTurn.bind(this));
        this.gamefieldModel.eventDispatcher.addEventListener(GamefieldModelEvents.UPDATE_SCORE, this.onScoreUpdated.bind(this));

        this.gamefieldModel.eventDispatcher.addEventListener(GamefieldModelEvents.GAMEFIELD_NORMALIZED, this.onGamefieldNormalized.bind(this));
        this.gamefieldModel.eventDispatcher.addEventListener(GamefieldModelEvents.GAMEFIELD_RESET, this.onGamefieldReset.bind(this));

        this.gamefieldModel.eventDispatcher.addEventListener(GamefieldModelEvents.BOOSTER_USED, this.onBoosterUsed.bind(this));

        this.onMakeTurn();
        this.onScoreUpdated();
    }

    private onMakeTurn(): void {
        this.turnsLabel.string = this.gamefieldModel.turns.toString();
    }

    private onScoreUpdated(): void {
        this.scoreLabel.string = `${this.gamefieldModel.score}/${this.gamefieldModel.targetScore}`;
    }

    private onGamefieldNormalized(): void {
        switch (this.gamefieldModel.gameStatus) {
            case GameStatus.WIN: {
                this.winPopup.active = true;
                break;
            }
            case GameStatus.LOSE: {
                this.losePopup.active = true;
                break;
            }
        }
    }

    private onGamefieldReset(): void {
        this.onMakeTurn();
        this.onScoreUpdated();
    }

    private onBoosterSelected(boosterButton: BoosterButton): void {
        this.presenter.selectBooster(boosterButton);
    }

    private onBoosterUsed(): void {
        this.presenter.useBooster();
    }

    public onWinBtnClick(): void {
        this.winPopup.active = false;
        this.presenter.restart();
    }

    public onLoseBtnClick(): void {
        this.losePopup.active = false;
        this.presenter.restart();
    }

    public onDestroy(): void {
        this.gamefieldModel.eventDispatcher.removeEventListener(GamefieldModelEvents.MAKE_TURN, this.onMakeTurn.bind(this));
        this.gamefieldModel.eventDispatcher.removeEventListener(GamefieldModelEvents.UPDATE_SCORE, this.onScoreUpdated.bind(this));

        this.gamefieldModel.eventDispatcher.removeEventListener(GamefieldModelEvents.GAMEFIELD_NORMALIZED, this.onGamefieldNormalized.bind(this));
        this.gamefieldModel.eventDispatcher.removeEventListener(GamefieldModelEvents.GAMEFIELD_RESET, this.onGamefieldReset.bind(this));

        this.gamefieldModel.eventDispatcher.removeEventListener(GamefieldModelEvents.BOOSTER_USED, this.onBoosterUsed.bind(this));
    }
}