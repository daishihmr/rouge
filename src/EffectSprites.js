phina.namespace(function() {

  phina.define("glb.EffectSprites", {
    superClass: "phigl.InstancedDrawable",
    
    instanceData: null,
    pool: null,
    _count: 50000,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phigl.Program(gl).attach("effectSprites.vs").attach("effectSprites.fs").link())
        .setIndexValues([0, 1, 2, 1, 3, 2])
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
          "instanceVisible",
          "instancePosition",
          "instanceRotation",
          "instanceScale",
          "instanceFrame",
          "instanceAlpha"
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
      this.uniforms.texture.setValue(0).setTexture(phigl.Texture(gl, this._createTexture()));
      this.uniforms.globalScale.setValue(1.0);

      var instanceData = this.instanceData = [];
      for (var i = 0; i < this._count; i++) {
        instanceData.push(
          // visible
          0,
          // position
          0, 0,
          // rotation
          0,
          // scale
          1,
          // frame
          0, 0,
          // alpha
          0
        );
      }
      this.setInstanceAttributeData(instanceData);

      var self = this;
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Effect(id, instanceData, instanceStride)
          .on("removed", function() {
            self.pool.push(this);
            instanceData[this.id * instanceStride + 0] = 0;
          });
      });
      
      console.log(this);
    },
    
    _createTexture: function() {
      var texture = phina.graphics.Canvas().setSize(512, 512);
      var context = texture.context;
      var g = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0.0, "rgba(255, 255, 255, 0.1)");
      g.addColorStop(0.6, "rgba(255, 125,   0, 0.1)");
      g.addColorStop(1.0, "rgba(255,   0,   0, 0.0)");
      context.fillStyle = g;
      context.fillRect(0, 0, 64, 64);
      return texture;
    },
    
    update: function() {
      this.setInstanceAttributeData(this.instanceData);
    },
    
    render: function() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      
      this.uniforms.globalScale.value = 1.0;
      // console.log("effect draw");
      this.draw(this._count);
    },
  });

});
