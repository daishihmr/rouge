phina.namespace(function() {

  phina.define("glb.Terrain", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,
    pool: null,
    _count: 0,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      var obj = phina.asset.AssetManager.get("obj", "hex.obj");

      this
        .setProgram(phigl.Program(gl).attach("terrain.vs").attach("terrain.fs").link())
        .setIndexValues(obj.getIndices())
        .setAttributes("position", "uv", "normal")
        .setAttributeData(obj.getAttributeData())
        .setInstanceAttributes(
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale"
        )
        .setUniforms(
          "vpMatrix",
          "lightDirection",
          "diffuseColor",
          "ambientColor",
          "eyeDirection"
        );

      var instanceStride = this.instanceStride / 4;

      this._count = (glb.Terrain.countX * 2) * (glb.Terrain.countZ * 2);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // visible
          0,
          // position
          0, 0, 0,
          // rotation
          0, 0, 0,
          // scale
          1, 1, 1
        );
      }
      this.setInstanceAttributeData(instanceData);

      this.lightDirection = vec3.set(vec3.create(), 1, -1, -1);
      this.uniforms.lightDirection.value = vec3.normalize(vec3.create(), this.lightDirection);
      this.uniforms.diffuseColor.value = [0.22, 0.22, 0.22 * 2, 1.0];
      this.uniforms.ambientColor.value = [0.10, 0.10, 0.10, 1.0];

      var vMatrix = mat4.lookAt(mat4.create(), [2, 30, 5], [0, 0, 0], [0, 1, 0]);
      var pMatrix = mat4.perspective(mat4.create(), 45, w / h, 0.1, 10000);
      this.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.uniforms.eyeDirection.value = [0, -30, -5];

      var self = this;
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Hex(id, instanceData, instanceStride)
          .on("removed", function() {
            self.pool.push(this);
            instanceData[this.id * instanceStride + 0] = 0;
          });
      });

      // console.log(this);
    },

    update: function(app) {
      var f = app.ticker.frame * 0.01;
      this.lightDirection = vec3.set(vec3.create(), Math.cos(f), -0.3, Math.sin(f));
      this.uniforms.lightDirection.value = vec3.normalize(vec3.create(), this.lightDirection);
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.draw(this._count);
    },

    _static: {
      countX: 10,
      countZ: 14,
      unit: 2.0,
    },
  });

});
