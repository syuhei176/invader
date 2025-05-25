import * as PIXI from 'pixi.js';

export class Block {
  sprite: PIXI.Graphics;
  destroyed = false;

  constructor(x: number, y: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x999999);
    this.sprite.drawRect(-10, -10, 20, 20);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy() {
    this.destroyed = true;
  }
}