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
                    "hex.obj": "../asset/hex.obj",
                    "cube.obj": "../asset/cube.obj",
                    "enemyS1.obj": "../asset/enemyS1.obj",
                    "enemyS2.obj": "../asset/enemyS2.obj",
                    "enemyS3.obj": "../asset/enemyS3.obj",
                    "enemyS4.obj": "../asset/enemyS4.obj",
                    // "p64.obj": "../asset/p64.obj",
                  },
                  image: {
                    "bullets.png": "../asset/bullets.png",
                    "enemyS1.png": "../asset/enemyS1.png",
                    "enemyS2.png": "../asset/enemyS2.png",
                    "enemyS3.png": "../asset/enemyS3.png",
                    "enemyS4.png": "../asset/enemyS4.png",
                    // "p64.png": "../asset/p64.png",
                  },
                  vertexShader: {
                    "bulletSprites.vs": "../asset/bulletSprites.vs",
                    "effectSprites.vs": "../asset/effectSprites.vs",
                    "terrain.vs": "../asset/terrain.vs",
                    "terrainEdge.vs": "../asset/terrainEdge.vs",
                    "obj.vs": "../asset/obj.vs",
                    "objEdge.vs": "../asset/objEdge.vs",
                    "objGlow.vs": "../asset/objGlow.vs",
                    "effect_copy.vs": "../asset/effect_copy.vs",
                    "effect_blur.vs": "../asset/effect_blur.vs",
                  },
                  fragmentShader: {
                    "bulletSprites.fs": "../asset/bulletSprites.fs",
                    "effectSprites.fs": "../asset/effectSprites.fs",
                    "terrain.fs": "../asset/terrain.fs",
                    "terrainEdge.fs": "../asset/terrainEdge.fs",
                    "obj.fs": "../asset/obj.fs",
                    "objEdge.fs": "../asset/objEdge.fs",
                    "objGlow.fs": "../asset/objGlow.fs",
                    "effect_copy.fs": "../asset/effect_copy.fs",
                    "effect_blur.fs": "../asset/effect_blur.fs",
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
          enemyLayer: { className: "phina.display.DisplayElement" },
          glLayer: { className: "glb.GLLayer" },
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

      this.on("enterframe", function(e) {
        if (e.app.ticker.frame % 5 !== 0) return;

        var d = Math.randfloat(150, 30).toRadian();
        var dd = Math.randfloat(-0.2, 0.2);

        var enemy = glLayer.enemyDrawer.get("enemyS4");
        if (enemy) {
          var runner = pattern.createRunner(config);
          enemy
            .spawn({
              x: this.width * Math.random(),
              y: this.height * Math.random(),
              z: 0,
              rotX: 0,
              rotY: 0,
              rotZ: d,
              scaleX: OBJ_SCALE * 1.5,
              scaleY: OBJ_SCALE * 1.5,
              scaleZ: OBJ_SCALE * 1.5,
            })
            .clearEventListener("enterframe")
            .on("enterframe", function(e) {
              this.x += Math.cos(d) * 8;
              this.y += Math.sin(d) * 8;
              // this.rotateZ(dd);
              
              d += dd;

              if (SCREEN_HEIGHT + 100 < this.y) {
                this.remove();
              }

              // this.x = self.width / 2 + Math.sin(e.app.ticker.frame * 0.1) * self.width * 0.4;
              runner.x = this.x;
              runner.y = this.y;
              runner.update();
            })
            .addChildTo(glLayer);
        }
      });
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
