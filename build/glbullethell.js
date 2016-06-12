var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1080;
var OBJ_SCALE = 30.0;

phina.namespace(function() {

  phina.input.Keyboard.KEY_CODE["SHOT"] = phina.input.Keyboard.KEY_CODE["z"];
  phina.input.Keyboard.KEY_CODE["BOMB"] = phina.input.Keyboard.KEY_CODE["x"];
  phina.input.Keyboard.KEY_CODE["LASER"] = phina.input.Keyboard.KEY_CODE["c"];
  phina.input.Gamepad.BUTTON_CODE["SHOT"] = phina.input.Gamepad.BUTTON_CODE["R2"];
  phina.input.Gamepad.BUTTON_CODE["BOMB"] = phina.input.Gamepad.BUTTON_CODE["a"];
  phina.input.Gamepad.BUTTON_CODE["LASER"] = phina.input.Gamepad.BUTTON_CODE["x"];

  var canvas = document.createElement("canvas");
  var gl = null;
  try {
    gl = canvas.getContext("webgl");
  } catch (e) {
    gl = null;
    glb.ErrorScene.message = "WebGL not supported";
  }

  phina.main(function() {
    phina.display.Label.defaults.fontFamily = "Aldrich";

    phina.asset.AssetLoader()
      .on("load", function() { start() })
      .load({ font: { "Aldrich": "./asset/font/Aldrich/Aldrich-Regular.ttf" } });
  });

  var start = function() {
    var app = phina.display.CanvasApp({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        fps: 30,
      })
      .replaceScene(gl ? glb.SceneFlow({ canvas: canvas, gl: gl }) : glb.ErrorScene())
      .enableStats()
      .run();

    app.gamepadManager = phina.input.GamepadManager();
    app.update = function() {
      this.gamepadManager.update();
    };
  };

});

phina.namespace(function() {

  phina.define("strike.NumberSpriteArray", {
    superClass: "phina.display.DisplayElement",

    sprites: null,
    commas: null,
    digit: 0,

    _value: 0,

    init: function(options) {
      options = {}.$extend({
        digit: 8,
      }, options);

      this.digit = options.digit;

      this.sprites = Array.range(0, options.digit).map(function() {
        return strike.NumberSprite(options)
          .setOrigin(0, 0);
      });

      this.superInit({
        width: this.sprites[0].width * options.digit,
        height: options.fontSize,
      });

      var self = this;
      this.sprites.forEach(function(s, i, all) {
        s.x += (all.length - i - 1) * s.width;
        s.addChildTo(self);
      });

      this.commas = [];
      for (var i = 1; i < this.digit / 3; i++) {
        var c = phina.display.Label({
            text: ",",
          }.$extend(options))
          .setPosition((this.digit - i * 3) * this.sprites[0].width, this.sprites[0].height * 0.5)
          .addChildTo(this);
        this.commas.push(c);
      }
    },

    setValue: function(num) {
      this._value = num;
      var n = Math.floor(num);

      var s = ("" + n).length / 3 - 1;
      this.commas.forEach(function(c, i) {
        c.visible = i < s;
      });

      for (var i = 0; i < this.digit; i++) {
        if (n === 0) {
          this.sprites[i].visible = false;
        } else {
          this.sprites[i].visible = true;
          this.sprites[i].frameIndex = n % 10;
        }
        n = Math.floor(n / 10);
      }
    },

    _accessor: {
      value: {
        get: function() {
          return this._value;
        },
        set: function(v) {
          this.setValue(v);
        }
      }
    }
  });

  phina.define("strike.NumberSprite", {
    superClass: "phina.display.Sprite",

    init: function(options) {
      options = {}.$extend({
        fontSize: 20,
        fontFamily: "sans-serif",
        fill: "white",
        stroke: null,
        fontWeight: "",
      }, options);

      var canvas = phina.graphics.Canvas();
      var context = canvas.context;

      this.unitWidth = Array.range(0, 10)
        .map(function(i) {
          context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
          return context.measureText("" + i).width;
        })
        .sort(function(lhs, rhs) {
          return lhs - rhs;
        })
        .map(function(w) {
          return w;
        })
        .last + 1 | 0;

      this.unitWidth *= 1.15;

      var w = this.unitWidth * 10;
      var h = options.fontSize;
      canvas.setSize(Math.pow(2, Math.log2(w) + 1 | 0), Math.pow(2, Math.log2(h) + 1 | 0));

      context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
      context.fillStyle = options.fill;
      context.strokeStyle = options.stroke;
      context.textAlign = "center"
      context.textBaseline = "middle";
      for (var i = 0; i < 10; i++) {
        if (options.fill) context.fillText("" + i, this.unitWidth * (0.5 + i), h / 2);
        if (options.stroke) context.strokeText("" + i, w * (0.5 + i), h / 2);
      }

      this.superInit(canvas, this.unitWidth, h);
      this.setFrameIndex(0);
    },
  });

});

phina.namespace(function() {

  phina.define("glb.ScorePanel", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit();
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          
        },
      });
    },
  });

});

phina.namespace(function() {

  phina.define("glb.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          scorePanel: { className: "glb.ScorePanel" },
        },
      });
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Bullet", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,
    runner: null,

    x: 0,
    y: 0,
    age: 0,

    power: 0,

    _active: false,
    
    radius: 20,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;

      this.index = id * instanceStride;
    },

    spawn: function(runner, option) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.runner = runner;
      this.x = runner.x;
      this.y = runner.y;
      this.age = 0;
      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 2] = runner.direction; // rotation
      instanceData[index + 3] = 1.8; // scale
      instanceData[index + 4] = option.type % 8; // frame.x
      instanceData[index + 5] = ~~(option.type / 8); // frame.y
      instanceData[index + 6] = 1; // visible
      instanceData[index + 7] = 1; // brightness
      instanceData[index + 8] = 0.2 + ~~(option.type / 8) % 2; // auraColor.r
      instanceData[index + 9] = 0.2 + 0; // auraColor.g
      instanceData[index + 10] = 0.2 + ~~(option.type / 8) % 2 + 1; // auraColor.b

      var self = this;
      runner.onVanish = function() {
        self.remove();
      };

      return this;
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    onremoved: function() {
      this.instanceData[this.index + 6] = 0;
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;
      var runner = this.runner;

      runner.update();
      this.x = runner.x;
      this.y = runner.y;

      if (this.x < -100 || SCREEN_WIDTH + 100 < this.x || this.y < -100 || SCREEN_HEIGHT + 100 < this.y) {
        this.remove();
        return;
      }

      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 7] = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      this.age += 1;
    },

    hitPlayer: function(player) {
      // TODO
      this.remove();
    },
  });

});

phina.namespace(function() {
  phina.define("glb.BulletDrawer", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,

    pool: null,
    _count: 2000,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phina.asset.AssetManager.get("shader", "bullets"))
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -16, +16,
            //
            +16, +16,
            //
            -16, -16,
            //
            +16, -16,
          ]
        }, {
          unitSize: 2,
          data: [
            //
            0, 32 / 256,
            //
            32 / 256, 32 / 256,
            //
            0, 0,
            //
            32 / 256, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceVisible",
          "instanceBrightness",
          "instanceAuraColor"
        )
        .setUniforms(
          "vpMatrix",
          "texture",
          "globalScale"
        );

      var instanceUnit = this.instanceStride / 4;

      this.uniforms.texture.setValue(0).setTexture(phina.asset.AssetManager.get("texture", "bullets.png"));
      this.uniforms.globalScale.setValue(1.0);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // position
          0, 0,
          // rotation
          0,
          // scale
          1,
          // frame
          0, 0,
          // visible
          0,
          // brightness
          0,
          // auraColor
          0, 0, 0
        );
      }
      this.setInstanceAttributeData(instanceData);

      var self = this;
      this.pool = Array.range(0, this._count)
        .map(function(id) {
          return glb.Bullet(id, instanceData, instanceUnit)
            .on("removed", function() {
              self.pool.add(this);
            });
        })
        .toPool(function(lhs, rhs) {
          return lhs.id - rhs.id;
        });
    },

    get: function() {
      return this.pool.get();
    },

    update: function(app) {
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function(uniforms) {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);

      this.uniforms.globalScale.value = 1.0;
      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.uniforms[key]) this.uniforms[key].value = value;
        }.bind(this));
      }

      this.draw(this._count);
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Camera", {

    position: null,
    vMatrix: null,
    pMatrix: null,
    vpMatrix: null,

    init: function() {
      this.position = vec3.create();
      this.vMatrix = mat4.create();
      this.pMatrix = mat4.create();
      this.vpMatrix = mat4.create();
    },

    setPosition: function(x, y, z) {
      vec3.set(this.position, x, y, z);
      return this;
    },

    lookAt: function(x, y, z) {
      mat4.lookAt(this.vMatrix, this.position, [x, y, z], [0, 1, 0]);
      return this;
    },

    ortho: function(left, right, bottom, top, near, far) {
      mat4.ortho(this.pMatrix, left, right, bottom, top, near, far);
      return this;
    },

    perspective: function(fovy, aspect, near, far) {
      mat4.perspective(this.pMatrix, fovy, aspect, near, far);
      return this;
    },

    calcVpMatrix: function() {
      mat4.mul(this.vpMatrix, this.pMatrix, this.vMatrix);
      return this;
    },

    uniformValues: function() {
      return {
        vpMatrix: this.vpMatrix,
        cameraPosition: this.position,
      };
    }

  });
});

