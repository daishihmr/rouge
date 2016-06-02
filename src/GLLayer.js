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
