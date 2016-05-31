phina.namespace(function() {

  phina.define("glb.ObjDrawer", {

    gl: null,
    count: 0,

    objTypes: null,

    instanceData: null,
    ibos: null,
    vbos: null,
    textures: null,
    pools: null,

    faceDrawer: null,

    cameraPosition: null,

    init: function(gl, ext, w, h) {
      this.gl = gl;
      this.count = 500;

      this.objTypes = [];

      this.instanceData = {};
      this.ibos = {};
      this.vbos = {};
      this.textures = {};
      this.pools = {};

      this.faceDrawer = phigl.InstancedDrawable(gl, ext);
      this.faceDrawer
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

      var instanceStride = this.faceDrawer.instanceStride / 4;

      this.cameraPosition = vec3.create();
      vec3.set(this.cameraPosition, w / 2, h * 0.75, w * 1.5);
      var vMatrix = mat4.lookAt(mat4.create(), this.cameraPosition, [w / 2, h / 2, 0], [0, 1, 0]);
      var pMatrix = mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000);
      this.faceDrawer.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.faceDrawer.uniforms.cameraPosition.value = this.cameraPosition;

      this.lightDirection = vec3.set(vec3.create(), -1.0, 0.0, -1.0);
      this.faceDrawer.uniforms.lightDirection.value = vec3.normalize(this.lightDirection, this.lightDirection);
      this.faceDrawer.uniforms.diffuseColor.value = [0.9, 0.9, 0.9, 1.0];
      this.faceDrawer.uniforms.ambientColor.value = [0.4, 0.4, 0.4, 1.0];
    },

    addObjType: function(objType) {
      var self = this;
      var instanceStride = this.faceDrawer.instanceStride / 4;

      if (!this.objTypes.contains(objType)) {
        var instanceData = this.instanceData[objType] = Array.range(this.count).map(function(i) {
          return [
            // visible
            0,
            // m0
            1, 0, 0, 0,
            // m1
            0, 1, 0, 0,
            // m2
            0, 0, 1, 0,
            // m3
            0, 0, 0, 1
          ];
        }).flatten();
        this.ibos[objType] = phina.asset.AssetManager.get("ibo", objType + ".obj");
        this.vbos[objType] = phina.asset.AssetManager.get("vbo", objType + ".obj");
        this.textures[objType] = phina.asset.AssetManager.get("texture", objType + ".png");
        this.pools[objType] = Array.range(this.count).map(function(id) {
          return glb.Obj(id, instanceData, instanceStride)
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
      // var f = app.ticker.frame * 0.01;
      // this.lightDirection = vec3.set(this.lightDirection, Math.cos(f) * 2, -0.25, Math.sin(f) * 2);
      // vec3.normalize(this.lightDirection, this.lightDirection);
      // this.uniforms.lightDirection.value = this.lightDirection;

      // this.objTypes.forEach(function(objType) {
      //   var instanceData = self.instanceData[objType];
      //   self.faceDrawer.setInstanceAttributeData(instanceData);
      // });
    },

    render: function() {
      var self = this;
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.objTypes.forEach(function(objType) {
        var instanceData = self.instanceData[objType];
        var ibo = self.ibos[objType];
        var vbo = self.vbos[objType];
        var texture = self.textures[objType];
        
        self.faceDrawer
          .setIbo(ibo)
          .setAttributeVbo(vbo)
          .setInstanceAttributeData(instanceData);
        self.faceDrawer.uniforms.texture.setValue(0).setTexture(texture);
        self.faceDrawer.draw(self.count);
      });
    },
  });

});