phina.namespace(function() {

  phina.define("glb.Collisions", {
    superClass: "phina.util.EventDispatcher",

    player: null,
    bullets: null,
    enemies: null,
    shots: null,

    init: function() {
      this.superInit();

      this.player = null;
      this.bullets = [];
      this.enemies = [];
      this.shots = [];
    },

    setPlayer: function(v) {
      this.player = v;
      v.on("inactivated", function() {
        this.player = null;
      }.bind(this));
      v.on("removed", function() {
        this.player = null;
      }.bind(this));
    },

    addBullet: function(v) {
      this.bullets.push(v);
      v.on("inactivated", function() {
        this.bullets.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.bullets.erase(v);
      }.bind(this));
    },

    addEnemy: function(v) {
      this.enemies.push(v);
      v.on("inactivated", function() {
        this.enemies.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.enemies.erase(v);
      }.bind(this));
    },

    addShot: function(v) {
      this.shots.push(v);
      v.on("inactivated", function() {
        this.shots.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.shots.erase(v);
      }.bind(this));
    },

    update: function(app) {
      this._hitTestShotEnemy();
      this._hitTestPlayerBullet();
      this._hitTestPlayerEnemy();
    },

    _hitTestShotEnemy: function() {
      var ss = this.shots.clone();
      var es = this.enemies.clone();
      var s;
      var e;
      for (var j = 0, jl = es.length; j < jl; j++) {
        e = es[j];

        if (e.muteki || !e.visible || e.mutekiTime > 0 || e.hp <= 0) continue;

        for (var i = 0, il = ss.length; i < il; i++) {
          s = ss[i];

          if ((e.x - s.x) * (e.x - s.x) + (e.y - s.y) * (e.y - s.y) < e.radius * e.radius) {
            e.hitShot(s);
            s.hitEnemy(e);
          }
        }
      }
    },

    _hitTestPlayerBullet: function() {
      var p = this.player;
      var bs = this.bullets.clone();

      if (p.muteki || !p.visible || p.mutekiTime > 0 || p.hp <= 0) return;

      var b;
      for (var i = 0, il = bs.length; i < il; i++) {
        b = bs[i];
        if ((p.x - b.x) * (p.x - b.x) + (p.y - b.y) * (p.y - b.y) < b.radius * b.radius) {
          p.hitBullet(b);
          b.hitPlayer(p);
        }
      }
    },

    _hitTestPlayerEnemy: function() {
      var p = this.player;
      var es = this.enemies.clone();

      if (p.muteki || !p.visible || p.mutekiTime > 0 || p.hp > 0) return;

      var e;
      for (var i = 0, il = es.length; i < il; i++) {
        e = es[i];
        if ((p.x - e.x) * (p.x - e.x) + (p.y - e.y) * (p.y - e.y) < e.radius * e.radius) {
          p.hitEnemy(e);
          e.hitPlayer(p);
        }
      }
    },

  });

});

phina.namespace(function() {

  phina.define("glb.EnemySpawner", {
    superClass: "phina.app.Element",

    init: function(options) {
      this.superInit();

      this.name = options.name;
      this.pattern = options.pattern;
      this.runner = options.runner;
      this.x = options.x;
      this.y = options.y;

      // TODO
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Explosion", {

    glLayer: null,

    init: function(glLayer) {
      this.glLayer = glLayer;
    },
    
    spark: function(x, y) {
      var glLayer = this.glLayer;
      
      (1).times(function() {
        var e = glLayer.spriteDrawer.get("effect");

        if (!e) return;
        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(75, 125);
        var s = Math.randfloat(0.1, 0.2);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scaleX: s,
            scaleY: s,
            alpha: 5,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            alpha: 0,
          }, 666, "easeOutQuart")
          .call(function() {
            e.remove();
          });
      });
    },

    small: function(x, y) {
      var glLayer = this.glLayer;

      (7).times(function() {
        var e = glLayer.spriteDrawer.get("effect");
        if (!e) return;

        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(30, 45);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.2,
            y: y + Math.sin(a) * r * 0.2,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            frameX: 0,
            frameY: 0,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
          }, 333, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });

      (2).times(function() {
        var e = glLayer.spriteDrawer.get("effect");

        if (!e) return;
        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(75, 125);
        var s = Math.randfloat(0.2, 0.4);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scaleX: s,
            scaleY: s,
            alpha: 5,
            frameX: 0,
            frameY: 0,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            alpha: 0,
          }, 666, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });
    },
  });

});

