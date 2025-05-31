import { Application } from 'pixi.js';
import { Player } from './player';
import { Bullet } from './bullet';
import { Enemy } from './enemy';
import { EnemyBullet } from './enemy-bullet';
import { Block } from './block';
import { Text, TextStyle } from 'pixi.js';

function showGameOverText(app: Application) {
  const style = new TextStyle({
    fill: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    align: 'center',
  });

  const message = new Text('GAME OVER', style);
  message.anchor.set(0.5);
  message.x = app.screen.width / 2;
  message.y = app.screen.height / 2;

  app.stage.addChild(message);
}

function showGameClearText(app: Application) {
  const style = new TextStyle({
    fill: '#00ff00',
    fontSize: 48,
    fontWeight: 'bold',
    align: 'center',
  });

  const message = new Text('GAME CLEAR!', style);
  message.anchor.set(0.5);
  message.x = app.screen.width / 2;
  message.y = app.screen.height / 2;

  app.stage.addChild(message);
}

let gameOver = false;
let gameClear = false;

const enemyBullets: EnemyBullet[] = [];
let enemyShootCooldown = 0;

async function main() {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: 0x000000,
  });

  document.body.style.margin = '0';
  document.body.appendChild(app.canvas);


  const player = new Player(app.screen.width / 2, app.screen.height - 50);
  app.stage.addChild(player.sprite);

  const bullets: Bullet[] = [];
  const enemies: Enemy[] = [];
  const blocks: Block[] = [];

  function createBlocks() {
    const positions = [150, 300, 450];
    for (const x of positions) {
      for (let i = 0; i < 3; i++) {
        const block = new Block(x + i * 20, app.screen.height - 120);
        blocks.push(block);
        app.stage.addChild(block.sprite);
      }
    }
  }
  
  createBlocks();  

  // 敵を生成
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      const enemy = new Enemy(80 + j * 60, 60 + i * 50);
      enemies.push(enemy);
      app.stage.addChild(enemy.sprite);
    }
  }

  // --- 入力処理 ---
  const keys: Record<string, boolean> = {};
  let touchMove = 0;
  let touchShoot = true;
  let enemyDirection = 1; // 1: 右へ, -1: 左へ

  window.addEventListener('keydown', (e) => keys[e.code] = true);
  window.addEventListener('keyup', (e) => keys[e.code] = false);

  // 透明ボタン取得
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');
  const fireBtn = document.getElementById('fire');

  leftBtn?.addEventListener('touchstart', e => {
    e.preventDefault();
    touchMove = -1;
  });
  leftBtn?.addEventListener('touchend', e => {
    e.preventDefault();
    touchMove = 0;
  });

  rightBtn?.addEventListener('touchstart', e => {
    e.preventDefault();
    touchMove = 1;
  });
  rightBtn?.addEventListener('touchend', e => {
    e.preventDefault();
    touchMove = 0;
  });

  fireBtn?.addEventListener('touchstart', e => {
    e.preventDefault();
    touchShoot = true;
  });
  fireBtn?.addEventListener('touchend', e => {
    e.preventDefault();
    touchShoot = false;
  });

  // --- ゲームループ ---
  app.ticker.add(() => {
    if (gameOver || gameClear) return;

    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].destroyed) {
        app.stage.removeChild(enemies[i].sprite);
        enemies.splice(i, 1);
      }
    }

    // 弾の削除
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].destroyed) {
        app.stage.removeChild(bullets[i].sprite);
        bullets.splice(i, 1);
      }
    }
    
    
    // 🎉 全滅判定（敵がいなくなったらクリア）
    if (enemies.length === 0) {
      gameClear = true;
      showGameClearText(app);
    }

    // プレイヤー弾 vs ブロック
    for (const bullet of bullets) {
      for (const block of blocks) {
        if (!bullet.destroyed && !block.destroyed) {
          const b = bullet.sprite.getBounds();
          const c = block.sprite.getBounds();
          if (b.x < c.x + c.width && b.x + b.width > c.x && b.y < c.y + c.height && b.y + b.height > c.y) {
            bullet.destroy();
            block.destroy();
          }
        }
      }
    }

    // 敵弾 vs ブロック
    for (const bullet of enemyBullets) {
      bullet.update();

      if (bullet.hit(player)) {
        bullet.destroy();
        gameOver = true;
        showGameOverText(app);
      }

      for (const block of blocks) {
        if (!bullet.destroyed && !block.destroyed) {
          const b = bullet.sprite.getBounds();
          const c = block.sprite.getBounds();
          if (b.x < c.x + c.width && b.x + b.width > c.x && b.y < c.y + c.height && b.y + b.height > c.y) {
            bullet.destroy();
            block.destroy();
          }
        }
      }
    }

    // 削除
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].destroyed) {
        app.stage.removeChild(blocks[i].sprite);
        blocks.splice(i, 1);
      }
    }

    // 敵の移動
    const step = 1;
    let hitEdge = false;
  
    for (const enemy of enemies) {
      enemy.sprite.x += step * enemyDirection;
      if (
        enemy.sprite.x > app.screen.width - 60 || 
        enemy.sprite.x < 30
      ) {
        hitEdge = true;
      }
    }
  
    if (hitEdge) {
      enemyDirection *= -1;
      for (const enemy of enemies) {
        enemy.sprite.y += 20;
      }
    }

    // 敵の弾発射ロジック
    if (enemyShootCooldown <= 0 && enemies.length > 0) {
      const shooter = enemies[Math.floor(Math.random() * enemies.length)];
      const bullet = new EnemyBullet(shooter.sprite.x, shooter.sprite.y + 20);
      enemyBullets.push(bullet);
      app.stage.addChild(bullet.sprite);
      enemyShootCooldown = 60; // 約1秒おき
    } else {
      enemyShootCooldown--;
    }

    // 敵の弾更新 & 当たり判定
    for (const bullet of enemyBullets) {
      bullet.update();
      if (bullet.hit(player)) {
        bullet.destroy();
        console.log('Player hit!');
        // TODO: ライフやゲームオーバー処理
      }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      if (enemyBullets[i].destroyed) {
        app.stage.removeChild(enemyBullets[i].sprite);
        enemyBullets.splice(i, 1);
      }
    }


    // 移動
    if (keys['ArrowLeft'] || touchMove === -1) player.sprite.x -= 5;
    if (keys['ArrowRight'] || touchMove === 1) player.sprite.x += 5;

    // 弾発射（Spaceキー or タッチ）
    const shouldShoot = keys['Space'] || touchShoot;
    if (shouldShoot && bullets.length < 2) {
      const bullet = new Bullet(player.sprite.x, player.sprite.y - 20);
      bullets.push(bullet);
      app.stage.addChild(bullet.sprite);
      //touchShoot = false; // 一回発射
    }

    // 弾と敵の更新・判定
    for (const bullet of bullets) {
      bullet.update();
      for (const enemy of enemies) {
        if (bullet.hit(enemy)) {
          bullet.destroy();
          enemy.destroy();
        }
      }
    }

    // 消去処理
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].destroyed) {
        app.stage.removeChild(bullets[i].sprite);
        bullets.splice(i, 1);
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].destroyed) {
        app.stage.removeChild(enemies[i].sprite);
        enemies.splice(i, 1);
      }
    }
  });
}

main();