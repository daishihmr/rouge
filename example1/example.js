phina.namespace(function() {

  phina.main(function() {

    phina.accessory.Tweener.prototype.updateType = "fps";

    phina.display.CanvasApp({
        backgroundColor: "black",
        fps: 60,
      })
      .replaceScene(
        phina.game.ManagerScene({
          scenes: [{
            label: "load",
            className: "phina.game.LoadingScene",
            arguments: {
              assets: {
                obj: {
                  "hex.obj": "../asset/hex.obj",
                },
                image: {
                  "bullets.png": "../asset/bullets.png",
                },
                vertexShader: {
                  "bulletSprites.vs": "../asset/bulletSprites.vs",
                  "effectSprites.vs": "../asset/effectSprites.vs",
                  "terrain.vs": "../asset/terrain.vs",
                },
                fragmentShader: {
                  "bulletSprites.fs": "../asset/bulletSprites.fs",
                  "effectSprites.fs": "../asset/effectSprites.fs",
                  "terrain.fs": "../asset/terrain.fs",
                },
              },
            },
          }, {
            label: "main",
            className: "MainScene",
          }, ],
        })
      )
      .enableStats()
      .run();

  });

  phina.define("MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      this.superInit();
      this.fromJSON({
        children: {
          enemyLayer: { className: "phina.display.DisplayElement" },
          glLayer: { className: "glb.GLLayer" },
        },
      });

      var glLayer = this.glLayer;

      var config = {
        target: { x: 320, y: 960 },
        createNewBullet: function(runner, option) {
          var b = glLayer.getBullet();
          if (b) b.spawn(runner, option).addChildTo(glLayer);
        },
      };

      var _ = bulletml.dsl;
      var w = 80;
      var speed = function(s) {
        return _.action([
          _.changeSpeed(_.speed(10), 1),
          _.wait(1),
          _.changeSpeed(_.speed(0), 8),
          _.wait(20),
          _.changeSpeed(_.speed(s), 80),
        ]);
      };
      var pattern = new bulletml.Root({
        // top0: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(2, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(3),
        //     _.repeat(4, [
        //       _.fire(_.direction(90, "sequance"), _.bullet(speed(7), { type: 5 })),
        //     ]),
        //   ]),
        // ]),
        // top1: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(-4, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(3),
        //     _.repeat(4, [
        //       _.fire(_.direction(90, "sequance"), _.bullet(speed(7), { type: 13 })),
        //     ]),
        //   ]),
        // ]),
        // top2: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(5, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(2),
        //     _.repeat(4, [
        //       _.fire(_.direction(90, "sequance"), _.bullet(speed(10), { type: 21 })),
        //     ]),
        //   ]),
        // ]),
      });

      var runner = pattern.createRunner(config);
      phina.display.CircleShape()
        .setPosition(320, 300)
        .on("enterframe", function() {
          runner.x = this.x;
          runner.y = this.y;
          runner.update();
        })
        .addChildTo(this.enemyLayer);
    },

    update: function(app) {
      return;
      var self = this;
      var glLayer = this.glLayer;
      var f = app.ticker.frame;
      if (f % 40 === 0) {
        var x = Math.randfloat(0, 640);
        var y = Math.randfloat(0, 960);
        (30).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(10, 50);
          var e = glLayer.getEffect();
          if (!e) return;
          e
            .spawn({
              x: x,
              y: y,
              rotation: 0,
              scale: 1,
              alpha: 2,
            })
            .addChildTo(self.glLayer)
            .tweener
            .clear()
            .to({
              x: x + Math.cos(a) * r,
              y: y + Math.sin(a) * r,
              scale: 1.5,
              alpha: 0,
            }, 30)
            .call(function() {
              e.remove();
            });
        });

        (10).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(80, 150);
          var e = glLayer.getEffect();
          if (!e) return;
          e
            .spawn({
              x: x,
              y: y,
              rotation: 0,
              scale: Math.randfloat(0.2, 0.4),
              alpha: 5,
            })
            .addChildTo(self.glLayer)
            .tweener
            .clear()
            .to({
              x: x + Math.cos(a) * r,
              y: y + Math.sin(a) * r,
              alpha: 0,
            }, 40, "easeOutQuad")
            .call(function() {
              e.remove();
            });
        });

      }
    },
  });

});