phina.namespace(function() {
  phina.define("glb.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,
    ready: false,

    domElement: null,
    gl: null,

    orthoCamera: null,
    perseCamera: null,

    terrain: null,
    itemDrawer: null,
    spriteDrawer: null,
    bulletDrawer: null,
    playerDrawer: null,
    enemyDrawer: null,

    framebufferMain: null,
    framebufferZoom: null,

    ppZoom: null,
    ppCopy: null,

    zoomCenterX: 0,
    zoomCenterY: 0,
    zoomStrength: 0,
    zoomAlpha: 0,

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.originX = 0;
      this.originY = 0;

      this.domElement = options.canvas;
      this.domElement.width = this.width * glb.GLLayer.quality;
      this.domElement.height = this.height * glb.GLLayer.quality;

      var gl = this.gl = options.gl;
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(gl);

      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.disable(gl.CULL_FACE);

      var cw = this.domElement.width;
      var ch = this.domElement.height;
      var w = this.width;
      var h = this.height;
      var sw = Math.pow(2, ~~Math.log2(cw) + 1);
      var sh = Math.pow(2, ~~Math.log2(ch) + 1);
      var q = glb.GLLayer.quality;

      this.orthoCamera = glb.Camera()
        .setPosition(w * 0.5, h * 0.5, w * 1.5)
        .lookAt(w * 0.5, h * 0.5, 0)
        .ortho(-w * 0.5, w * 0.5, h * 0.5, -h * 0.5, 0.1, 3000)
        .calcVpMatrix();

      this.perseCamera = glb.Camera()
        .setPosition(6, 20, 20)
        .lookAt(0, 0, 0)
        .perspective(45, w / h, 0.1, 10000)
        .calcVpMatrix();

      this.terrain = glb.TerrainDrawer(gl, extInstancedArrays, w, h);
      this.itemDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.spriteDrawer = glb.SpritDrawer(gl, extInstancedArrays, w, h);
      this.enemyDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.playerDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.bulletDrawer = glb.BulletDrawer(gl, extInstancedArrays, w, h);

      this.framebufferGlow = phigl.Framebuffer(gl, sw, sh);
      this.framebufferZanzo1 = phigl.Framebuffer(gl, sw, sh);
      this.framebufferZanzo2 = phigl.Framebuffer(gl, sw, sh);
      this.framebufferMain = phigl.Framebuffer(gl, sw, sh);
      this.framebufferZoom = phigl.Framebuffer(gl, sw, sh);

      this.ppZoom = glb.PostProcessing(gl, cw, ch, "postproccess_zoom", ["canvasSize", "center", "strength"]);
      this.ppCopy = glb.PostProcessing(gl, cw, ch, "postproccess_copy", ["alpha"]);
      this.ppBlur = glb.PostProcessing(gl, cw, ch, "postproccess_blur");

      this.setupTerrain();
      this.generateObjects();
      this.ready = true;
    },

    setupTerrain: function() {
      var self = this;
      var countX = glb.TerrainDrawer.countX;
      var countZ = glb.TerrainDrawer.countZ;
      var unit = glb.TerrainDrawer.unit;
      Array.range(-countX, countX).forEach(function(x) {
        Array.range(-countZ, countZ).forEach(function(z) {
          var hex = self.terrain.get();
          if (hex) {
            hex
              .spawn({
                visible: true,
                x: x * unit + z % 2,
                y: 0,
                z: z * unit * 1 / Math.sqrt(3) * 1.5,
                rotX: (-90).toRadian(),
                rotY: (90).toRadian(),
                rotZ: 0,
                scaleX: 1.2,
                scaleY: 1.2,
                scaleZ: 1.2,
              })
              .addChildTo(self);
            if (Math.random() < 0.03) {
              hex.on("enterframe", function(e) {
                this.y = (1.0 + Math.sin(e.app.ticker.frame * 0.01)) * 2.5;
              });
            }
          }
        });
      });
    },

    generateObjects: function() {
      this.playerDrawer.addObjType("fighter", "fighter", 1, "glb.Player");
      this.playerDrawer.addObjType("bit", "bit", 4);
      this.playerDrawer.addObjType("bitJoin", "bitJoin", 1);
      this.playerDrawer.addObjType("barrier", "barrier", 1);
      this.spriteDrawer.addObjType("shot", "effect", 160, "glb.Shot");
      this.spriteDrawer.addObjType("laser", "effect", 20, "glb.Laser");
      this.spriteDrawer.addObjType("effect", "effect", 3000);
    },

    update: function(app) {
      if (!this.ready) return;

      this.terrain.update(app);
      this.itemDrawer.update(app);
      this.spriteDrawer.update(app);
      this.enemyDrawer.update(app);
      this.playerDrawer.update(app);
      this.bulletDrawer.update(app);
    },

    draw: function(canvas) {
      if (!this.ready) return;

      var gl = this.gl;
      var image = this.domElement;
      var cw = image.width;
      var ch = image.height;

      var ou = this.orthoCamera.uniformValues();
      var pu = this.perseCamera.uniformValues();

      this.framebufferGlow.bind();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.enemyDrawer.renderGlow(ou);
      this.playerDrawer.renderGlow(ou);

      this.framebufferZanzo1.bind();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.ppCopy.render(this.framebufferZanzo2.texture, { alpha: 0.85 }, true);
      this.ppBlur.render(this.framebufferGlow.texture, null, true);

      this.framebufferMain.bind();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render({
        diffuseColor: [0.2, 0.2, 0.2 * 1.6, 0.7],
      }.$extend(pu));
      this.itemDrawer.render(ou);
      this.enemyDrawer.render({
        diffuseColor: [1.0, 1.0, 1.0, 1.0],
      }.$extend(ou));
      this.spriteDrawer.render(ou);
      this.playerDrawer.render(ou);
      this.ppCopy.render(this.framebufferZanzo1.texture, null, true);
      this.bulletDrawer.render(ou);

      if (this.zoomStrength > 0 && this.zoomAlpha > 0) {
        this.framebufferZoom.bind();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.ppZoom.render(this.framebufferMain.texture, {
          center: this.ppZoom.viewCoordToShaderCoord(this.zoomCenterX, this.zoomCenterY),
          strength: this.zoomStrength,
        });
      }

      phigl.Framebuffer.unbind(gl);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.ppCopy.render(this.framebufferMain.texture, {
        alpha: 1.0 - this.zoomAlpha,
      });
      if (this.zoomStrength > 0 && this.zoomAlpha > 0) {
        this.ppCopy.render(this.framebufferZoom.texture, {
          alpha: this.zoomAlpha,
        }, true);
      }

      gl.flush();

      canvas.context.drawImage(image, 0, 0, cw, ch, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      var temp = this.framebufferZanzo1;
      this.framebufferZanzo1 = this.framebufferZanzo2;
      this.framebufferZanzo2 = temp;
    },

    startZoom: function(x, y) {
      this.zoomCenterX = x;
      this.zoomCenterY = y;
      this.tweener.clear()
        .set({
          zoomStrength: 0,
          zoomAlpha: 1.0,
        })
        .to({
          zoomStrength: 10,
          zoomAlpha: 0,
        }, 666, "easeOutQuad");
    },

    _static: {
      // quality: 0.5,
      quality: 1.0,
    },
  });

});

phina.namespace(function() {

  phina.define("glb.GlowEffect", {

    gl: null,
    current: null,
    before: null,
    drawer: null,

    width: 0,
    height: 0,

    init: function(gl, w, h) {
      this.gl = gl;
      
      var sw = Math.pow(2, ~~Math.log2(w) + 1);
      var sh = Math.pow(2, ~~Math.log2(h) + 1);

      this.current = phigl.Framebuffer(gl, sw, sh);
      this.before = phigl.Framebuffer(gl, sw, sh);

      this.drawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(phina.asset.AssetManager.get("shader", "effect_blur"))
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, h / sh,
          //
          +1, +1, w / sw, h / sh,
          //
          -1, -1, 0, 0,
          // 
          +1, -1, w / sw, 0,
        ])
        .setUniforms("texture", "canvasSize");

      this.copyDrawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(phina.asset.AssetManager.get("shader", "effect_copy"))
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, h / sh,
          //
          +1, +1, w / sw, h / sh,
          //
          -1, -1, 0, 0,
          // 
          +1, -1, w / sw, 0,
        ])
        .setUniforms("texture", "alpha");

      this.width = w;
      this.height = h;
    },

    bindCurrent: function() {
      this.current.bind();
    },

    renderCurrent: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      this.drawer.uniforms.texture.setValue(0).setTexture(this.current.texture);
      this.drawer.uniforms.canvasSize.value = [this.current.width, this.current.height];
      this.drawer.draw();

      return this;
    },

    renderBefore: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.copyDrawer.uniforms.texture.setValue(0).setTexture(this.before.texture);
      this.copyDrawer.uniforms.alpha.value = 0.99;
      this.copyDrawer.draw();

      return this;
    },

    switchFramebuffer: function() {
      var temp = this.current;
      this.current = this.before;
      this.before = temp;
    },

  });

});

phina.namespace(function() {
  
  phina.define("glb.Laser", {
    superClass: "glb.Shot",
    
    player: null,
    iScaleX: 1,
    iScaleY: 1,
    fScaleX: 1,
    fScaleY: 1,
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.dx = options.dx;
      this.dy = options.dy;
      this.player = options.player;
      
      glb.Sprite.prototype.spawn.call(this, options);

      this.iScaleX = this.scaleX * 2;
      this.iScaleY = this.scaleY * 2;
      this.fScaleX = this.scaleX * 1;
      this.fScaleY = this.scaleY * 1;

      return this;
    },

    update: function(app) {
      this.x = this.player.x;
      this.y += this.dy;
      var t = Math.clamp(this.age / 4, 0.0, 1.0);
      // this.scaleX = this.iScaleX + (this.fScaleX - this.iScaleX) * t;
      this.scaleY = this.iScaleY + (this.fScaleY - this.iScaleY) * t;
      glb.Sprite.prototype.update.call(this, app);
    },

  });

});

