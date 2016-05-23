phina.namespace(function() {

  phina.define("glb.BulletSprites", {
    superClass: "phigl.InstancedDrawable",
    
    instanceData: null,
    pool: null,
    _count: 1000,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phigl.Program(gl).attach("bulletSprites.vs").attach("bulletSprites.fs").link())
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
            0, 32 / 256,
            //
            32 / 256, 32 / 256,
            //
            0, 0,
            //
            32 / 256, 0,
          ]
        }, ])
        .setInstanceAttributes(
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceVisible",
          "instanceBrightness",
          "instanceAuraColor"
        )
        .setUniforms(
          "vMatrix",
          "pMatrix",
          "texture",
          "globalScale"
        );
      
      var instanceStride = this.instanceStride / 4;
        
      this.uniforms.vMatrix.setValue(
        mat4.lookAt(mat4.create(), [w / 2, h / 2, 1000], [w / 2, h / 2, 0], [0, 1, 0])
      );
      this.uniforms.pMatrix.setValue(
        mat4.ortho(mat4.create(), -w / 2, w / 2, h / 2, -h / 2, 0.1, 3000)
      );
      this.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, "bullets.png"));
      this.uniforms.globalScale.setValue(1.0);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // position
          0, 0,
          // rotation
          0,
          // scale
          1,
          // frame
          0, 0,
          // visible
          0,
          // brightness
          0,
          // auraColor
          0, 0, 0
        );
      }
      this.setInstanceAttributeData(instanceData);

      var self = this;
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Bullet(id, instanceData, instanceStride)
          .on("removed", function() {
            self.pool.push(this);
            instanceData[this.id * instanceStride + 6] = 0;
          });
      });
      
      console.log(this);
    },
    
    update: function() {
      this.setInstanceAttributeData(this.instanceData);
    },
    
    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.DEPTH_TEST);
      
      this.uniforms.globalScale.value = 1.0;
      // console.log("bullet draw");
      this.draw(this._count);
    },
  });

});
