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
          glLayer.enemyDrawer.addObjType(key, d.count || 100, d.className || "glb.Enemy");
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

      var barrier = glLayer.playerDrawer.get("barrier").addChildTo(glLayer);
      player.setBarrier(barrier);

      // TODO atdks
      for (var i = 0; i < 1000; i++) {
        var enemy = this.launchEnemy("enemyS1", 0, "basic0", Math.randfloat(0.1, 0.9) * SCREEN_WIDTH, Math.randfloat(0.1, 0.5) * SCREEN_HEIGHT);
        if (enemy) {
          enemy.on("enterframe", function() {
            this.rotateZ(0.1);
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