phina.namespace(function() {

  phina.define("glb.Obj", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    visible: false,
    position: null,
    quaternion: null,
    scale: null,
    matrix: null,
    alpha: 1,

    dirty: true,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;

      this.position = vec3.create();
      this.quaternion = quat.create();
      this.scale = vec3.create();
      this.matrix = mat4.create();
    },

    spawn: function(options) {
      options = {}.$extend({
        visible: false,
        x: 0,
        y: 0,
        z: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        scaleX: OBJ_SCALE,
        scaleY: OBJ_SCALE,
        scaleZ: OBJ_SCALE,
        alpha: 1,
      }, options);

      var index = this.index;
      var instanceData = this.instanceData;
      this.age = 0;

      this.visible = options.visible;
      this.x = options.x;
      this.y = options.y;
      this.z = options.z;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.scaleZ = options.scaleZ;
      this.alpha = options.alpha;

      quat.identity(this.quaternion);
      quat.rotateZ(this.quaternion, this.quaternion, options.rotZ);
      quat.rotateY(this.quaternion, this.quaternion, options.rotY);
      quat.rotateX(this.quaternion, this.quaternion, options.rotX);

      this.dirty = true;

      instanceData[index + 0] = this.visible ? 1 : 0;

      if (this.dirty) {
        mat4.fromRotationTranslationScale(this.matrix, this.quaternion, this.position, this.scale);

        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        instanceData[index + 13] = this.alpha;
        this.dirty = false;
      }

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      instanceData[index + 0] = this.visible ? 1 : 0;

      if (this.dirty) {
        mat4.fromRotationTranslationScale(this.matrix, this.quaternion, this.position, this.scale);

        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        instanceData[index + 13] = this.alpha;
        this.dirty = false;
      }

      this.age += 1;
    },

    onremoved: function() {
      this.instanceData[this.index + 0] = 0;
    },

    rotateX: function(rad) {
      quat.rotateX(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },
    rotateY: function(rad) {
      quat.rotateY(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },
    rotateZ: function(rad) {
      quat.rotateZ(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },

    lookAt: function(target) {
      var mp = this.position;
      var tp = target.position;

      quat.identity(this.quaternion);
      this.rotateZ(Math.atan2(tp[1] - mp[1], tp[0] - mp[0]));

      var from = vec3.sub(vec3.create(), [tp[0], tp[1], 0], [mp[0], mp[1], 0]);
      var to = vec3.sub(vec3.create(), tp, mp);
      var q = quat.rotationTo(quat.create(), vec3.normalize(from, from), vec3.normalize(to, to));
      quat.mul(this.quaternion, this.quaternion, q);

      this.dirty = true;
      return this;
    },

    _accessor: {
      x: {
        get: function() {
          return this.position[0];
        },
        set: function(v) {
          this.position[0] = v;
          this.dirty = true;
        }
      },
      y: {
        get: function() {
          return this.position[1];
        },
        set: function(v) {
          this.position[1] = v;
          this.dirty = true;
        }
      },
      z: {
        get: function() {
          return this.position[2];
        },
        set: function(v) {
          this.position[2] = v;
          this.dirty = true;
        }
      },

      scaleX: {
        get: function() {
          return this.scale[0];
        },
        set: function(v) {
          this.scale[0] = v;
          this.dirty = true;
        }
      },
      scaleY: {
        get: function() {
          return this.scale[1];
        },
        set: function(v) {
          this.scale[1] = v;
          this.dirty = true;
        }
      },
      scaleZ: {
        get: function() {
          return this.scale[2];
        },
        set: function(v) {
          this.scale[2] = v;
          this.dirty = true;
        }
      },
    }
  });

});

phina.namespace(function() {

  phina.define("glb.ObjAsset", {
    superClass: "phina.asset.File",
    
    init: function() {
      this.superInit();
    },
    
    getAttributeData: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";
      
      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      obj = globj.ObjParser.trialgulate(obj);
      return globj.AttributeBuilder.build(obj);
    },

    getAttributeDataEdges: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      obj = globj.ObjParser.edge(obj);
      return globj.AttributeBuilder.buildEdges(obj);
    },
  });

  phina.asset.AssetLoader.assetLoadFunctions["obj"] = function(key, path) {
    var shader = glb.ObjAsset();
    return shader.load({
      path: path,
    });
  };

});

phina.namespace(function() {

  phina.define("glb.ObjDrawer", {

    gl: null,

    objTypes: null,

    counts: null,
    instanceData: null,
    instanceVbo: null,
    ibos: null,
    vbos: null,
    textures: null,
    pools: null,

    faceDrawer: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;

      this.objTypes = [];

      this.counts = {};
      this.instanceData = {};
      this.instanceVbo = {};
      this.ibos = {};
      this.vbos = {};
      this.textures = {};
      this.pools = {};

      this.faceDrawer = phigl.InstancedDrawable(gl, ext)
        .setProgram(phina.asset.AssetManager.get("shader", "obj"))
        .setAttributes("position", "uv", "normal")
        .setInstanceAttributes(
          "instanceVisible",
          "instanceMatrix0",
          "instanceMatrix1",
          "instanceMatrix2",
          "instanceMatrix3",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "lightDirection",
          "diffuseColor",
          "ambientColor",
          "cameraPosition",
          "texture"
        );

      this.glowDrawer = phigl.InstancedDrawable(gl, ext)
        .setProgram(phina.asset.AssetManager.get("shader", "objGlow"))
        .setAttributes("position", "uv", "normal")
        .setInstanceAttributes(
          "instanceVisible",
          "instanceMatrix0",
          "instanceMatrix1",
          "instanceMatrix2",
          "instanceMatrix3",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "texture"
        );

      this.lightDirection = vec3.set(vec3.create(), 1, -0.5, 0);
      vec3.normalize(this.lightDirection, this.lightDirection);
      // this.diffuseColor = [0.6, 0.6, 0.6, 1.0];
      // this.ambientColor = [0.6, 0.6, 0.6, 1.0];

      this.diffuseColor = [0.5, 0.5, 0.5, 1.0];
      this.ambientColor = [0.5, 0.5, 0.5, 1.0];
    },

    addObjType: function(objType, objAssetName, count, className) {
      className = className || "glb.Obj";

      count = count || 1;
      var self = this;
      var instanceStride = this.faceDrawer.instanceStride / 4;

      if (!this.objTypes.contains(objType)) {
        this.counts[objType] = count;
        var instanceData = this.instanceData[objType] = Array.range(count).map(function(i) {
          return [
            // visible
            0,
            // m0
            1, 0, 0,
            // m1
            0, 1, 0,
            // m2
            0, 0, 1,
            // m3
            0, 0, 0,
            // alpha
            1,
          ];
        }).flatten();
        this.instanceVbo[objType] = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW).set(instanceData);
        this.ibos[objType] = phina.asset.AssetManager.get("ibo", objAssetName + ".obj");
        this.vbos[objType] = phina.asset.AssetManager.get("vbo", objAssetName + ".obj");
        this.textures[objType] = phina.asset.AssetManager.get("texture", objAssetName + ".png");

        var ObjClass = phina.using(className);
        this.pools[objType] = Array.range(count).map(function(id) {
          return ObjClass(id, instanceData, instanceStride)
            .on("removed", function() {
              self.pools[objType].push(this);
            });
        });

        this.objTypes.push(objType);
      }
    },

    get: function(objType) {
      return this.pools[objType].shift();
    },

    update: function(app) {
    },

    render: function(uniforms) {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.diffuseColor.value = this.diffuseColor;
      this.faceDrawer.uniforms.ambientColor.value = this.ambientColor;

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.faceDrawer.uniforms[key]) this.faceDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var instanceVbo = self.instanceVbo[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        try {
          instanceVbo.set(instanceData);
          self.faceDrawer
            .setIndexBuffer(ibo)
            .setAttributeVbo(vbo)
            .setInstanceAttributeVbo(instanceVbo);
          self.faceDrawer.uniforms.texture.setValue(0).setTexture(texture);
          self.faceDrawer.draw(count);
        } catch (e) {
          console.error("obj draw error", objType, instanceData.length);
          throw e;
        }
      });
    },

    renderGlow: function(uniforms) {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.glowDrawer.uniforms[key]) this.glowDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var instanceVbo = self.instanceVbo[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        try {
          instanceVbo.set(instanceData);
          self.glowDrawer
            .setIndexBuffer(ibo)
            .setAttributeVbo(vbo)
            .setInstanceAttributeVbo(instanceVbo);
          self.glowDrawer.uniforms.texture.setValue(0).setTexture(texture);
          self.glowDrawer.draw(count);
        } catch (e) {
          console.error("obj-glow draw error", objType, instanceData.length);
          throw e;
        }
      });
    },

  });

});

