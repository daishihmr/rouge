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
