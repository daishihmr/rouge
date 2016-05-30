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
    
    onremoved: function() {
      this.instanceData[this.index + 6] = 0;
    },

    update: function(app) {
      var instanceData = this.instanceData;
      var index = this.index;
      var runner = this.runner;

      runner.update();
      this.x = runner.x;
      this.y = runner.y;

      if (this.x < -100 || SCREEN_WIDTH + 100 < this.x || this.y < -100 || SCREEN_HEIGHT + 100 < this.y) {
        this.remove();
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
        mat4.lookAt(mat4.create(), [w / 2, h * 0.75, w * 1.5], [w / 2, h / 2, 0], [0, 1, 0])
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
        mat4.lookAt(mat4.create(), [w / 2, h * 0.75, w * 1.5], [w / 2, h / 2, 0], [0, 1, 0])
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
      this.domElement.width = this.width * glb.GLLayer.quality;
      this.domElement.height = this.height * glb.GLLayer.quality;

      this.gl = this.domElement.getContext("webgl");
      var extInstancedArrays = phigl.Extensions.getInstancedArrays(this.gl);
      var extVertexArrayObject = phigl.Extensions.getVertexArrayObject(this.gl);

      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      this.terrain = glb.Terrain(gl, extInstancedArrays, this.width, this.height);
      this.effectSprites = glb.EffectSprites(gl, extInstancedArrays, this.width, this.height);
      this.bulletSprites = glb.BulletSprites(gl, extInstancedArrays, this.width, this.height);
      this.enemies = glb.EnemiesDrawer(1, "enemyS1.obj", gl, extInstancedArrays, this.width, this.height);

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
                y: Math.random() < 0.04 ? 5 : 0,
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
      this.enemies.update(app);

      return;
    },

    draw: function(canvas) {
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this.terrain.render();
      this.enemies.render();
      this.effectSprites.render();
      this.bulletSprites.render();
      gl.flush();

      var image = this.domElement;
      canvas.context.drawImage(image, 0, 0, image.width, image.height, -this.width * this.originX, -this.height * this.originY, this.width, this.height);

      // this.draw = function(){};
    },

    _static: {
      quality: 0.5,
    },
  });

});

phina.namespace(function() {

  phina.define("glb.Obj", {
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

    getAttributeDataEdges: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      var hashes = [];
      var result = [];

      return obj.faces
        .map(function(face) {
          var lines = [];
          for (var i = 0; i < face.length - 1; i++) {
            lines.push([face[i + 0].position, face[i + 1].position]);
          }
          lines.push([face.last.position, face.first.position]);
          return lines;
        })
        .flatten(1)
        .uniq(function(lhs, rhs) {
          return lhs[0] === rhs[0] && lhs[1] === rhs[1];
        })
        .map(function(edge) {
          var p0 = obj.positions[edge[0] - 1];
          var p1 = obj.positions[edge[1] - 1];
          return [
            [p0.x, p0.y, p0.z],
            [p1.x, p1.y, p1.z],
          ];
        })
        .flatten();
    },
  });

  phina.asset.AssetLoader.assetLoadFunctions["obj"] = function(key, path) {
    var shader = glb.ObjAsset();
    return shader.load({
      path: path,
    });
  };

  var hash = function(p0, p1) {
    var result = 1;
    var prime = 2411;
    result = prime * result + p0;
    result = prime * result + p1;
    return "" + result;
  };

});

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

phina.namespace(function() {

  /**
   * @param {Function} [fn] return true if lhs and rhs are equivalence.
   */
  Array.prototype.$method("uniq", function(fn) {
    if (fn) {
      return this.filter(function(me, index, self) {
        return !self.slice(0, index).some(function(another) {
          return fn(me, another);
        });
      });
    } else {
      return this.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    }
  });

});

//# sourceMappingURL=glbullethell.js.map