phina.namespace(function() {

  phina.define("glb.Player", {
    superClass: "glb.Obj",

    hp: 10,
    mutekiTime: 0,
    controllable: false,
    bits: null,
    shift: -1,
    roll: 0,

    tweener2: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      this.roll = 0;
      this.bits = [];
      this.tweener2 = phina.accessory.Tweener().attachTo(this);
    },

    spawn: function() {
      glb.Obj.prototype.spawn.call(this, {
        visible: false,
        x: SCREEN_WIDTH * 0.5,
        y: SCREEN_HEIGHT * 1.2,
        rotZ: (-90).toRadian(),
        scaleX: 20,
        scaleY: 20,
        scaleZ: 20,
      });

      return this;
    },

    launch: function() {
      this.tweener
        .clear()
        .set({
          x: SCREEN_WIDTH * 0.5,
          y: SCREEN_HEIGHT * 1.2,
          visible: true,
          controllable: false,
          roll: R180,
        })
        .to({
          y: SCREEN_HEIGHT * 0.8,
          roll: 0,
        }, 1000, "easeOutBack")
        .set({
          controllable: true,
          mutekiTime: 90,
          shift: -1,
        })
        .call(function() {
          this.flare("launched");
        }.bind(this))
        .wait(3000);

      this.tweener2
        .clear()
        .set({
          scaleX: 20 * 5,
          scaleY: 20 * 5,
          scaleZ: 20 * 5,
        })
        .to({
          scaleX: 20,
          scaleY: 20,
          scaleZ: 20,
        }, 1000);
    },

    setBitJoin: function(bitJoin) {
      this.bitJoin = bitJoin;
      bitJoin
        .spawn({
          visible: true,
          scaleX: 20,
          scaleY: 20,
          scaleZ: 20,
          rotZ: (-90).toRadian(),
        });
    },

    setBarrier: function(barrier) {
      this.barrier = barrier;
      barrier.spawn({
        scaleX: 20,
        scaleY: 20,
        scaleZ: 20,
        rotZ: (-90).toRadian(),
      });
      return this;
    },

    update: function(app) {
      if (this.controllable) {
        this.control(app);
      }

      if (this.shift < 0) {
        this.shift = Math.min(this.shift + 0.1, 0);
      }

      var index = this.index;
      var instanceData = this.instanceData;

      quat.copy(this.quaternion, BASE_QUAT);
      quat.rotateX(this.quaternion, this.quaternion, this.roll);

      var v = this.shift;
      for (var i = 0; i < 4; i++) {
        var bit = this.bits[i];
        var bd0 = BIT_DATA0[i];
        var bd1 = BIT_DATA1[i];
        var bd2 = BIT_DATA2[i];

        if (v < 0) {
          var x = bd0.x * (-v) + bd1.x * (1 + v);
          var y = bd0.y * (-v) + bd1.y * (1 + v);
          var d = bd0.d * (-v) + bd1.d * (1 + v);
        } else {
          var x = bd1.x * (1 - v) + bd2.x * v;
          var y = bd1.y * (1 - v) + bd2.y * v;
          var d = bd1.d * (1 - v) + bd2.d * v;
        }

        if (bit) {
          bit.visible = this.controllable && this.shift < 1;
          if (bit.visible) {
            bit.x = this.x + x;
            bit.y = this.y + y;
            quat.setAxisAngle(bit.quaternion, [0, 0, 1], d);
            bit.rotateX(this.age * (i < 2 ? 0.2 : -0.2));
          }
        }
      }

      var bitJoin = this.bitJoin;
      bitJoin.visible = this.controllable && this.shift === 1;
      if (bitJoin) {
        bitJoin.x = this.x;
        bitJoin.y = this.y + -50;
        bitJoin.rotateX(0.2);
      }

      var barrier = this.barrier;
      if (barrier) {
        barrier.visible = this.muteki;
        if (barrier.visible) {
          barrier.x = this.x;
          barrier.y = this.y;
          barrier.rotateX(0.5);
        }
      }

      instanceData[index + 0] = this.visible ? 1 : 0;

      if (this.dirty) {
        quat.mul(tempQuat, RX, this.quaternion);
        mat4.fromRotationTranslationScale(this.matrix, tempQuat, this.position, this.scale);

        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        instanceData[index + 13] = this.alpha;
        this.dirty = false;
      }

      this.age += 1;
      this.mutekiTime -= 1;
    },

    control: function(app) {
      var frame = app.ticker.frame;
      var kb = app.keyboard;
      var gp = app.gamepadManager.get();
      var dir = kb.getKeyDirection();

      var gpdir = gp.getStickDirection();
      if (gpdir.length() > 0.5) {
        var x = 0;
        var y = 0;
        if (gpdir.x < -0.5) x = -1.0;
        else if (0.5 < gpdir.x) x = 1.0;
        if (gpdir.y < -0.5) y = -1.0;
        else if (0.5 < gpdir.y) y = 1.0;
        dir.add(phina.geom.Vector2(x, y).normalize());
      }

      dir.add(gp.getKeyDirection());

      dir.normalize();

      var speed = (kb.getKey("LASER") || gp.getKey("LASER")) ? 13 : 24;

      this.x = Math.clamp(this.x + dir.x * speed, 10, SCREEN_WIDTH - 10);
      this.y = Math.clamp(this.y + dir.y * speed, 10, SCREEN_HEIGHT - 10);

      if (dir.x) {
        this.roll = Math.clamp(this.roll - dir.x * 0.2, -R90, R90);
      } else {
        if (this.roll < -0.2) {
          this.roll += 0.2;
        } else if (0.2 < this.roll) {
          this.roll -= 0.2;
        } else {
          this.roll = 0;
        }
      }

      var pressShot = kb.getKey("SHOT") || gp.getKey("SHOT");
      var pressLaser = kb.getKey("LASER") || gp.getKey("LASER");

      if (this.shift >= 0) {
        if (kb.getKey("LASER") || gp.getKey("LASER")) {
          this.shift = Math.min(this.shift + 0.2, 1);
        } else {
          this.shift = Math.max(this.shift - 0.2, 0);
        }
      }

      if (pressShot && (0 <= this.shift && this.shift < 1) && frame % 2 === 0) {
        this.shot();
      } else if (pressLaser && this.shift == 1) {
        this.laser();
      }
    },

    hitBullet: function(bullet) {
      // TO25O
    },

    hitEnemy: function(enemy) {
      // TODO
    },

    laser: function() {
      var f = [6, 7, 8].pickup();
      this.flare("fireLaser", {
        x: this.x,
        y: this.y - 40,
        rotation: Math.PI * -0.5,
        scaleX: 12,
        scaleY: Math.randfloat(1.8, 2.2),
        frameX: f % 8,
        frameY: ~~(f / 8),
        alpha: 1.0,
        dx: 0,
        dy: -100,
        player: this,
      });
    },

    shot: function() {
      for (var i = -2; i < 2; i++) {
        this.flare("fireShot", {
          x: this.x + i * 20 + 10,
          y: this.y - 20,
          rotation: Math.PI * -0.5,
          scaleX: 4,
          scaleY: 4,
          frameX: [1, 2, 3, 4].pickup(),
          frameY: 1,
          alpha: 1.0,
          dx: 0,
          dy: -60,
        });
      }

      var v = this.shift;
      if (v < 0) return;

      for (var i = 0; i < 4; i++) {
        var bd0 = BIT_DATA0[i];
        var bd1 = BIT_DATA1[i];
        var bd2 = BIT_DATA2[i];
        if (v < 0) {
          var x = bd0.x * (-v) + bd1.x * (1 + v);
          var y = bd0.y * (-v) + bd1.y * (1 + v);
          var d = bd0.d * (-v) + bd1.d * (1 + v);
          var cw = bd0.cw * (-v) + bd1.cw * (1 + v);
          var sw = bd0.sw * (-v) + bd1.sw * (1 + v);
          var cr = bd0.cr * (-v) + bd1.cr * (1 + v);
          var sr = bd0.sr * (-v) + bd1.sr * (1 + v);
        } else {
          var x = bd1.x * (1 - v) + bd2.x * v;
          var y = bd1.y * (1 - v) + bd2.y * v;
          var d = bd1.d * (1 - v) + bd2.d * v;
          var cw = bd1.cw * (1 - v) + bd2.cw * v;
          var sw = bd1.sw * (1 - v) + bd2.sw * v;
          var cr = bd1.cr * (1 - v) + bd2.cr * v;
          var sr = bd1.sr * (1 - v) + bd2.sr * v;
        }
        [-1, 1].forEach(function(j) {
          this.flare("fireShot", {
            x: this.x + x + cw * 15 * j + cr * 30,
            y: this.y + y + sw * 15 * j + sr * 30,
            rotation: d,
            scaleX: 4,
            scaleY: 4,
            frameX: [1, 2, 3, 4].pickup(),
            frameY: 1,
            alpha: 1.0,
            dx: cr * 60,
            dy: sr * 60,
          });
        }.bind(this));
      }
    },

    _accessor: {
      muteki: {
        get: function() {
          return !this.controllable || this.mutekiTime > 0;
        },
        set: function() {},
      },
    }

  });

  var BASE_QUAT = quat.rotateZ(quat.create(), quat.create(), (-90).toRadian());
  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (10).toRadian());
  var tempQuat = quat.create();
  var R360 = (360).toRadian();
  var R180 = (180).toRadian();
  var R90 = (90).toRadian();
  var R45 = (45).toRadian();
  var R22_5 = (22.5).toRadian();

  var BIT_DATA0 = [{
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, ];

  var BIT_DATA1 = [{
    x: -120,
    y: 35,
    d: (-20 - 90).toRadian(),
    sr: Math.sin((-20 - 90).toRadian()),
    cr: Math.cos((-20 - 90).toRadian()),
    sw: Math.sin((-20).toRadian()),
    cw: Math.cos((-20).toRadian()),
  }, {
    x: -70,
    y: 20,
    d: (-10 - 90).toRadian(),
    sr: Math.sin((-10 - 90).toRadian()),
    cr: Math.cos((-10 - 90).toRadian()),
    sw: Math.sin((-10).toRadian()),
    cw: Math.cos((-10).toRadian()),
  }, {
    x: 70,
    y: 20,
    d: (10 - 90).toRadian(),
    sr: Math.sin((10 - 90).toRadian()),
    cr: Math.cos((10 - 90).toRadian()),
    sw: Math.sin((10).toRadian()),
    cw: Math.cos((10).toRadian()),
  }, {
    x: 120,
    y: 35,
    d: (20 - 90).toRadian(),
    sr: Math.sin((20 - 90).toRadian()),
    cr: Math.cos((20 - 90).toRadian()),
    sw: Math.sin((20).toRadian()),
    cw: Math.cos((20).toRadian()),
  }, ];

  var BIT_DATA2 = [{
    x: 0,
    y: -50,
    d: (6 - 90).toRadian(),
    sr: Math.sin((6 - 90).toRadian()),
    cr: Math.cos((6 - 90).toRadian()),
    sw: Math.sin((6).toRadian()),
    cw: Math.cos((6).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (3 - 90).toRadian(),
    sr: Math.sin((3 - 90).toRadian()),
    cr: Math.cos((3 - 90).toRadian()),
    sw: Math.sin((3).toRadian()),
    cw: Math.cos((3).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (-3 - 90).toRadian(),
    sr: Math.sin((-3 - 90).toRadian()),
    cr: Math.cos((-3 - 90).toRadian()),
    sw: Math.sin((-3).toRadian()),
    cw: Math.cos((-3).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (-6 - 90).toRadian(),
    sr: Math.sin((-6 - 90).toRadian()),
    cr: Math.cos((-6 - 90).toRadian()),
    sw: Math.sin((-6).toRadian()),
    cw: Math.cos((-6).toRadian()),
  }, ];

});

phina.namespace(function() {

  phina.define("glb.Pool", {

    array: null,
    dirty: null,
    comparator: null,

    init: function(array, comparator) {
      this.array = array || [];
      this.comparator = comparator || function(lhs, rhs) {
        return lhs - rhs;
      };
      this.dirty = true;
    },

    add: function(obj) {
      this.array.push(obj);
      this.dirty = true;
    },

    get: function() {
      if (this.dirty) {
        this.array.sort(this.comparator);
        this.dirty = false;
      }
      return this.array.shift();
    },
  });

  Array.prototype.$method("toPool", function(comparator) {
    return glb.Pool(this, comparator);
  });

});

phina.namespace(function() {

  phina.define("glb.PostProcessing", {

    gl: null,
    drawer: null,

    width: 0,
    height: 0,
    
    init: function(gl, w, h, shaderName, uniforms) {
      this.gl = gl;

      var sw = Math.pow(2, ~~Math.log2(w) + 1);
      var sh = Math.pow(2, ~~Math.log2(h) + 1);

      this.drawer = phigl.Drawable(gl)
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setProgram(phina.asset.AssetManager.get("shader", shaderName))
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeData([
          //
          -1, +1, 0, h / sh,
          //
          +1, +1, w / sw, h / sh,
          //
          -1, -1, 0, 0,
          // 
          +1, -1, w / sw, 0,
        ])
        .setUniforms(["texture", "canvasSize"].concat(uniforms));

      this.width = w;
      this.height = h;
      this.sw = sw;
      this.sh = sh;
    },

    render: function(texture, uniformValues, additiveBlending) {
      var gl = this.gl;

      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      
      if (additiveBlending) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }

      this.drawer.uniforms.texture.setValue(0).setTexture(texture);
      this.drawer.uniforms.canvasSize.value = [this.sw, this.sh];
      if (uniformValues) this.setUniforms(uniformValues);
      this.drawer.draw();

      return this;
    },

    setUniforms: function(uniformValues) {
      var uniforms = this.drawer.uniforms;
      uniformValues.forIn(function(k, v) {
        uniforms[k].value = v;
      });
    },
    
    viewCoordToShaderCoord: function(x, y) {
      var q = glb.GLLayer.quality;
      return [x * q / this.sw, (SCREEN_HEIGHT - y) * q / this.sh];
    },

  });

});

phina.namespace(function() {

  phina.define("glb.Shot", {
    superClass: "glb.Sprite",
    
    power: 0,
    bx: 0,
    by: 0,

    _active: false,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.dx = options.dx;
      this.dy = options.dy;
      return glb.Sprite.prototype.spawn.call(this, options);
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    update: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      glb.Sprite.prototype.update.call(this, app);
    },

    hitEnemy: function(e) {
      // TODO
      this.flare("hitEnemy");
      this.remove();
    },

  });
});

