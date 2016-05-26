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
