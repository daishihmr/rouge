phina.namespace(function() {

  phina.define("glb.ObjDrawer", {

    gl: null,

    objTypes: null,

    counts: null,
    instanceData: null,
    ibos: null,
    vbos: null,
    textures: null,
    pools: null,

    faceDrawer: null,

    cameraPosition: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;

      this.objTypes = [];

      this.counts = {};
      this.instanceData = {};
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
          "instanceMatrix3"
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
          "instanceMatrix3"
        )
        .setUniforms(
          "vpMatrix",
          "texture"
        );

      this.cameraPosition = vec3.set(vec3.create(), w / 2, h * 0.5, w * 1.5);
      this.vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [w / 2, h / 2, 0], [0, 1, 0]);
      this.pMatrix = mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000);
      this.vpMatrix = mat4.create();
      this.lightDirection = vec3.set(vec3.create(), -1.0, 0.0, -1.0);
      this.diffuseColor = [0.9, 0.9, 0.9, 1.0];
      this.ambientColor = [0.4, 0.4, 0.4, 1.0];
    },

    addObjType: function(objType, count) {
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
          ];
        }).flatten();
        this.ibos[objType] = phina.asset.AssetManager.get("ibo", objType + ".obj");
        this.vbos[objType] = phina.asset.AssetManager.get("vbo", objType + ".obj");
        this.textures[objType] = phina.asset.AssetManager.get("texture", objType + ".png");
        this.pools[objType] = Array.range(count).map(function(id) {
          return glb.Obj(id, instanceData, instanceStride, objType)
            .on("removed", function() {
              self.pools[this.objType].push(this);
            });
        });

        this.objTypes.push(objType);
      }
    },

    get: function(objType) {
      return this.pools[objType].shift();
    },

    update: function(app) {
      mat4.mul(this.vpMatrix, this.pMatrix, this.vMatrix);
      vec3.normalize(this.lightDirection, this.lightDirection);
    },

    render: function() {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.faceDrawer.uniforms.vpMatrix.value = this.vpMatrix;
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;
      this.faceDrawer.uniforms.lightDirection.value = this.lightDirection;
      this.faceDrawer.uniforms.diffuseColor.value = this.diffuseColor;
      this.faceDrawer.uniforms.ambientColor.value = this.ambientColor;

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        self.faceDrawer
          .setIndexBuffer(ibo)
          .setAttributeVbo(vbo)
          .setInstanceAttributeData(instanceData);
        self.faceDrawer.uniforms.texture.setValue(0).setTexture(texture);
        self.faceDrawer.draw(count);
      });
    },

    renderGlow: function() {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.glowDrawer.uniforms.vpMatrix.value = this.vpMatrix;

      this.objTypes.forEach(function(objType) {
        var count = self.counts[objType];
        var instanceData = self.instanceData[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];

        self.glowDrawer
          .setIndexBuffer(ibo)
          .setAttributeVbo(vbo)
          .setInstanceAttributeData(instanceData);
        self.glowDrawer.uniforms.texture.setValue(0).setTexture(texture);
        self.glowDrawer.draw(count);
      });
    },

  });

});
