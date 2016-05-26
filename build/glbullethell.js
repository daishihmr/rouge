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

      this.index = id * instanceStride;
    },

    spawn: function(runner, option) {
      var instanceData = this.instanceData;
      var index = this.index;

      this.runner = runner;
      this.x = runner.x;
      this.y = runner.y;
      this.age = 0;
      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 2] = runner.direction; // rotation
      instanceData[index + 3] = 1.5; // scale
      instanceData[index + 4] = option.type % 8; // frame.x
      instanceData[index + 5] = ~~(option.type / 8); // frame.y
      instanceData[index + 6] = 1; // visible
      instanceData[index + 7] = 1; // brightness
      instanceData[index + 8] = 0.2 + ~~(option.type / 8) % 2; // auraColor.r
      instanceData[index + 9] = 0.2 + 0; // auraColor.g
      instanceData[index + 10] = 0.2 + ~~(option.type / 8) % 2 + 1; // auraColor.b

      var self = this;
      runner.onVanish = function() {
        self.remove();
      };

      return this;
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;
      var runner = this.runner;

      runner.update();
      this.x = runner.x;
      this.y = runner.y;

      if (this.x < -100 || 720 + 100 < this.x || this.y < -100 || 1280 + 100 < this.y) {
        this.remove();
        instanceData[index + 6] = 0;
        return;
      }

      instanceData[index + 0] = this.x;
      instanceData[index + 1] = this.y;
      instanceData[index + 7] = 1.5 + Math.sin(this.age * 0.2) * 0.6;

      this.age += 1;
    },
  });

});

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

      var instanceUnit = this.instanceStride / 4;

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
        return glb.Bullet(id, instanceData, instanceUnit)
          .on("removed", function() {
            self.pool.push(this);
          });
      });

      // console.log(this);

      // console.log("count = " + this._count);
      // console.log("this.instanceStride = " + this.instanceStride);
      // console.log("instanceUnit = " + instanceUnit);
      // console.log("this.instanceData.length = " + this.instanceData.length);
    },

    get: function() {
      var b = this.pool.shift();
      return b;
    },

    update: function(app) {
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
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      var index = this.index;
      var instanceData = this.instanceData;

      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scale = options.scale;
      this.alpha = options.alpha;

      instanceData[index + 0] = 1; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scale; // scale
      instanceData[index + 5] = 0; // frame.x
      instanceData[index + 6] = 0; // frame.y
      instanceData[index + 7] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.x < -100 || 640 + 100 < this.x || this.y < -100 || 960 + 100 < this.y) {
        this.remove();
      }

      instanceData[index + 1] = this.x;
      instanceData[index + 2] = this.y;
      instanceData[index + 3] = this.rotation;
      instanceData[index + 4] = this.scale;
      instanceData[index + 7] = this.alpha;

      this.age += 1;
    },
  });

});

