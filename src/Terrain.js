phina.namespace(function() {

  phina.define("glb.Terrain", {

    gl: null,
    faceDrawer: null,
    edgeDrawer: null,

    instanceData: null,
    pool: null,
    count: 0,

    cameraPosition: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;
      this.count = (glb.Terrain.countX * 2) * (glb.Terrain.countZ * 2);
      this.faceDrawer = phigl.InstancedDrawable(gl, ext);
      this.edgeDrawer = phigl.InstancedDrawable(gl, ext);
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

      var obj = phina.asset.AssetManager.get("obj", "hex.obj");

      this.faceDrawer
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
          "cameraPosition"
        );

      this.edgeDrawer
        .setDrawMode(gl.LINES)
        .setProgram(phigl.Program(gl).attach("terrainEdge.vs").attach("terrainEdge.fs").link())
        .setIndexValues(obj.getIndices())
        .setAttributes("position")
        .setAttributeData(obj.getAttributeDataEdges())
        .setInstanceAttributes(
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale"
        )
        .setUniforms(
          "vpMatrix",
          "cameraPosition",
          "color"
        );

      var instanceStride = this.edgeDrawer.instanceStride / 4;

      this.cameraPosition = vec3.create();
      vec3.set(this.cameraPosition, 6, 20, 20);
      var vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [0, 0, 0], [0, 1, 0]);
      var pMatrix = mat4.perspective(mat4.create(), 45, w / h, 0.1, 10000);
      this.faceDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;
      this.edgeDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.edgeDrawer.uniforms.cameraPosition.value = this.cameraPosition;

      this.lightDirection = vec3.set(vec3.create(), 1, -1, -1);
      this.faceDrawer.uniforms.lightDirection.value = vec3.normalize(vec3.create(), this.lightDirection);
      this.faceDrawer.uniforms.diffuseColor.value = [0.22, 0.22, 0.22 * 2, 0.7];
      this.faceDrawer.uniforms.ambientColor.value = [0.10, 0.10, 0.10, 1.0];
      this.edgeDrawer.uniforms.color.value = [1.0, 1.0, 1.0, 1.0];

      var self = this;
      this.pool = Array.range(0, this.count).map(function(id) {
        return glb.Obj(id, instanceData, instanceStride)
          .on("enterframe", function() {
            this.x += self.cameraPosition[0] * 0.015;
            this.z += self.cameraPosition[2] * 0.015;

            var countX = glb.Terrain.countX;
            var countZ = glb.Terrain.countZ;
            var unit = glb.Terrain.unit;
            if (this.x < -countX * unit) this.x += countX * unit * 2;
            else if (countX * unit < this.x) this.x -= countX * unit * 2;
            if (this.z < -countZ * unit * 1 / Math.sqrt(3) * 1.5) this.z += countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
            else if (countZ * unit * 1 / Math.sqrt(3) * 1.5 < this.z) this.z -= countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
          })
          .on("removed", function() {
            instanceData[this.index + 0] = 0;
            self.pool.push(this);
          });
      });

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);

      // console.log(this);
    },

    update: function(app) {
      var f = app.ticker.frame * 0.001;
      this.lightDirection = vec3.set(this.lightDirection, Math.cos(f * 10) * 2, 1, Math.sin(f * 10) * 2);
      vec3.normalize(this.lightDirection, this.lightDirection);
      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;

      this.faceDrawer.setInstanceAttributeData(this.instanceData);
      this.edgeDrawer.setInstanceAttributeData(this.instanceData);
    },

    get: function() {
      return this.pool.shift();
    },

    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
