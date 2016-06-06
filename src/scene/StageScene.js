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

      var glLayer = this.glLayer;
      var uiLayer = this.uiLayer;
      var collisions = this.collisions = glb.Collisions();
      var explosion = this.explosion = glb.Explosion(glLayer);
      var player = this.player = glLayer.playerDrawer.get("fighter");
      var stage = this.stage = glb.Stage();

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
        .spawn(glLayer)
        .on("fireShot", function(e) {
          collisions.addShot(e.shot);
          if (!e.shot.has("hitEnemy")) {
            e.shot.on("hitEnemy", function() {
              explosion.spark(this.x, this.y - 20);
            });
          }
        })
        .addChildTo(glLayer);
      collisions.setPlayer(player);

      var barrier = glLayer.playerDrawer.get("barrier");
      barrier
        .spawn({
          scaleX: 20,
          scaleY: 20,
          scaleZ: 20,
          rotZ: (-90).toRadian(),
        })
        .addChildTo(glLayer);
      player.setBarrier(barrier);

      // TODO atdks
      for (var i = 0; i < 10; i++) {
        this.launchEnemy("enemyS1", 0, "basic0", Math.randfloat(0.1, 0.9) * SCREEN_WIDTH, Math.randfloat(0.1, 0.9) * SCREEN_HEIGHT);
      }

      player.launch();

    },

    launchEnemy: function(name, patternId, runnerName, x, y) {
      var glLayer = this.glLayer;
      var enemy = glLayer.enemyDrawer.get(name);
      if (enemy) {
        enemy
          .spawn({
            x: x,
            y: y,
          })
          .setRunner(runnerName)
          .setPattern(patternId)
          .addChildTo(glLayer);

        this.collisions.addEnemy(enemy);
      }
    },

    update: function(app) {
      this.stage.update();

      if (app.keyboard.getKeyDown("p")) {
        app.canvas.saveAsImage();
      }
    },
  });

});