phina.namespace(function() {

  phina.define("glb.Sprite", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    x: 0,
    y: 0,
    rotation: 0,
    scale: 0,

    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      options.$safe({
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        frameX: 0,
        frameY: 0,
        alpha: 1,
      });

      var index = this.index;
      var instanceData = this.instanceData;

      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.frameX = options.frameX;
      this.frameY = options.frameY;
      this.alpha = options.alpha;

      instanceData[index + 0] = 1; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.x < -100 || 640 + 100 < this.x || this.y < -100 || 960 + 100 < this.y) {
        this.remove();
        return;
      }

      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.alpha; // alpha

      this.age += 1;
    },

    onremoved: function() {
      this.instanceData[this.index + 0] = 0;
    }
  });

});

phina.namespace(function() {

  phina.define("glb.SpritDrawer", {
    superClass: "phigl.InstancedDrawable",

    objTypes: null,

    counts: null,
    instanceData: null,
    textures: null,
    pools: null,

    additiveBlending: true,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      this.objTypes = [];

      this.counts = {};
      this.instanceData = {};
      this.instanceVbos = {};
      this.textures = {};
      this.pools = {};

      this
        .setProgram(phina.asset.AssetManager.get("shader", "sprites"))
        .setDrawMode(gl.TRIANGLE_STRIP)
        .setIndexValues([0, 1, 2, 3])
        .setAttributes("position", "uv")
        .setAttributeDataArray([{
          unitSize: 2,
          data: [
            //
            -16, +16,
            //
            +16, +16,
            //
            -16, -16,
            //
            +16, -16,
          ]
        }, {
          unitSize: 2,
          data: [
            //
            0, 1 / 8,
            //
            1 / 8, 1 / 8,
            //
            0, 0,
            //
            1 / 8, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "texture",
          "globalScale"
        );

      var instanceStride = this.instanceStride / 4;

      this.uniforms.globalScale.setValue(1.0);
    },

    addObjType: function(objName, textureName, count, className) {
      className = className || "glb.Sprite";

      count = count || 1;
      var self = this;
      var instanceStride = this.instanceStride / 4;

      if (!this.objTypes.contains(objName)) {
        this.counts[objName] = count;
        var instanceData = this.instanceData[objName] = Array.range(count).map(function(i) {
          return [
            // visible
            0,
            // m0
            1, 0, 0,
            // m1
            0, 1, 0,
            // m2
            0, 0, 1,
            // m3
            0, 0, 0,
          ];
        }).flatten();
        this.instanceVbos[objName] = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW);

        this.textures[objName] = phina.asset.AssetManager.get("texture", textureName + ".png");

        var ObjClass = phina.using(className);
        this.pools[objName] = Array.range(count).map(function(id) {
          return ObjClass(id, instanceData, instanceStride)
            .on("removed", function() {
              self.pools[objName].push(this);
            });
        });

        this.objTypes.push(objName);
      }
    },

    _createTexture: function() {
      var texture = phina.graphics.Canvas().setSize(512, 512);
      var context = texture.context;
      var g = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0.0, "rgba(255, 255, 255, 0.3)");
      g.addColorStop(0.6, "rgba(255, 125,   0, 0.3)");
      g.addColorStop(1.0, "rgba(255,   0,   0, 0.0)");
      context.fillStyle = g;
      context.fillRect(0, 0, 64, 64);
      return texture;
    },

    get: function(objName) {
      return this.pools[objName].shift();
    },

    update: function() {},

    render: function(uniforms) {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      if (this.additiveBlending) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.disable(gl.DEPTH_TEST);

      this.uniforms.globalScale.value = 1.0;

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.uniforms[key]) this.uniforms[key].value = value;
        }.bind(this));
      }
      var self = this;
      this.objTypes.forEach(function(objName) {
        var count = self.counts[objName];
        var instanceData = self.instanceData[objName];
        var instanceVbo = self.instanceVbos[objName];
        var texture = self.textures[objName];

        instanceVbo.set(instanceData);

        self.setInstanceAttributeVbo(instanceVbo);
        self.uniforms.texture.setValue(0).setTexture(texture);
        self.draw(count);
      });
    },
  });

});

