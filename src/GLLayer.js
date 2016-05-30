phina.namespace(function() {
  phina.define("glb.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,

    domElement: null,
    gl: null,
    terrain: null,
    effectSprites: null,
    bulletSprites: null,

    init: function() {
      this.superInit({
        width: 720,
        height: 1280,
      });
      this.originX = 0;
      this.originY = 0;

      this.domElement = document.createElement("canvas");
      this.domElement.width = this.width * glb.GLLayer.quality;
      this.domElement.height = this.height * glb.GLLayer.quality;

      this.gl = this.domElement.getContext("webgl");
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(this.gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(this.gl);

      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      this.terrain = glb.Terrain(gl, extInstancedArrays, this.width, this.height);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);
      this.enemies = glb.EnemiesDrawer(1, "enemyS1.obj", gl, extInstancedArrays, this.width, this.height);

      var self = this;
      var countX = glb.Terrain.countX;
      var countZ = glb.Terrain.countZ;
      var unit = glb.Terrain.unit;
      Array.range(-countX, countX).forEach(function(x) {
        Array.range(-countZ, countZ).forEach(function(z) {
          var hex = self.getHex();
          if (hex) {
            hex
              .spawn({
                x: x * unit + z % 2,
                y: Math.random() < 0.04 ? 5 : 0,
                z: z * unit * 1 / Math.sqrt(3) * 1.5,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                scaleX: 1.1,
                scaleY: 1.1,
                scaleZ: 1.1,
              })
              .addChildTo(self);
          }
        });
      });
    },

    getHex: function() {
      return this.terrain.get();
    },

    getEffect: function() {
      return this.effectSprites.get();
    },

    getBullet: function() {
      return this.bulletSprites.get();
    },

    update: function(app) {
      this.terrain.update(app);
      this.effectSprites.update(app);
      this.bulletSprites.update(app);
      this.enemies.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
      this.enemies.render();
      this.effectSprites.render();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      // this.draw = function(){};
    },

    _static: {
      quality: 0.5,
    },
  });

});
