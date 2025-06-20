import { CellType } from "../../../../shared/types";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {
    @property(cc.Sprite)
    public readonly SpriteRenderer: cc.Sprite = null;

    @property(cc.SpriteFrame)
    private states: cc.SpriteFrame[] = [];

    public setState(state: CellType): void {
        if (state === CellType.EMPTY) {
            this.SpriteRenderer.spriteFrame = null;
        }
        else
        {
            try {
                this.SpriteRenderer.spriteFrame = this.states[state];
            }
            catch (e) {
                console.error("Invalid cell state", state);
                return;
            }
        }
    }

    public setHover(value: boolean): void {
        this.node.opacity = value ? 128 : 255;
    }
}