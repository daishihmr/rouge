phina.namespace(function() {

  phina.define("glb.Bullet", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,
    runner: null,

    x: 0,
    y: 0,
    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.instanceStride = instanceStride;
    },

    spawn: function(runner, option) {
      var id = this.id;
      var instanceData = this.instanceData;
      var instanceStride = this.instanceStride;

      this.runner = runner;
      this.x = runner.x;
      this.y = runner.y;
      this.age = 0;
      instanceData[id * instanceStride + 0] = this.x;
      instanceData[id * instanceStride + 1] = this.y;
      instanceData[id * instanceStride + 2] = runner.direction; // rotation
      instanceData[id * instanceStride + 3] = 1.5; // scale
      instanceData[id * instanceStride + 4] = option.type % 8; // frame.x
      instanceData[id * instanceStride + 5] = ~~(option.type / 8); // frame.y
      instanceData[id * instanceStride + 6] = 1; // visible
      instanceData[id * instanceStride + 7] = 1; // brightness
      instanceData[id * instanceStride + 8] = 0.2 + ~~(option.type / 8) % 2; // auraColor.r
      instanceData[id * instanceStride + 9] = 0.2 + 0; // auraColor.g
      instanceData[id * instanceStride + 10] = 0.2 + ~~(option.type / 8) % 2 + 1; // auraColor.b

      var self = this;
      runner.onVanish = function() {
        self.remove();
      };

      return this;
    },

    update: function(app) {
      var id = this.id;
      var instanceData = this.instanceData;
      var instanceStride = this.instanceStride;
      var runner = this.runner;

      runner.update();
      this.x = runner.x;
      this.y = runner.y;

      if (this.x < -100 || 640 + 100 < this.x || this.y < -100 || 960 + 100 < this.y) {
        this.remove();
      }

      instanceData[id * instanceStride + 0] = this.x;
      instanceData[id * instanceStride + 1] = this.y;
      instanceData[id * instanceStride + 7] = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      this.age += 1;
    },
  });

});

phina.namespace(function() {

  phina.define("glb.BulletSprites", {
    superClass: "phigl.InstancedDrawable",
    
    instanceData: null,
    pool: null,
    _count: 50000,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phigl.Program(gl).attach("bulletSprites.vs").attach("bulletSprites.fs").link())
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

phina.namespace(function() {

  phina.define("glb.Effect", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    x: 0,
    y: 0,
    rotation: 0,
    scale: 0,

    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.instanceStride = instanceStride;
    },

    spawn: function(options) {
      var id = this.id;
      var instanceData = this.instanceData;
      var instanceStride = this.instanceStride;

      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scale = options.scale;
      this.alpha = options.alpha;

      instanceData[id * instanceStride + 0] = 1; // visible
      instanceData[id * instanceStride + 1] = this.x; // position.x
      instanceData[id * instanceStride + 2] = this.y; // position.y
      instanceData[id * instanceStride + 3] = this.rotation; // rotation
      instanceData[id * instanceStride + 4] = this.scale; // scale
      instanceData[id * instanceStride + 5] = 0; // frame.x
      instanceData[id * instanceStride + 6] = 0; // frame.y
      instanceData[id * instanceStride + 7] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var id = this.id;
      var instanceData = this.instanceData;
      var instanceStride = this.instanceStride;

      if (this.x < -100 || 640 + 100 < this.x || this.y < -100 || 960 + 100 < this.y) {
        this.remove();
      }

      instanceData[id * instanceStride + 1] = this.x;
      instanceData[id * instanceStride + 2] = this.y;
      instanceData[id * instanceStride + 3] = this.rotation;
      instanceData[id * instanceStride + 4] = this.scale;
      instanceData[id * instanceStride + 7] = this.alpha;

      this.age += 1;
    },
  });

});

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

phina.namespace(function() {

  phina.define("glb.GLLayer", {
    superClass: "phina.display.Layer",

    renderChildBySelf: true,

    domElement: null,
    gl: null,
    effectSprites: null,
    bulletSprites: null,

    init: function(options) {
      options = options || {};
      this.superInit(options);
      this.originX = 0;
      this.originY = 0;

      this.domElement = document.createElement("canvas");
      this.domElement.width = this.width;
      this.domElement.height = this.height;

      this.gl = this.domElement.getContext("webgl");
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(this.gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(this.gl);

      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);
    },

    getEffect: function() {
      return this.effectSprites.pool.shift();
    },

    getBullet: function() {
      return this.bulletSprites.pool.shift();
    },

    update: function(app) {
      this.effectSprites.update(app);
      this.bulletSprites.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.effectSprites.render();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);
      
      // this.draw = function(){};
    },

  });

});

phina.namespace(function() {
  
  phina.define("glb.Shape", {
    
    positions: null,
    normals: null,
    uvs: null,
    indices: null,

    init: function() {
      this.positions = [];
      this.normals = [];
      this.uvs = [];
      this.indices = [];
    },

    getDate: function(names) {
      names = Array.prototype.concat([], arguments);
    },

  });
  
});

//# sourceMappingURL=glbullethell.js.map
