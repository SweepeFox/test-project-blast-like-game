import { BoosterType } from "../../../../shared/types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoosterButton extends cc.Button {
    @property(cc.Label)
    private readonly amountLabel: cc.Label = null;

    @property
    public readonly boosterType: BoosterType = BoosterType.BOMB;

    private amount: number;

    private onClickAction: () => void;

    public init(amount: number, onClickAction: () => void): void {
        this.updateAmount(amount);
        this.onClickAction = onClickAction;
    }

    public updateAmount(newAmount: number): void {
        this.amount = newAmount;
        this.amountLabel.string = this.amount.toString();

        if (this.amount === 0) {
            this.interactable = false;
            this.node.opacity = 128;
        }
    }

    public setSelected(selected: boolean): void {
        if (selected) {
            this.node.setScale(1.1);
            this.node.runAction(cc.repeatForever(cc.sequence(
                cc.scaleTo(0.5, 1.2),
                cc.scaleTo(0.5, 1.0)
            )));
        } else {
            this.node.stopAllActions();
            this.node.setScale(1.0);
        }
    }

    public onClick(): void {
        this.onClickAction && this.onClickAction();
    }
}