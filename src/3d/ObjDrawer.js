phina.namespace(function() {

  phina.define("glb.ObjDrawer", {

    gl: null,

    objTypes: null,

    counts: null,
    instanceData: null,
    instanceVbo: null,
    ibos: null,
    vbos: null,
    textures: null,
    pools: null,

    faceDrawer: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;

      this.objTypes = [];

      this.counts = {};
      this.instanceData = {};
      this.instanceVbo = {};
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
          "instanceMatrix3",
          "instanceAlpha"
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
          "instanceMatrix3",
          "instanceAlpha"
        )
        .setUniforms(
          "vpMatrix",
          "texture"
        );

      this.lightDirection = vec3.set(vec3.create(), 1, -0.5, 0);
      vec3.normalize(this.lightDirection, this.lightDirection);
      // this.diffuseColor = [0.6, 0.6, 0.6, 1.0];
      // this.ambientColor = [0.6, 0.6, 0.6, 1.0];

      this.diffuseColor = [0.5, 0.5, 0.5, 1.0];
      this.ambientColor = [0.5, 0.5, 0.5, 1.0];
    },

    addObjType: function(objType, objAssetName, count, className) {
      className = className || "glb.Obj";

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
            // alpha
            1,
          ];
        }).flatten();
        this.instanceVbo[objType] = phigl.Vbo(this.gl, this.gl.DYNAMIC_DRAW).set(instanceData);
        this.ibos[objType] = phina.asset.AssetManager.get("ibo", objAssetName + ".obj");
        this.vbos[objType] = phina.asset.AssetManager.get("vbo", objAssetName + ".obj");
        this.textures[objType] = phina.asset.AssetManager.get("texture", objAssetName + ".png");

        var ObjClass = phina.using(className);
        this.pools[objType] = Array.range(count).map(function(id) {
          return ObjClass(id, instanceData, instanceStride)
            .on("removed", function() {
              self.pools[objType].push(this);
            });
        });

        this.objTypes.push(objType);
      }
    },

    get: function(objType) {
      return this.pools[objType].shift();
    },

    update: function(app) {
    },

    render: function(uniforms) {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.diffuseColor.value = this.diffuseColor;
      this.faceDrawer.uniforms.ambientColor.value = this.ambientColor;

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.faceDrawer.uniforms[key]) this.faceDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var instanceVbo = self.instanceVbo[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        try {
          instanceVbo.set(instanceData);
          self.faceDrawer
            .setIndexBuffer(ibo)
            .setAttributeVbo(vbo)
            .setInstanceAttributeVbo(instanceVbo);
          self.faceDrawer.uniforms.texture.setValue(0).setTexture(texture);
          self.faceDrawer.draw(count);
        } catch (e) {
          console.error("obj draw error", objType, instanceData.length);
          throw e;
        }
      });
    },

    renderGlow: function(uniforms) {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.glowDrawer.uniforms[key]) this.glowDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var instanceVbo = self.instanceVbo[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        try {
          instanceVbo.set(instanceData);
          self.glowDrawer
            .setIndexBuffer(ibo)
            .setAttributeVbo(vbo)
            .setInstanceAttributeVbo(instanceVbo);
          self.glowDrawer.uniforms.texture.setValue(0).setTexture(texture);
          self.glowDrawer.draw(count);
        } catch (e) {
          console.error("obj-glow draw error", objType, instanceData.length);
          throw e;
        }
      });
    },

  });

});
