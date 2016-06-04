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
                    "fighter.obj": "./asset/obj/fighter.obj",
                    "hex.obj": "./asset/obj/hex.obj",
                    "enemyS1.obj": "./asset/obj/enemyS1.obj",
                    "enemyS2.obj": "./asset/obj/enemyS2.obj",
                    "enemyS3.obj": "./asset/obj/enemyS3.obj",
                    "enemyS4.obj": "./asset/obj/enemyS4.obj",
                  },
                  image: {
                    "fighter.png": "./asset/image/fighter.png",
                    "shot.png": "./asset/image/shot.png",
                    "bullets.png": "./asset/image/bullets.png",
                    "enemyS1.png": "./asset/image/enemyS1.png",
                    "enemyS2.png": "./asset/image/enemyS2.png",
                    "enemyS3.png": "./asset/image/enemyS3.png",
                    "enemyS4.png": "./asset/image/enemyS4.png",
                    "effect.png": "./asset/image/effect.png",
                  },
                  vertexShader: {
                    "bullets.vs": "./asset/shader/bullets.vs",
                    "sprites.vs": "./asset/shader/sprites.vs",
                    "terrain.vs": "./asset/shader/terrain.vs",
                    "terrainEdge.vs": "./asset/shader/terrainEdge.vs",
                    "obj.vs": "./asset/shader/obj.vs",
                    "objEdge.vs": "./asset/shader/objEdge.vs",
                    "objGlow.vs": "./asset/shader/objGlow.vs",
                    "effect_copy.vs": "./asset/shader/effect_copy.vs",
                    "effect_blur.vs": "./asset/shader/effect_blur.vs",
                    "effect_zoom.vs": "./asset/shader/effect_zoom.vs",
                  },
                  fragmentShader: {
                    "bullets.fs": "./asset/shader/bullets.fs",
                    "sprites.fs": "./asset/shader/sprites.fs",
                    "terrain.fs": "./asset/shader/terrain.fs",
                    "terrainEdge.fs": "./asset/shader/terrainEdge.fs",
                    "obj.fs": "./asset/shader/obj.fs",
                    "objEdge.fs": "./asset/shader/objEdge.fs",
                    "objGlow.fs": "./asset/shader/objGlow.fs",
                    "effect_copy.fs": "./asset/shader/effect_copy.fs",
                    "effect_blur.fs": "./asset/shader/effect_blur.fs",
                    "effect_zoom.fs": "./asset/shader/effect_zoom.fs",
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
          uiLayer: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            children: {
              scorePanel: { className: "glb.ScorePanel" },
            },
          },
        },
      });

      this.one("enter", function() {
        var loadScene = glb.LoadScene(this.glLayer.gl);
        loadScene.on("exit", function() {
          this.start();
        }.bind(this));
        this.app.pushScene(loadScene);
      });
    },

    start: function() {
      var glLayer = this.glLayer;

      glLayer.start();

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
        top0: _.action([
          _.repeat(Infinity, [
            _.fire(_.speed(10), _.bullet({ type: 3 })),
            _.wait(90),
            _.fire(_.speed(10), _.bullet({ type: 11 })),
            _.wait(90),
          ]),
        ]),
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

      glLayer.spriteDrawer.addObjType("effect", 500);
      glLayer.spriteDrawer.addObjType("shot", 100, "glb.Shot");

      glLayer.playerDrawer.addObjType("fighter", 1, "glb.Fighter");
      var player = glLayer.playerDrawer.get("fighter");
      player
        .spawn({
          x: SCREEN_WIDTH * 0.5,
          y: SCREEN_HEIGHT * 0.8,
          rotZ: (-90).toRadian(),
        })
        .addChildTo(glLayer)
        .on("enterframe", function(e) {
          if (e.app.ticker.frame % 2 === 0) {
            for (var i = 0; i < 2; i++) {
              var shot = glLayer.spriteDrawer.get("shot");
              if (shot) {
                shot
                  .spawn({
                    x: this.x + -15 + i * 30,
                    y: this.y - 20,
                    rotation: Math.PI * -0.5,
                    scale: 2,
                    frameX: 0,
                    frameY: 1,
                    alpha: 0.5,
                    dx: 0,
                    dy: -60,
                  })
                  .addChildTo(glLayer);
              }
            }
          }
        });

      var config = {
        target: player,
        createNewBullet: function(runner, option) {
          var b = glLayer.bulletDrawer.get();
          if (b) b.spawn(runner, option).addChildTo(glLayer);
        },
      };

      glLayer.enemyDrawer.addObjType("enemyS4", 1000);
      var launchEnemy = function(x, y) {
        var runner = pattern.createRunner(config);
        var t = Math.randfloat(-Math.PI, Math.PI);
        var e = glLayer.enemyDrawer.get("enemyS4")
        e.isEnemy = true;
        e
          .spawn({
            x: x,
            y: y,
            rotZ: t,
            scaleX: OBJ_SCALE * 1.5,
            scaleY: OBJ_SCALE * 1.5,
            scaleZ: OBJ_SCALE * 1.5,
          })
          .addChildTo(glLayer)
          .on("enterframe", function(e) {
            this.rotateZ(0.1);

            this.x = x + Math.cos(e.app.ticker.frame * 0.06 + t) * 150;
            this.y = y + Math.sin(e.app.ticker.frame * 0.06 + t) * 150;

            runner.x = this.x;
            runner.y = this.y;
            runner.update();
          });
      };

      for (var i = 0; i < 1000; i++) {
        launchEnemy(Math.randfloat(80, SCREEN_WIDTH - 80), Math.randfloat(80, SCREEN_HEIGHT * 0.5 - 80));
      }

      // this.recorder = phina.graphics.CanvasRecorder(this.app.canvas);
      // this.recorder.start(30, 3000);
      // this.recorder.onfinished = function() {
      //   this.open();
      // };
    },

    update: function(app) {
      return;
      var self = this;
      var glLayer = this.glLayer;
      var f = app.ticker.frame;

      if (!glLayer.ready) return;

      if (f % 60 === 0) {
        var x = Math.randfloat(0, this.width);
        var y = Math.randfloat(this.height * 0.5, this.height);

        glLayer.startZoom(x, y);

        (15).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(20, 100);
          var e = glLayer.spriteDrawer.get("effect");
          if (!e) return;
          e
            .spawn({
              x: x + Math.cos(a) * r * 0.1,
              y: y + Math.sin(a) * r * 0.1,
              rotation: 0,
              scale: 2,
              alpha: 2,
            })
            .addChildTo(self.glLayer)
            .tweener
            .clear()
            .to({
              x: x + Math.cos(a) * r,
              y: y + Math.sin(a) * r,
              scale: 4,
              alpha: 0,
            }, 15)
            .call(function() {
              e.remove();
            });
        });

        (10).times(function() {
          var a = Math.randfloat(0, Math.PI * 2);
          var r = Math.randfloat(150, 250);
          var e = glLayer.spriteDrawer.get("effect");
          if (!e) return;
          e
            .spawn({
              x: x + Math.cos(a) * r * 0.1,
              y: y + Math.sin(a) * r * 0.1,
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
