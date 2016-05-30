phina.namespace(function() {

  phina.define("glb.EnemiesDrawer", {

    gl: null,
    faceDrawer: null,
    // edgeDrawer: null,

    instanceData: null,
    pool: null,
    count: 0,

    cameraPosition: null,

    enemyTypes: [],

    init: function(count, objName, gl, ext, w, h) {
      this.gl = gl;
      this.count = count;
      this.faceDrawer = phigl.InstancedDrawable(gl, ext);
      // this.edgeDrawer = phigl.InstancedDrawable(gl, ext);
      var instanceData = this.instanceData = [];
      for (var i = 0; i < this.count; i++) {
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

      var obj = phina.asset.AssetManager.get("obj", objName);

      this.faceDrawer
        .setProgram(phigl.Program(gl).attach("obj.vs").attach("obj.fs").link())
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
          "cameraPosition"
        );

      // this.edgeDrawer
      //   .setDrawMode(gl.LINES)
      //   .setProgram(phigl.Program(gl).attach("objEdge.vs").attach("objEdge.fs").link())
      //   .setIndexValues(obj.getIndices())
      //   .setAttributes("position")
      //   .setAttributeData(obj.getAttributeDataEdges())
      //   .setInstanceAttributes(
      //     "instanceVisible",
      //     "instancePosition",
      //     "instanceRotation",
      //     "instanceScale"
      //   )
      //   .setUniforms(
      //     "vpMatrix",
      //     "cameraPosition",
      //     "color"
      //   );

      var instanceStride = this.faceDrawer.instanceStride / 4;

      this.cameraPosition = vec3.create();
      vec3.set(this.cameraPosition, w / 2, h * 0.75, w * 1.5);
      var vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [w / 2, h / 2, 0], [0, 1, 0]);
      var pMatrix = mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000);
      this.faceDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;
      // this.edgeDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      // this.edgeDrawer.uniforms.cameraPosition.value = this.cameraPosition;

      this.lightDirection = vec3.set(vec3.create(), 1, -1, -1);
      this.faceDrawer.uniforms.lightDirection.value = vec3.normalize(vec3.create(), this.lightDirection);
      this.faceDrawer.uniforms.diffuseColor.value = [0.4, 0.4, 0.4, 1.0];
      this.faceDrawer.uniforms.ambientColor.value = [0.4, 0.4, 0.4, 1.0];
      // this.edgeDrawer.uniforms.color.value = [1.0, 1.0, 1.0, 1.0];

      var self = this;
      this.pool = Array.range(0, this.count).map(function(id) {
        return glb.Obj(id, instanceData, instanceStride)
          .on("removed", function() {
            instanceData[this.index + 0] = 0;
            self.pool.push(this);
          });
      });

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      // this.edgeDrawer.setInstanceAttributeData(this.instanceData);

      // console.log(this);
    },

    update: function(app) {
      var f = app.ticker.frame * 0.01;
      // this.lightDirection = vec3.set(this.lightDirection, Math.cos(f) * 2, -0.25, Math.sin(f) * 2);
      // vec3.normalize(this.lightDirection, this.lightDirection);
      // this.uniforms.lightDirection.value = this.lightDirection;

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      // this.edgeDrawer.setInstanceAttributeData(this.instanceData);
    },

    get: function() {
      return this.pool.shift();
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.draw(this.count);
      // this.edgeDrawer.draw(this.count);
    },
  });

});
