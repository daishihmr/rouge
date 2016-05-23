phina.namespace(function() {

  phina.define("glb.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,

    domElement: null,
    gl: null,
    terrain: null,
    effectSprites: null,
    bulletSprites: null,

    init: function(options) {
      options = options || {};
      this.superInit(options);
      this.originX = 0;
      this.originY = 0;

      this.domElement = document.createElement("canvas");
      this.domElement.width = this.width;
      this.domElement.height = this.height;

      this.gl = this.domElement.getContext("webgl");
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(this.gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(this.gl);

      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      this.terrain = glb.Terrain(gl, extInstancedArrays, this.width, this.height);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);

      var self = this;
      var unit = 1.8;
      Array.range(-5, 5).forEach(function(x) {
        Array.range(-10, 10).forEach(function(z) {
          var hex = self.getHex();
          if (hex) {
            hex
              .spawn({
                x: x * unit + z % 2,
                y: Math.randfloat(-1.2, 1.2),
                z: z * unit * 1 / Math.sqrt(3) * 1.5,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
              })
              .addChildTo(self);
          }
        });
      });
    },

    getHex: function() {
      return this.terrain.pool.shift();
    },

    getEffect: function() {
      return this.effectSprites.pool.shift();
    },

    getBullet: function() {
      return this.bulletSprites.pool.shift();
    },

    update: function(app) {
      this.terrain.update(app);
      this.effectSprites.update(app);
      this.bulletSprites.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
      this.effectSprites.render();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      // this.draw = function(){};
    },

  });

});
