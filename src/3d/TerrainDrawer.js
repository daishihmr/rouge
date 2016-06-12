phina.namespace(function() {

  phina.define("glb.TerrainDrawer", {

    gl: null,
    faceDrawer: null,
    edgeDrawer: null,

    instanceData: null,
    pool: null,
    count: 0,

    init: function(gl, ext, w, h) {
      this.gl = gl;
      this.count = (glb.TerrainDrawer.countX * 2) * (glb.TerrainDrawer.countZ * 2);
      this.faceDrawer = phigl.InstancedDrawable(gl, ext);
      this.edgeDrawer = phigl.InstancedDrawable(gl, ext);
      var instanceData = this.instanceData = [];
      for (var i = 0; i < this.count; i++) {
        instanceData.push(
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
          1
        );
      }

      this.faceDrawer
        .setProgram(phina.asset.AssetManager.get("shader", "terrain"))
        .setIndexBuffer(phina.asset.AssetManager.get("ibo", "hex.obj"))
        .setAttributes("position", "uv", "normal")
        .setAttributeVbo(phina.asset.AssetManager.get("vbo", "hex.obj"))
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
          "cameraPosition"
        );

      this.edgeDrawer
        .setDrawMode(gl.LINES)
        .setProgram(phina.asset.AssetManager.get("shader", "terrainEdge"))
        .setIndexBuffer(phina.asset.AssetManager.get("edgesIbo", "hex.obj"))
        .setAttributes("position")
        .setAttributeVbo(phina.asset.AssetManager.get("edgesVbo", "hex.obj"))
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
          "cameraPosition",
          "color"
        );

      var instanceStride = this.edgeDrawer.instanceStride / 4;

      this.lightDirection = vec3.set(vec3.create(), -1, -0.5, 0);
      vec3.normalize(this.lightDirection, this.lightDirection);
      // this.faceDrawer.uniforms.diffuseColor.value = [0.22, 0.22, 0.22 * 2.6, 0.75];

      var self = this;
      this.pool = Array.range(0, this.count).map(function(id) {
        return glb.Obj(id, instanceData, instanceStride)
          .on("enterframe", function() {
            // 地形の流れる方向
            this.x += 6 * 0.01;
            this.z += 20 * 0.01;

            var countX = glb.TerrainDrawer.countX;
            var countZ = glb.TerrainDrawer.countZ;
            var unit = glb.TerrainDrawer.unit;
            if (this.x < -countX * unit) this.x += countX * unit * 2;
            else if (countX * unit < this.x) this.x -= countX * unit * 2;
            if (this.z < -countZ * unit * 1 / Math.sqrt(3) * 1.5) this.z += countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
            else if (countZ * unit * 1 / Math.sqrt(3) * 1.5 < this.z) this.z -= countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
          })
          .on("removed", function() {
            self.pool.push(this);
          });
      });

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);
    },

    update: function(app) {
      var f = app.ticker.frame * 0.003;
    },

    get: function() {
      return this.pool.shift();
    },

    render: function(uniforms) {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);

      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.ambientColor.value = [0.05, 0.05, 0.05, 0.7];
      this.edgeDrawer.uniforms.color.value = [1.0, 1.0, 1.0, 1.0];

      if (uniforms) {
        uniforms.forIn(function(key, value) {
          if (this.edgeDrawer.uniforms[key]) this.edgeDrawer.uniforms[key].value = value;
          if (this.faceDrawer.uniforms[key]) this.faceDrawer.uniforms[key].value = value;
        }.bind(this));
      }

      this.edgeDrawer.draw(this.count);
      this.faceDrawer.draw(this.count);
    },

    _static: {
      countX: 12,
      countZ: 22,
      unit: 2.05,
    },
  });

});
