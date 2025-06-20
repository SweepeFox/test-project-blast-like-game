import type GamefieldPresenter from "../../gamefield/presenter/GamefieldPresenter";
import type BoosterButton from "../view/components/BoosterButton";
import type HudModel from "../model/HudModel";
import GamefieldModel from "../../gamefield/model/GamefieldModel";

export default class HudPresenter {
    private readonly model: HudModel;
    private readonly gamefieldModel: GamefieldModel;
    private readonly gamefieldPresenter: GamefieldPresenter;

    public constructor(model: HudModel, gamefieldModel: GamefieldModel, gamefieldPresenter: GamefieldPresenter) {
        this.model = model;
        this.gamefieldModel = gamefieldModel;
        this.gamefieldPresenter = gamefieldPresenter;
    }

    public selectBooster(booster: BoosterButton | null): void {
        this.model.selectedBoosterButton?.setSelected(false);

        if (this.model.selectedBoosterButton === booster) {
            this.model.selectedBoosterButton = null;
            this.gamefieldPresenter.selectBooster(null);
            return;
        }

        this.model.selectedBoosterButton = booster;
        this.model.selectedBoosterButton?.setSelected(true);

        this.gamefieldPresenter.selectBooster(booster.boosterType);
    }

    public useBooster(): void {
        if (this.model.selectedBoosterButton === null) {
            return;
        }

        this.model.selectedBoosterButton.updateAmount(this.gamefieldModel.availableBoosters[this.model.selectedBoosterButton.boosterType].amount ?? 0);
        this.model.selectedBoosterButton.setSelected(false);
        this.model.selectedBoosterButton = null;
    }

    public restart(): void {
        this.gamefieldPresenter.restart();
    }
}