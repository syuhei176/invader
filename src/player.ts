import * as PIXI from 'pixi.js';

export class Player {
  sprite: PIXI.Graphics;

  constructor(x: number, y: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x00ff00);
    this.sprite.drawRect(-20, -10, 40, 20);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  update(keys: Record<string, boolean>) {
    if (keys['ArrowLeft']) this.sprite.x -= 5;
    if (keys['ArrowRight']) this.sprite.x += 5;
  }
}