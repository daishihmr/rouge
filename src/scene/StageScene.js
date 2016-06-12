phina.namespace(function() {

  phina.define("glb.StageScene", {
    superClass: "phina.display.DisplayScene",

    collisions: null,
    explosion: null,
    player: null,
    stage: null,

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.fromJSON({
        children: {
          glLayer: {
            className: "glb.GLLayer",
            arguments: { canvas: options.canvas, gl: options.gl },
          },
          uiLayer: {
            className: "glb.UILayer",
          },
        },
      });

      var self = this;
      var glLayer = this.glLayer;
      var uiLayer = this.uiLayer;
      var collisions = this.collisions = glb.Collisions();
      var explosion = this.explosion = glb.Explosion(glLayer);
      var player = this.player = glLayer.playerDrawer.get("fighter");
      var stage = this.stage = glb.Stage();

      stage.on("enemyTask", function(e) {
        self.launchEnemy(e.name, e.pattern, e.runner, e.x, e.y);
      });
      stage.on("spawnerTask", function(e) {
        glb.Spawner(e)
          .on("spawn", function(e) {
            self.launchEnemy(e.name, e.pattern, e.runner, e.x, e.y);
          })
          .addChildTo(self);
      });

      this.on("enterframe", function(e) {
        collisions.update(e.app);
      });

      glb.Danmaku.config.target = player;
      glb.Danmaku.config.createNewBullet = function(runner, options) {
        var bullet = glLayer.bulletDrawer.get();
        if (bullet) {
          bullet.spawn(runner, options).addChildTo(glLayer);
          collisions.addBullet(bullet);
        }
      };

      Object.keys(glb.Assets.get({ assetType: options.assetType }).obj)
        .map(function(key) {
          return key.replace(".obj", "");
        })
        .forEach(function(key) {
          var d = glb.Enemy.data[key] || {};
          glLayer.enemyDrawer.addObjType(key, key, d.count || 100, d.className || "glb.Enemy");
        });

      player
        .spawn()
        .addChildTo(glLayer)
        .on("fireShot", function(e) {
          var shot = glLayer.spriteDrawer.get("shot");
          if (shot) {
            shot.spawn(e).addChildTo(glLayer);
            collisions.addShot(shot);
            if (!shot.has("hitEnemy")) {
              shot
                .on("hitEnemy", function() {
                  explosion.spark(this.x, this.y - 10);
                });
            }
          }
        })
        .on("fireLaser", function(e) {
          var laser = glLayer.spriteDrawer.get("laser");
          if (laser) {
            laser.spawn(e).addChildTo(glLayer);
            collisions.addShot(laser);
            if (!laser.has("hitEnemy")) {
              laser
                .on("hitEnemy", function() {
                  explosion.small(this.x, this.y);
                });
            }
          }

          var mf = glLayer.spriteDrawer.get("effect");
          if (mf) {
            var s = Math.randfloat(6.0, 8.0);
            mf.spawn({
              x: e.x,
              y: e.y - 20,
              rotation: (-90).toRadian(),
              scaleX: s,
              scaleY: s,
              frameX: 5,
              frameY: 1,
              alpha: 0.8,
            }).addChildTo(glLayer);
            mf.tweener.clear().wait(20).call(function() {
              mf.remove();
            });
          }
        })
        .on("launched", function() {
          // TODO
        });
      collisions.setPlayer(player);

      [-2, -1, 1, 2].forEach(function(i) {
        var bit = glLayer.playerDrawer.get("bit")
          .spawn({
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            scaleX: 20,
            scaleY: 20,
            scaleZ: 20,
            rotZ: (-90 + i * 10).toRadian(),
          })
          .addChildTo(glLayer);
        player.bits.push(bit);
      });

      var bitJoin = glLayer.playerDrawer.get("bitJoin")
        .addChildTo(glLayer);
      player.setBitJoin(bitJoin);

      var barrier = glLayer.playerDrawer.get("barrier").addChildTo(glLayer);
      player.setBarrier(barrier);

      // TODO atdks
      for (var i = 0; i < 200; i++) {
        var e = this.launchEnemy("enemyS" + Math.randint(1, 5), 0, "basic0", Math.randfloat(0.1, 0.9) * SCREEN_WIDTH, Math.randfloat(0.1, 0.5) * SCREEN_HEIGHT);
        if (e) {
          quat.setAxisAngle(e.quaternion, [0, 0, 1], (90).toRadian());
          e.dirty = true;
          e.on("enterframe", function() {
            this.y += 1;
          });
        }
      }

      player.launch();
    },

    launchEnemy: function(name, patternId, runnerName, x, y) {
      var glLayer = this.glLayer;
      var enemy = glLayer.enemyDrawer.get(name);
      if (enemy) {
        enemy
          .spawn({
            visible: true,
            x: x,
            y: y,
          })
          .setRunner(runnerName)
          .setPattern(patternId)
          .addChildTo(glLayer);

        this.collisions.addEnemy(enemy);
        return enemy;
      }
    },

    update: function(app) {
      this.stage.update();

      if (app.keyboard.getKeyDown("p")) {
        app.canvas.saveAsImage();
      }

      if (app.keyboard.getKeyDown("l")) {

        this.player.launch();
      }
    },
  });

});