phina.namespace(function() {

  phina.define("glb.TerrainDrawer", {

    gl: null,
    faceDrawer: null,
    edgeDrawer: null,

    instanceData: null,
    pool: null,
    count: 0,

    init: function(gl, ext, w, h) {
      this.gl = gl;
      this.count = (glb.TerrainDrawer.countX * 2) * (glb.TerrainDrawer.countZ * 2);
      this.faceDrawer = phigl.InstancedDrawable(gl, ext);
      this.edgeDrawer = phigl.InstancedDrawable(gl, ext);
      var instanceData = this.instanceData = [];
      for (var i = 0; i < this.count; i++) {
        instanceData.push(
          // visible
          0,
          // m0
          1, 0, 0,
          // m1
          0, 1, 0,
          // m2
          0, 0, 1,
          // m3
          0, 0, 0,
          // alpha
          1
        );
      }

      this.faceDrawer
        .setProgram(phina.asset.AssetManager.get("shader", "terrain"))
        .setIndexBuffer(phina.asset.AssetManager.get("ibo", "hex.obj"))
        .setAttributes("position", "uv", "normal")
        .setAttributeVbo(phina.asset.AssetManager.get("vbo", "hex.obj"))
        .setInstanceAttributes(
          "instanceVisible",
          "instanceMatrix0",
          "instanceMatrix1",
          "instanceMatrix2",
          "instanceMatrix3",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "lightDirection",
          "diffuseColor",
          "ambientColor",
          "cameraPosition"
        );

      this.edgeDrawer
        .setDrawMode(gl.LINES)
        .setProgram(phina.asset.AssetManager.get("shader", "terrainEdge"))
        .setIndexBuffer(phina.asset.AssetManager.get("edgesIbo", "hex.obj"))
        .setAttributes("position")
        .setAttributeVbo(phina.asset.AssetManager.get("edgesVbo", "hex.obj"))
        .setInstanceAttributes(
          "instanceVisible",
          "instanceMatrix0",
          "instanceMatrix1",
          "instanceMatrix2",
          "instanceMatrix3",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "cameraPosition",
          "color"
        );

      var instanceStride = this.edgeDrawer.instanceStride / 4;

      this.lightDirection = vec3.set(vec3.create(), -1, -0.5, 0);
      vec3.normalize(this.lightDirection, this.lightDirection);
      // this.faceDrawer.uniforms.diffuseColor.value = [0.22, 0.22, 0.22 * 2.6, 0.75];

      var self = this;
      this.pool = Array.range(0, this.count).map(function(id) {
        return glb.Obj(id, instanceData, instanceStride)
          .on("enterframe", function() {
            // 地形の流れる方向
            this.x += 6 * 0.01;
            this.z += 20 * 0.01;

            var countX = glb.TerrainDrawer.countX;
            var countZ = glb.TerrainDrawer.countZ;
            var unit = glb.TerrainDrawer.unit;
            if (this.x < -countX * unit) this.x += countX * unit * 2;
            else if (countX * unit < this.x) this.x -= countX * unit * 2;
            if (this.z < -countZ * unit * 1 / Math.sqrt(3) * 1.5) this.z += countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
            else if (countZ * unit * 1 / Math.sqrt(3) * 1.5 < this.z) this.z -= countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
          })
          .on("removed", function() {
            self.pool.push(this);
          });
      });

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);
    },

    update: function(app) {
      var f = app.ticker.frame * 0.003;
    },

    get: function() {
      return this.pool.shift();
    },

    render: function(uniforms) {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);

      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.ambientColor.value = [0.05, 0.05, 0.05, 0.7];
      this.edgeDrawer.uniforms.color.value = [1.0, 1.0, 1.0, 1.0];

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.edgeDrawer.uniforms[key]) this.edgeDrawer.uniforms[key].value = value;
          if (this.faceDrawer.uniforms[key]) this.faceDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.edgeDrawer.draw(this.count);
      this.faceDrawer.draw(this.count);
    },

    _static: {
      countX: 12,
      countZ: 22,
      unit: 2.05,
    },
  });

});

phina.namespace(function() {

  phina.asset.AssetLoader.assetLoadFunctions["textureSource"] = function(key, path) {
    var texture = phina.asset.Texture();
    var flow = texture.load(path);
    return flow;
  };

});

phina.namespace(function() {

  phina.define("glb.Assets", {
    _static: {
      get: function(options) {
        switch (options.assetType) {
          case "common":
            return {
              obj: {
                "fighter.obj": "./asset/obj/fighter.obj",
                "bit.obj": "./asset/obj/bit.obj",
                "bitJoin.obj": "./asset/obj/bitJoin.obj",
                "hex.obj": "./asset/obj/hex.obj",
                "barrier.obj": "./asset/obj/barrier.obj",
              },
              textureSource: {
                "fighter.png": "./asset/image/fighter.png",
                "bit.png": "./asset/image/bit.png",
                "bitJoin.png": "./asset/image/bit.png",
                "bullets.png": "./asset/image/bullets.png",
                "effect.png": "./asset/image/effect.png",
                "barrier.png": "./asset/image/barrier.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
                "terrain.vs": "./asset/shader/terrain.vs",
                "terrainEdge.vs": "./asset/shader/terrainEdge.vs",
                "obj.vs": "./asset/shader/obj.vs",
                "objEdge.vs": "./asset/shader/objEdge.vs",
                "objGlow.vs": "./asset/shader/objGlow.vs",
                "postproccess_copy.vs": "./asset/shader/postproccess.vs",
                "postproccess_blur.vs": "./asset/shader/postproccess.vs",
                "postproccess_zoom.vs": "./asset/shader/postproccess.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
                "terrain.fs": "./asset/shader/terrain.fs",
                "terrainEdge.fs": "./asset/shader/terrainEdge.fs",
                "obj.fs": "./asset/shader/obj.fs",
                "objEdge.fs": "./asset/shader/objEdge.fs",
                "objGlow.fs": "./asset/shader/objGlow.fs",
                "postproccess_copy.fs": "./asset/shader/postproccess_copy.fs",
                "postproccess_blur.fs": "./asset/shader/postproccess_blur.fs",
                "postproccess_zoom.fs": "./asset/shader/postproccess_zoom.fs",
              },
            };
          case "stage1":
            return {
              obj: {
                "enemyS1.obj": "./asset/obj/enemyS1.obj",
                "enemyS2.obj": "./asset/obj/enemyS2.obj",
                "enemyS3.obj": "./asset/obj/enemyS3.obj",
                "enemyS4.obj": "./asset/obj/enemyS4.obj",
                "enemyS5.obj": "./asset/obj/enemyS5.obj",
                "enemyM1.obj": "./asset/obj/enemyM1.obj",
              },
              textureSource: {
                "enemyS1.png": "./asset/image/enemyS1.png",
                "enemyS2.png": "./asset/image/enemyS2.png",
                "enemyS3.png": "./asset/image/enemyS3.png",
                "enemyS4.png": "./asset/image/enemyS4.png",
                "enemyS5.png": "./asset/image/enemyS5.png",
                "enemyM1.png": "./asset/image/enemyM1.png",
              },
            };
          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Danmaku", {
    init: function() {},
    _static: {
      _initialized: false,
      config: {},
      intervalRate: 1.0,
      speedRate: 15.0,

      initialize: function() {
        this._initialized = true;

        var R = bullet({ type: 2 });
        var B = bullet({ type: 10 });

        // 自機狙い単発
        this.basic0 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(speed(1), R),
              interval(30),
              fire(speed(1), B),
            ]),
          ]),
        });

        // 自機狙い５連発
        this.basic1 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(speed(1), R),
              repeat(4, [
                interval(4),
                fire(dseq(0), sseq(0), R),
              ]),
            ]),
          ]),
        });

        // 自機狙い3way（広）
        this.basic2 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(direction(-15), speed(1), R),
              repeat(2, [
                fire(dseq(15), speed(1), R),
              ]),
            ]),
          ]),
        });

        // 自機狙い3way（狭）
        this.basic3 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(direction(-8), speed(1), R),
              repeat(2, [
                fire(dseq(8), speed(1), R),
              ]),
            ]),
          ]),
        });

        this.test = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              fire(dseq(1), speed(1), R),
              repeat(90 - 1, [
                fire(dseq(360 / 90), speed(1), R),
              ]),
              interval(5),
            ]),
          ]),
        });
      },

      createRunner: function(name) {
        if (!this._initialized) this.initialize();
        return this[name].createRunner(this.config);
      },
    },
  });

  var action = bulletml.dsl.action;
  var actionRef = bulletml.dsl.actionRef;
  var bullet = bulletml.dsl.bullet;
  var bulletRef = bulletml.dsl.bulletRef;
  var fire = bulletml.dsl.fire;
  var fireRef = bulletml.dsl.fireRef;
  var changeDirection = bulletml.dsl.changeDirection;
  var changeSpeed = bulletml.dsl.changeSpeed;
  var accel = bulletml.dsl.accel;
  var wait = bulletml.dsl.wait;
  var vanish = bulletml.dsl.vanish;
  var repeat = bulletml.dsl.repeat;
  var bindVar = bulletml.dsl.bindVar;
  var notify = bulletml.dsl.notify;
  var direction = bulletml.dsl.direction;
  var _speed = bulletml.dsl.speed;
  var horizontal = bulletml.dsl.horizontal;
  var vertical = bulletml.dsl.vertical;
  var fireOption = bulletml.dsl.fireOption;
  var offsetX = bulletml.dsl.offsetX;
  var offsetY = bulletml.dsl.offsetY;
  var autonomy = bulletml.dsl.autonomy;

  var interval = function(v) {
    return wait(Math.max(v * glb.Danmaku.intervalRate, 1));
  };

  var speed = function(v) {
    return _speed(v * glb.Danmaku.speedRate);
  };

  var dseq = function(v) {
    return direction(v, "sequence");
  };
  var sseq = function(v) {
    return _speed(v, "sequence");
  };

});