phina.namespace(function() {

  phina.define("glb.EffectSprites", {
    superClass: "phigl.InstancedDrawable",

    instanceData: null,
    pool: null,
    _count: 200,

    init: function(gl, ext, w, h) {
      this.superInit(gl, ext);
      this
        .setProgram(phigl.Program(gl).attach("effectSprites.vs").attach("effectSprites.fs").link())
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
            instanceData[this.index + 0] = 0;
            self.pool.push(this);
          });
      });

      // console.log(this);
    },

    _createTexture: function() {
      var texture = phina.graphics.Canvas().setSize(512, 512);
      var context = texture.context;
      var g = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0.0, "rgba(255, 255, 255, 0.3)");
      g.addColorStop(0.6, "rgba(255, 125,   0, 0.3)");
      g.addColorStop(1.0, "rgba(255,   0,   0, 0.0)");
      context.fillStyle = g;
      context.fillRect(0, 0, 64, 64);
      return texture;
    },

    get: function() {
      return this.pool.shift();
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
    terrain: null,
    effectSprites: null,
    bulletSprites: null,

    init: function() {
      this.superInit({
        width: 720,
        height: 1280,
      });
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

      this.terrain = glb.Terrain(gl, extInstancedArrays, this.width, this.height);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);

      var self = this;
      var countX = glb.Terrain.countX;
      var countZ = glb.Terrain.countZ;
      var unit = glb.Terrain.unit;
      Array.range(-countX, countX).forEach(function(x) {
        Array.range(-countZ, countZ).forEach(function(z) {
          var hex = self.getHex();
          if (hex) {
            hex
              .spawn({
                x: x * unit + z % 2,
                y: Math.random() < 0.1 ? 4 : 0,
                z: z * unit * 1 / Math.sqrt(3) * 1.5,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                scaleX: 1.1,
                scaleY: 1.1,
                scaleZ: 1.1,
              })
              .addChildTo(self);
          }
        });
      });
    },

    getHex: function() {
      return this.terrain.get();
    },

    getEffect: function() {
      return this.effectSprites.get();
    },

    getBullet: function() {
      return this.bulletSprites.get();
    },

    update: function(app) {
      this.terrain.update(app);
      this.effectSprites.update(app);
      this.bulletSprites.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
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

  phina.define("glb.Hex", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    x: 0,
    y: 0,
    z: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scaleX: 0,
    scaleY: 0,
    scaleZ: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      var index = this.index;
      var instanceData = this.instanceData;
      this.age = 0;

      this.x = options.x;
      this.y = options.y;
      this.z = options.z;
      this.rotX = options.rotX;
      this.rotY = options.rotY;
      this.rotZ = options.rotZ;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.scaleZ = options.scaleZ;

      instanceData[index + 0] = 1;
      instanceData[index + 1] = this.x;
      instanceData[index + 2] = this.y;
      instanceData[index + 3] = this.z;
      instanceData[index + 4] = this.rotX;
      instanceData[index + 5] = this.rotY;
      instanceData[index + 6] = this.rotZ;
      instanceData[index + 7] = this.scaleX;
      instanceData[index + 8] = this.scaleY;
      instanceData[index + 9] = this.scaleZ;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      this.x += 0.20;
      this.z += 0.50;

      var countX = glb.Terrain.countX;
      var countZ = glb.Terrain.countZ;
      var unit = glb.Terrain.unit;
      if (this.x < -countX * unit) this.x += countX * unit * 2;
      else if (countX * unit < this.x) this.x -= countX * unit * 2;
      if (this.z < -countZ * unit * 1 / Math.sqrt(3) * 1.5) this.z += countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;
      else if (countZ * unit * 1 / Math.sqrt(3) * 1.5 < this.z) this.z -= countZ * unit * 1 / Math.sqrt(3) * 1.5 * 2;

      instanceData[index + 1] = this.x;
      instanceData[index + 2] = this.y;
      instanceData[index + 3] = this.z;
      instanceData[index + 4] = this.rotX;
      instanceData[index + 5] = this.rotY;
      instanceData[index + 6] = this.rotZ;
      instanceData[index + 7] = this.scaleX;
      instanceData[index + 8] = this.scaleY;
      instanceData[index + 9] = this.scaleZ;

      this.age += 1;
    },
  });

});

phina.namespace(function() {

  phina.define("glb.ObjAsset", {
    superClass: "phina.asset.File",

    init: function() {
      this.superInit();
    },

    getIndices: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];

      var vertexSize = 0;
      obj.faces.forEach(function(face) {
        for (var i = 1; i < face.length - 1; i++) {
          vertexSize += 3;
        }
      });

      return Array.range(vertexSize);
    },

    getAttributeData: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];

      var trigons = [];
      obj.faces.forEach(function(face) {
        for (var i = 1; i < face.length - 1; i++) {
          trigons.push(face[0]);
          trigons.push(face[i + 0]);
          trigons.push(face[i + 1]);
        }
      });

      return trigons.map(function(vertex, i) {
        var p = obj.positions[vertex.position - 1];
        var t = obj.texCoords[vertex.texCoord - 1];
        var n = obj.normals[vertex.normal - 1];
        return [
          // position
          p.x, p.y, p.z,
          // texCoord
          t.u, t.v,
          // normal
          n.x, n.y, n.z
        ];
      }).flatten();
    },
  });

  phina.asset.AssetLoader.assetLoadFunctions["obj"] = function(key, path) {
    var shader = glb.ObjAsset();
    return shader.load({
      path: path,
    });
  };

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
      this.uniforms.diffuseColor.value = [0.22, 0.22 * 2, 0.22, 1.0];
      this.uniforms.ambientColor.value = [0.10, 0.10, 0.10, 1.0];

      var vMatrix = mat4.lookAt(mat4.create(), [2, 30, 5], [0, 0, 0], [0, 1, 0]);
      var pMatrix = mat4.perspective(mat4.create(), 45, w / h, 0.1, 10000);
      this.uniforms.vpMatrix.value = mat4.mul(mat4.create(), pMatrix, vMatrix);
      this.uniforms.eyeDirection.value = [0, -30, -5];

      var self = this;
      this.pool = Array.range(0, this._count).map(function(id) {
        return glb.Hex(id, instanceData, instanceStride)
          .on("removed", function() {
            instanceData[this.index + 0] = 0;
            self.pool.push(this);
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

    get: function() {
      return this.pool.shift();
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

//# sourceMappingURL=glbullethell.js.map
