import * as PIXI from 'pixi.js';

export class Enemy {
  sprite: PIXI.Graphics;
  destroyed = false;

  constructor(x: number, y: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xff0000);
    this.sprite.drawRect(-15, -10, 30, 20);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy() {
    this.destroyed = true;
  }
}