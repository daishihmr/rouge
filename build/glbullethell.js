phina.namespace(function() {

  phina.define("glb.Bullet", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,
    runner: null,

    x: 0,
    y: 0,
    age: 0,

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
      instanceData[index + 3] = 1.5; // scale
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
  });

});

phina.namespace(function() {
  phina.define("glb.BulletSprites", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,
    pool: null,
    _count: 1000,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phina.asset.AssetManager.get("shader", "bulletSprites"))
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
          "vMatrix",
          "pMatrix",
          "texture",
          "globalScale"
        );

      var instanceUnit = this.instanceStride / 4;

      this.uniforms.vMatrix.setValue(
        mat4.lookAt(mat4.create(), [w / 2, h * 0.5, w * 1.5], [w / 2, h / 2, 0], [0, 1, 0])
      );
      this.uniforms.pMatrix.setValue(
        mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000)
      );
      this.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "bullets.png"));
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
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Bullet(id, instanceData, instanceUnit)
          .on("removed", function() {
            self.pool.push(this);
          });
      });
    },

    get: function() {
      var b = this.pool.shift();
      return b;
    },

    update: function(app) {
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      this.uniforms.globalScale.value = 1.0;
      this.draw(this._count);
    },
  });

});

phina.namespace(function() {

  phina.define("glb.DownloadScene", {
    superClass: "phina.game.LoadingScene",

    init: function(options) {
      this.superInit(options);
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Effect", {
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
      var index = this.index;
      var instanceData = this.instanceData;

      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scale = options.scale;
      this.alpha = options.alpha;

      instanceData[index + 0] = 1; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scale; // scale
      instanceData[index + 5] = 0; // frame.x
      instanceData[index + 6] = 0; // frame.y
      instanceData[index + 7] = this.alpha; // alpha

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

      instanceData[index + 1] = this.x;
      instanceData[index + 2] = this.y;
      instanceData[index + 3] = this.rotation;
      instanceData[index + 4] = this.scale;
      instanceData[index + 7] = this.alpha;

      this.age += 1;
    },

    onremoved: function() {
      this.instanceData[this.index + 0] = 0;
    }
  });

});

