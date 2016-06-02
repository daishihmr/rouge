var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1080;
var OBJ_SCALE = 20.0;

phina.namespace(function() {

  phina.main(function() {

    phina.accessory.Tweener.prototype.updateType = "fps";

    phina.display.CanvasApp({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        fps: 30,
      })
      .replaceScene(
        phina.game.ManagerScene({
          scenes: [

            {
              label: "download",
              className: "glb.DownloadScene",
              arguments: {
                assets: {
                  obj: {
                    "hex.obj": "../asset/obj/hex.obj",
                    "enemyS1.obj": "../asset/obj/enemyS1.obj",
                    "enemyS2.obj": "../asset/obj/enemyS2.obj",
                    "enemyS3.obj": "../asset/obj/enemyS3.obj",
                    "enemyS4.obj": "../asset/obj/enemyS4.obj",
                  },
                  image: {
                    "bullets.png": "../asset/image/bullets.png",
                    "enemyS1.png": "../asset/image/enemyS1.png",
                    "enemyS2.png": "../asset/image/enemyS2.png",
                    "enemyS3.png": "../asset/image/enemyS3.png",
                    "enemyS4.png": "../asset/image/enemyS4.png",
                  },
                  vertexShader: {
                    "bulletSprites.vs": "../asset/shader/bulletSprites.vs",
                    "effectSprites.vs": "../asset/shader/effectSprites.vs",
                    "terrain.vs": "../asset/shader/terrain.vs",
                    "terrainEdge.vs": "../asset/shader/terrainEdge.vs",
                    "obj.vs": "../asset/shader/obj.vs",
                    "objEdge.vs": "../asset/shader/objEdge.vs",
                    "objGlow.vs": "../asset/shader/objGlow.vs",
                    "effect_copy.vs": "../asset/shader/effect_copy.vs",
                    "effect_blur.vs": "../asset/shader/effect_blur.vs",
                    "effect_zoom.vs": "../asset/shader/effect_zoom.vs",
                  },
                  fragmentShader: {
                    "bulletSprites.fs": "../asset/shader/bulletSprites.fs",
                    "effectSprites.fs": "../asset/shader/effectSprites.fs",
                    "terrain.fs": "../asset/shader/terrain.fs",
                    "terrainEdge.fs": "../asset/shader/terrainEdge.fs",
                    "obj.fs": "../asset/shader/obj.fs",
                    "objEdge.fs": "../asset/shader/objEdge.fs",
                    "objGlow.fs": "../asset/shader/objGlow.fs",
                    "effect_copy.fs": "../asset/shader/effect_copy.fs",
                    "effect_blur.fs": "../asset/shader/effect_blur.fs",
                    "effect_zoom.fs": "../asset/shader/effect_zoom.fs",
                  },
                },
              },
            },

            {
              label: "main",
              className: "MainScene",
            },

          ],
        })
      )
      .enableStats()
      .run();

  });

  phina.define("MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      var self = this;
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.fromJSON({
        children: {
          glLayer: { className: "glb.GLLayer" },
          uiLayer: { className: "phina.display.DisplayElement" },
        },
      });

      this.one("enter", function() {
        var loadScene = glb.LoadScene(this.glLayer.gl);
        loadScene.on("exit", function() {
          this.start();
        }.bind(this));
        this.app.pushScene(loadScene);
      })
    },

    start: function() {
      var glLayer = this.glLayer;

      glLayer.start();

      var config = {
        target: { x: this.width / 2, y: this.height * 0.9 },
        createNewBullet: function(runner, option) {
          var b = glLayer.bulletSprites.get();
          if (b) b.spawn(runner, option).addChildTo(glLayer);
        },
      };

      var _ = bulletml.dsl;
      var w = 4;
      var speed = function(s) {
        return _.action([
          _.changeSpeed(_.speed(20), 1),
          _.wait(1),
          _.changeSpeed(_.speed(0), 1),
          _.wait(15),
          _.changeSpeed(_.speed(s), 25),
        ]);
      };
      var pattern = new bulletml.Root({
        // top0: _.action([
        //   _.repeat(Infinity, [
        //     _.repeat(5, [
        //       _.fire(_.bullet(_.direction(10, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //       _.wait(2),
        //       _.repeat(w, [
        //         _.fire(_.direction(360 / w, "sequance"), _.bullet(speed(20), { type: 1 })),
        //       ]),
        //     ]),
        //     _.wait(90),
        //   ]),
        // ]),
        // top1: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(-4, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(2),
        //     _.repeat(w, [
        //       _.fire(_.direction(360 / w, "sequance"), _.bullet(speed(10), { type: 9 })),
        //     ]),
        //   ]),
        // ]),
        // top2: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(5, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(6),
        //     _.repeat(w, [
        //       _.fire(_.direction(360 / w, "sequance"), _.bullet(speed(7), { type: 33 })),
        //     ]),
        //   ]),
        // ]),
        // top3: _.action([
        //   _.repeat(Infinity, [
        //     _.fire(_.bullet(_.direction(-5, "sequance"), _.action([_.wait(1), _.vanish()]))),
        //     _.wait(6),
        //     _.repeat(w, [
        //       _.fire(_.direction(360 / w, "sequance"), _.bullet(speed(7), { type: 41 })),
        //     ]),
        //   ]),
        // ]),
      });

      glLayer.enemyDrawer.addObjType("enemyS4", 200);
      var launchEnemy = function(x, y) {
        glLayer.enemyDrawer.get("enemyS4")
          .spawn({
            x: x,
            y: y,
            z: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            scaleX: OBJ_SCALE * 1.5,
            scaleY: OBJ_SCALE * 1.5,
            scaleZ: OBJ_SCALE * 1.5,
          })
          .addChildTo(glLayer)
          .on("enterframe", function() { this.rotateZ(0.1) });
      };

      launchEnemy(200, 200);
      launchEnemy(SCREEN_WIDTH - 200, 200);
      launchEnemy(SCREEN_WIDTH - 200, SCREEN_HEIGHT - 200);
      launchEnemy(200, SCREEN_HEIGHT - 200);
      launchEnemy(400, 400);
      launchEnemy(SCREEN_WIDTH - 400, 400);
      launchEnemy(SCREEN_WIDTH - 400, SCREEN_HEIGHT - 400);
      launchEnemy(400, SCREEN_HEIGHT - 400);
    },

    update: function(app) {
      var self = this;
      var glLayer = this.glLayer;
      var f = app.ticker.frame;
      if (f % 2 === 0) {
        var x = Math.randfloat(0, this.width);
        var y = Math.randfloat(0, this.height);
        (15).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(10, 50);
          var e = glLayer.effectSprites.get();
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
            }, 15)
            .call(function() {
              e.remove();
            });
        });

        (5).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(80, 150);
          var e = glLayer.effectSprites.get();
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
            }, 20, "easeOutQuad")
            .call(function() {
              e.remove();
            });
        });

      }
    },
  });

});
