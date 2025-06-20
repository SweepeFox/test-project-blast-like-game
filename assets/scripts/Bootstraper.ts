import GamefieldPresenter from "./mvp/gamefield/presenter/GamefieldPresenter";
import GamefieldModel from "./mvp/gamefield/model/GamefieldModel";
import GamefieldView from "./mvp/gamefield/view/GamefieldView";
import HudPresenter from "./mvp/hud/presenter/HudPresenter";
import HudModel from "./mvp/hud/model/HudModel";
import HudView from "./mvp/hud/view/HudView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bootstraper extends cc.Component {
    private readonly levelConfig: ILevelConfig = {
        gamefieldWidth: 8,
        gamefieldHeight: 9,
        availableTurns: 30,
        scoreTarget: 250,
    }

    @property(cc.Prefab)
    private gamefieldViewPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private hudViewPrefab: cc.Prefab = null;

    public onLoad(): void {
        const { gamefieldWidth, gamefieldHeight, availableTurns, scoreTarget } = this.levelConfig;

        const gamefieldModel = new GamefieldModel(gamefieldWidth, gamefieldHeight, availableTurns, scoreTarget);
        const gamefieldPresenter = new GamefieldPresenter(gamefieldModel);
        const gamefieldView = cc.instantiate(this.gamefieldViewPrefab).getComponent(GamefieldView);

        gamefieldView.node.parent = this.node;
        gamefieldView.init(gamefieldModel, gamefieldPresenter);

        const hudModel = new HudModel();
        const hudPresenter = new HudPresenter(hudModel, gamefieldModel, gamefieldPresenter);
        const hudView = cc.instantiate(this.hudViewPrefab).getComponent(HudView);

        hudView.node.parent = this.node;
        hudView.init(gamefieldModel, hudPresenter,hudModel);
    }
}

export interface ILevelConfig {
    gamefieldWidth: number;
    gamefieldHeight: number;
    availableTurns: number;
    scoreTarget: number;
}