phina.namespace(function() {

  phina.define("glb.EffectSprites", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,
    pool: null,
    _count: 200,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phina.asset.AssetManager.get("shader", "effectSprites"))
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
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceAlpha"
        )
        .setUniforms(
          "vMatrix",
          "pMatrix",
          "texture",
          "globalScale"
        );

      var instanceStride = this.instanceStride / 4;

      this.uniforms.vMatrix.setValue(
        mat4.lookAt(mat4.create(), [w / 2, h * 0.5, w * 1.5], [w / 2, h / 2, 0], [0, 1, 0])
      );
      this.uniforms.pMatrix.setValue(
        mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000)
      );
      this.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, this._createTexture()));
      this.uniforms.globalScale.setValue(1.0);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // visible
          0,
          // position
          0, 0,
          // rotation
          0,
          // scale
          1,
          // frame
          0, 0,
          // alpha
          0
        );
      }
      this.setInstanceAttributeData(instanceData);

      var self = this;
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Effect(id, instanceData, instanceStride)
          .on("removed", function() {
            self.pool.push(this);
          });
      });
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

    get: function() {
      return this.pool.shift();
    },

    update: function() {
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);

      this.uniforms.globalScale.value = 1.0;
      this.draw(this._count);
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

    terrain: null,
    itemDrawer: null,
    effectSprites: null,
    bulletSprites: null,
    playerDrawer: null,
    enemyDrawer: null,

    glowEffect: null,

    framebufferNormal: null,
    framebufferBlur: null,

    ppZoomBlur: null,
    ppCopy: null,

    zoomCenterX: 0,
    zoomCenterY: 0,
    zoomStrength: 0,
    zoomAlpha: 0,

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.originX = 0;
      this.originY = 0;

      this.domElement = document.createElement("canvas");
      this.domElement.width = this.width * glb.GLLayer.quality;
      this.domElement.height = this.height * glb.GLLayer.quality;

      this.gl = this.domElement.getContext("webgl");
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      this.gl.clearDepth(1.0);
    },

    start: function() {
      var gl = this.gl;
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(gl);

      var cw = this.domElement.width;
      var ch = this.domElement.height;
      var w = this.width;
      var h = this.height;
      var sw = Math.pow(2, ~~Math.log2(cw) + 1);
      var sh = Math.pow(2, ~~Math.log2(ch) + 1);
      var q = glb.GLLayer.quality;

      this.terrain = glb.Terrain(gl, extInstancedArrays, w, h);
      this.itemDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, w, h);
      this.enemyDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.playerDrawer = glb.ObjDrawer(gl, extInstancedArrays, w, h);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, w, h);

      this.glowEffect = glb.GlowEffect(gl, cw, ch);

      this.framebufferNormal = phigl.Framebuffer(gl, sw, sh);
      this.framebufferBlur = phigl.Framebuffer(gl, sw, sh);

      this.ppZoomBlur = glb.PostProcessing(gl, cw, ch, "effect_zoom", ["canvasSize", "center", "strength"]);
      this.ppCopy = glb.PostProcessing(gl, cw, ch, "effect_copy", ["alpha"]);

      this.setupTerrain();
    },

    setupTerrain: function() {
      var self = this;
      var countX = glb.Terrain.countX;
      var countZ = glb.Terrain.countZ;
      var unit = glb.Terrain.unit;
      Array.range(-countX, countX).forEach(function(x) {
        Array.range(-countZ, countZ).forEach(function(z) {
          var hex = self.terrain.get();
          if (hex) {
            hex
              .spawn({
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

      this.ready = true;
    },

    update: function(app) {
      if (!this.ready) return;

      this.terrain.update(app);
      this.itemDrawer.update(app);
      this.effectSprites.update(app);
      this.enemyDrawer.update(app);
      this.playerDrawer.update(app);
      this.bulletSprites.update(app);
      
      if (app.ticker.frame % 100 === 0) {
        this.startZoom(Math.random() * SCREEN_WIDTH, Math.random() * SCREEN_HEIGHT);
      }
    },

    draw: function(canvas) {
      if (!this.ready) return;

      var gl = this.gl;
      var image = this.domElement;
      var cw = image.width;
      var ch = image.height;

      this.glowEffect.bindCurrent();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.playerDrawer.renderGlow();
      this.enemyDrawer.renderGlow();
      this.glowEffect.renderBefore();
      gl.flush();

      this.framebufferNormal.bind();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
      this.itemDrawer.render();
      this.effectSprites.render();
      this.enemyDrawer.render();
      this.playerDrawer.render();
      this.glowEffect.renderCurrent();
      this.bulletSprites.render();
      gl.flush();

      this.framebufferBlur.bind();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.ppZoomBlur.render(this.framebufferNormal.texture, {
        center: this.ppZoomBlur.viewCoordToShaderCoord(this.zoomCenterX, this.zoomCenterY),
        strength: this.zoomStrength,
      });
      gl.flush();

      phigl.Framebuffer.unbind(gl);
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.ppCopy.render(this.framebufferNormal.texture, {
        alpha: 1.0 - this.zoomAlpha,
      });
      this.ppCopy.render(this.framebufferBlur.texture, {
        alpha: this.zoomAlpha,
      });
      gl.flush();

      canvas.context.drawImage(image, 0, 0, cw, ch, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      this.glowEffect.switchFramebuffer();
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
          zoomStrength: 30,
          zoomAlpha: 0,
        }, 40, "easeOutQuad");
    },

    _static: {
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
        .setUniforms("texture", "alpha", "canvasSize");

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
      this.drawer.uniforms.alpha.value = 0.2;
      this.drawer.uniforms.canvasSize.value = this.current.width;
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

  phina.define("glb.LoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(gl) {
      this.superInit();
      this.gl = gl;
      this.totalCount = 0;
      this.count = 0;

      this.one("enter", function() {
        this.load();
      });
    },

    onprogress: function() {
      this.count += 1;
      
      // TODO
      console.log(this.count + "/" + this.totalCount);
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
        Object.keys(manager.assets["image"]).length;

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

          var vbo = phigl.Vbo(gl).set(attrData);
          var ibo = phigl.Ibo(gl).set(Array.range(attrData.length / 8));
          var edgesVbo = phigl.Vbo(gl).set(edgeData);
          var edgesIbo = phigl.Ibo(gl).set(Array.range(edgeData.length / 3));

          manager.set("vbo", key, vbo);
          manager.set("ibo", key, ibo);
          manager.set("edgesVbo", key, edgesVbo);
          manager.set("edgesIbo", key, edgesIbo);

          self.flare("progress");
          resolve();
        });

        flows.push(flow);
      });

      manager.assets["image"].forIn(function(key, image) {
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

    deleteAll: function() {
      var manager = phina.asset.AssetManager;
      manager.assets.vbo.forIn(function(key, vbo) {
        vbo.delete();
      });
      manager.assets.ibo.forIn(function(key, ibo) {
        ibo.delete();
      });
      manager.assets.texture.forIn(function(key, texture) {
        texture.delete();
      });

      manager.assets.vbo = {};
      manager.assets.ibo = {};
      manager.assets.texture = {};

      return this;
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Obj", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    position: null,
    quaternion: null,
    scale: null,
    matrix: null,

    dirty: true,

    init: function(id, instanceData, instanceStride, objType) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
      this.objType = objType;

      this.position = vec3.create();
      this.quaternion = quat.create();
      this.scale = vec3.create();
      this.matrix = mat4.create();
    },

    spawn: function(options) {
      var index = this.index;
      var instanceData = this.instanceData;
      this.age = 0;

      this.x = options.x;
      this.y = options.y;
      this.z = options.z;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.scaleZ = options.scaleZ;

      quat.identity(this.quaternion);
      quat.rotateZ(this.quaternion, this.quaternion, options.rotZ);
      quat.rotateY(this.quaternion, this.quaternion, options.rotY);
      quat.rotateX(this.quaternion, this.quaternion, options.rotX);

      instanceData[index + 0] = 1;

      this.dirty = true;
      this.update();

      return this;
    },
    
    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

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

      var trigons = [];
      obj.faces.forEach(function(face) {
        for (var i = 1; i < face.length - 1; i++) {
          trigons.push(face[0]);
          trigons.push(face[i + 0]);
          trigons.push(face[i + 1]);
        }
      });

      return trigons.map(function(vertex, i) {
        var p = obj.positions[vertex.position - 1];
        var t = obj.texCoords[vertex.texCoord - 1];
        var n = obj.normals[vertex.normal - 1];
        return [
          // position
          p.x, p.y, p.z,
          // texCoord
          t.u, 1.0 - t.v,
          // normal
          n.x, n.y, n.z
        ];
      }).flatten();
    },

    getAttributeDataEdges: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      var hashes = [];
      var result = [];

      return obj.faces
        .map(function(face) {
          var lines = [];
          for (var i = 0; i < face.length - 1; i++) {
            lines.push([face[i + 0].position, face[i + 1].position]);
          }
          lines.push([face.last.position, face.first.position]);
          return lines;
        })
        .flatten(1)
        .uniq(function(lhs, rhs) {
          return lhs[0] === rhs[0] && lhs[1] === rhs[1];
        })
        .map(function(edge) {
          var p0 = obj.positions[edge[0] - 1];
          var p1 = obj.positions[edge[1] - 1];
          return [
            [p0.x, p0.y, p0.z],
            [p1.x, p1.y, p1.z],
          ];
        })
        .flatten();
    },
  });

  phina.asset.AssetLoader.assetLoadFunctions["obj"] = function(key, path) {
    var shader = glb.ObjAsset();
    return shader.load({
      path: path,
    });
  };

  var hash = function(p0, p1) {
    var result = 1;
    var prime = 2411;
    result = prime * result + p0;
    result = prime * result + p1;
    return "" + result;
  };

});

