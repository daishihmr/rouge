phina.namespace(function() {

  phina.define("glb.LoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(gl) {
      this.superInit();
      this.gl = gl;
    },

    load: function() {
      var gl = this.gl;
      var manager = phina.asset.AssetManager;

      manager.assets["obj"].forIn(function(key, obj) {
        manager.set("ibo", key, phigl.Ibo(gl, obj.getIndices()));
        manager.set("vbo", key, phigl.Vbo(gl, obj.getAttributeData()));
      });

      manager.assets["image"].forIn(function(key, image) {
        manager.set("texture", key, phigl.Texture(gl, image));
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
