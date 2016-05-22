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
                image: {
                  "bullets.png": "../asset/bullets.png",
                },
                vertexShader: {
                  "bulletSprites.vs": "../asset/bulletSprites.vs",
                  "effectSprites.vs": "../asset/effectSprites.vs",
                },
                fragmentShader: {
                  "bulletSprites.fs": "../asset/bulletSprites.fs",
                  "effectSprites.fs": "../asset/effectSprites.fs",
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
          shotLayer: { className: "phina.display.DisplayElement" },
          playerLayer: { className: "phina.display.DisplayElement" },
          effectLayer: { className: "phina.display.DisplayElement" },
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
      var w = 10;
      var pattern = new bulletml.Root({
        top0: _.action([
          _.fire(_.direction(0), _.speed(7), _.bullet({ type: 2 })),
          _.repeat(Infinity, [
            _.wait(6),
            _.fire(_.direction(8, "sequence"), _.speed(7), _.bullet({ type: 2 })),
            _.repeat(w - 1, [
              _.fire(_.direction(360 / w, "sequence"), _.speed(7), _.bullet({ type: 2 })),
            ]),
          ]),
        ]),
        top1: _.action([
          _.fire(_.direction(0), _.speed(7), _.bullet({ type: 8 })),
          _.repeat(Infinity, [
            _.wait(6),
            _.fire(_.direction(12, "sequence"), _.speed(7), _.bullet({ type: 8 })),
            _.repeat(w - 1, [
              _.fire(_.direction(360 / w, "sequence"), _.speed(7), _.bullet({ type: 8 })),
            ]),
          ]),
        ]),
        top2: _.action([
          _.repeat(Infinity, [
            _.wait(100),
            _.fire(_.direction(-17, "sequence"), _.speed(3), _.bullet({ type: 32 })),
          ]),
        ]),
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
      var self = this;
      var glLayer = this.glLayer;
      var f = app.ticker.frame;
      if (f % 2 === 0) {
        var x = Math.randfloat(0, 640);
        var y = Math.randfloat(0, 960);
        (100).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(10, 80);
          var e = glLayer.getEffect();
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
                scale: 2,
                alpha: 0,
              }, 40)
              .call(function() {
                e.remove();
              });
        });

        (10).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(70, 100);
          var e = glLayer.getEffect();
          e
            .spawn({
              x: x,
              y: y,
              rotation: 0,
              scale: 1,
              alpha: 5,
            })
            .addChildTo(self.glLayer)
            .tweener
              .clear()
              .to({
                x: x + Math.cos(a) * r,
                y: y + Math.sin(a) * r,
                alpha: 0,
              }, 60, "easeOutQuad")
              .call(function() {
                e.remove();
              });
        });

      }
    },
  });

});
