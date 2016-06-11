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
