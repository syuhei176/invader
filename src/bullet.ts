import * as PIXI from 'pixi.js';
import { Enemy } from './enemy';

export class Bullet {
  sprite: PIXI.Graphics;
  destroyed = false;

  constructor(x: number, y: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0xffffff);
    this.sprite.drawRect(-2, -10, 4, 10);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  update() {
    this.sprite.y -= 10;
    if (this.sprite.y < 0) this.destroy();
  }

  hit(enemy: Enemy): boolean {
    if (this.destroyed || enemy.destroyed) return false;
    const b = this.sprite.getBounds();
    const e = enemy.sprite.getBounds();
    return b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y;
  }

  destroy() {
    this.destroyed = true;
  }
}