phina.namespace(function() {

  phina.define("glb.ObjDrawer", {

    gl: null,

    objTypes: null,

    counts: null,
    instanceData: null,
    ibos: null,
    vbos: null,
    textures: null,
    pools: null,

    faceDrawer: null,

    cameraPosition: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;

      this.objTypes = [];

      this.counts = {};
      this.instanceData = {};
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
          "instanceMatrix3"
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
          "instanceMatrix3"
        )
        .setUniforms(
          "vpMatrix",
          "texture"
        );

      this.cameraPosition = vec3.set(vec3.create(), w / 2, h * 0.5, w * 1.5);
      this.vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [w / 2, h / 2, 0], [0, 1, 0]);
      this.pMatrix = mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000);
      this.vpMatrix = mat4.create();
      this.lightDirection = vec3.set(vec3.create(), -1.0, 0.0, -1.0);
      this.diffuseColor = [0.9, 0.9, 0.9, 1.0];
      this.ambientColor = [0.4, 0.4, 0.4, 1.0];
    },

    addObjType: function(objType, count) {
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
          ];
        }).flatten();
        this.ibos[objType] = phina.asset.AssetManager.get("ibo", objType + ".obj");
        this.vbos[objType] = phina.asset.AssetManager.get("vbo", objType + ".obj");
        this.textures[objType] = phina.asset.AssetManager.get("texture", objType + ".png");
        this.pools[objType] = Array.range(count).map(function(id) {
          return glb.Obj(id, instanceData, instanceStride, objType)
            .on("removed", function() {
              self.pools[this.objType].push(this);
            });
        });

        this.objTypes.push(objType);
      }
    },

    get: function(objType) {
      return this.pools[objType].shift();
    },

    update: function(app) {
      mat4.mul(this.vpMatrix, this.pMatrix, this.vMatrix);
      vec3.normalize(this.lightDirection, this.lightDirection);
    },

    render: function() {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.uniforms.vpMatrix.value = this.vpMatrix;
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;
      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.diffuseColor.value = this.diffuseColor;
      this.faceDrawer.uniforms.ambientColor.value = this.ambientColor;

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        self.faceDrawer
          .setIndexBuffer(ibo)
          .setAttributeVbo(vbo)
          .setInstanceAttributeData(instanceData);
        self.faceDrawer.uniforms.texture.setValue(0).setTexture(texture);
        self.faceDrawer.draw(count);
      });
    },

    renderGlow: function() {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.glowDrawer.uniforms.vpMatrix.value = this.vpMatrix;

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        self.glowDrawer
          .setIndexBuffer(ibo)
          .setAttributeVbo(vbo)
          .setInstanceAttributeData(instanceData);
        self.glowDrawer.uniforms.texture.setValue(0).setTexture(texture);
        self.glowDrawer.draw(count);
      });
    },

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

    render: function(texture, uniformValues) {
      var gl = this.gl;

      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      this.drawer.uniforms.texture.setValue(0).setTexture(texture);
      this.drawer.uniforms.canvasSize.value = [this.sw, this.sh];
      this.setUniforms(uniformValues);
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
      return [x * q / this.sw, (SCREEN_HEIGHT - y * q) / this.sh];
    },

  });

});

