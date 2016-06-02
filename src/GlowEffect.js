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
