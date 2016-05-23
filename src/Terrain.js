phina.namespace(function() {

  phina.define("glb.Terrain", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,
    pool: null,
    _count: 200,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);

      var obj = phina.asset.AssetManager.get("obj", "test.obj");

      this
        .setProgram(phigl.Program(gl).attach("terrain.vs").attach("terrain.fs").link())
        .setIndexValues(obj.getIndices("Cylinder"))
        .setAttributes("position", "uv", "normal")
        .setAttributeData(obj.getAttributeData("Cylinder"))
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
          "ambientColor"
        );

      var instanceStride = this.instanceStride / 4;

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

      this.uniforms.lightDirection.value = [1, 1, 1];
      this.uniforms.diffuseColor.value = [0.22 * 2, 0.22, 0.22, 1.0];
      this.uniforms.ambientColor.value = [0.02, 0.02, 0.02, 1.0];

      var vMatrix = mat4.lookAt(mat4.create(), [0, 20, 5], [0, 0, 0], [0, 1, 0]);
      var pMatrix = mat4.perspective(mat4.create(), 45, w / h, 0.1, 10000);
      this.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);

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

    update: function() {
      this.setInstanceAttributeData(this.instanceData);
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.draw(this._count);
    },
  });

});