phina.namespace(function() {

  phina.define("glb.Terrain", {

    gl: null,
    faceDrawer: null,
    edgeDrawer: null,

    instanceData: null,
    pool: null,
    count: 0,

    cameraPosition: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;
      this.count = (glb.Terrain.countX * 2) * (glb.Terrain.countZ * 2);
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
          0, 0, 0
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
          "instanceMatrix3"
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
          "instanceMatrix3"
        )
        .setUniforms(
          "vpMatrix",
          "cameraPosition",
          "color"
        );

      var instanceStride = this.edgeDrawer.instanceStride / 4;

      this.cameraPosition = vec3.create();
      vec3.set(this.cameraPosition, 6, 20, 20);
      var vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [0, 0, 0], [0, 1, 0]);
      var pMatrix = mat4.perspective(mat4.create(), 45, w / h, 0.1, 10000);
      this.faceDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;
      this.edgeDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.edgeDrawer.uniforms.cameraPosition.value = this.cameraPosition;

      this.lightDirection = vec3.set(vec3.create(), 2, 0.5, 0);
      this.faceDrawer.uniforms.lightDirection.value = vec3.normalize(vec3.create(), this.lightDirection);
      this.faceDrawer.uniforms.diffuseColor.value = [0.22, 0.22, 0.22 * 1.6, 0.65];
      this.faceDrawer.uniforms.ambientColor.value = [0.05, 0.05, 0.05, 1.0];
      this.edgeDrawer.uniforms.color.value = [0.5, 0.5, 0.5 * 1.2, 1.0];

      var self = this;
      this.pool = Array.range(0, this.count).map(function(id) {
        return glb.Obj(id, instanceData, instanceStride)
          .on("enterframe", function() {
            this.x += self.cameraPosition[0] * 0.025;
            this.z += self.cameraPosition[2] * 0.025;

            var countX = glb.Terrain.countX;
            var countZ = glb.Terrain.countZ;
            var unit = glb.Terrain.unit;
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
      var f = app.ticker.frame * 0.001;
      this.lightDirection = vec3.set(this.lightDirection, Math.cos(f * 5) * 1, 0.5, Math.sin(f * 5) * 1);
      vec3.normalize(this.lightDirection, this.lightDirection);
      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);
    },

    get: function() {
      return this.pool.shift();
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.cullFace(gl.FRONT);

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
