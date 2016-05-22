phina.namespace(function() {

  phina.define("glb.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,

    domElement: null,
    gl: null,
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

      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);
    },

    getEffect: function() {
      return this.effectSprites.pool.shift();
    },

    getBullet: function() {
      return this.bulletSprites.pool.shift();
    },

    update: function(app) {
      this.effectSprites.update(app);
      this.bulletSprites.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.effectSprites.render();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);
      
      // this.draw = function(){};
    },

  });

});
