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