phina.namespace(function() {

  phina.define("glb.Enemy", {
    superClass: "glb.Obj",

    _static: {
      data: {},
    },

    _active: false,

    hp: 10,
    mutekiTime: 0,
    runner: null,
    pattern: 0,

    radius: 50,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
      this.on("removed", function() {
        this.runner = null;
      });
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      instanceData[index + 0] = this.visible ? 1 : 0;
      if (this.dirty) {
        quat.mul(tempQuat, RX, this.quaternion);
        mat4.fromRotationTranslationScale(this.matrix, tempQuat, this.position, this.scale);

        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        instanceData[index + 13] = this.alpha;
        this.dirty = false;
      }

      if (this.runner) {
        this.runner.x = this.x;
        this.runner.y = this.y;
        this.runner.update();
      }

      this.age += 1;
      this.mutekiTime -= 1;
    },

    hitShot: function(shot) {
      // TODO
      if (this.mutekiTime > 0) {
        this.hp -= shot.power;
        this.mutekiTime = 1;
        this.flare("damaged");
      }
    },

    hitPlayer: function(player) {
      // TODO
    },

    setRunner: function(name) {
      this.runner = glb.Danmaku.createRunner(name);
      return this;
    },

    setPattern: function(id) {
      this.pattern = id;
      return this;
    },

  });

  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (45).toRadian());
  var tempQuat = quat.create();

});

phina.namespace(function() {

  phina.define("glb.EnemyS1", {
    superClass: "glb.Enemy",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

  });

  glb.Enemy.data["enemyS1"] = {
    count: 100,
    className: "glb.EnemyS1",
  };

});

phina.namespace(function() {

  phina.define("glb.DownloadScene", {
    superClass: "phina.game.LoadingScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        assets: glb.Assets.get({ assetType: options.assetType }),
      });

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "downloading",
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });
    },
  });

});

phina.namespace(function() {

  phina.define("glb.ErrorScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
      });

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "error: " + glb.ErrorScene.message,
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });
    },

    _static: {
      message: "",
    },
  });

});

phina.namespace(function() {

  phina.define("glb.LoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
      });
      this.gl = options.gl;
      this.assetType = options.assetType;
      this.totalCount = 0;
      this.count = 0;

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "loading",
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });

      this.tweener.wait(66).call(function() {
        this.load();
      }.bind(this));
    },

    onprogress: function() {
      this.count += 1;

      // TODO
      this.label.text = this.count + "/" + this.totalCount;
    },

    oncomplete: function() {
      this.app.popScene();
    },

    load: function() {
      var self = this;
      var gl = this.gl;
      var manager = phina.asset.AssetManager;

      this.totalCount =
        Object.keys(manager.assets["vertexShader"]).length +
        Object.keys(manager.assets["obj"]).length +
        Object.keys(manager.assets["textureSource"]).length;

      var flows = [];

      manager.assets["vertexShader"].forIn(function(key, obj) {
        var flow = phina.util.Flow(function(resolve) {
          var name = key.replace(".vs", "");
          var shader = phigl.Program(gl)
            .attach(name + ".vs")
            .attach(name + ".fs")
            .link();

          manager.set("shader", name, shader);

          self.flare("progress");
          resolve();
        });

        flows.push(flow);
      });

      manager.assets["obj"].forIn(function(key, obj) {
        var flow = phina.util.Flow(function(resolve) {
          var attrData = obj.getAttributeData();
          var edgeData = obj.getAttributeDataEdges();

          var vbo = phigl.Vbo(gl).set(attrData.attr);
          var ibo = phigl.Ibo(gl).set(attrData.indices);
          var edgesVbo = phigl.Vbo(gl).set(edgeData.attr);
          var edgesIbo = phigl.Ibo(gl).set(edgeData.indices);

          manager.set("vbo", key, vbo);
          manager.set("ibo", key, ibo);
          manager.set("edgesVbo", key, edgesVbo);
          manager.set("edgesIbo", key, edgesIbo);

          self.flare("progress");

          resolve();
        });

        flows.push(flow);
      });

      manager.assets["textureSource"].forIn(function(key, image) {
        var flow = phina.util.Flow(function(resolve) {
          var texture = phigl.Texture(gl, image);

          manager.set("texture", key, texture);

          self.flare("progress");

          resolve();
        });

        flows.push(flow);
      });

      phina.util.Flow.all(flows).then(function() {
        self.flare("complete");
      });

      return this;
    },

    _static: {
      deleteAssets: function(assetType) {
        var assets = glb.Assets.get(assetType);
        var manager = phina.asset.AssetManager;

        if (assets["obj"]) {
          assets["obj"].forIn(function(key) {
            if (manager.get("vbo", key)) {
              manager.get("vbo", key).delete();
              delete manager.assets["vbo"][key];
            }
            if (manager.get("ibo", key)) {
              manager.get("ibo", key).delete();
              delete manager.assets["ibo"][key];
            }
            if (manager.get("edgesVbo", key)) {
              manager.get("edgesVbo", key).delete();
              delete manager.assets["edgesVbo"][key];
            }
            if (manager.get("edgesIbo", key)) {
              manager.get("edgesIbo", key).delete();
              delete manager.assets["edgesIbo"][key];
            }

            if (manager.assets["obj"]) {
              delete manager.assets["obj"][key];
            }
          });
        }

        if (assets["textureSource"]) {
          assets["textureSource"].forIn(function(key, obj) {
            if (manager.get("texture", key)) {
              manager.get("texture", key).delete();
              delete manager.assets["texture"][key];
            }

            if (manager.assets["textureSource"]) {
              delete manager.assets["textureSource"][key];
            }
          });
        }
      },
    },
  });

});

phina.namespace(function() {

  phina.define("glb.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        scenes: [

          // {
          //   label: "logo",
          //   className: "phina.game.SplashScene",
          //   arguments: {
          //     width: SCREEN_WIDTH,
          //     height: SCREEN_HEIGHT,
          //   },
          // },

          {
            label: "download-common",
            className: "glb.DownloadScene",
            arguments: {}.$extend(options, { assetType: "common" }),
          },

          {
            label: "arcade",
            className: "glb.ArcadeMode",
            arguments: {}.$extend(options, {}),
          },

        ],
      });
    },
  });

  phina.define("glb.ArcadeMode", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        scenes: [

          {
            label: "download-stage1",
            className: "glb.DownloadScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

          {
            label: "load-stage1",
            className: "glb.LoadScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

          {
            label: "stage",
            className: "glb.StageScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

        ],
      });
    },
  });

});

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

phina.namespace(function() {

  phina.define("glb.Stage", {
    superClass: "phina.app.Element",

    seq: null,
    waitTime: 0,

    init: function() {
      this.superInit();
      this.seq = [];
    },

    update: function() {
      this.waitTime -= 1;
      if (this.waitTime > 0) return;

      var task = this.seq.shift();
      if (task) {
        this.fire(task);
      }
    },
    
    addTask: function(task) {
      this.seq.push(task);
      return this;
    },
    
    onwaitTask: function(e) {
      this.waitTime = e.time;
    },
    
    onstartBgmTask: function(e) {
      phina.asset.SoundManager.playMusic(e.name, e.fadeTime, e.loop);
    },
    
  });

});

phina.namespace(function() {

  phina.define("glb.Stage1", {
    superClass: "glb.Stage",

    init: function() {
      this.superInit();

      this
        .addTask({ type: "waitTask", time: 1000 })
        .addTask({ type: "enemyTask", name: "", pattern: 0, runner: "", x: 0, y: 0 });
    },

  });

});

phina.namespace(function() {

  /**
   * @param {Function} [fn] return true if lhs and rhs are equivalence.
   */
  Array.prototype.$method("uniq", function(fn) {
    if (fn) {
      return this.filter(function(me, index, self) {
        return !self.slice(0, index).some(function(another) {
          return fn(me, another);
        });
      });
    } else {
      return this.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    }
  });
  
  

});

//# sourceMappingURL=glbullethell.js.map
