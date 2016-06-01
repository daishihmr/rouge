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

      this.terrain = glb.Terrain(gl, extInstancedArrays, this.width, this.height);
      this.itemDrawer = glb.ObjDrawer(gl, extInstancedArrays, this.width, this.height);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.enemyDrawer = glb.ObjDrawer(gl, extInstancedArrays, this.width, this.height);
      this.playerDrawer = glb.ObjDrawer(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);
      
      this.glowEffect = glb.GlowEffect(gl, this.domElement.width, this.domElement.height);

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
    },

    draw: function(canvas) {
      if (!this.ready) return;

      var gl = this.gl;

      this.glowEffect.bindCurrent(0, 0, this.domElement.width, this.domElement.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.playerDrawer.renderGlow();
      this.enemyDrawer.renderGlow();
      this.glowEffect.renderBefore();
      gl.flush();

      phigl.Framebuffer.unbind(gl);
      gl.viewport(0, 0, this.domElement.width, this.domElement.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
      this.itemDrawer.render();
      // this.effectSprites.render();
      this.enemyDrawer.render();
      this.playerDrawer.render();
      this.glowEffect.renderCurrent();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      this.glowEffect.switchFramebuffer();
    },

    _static: {
      quality: 1.0,
    },
  });

});
