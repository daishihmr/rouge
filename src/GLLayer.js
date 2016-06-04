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
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

      this.orthoCamera = glb.Camera()
        .setPosition(w / 2, h * 0.5, w * 1.5)
        .lookAt(w / 2, h / 2, 0)
        .ortho(-w / 2, w / 2, h / 2, -h / 2, 0.1, 3000)
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
      this.bulletDrawer = glb.BulletSprites(gl, extInstancedArrays, w, h);

      this.framebufferGlow = phigl.Framebuffer(gl, sw, sh);
      this.framebufferGlowBlur1 = phigl.Framebuffer(gl, sw, sh);
      this.framebufferGlowBlur2 = phigl.Framebuffer(gl, sw, sh);
      this.framebufferMain = phigl.Framebuffer(gl, sw, sh);
      this.framebufferZoom = phigl.Framebuffer(gl, sw, sh);

      this.ppZoom = glb.PostProcessing(gl, cw, ch, "effect_zoom", ["canvasSize", "center", "strength"]);
      this.ppCopy = glb.PostProcessing(gl, cw, ch, "effect_copy", ["alpha"]);
      this.ppBlur = glb.PostProcessing(gl, cw, ch, "effect_blur");

      this.setupTerrain();
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

      this.framebufferGlow.bind();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.enemyDrawer.renderGlow(this.orthoCamera.uniformValues());
      this.playerDrawer.renderGlow(this.orthoCamera.uniformValues());
      gl.flush();

      this.framebufferGlowBlur1.bind();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.ppCopy.render(this.framebufferGlowBlur2.texture, { alpha: 0.7 }, true);
      for (var i = 0; i < 3; i++) {
        this.ppBlur.render(this.framebufferGlow.texture, null, true);
      }
      gl.flush();

      this.framebufferMain.bind();
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render({
        diffuseColor: [0.12, 0.12, 0.12 * 2.6, 0.75],
      }.$extend(this.perseCamera.uniformValues()));
      this.itemDrawer.render(this.orthoCamera.uniformValues());
      this.enemyDrawer.render({
        diffuseColor: [1.0, 1.0, 1.0, 1.0],
      }.$extend(this.orthoCamera.uniformValues()));
      this.spriteDrawer.render(this.orthoCamera.uniformValues());
      this.playerDrawer.render(this.orthoCamera.uniformValues());
      this.ppCopy.render(this.framebufferGlowBlur1.texture, null, true);
      this.bulletDrawer.render(this.orthoCamera.uniformValues());
      gl.flush();

      if (this.zoomStrength > 0 && this.zoomAlpha > 0) {
        this.framebufferZoom.bind();
        gl.viewport(0, 0, cw, ch);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.ppZoom.render(this.framebufferMain.texture, {
          center: this.ppZoom.viewCoordToShaderCoord(this.zoomCenterX, this.zoomCenterY),
          strength: this.zoomStrength,
        });
        gl.flush();
      }

      phigl.Framebuffer.unbind(gl);
      gl.viewport(0, 0, cw, ch);
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

      var temp = this.framebufferGlowBlur1;
      this.framebufferGlowBlur1 = this.framebufferGlowBlur2;
      this.framebufferGlowBlur2 = temp;
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
        }, 20, "easeOutQuad");
    },

    _static: {
      quality: 1.0,
    },
  });

});
