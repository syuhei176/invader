import * as PIXI from 'pixi.js';
import { Player } from './player';

export class EnemyBullet {
  sprite: PIXI.Graphics;
  destroyed = false;

  constructor(x: number, y: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xffaa00);
    this.sprite.drawRect(-2, 0, 4, 10);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  update() {
    this.sprite.y += 4;
    if (this.sprite.y > window.innerHeight) this.destroy();
  }

  hit(player: Player): boolean {
    const b = this.sprite.getBounds();
    const p = player.sprite.getBounds();
    return (
      b.x < p.x + p.width && b.x + b.width > p.x &&
      b.y < p.y + p.height && b.y + b.height > p.y
    );
  }

  destroy() {
    this.destroyed = true;
  }
}