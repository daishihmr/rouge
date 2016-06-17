phina.namespace(function() {

  phina.define("glb.Sprite", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,
    
    visible: true,

    x: 0,
    y: 0,
    rotation: 0,
    scale: 0,

    frameX: 0,
    frameY: 0,

    red: 1.0,
    green: 1.0,
    blue: 1.0,
    alpha: 1.0,

    age: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;
    },

    spawn: function(options) {
      options.$safe({
        visible: true,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        frameX: 0,
        frameY: 0,
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      });

      var index = this.index;
      var instanceData = this.instanceData;

      this.visible = options.visible;
      this.x = options.x;
      this.y = options.y;
      this.rotation = options.rotation;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.frameX = options.frameX;
      this.frameY = options.frameY;
      this.red = options.red;
      this.green = options.green;
      this.blue = options.blue;
      this.alpha = options.alpha;

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.red; // red
      instanceData[index + 9] = this.green; // green
      instanceData[index + 10] = this.blue; // blue
      instanceData[index + 11] = this.alpha; // alpha

      this.age = 0;

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.x < -100 || 640 + 100 < this.x || this.y < -100 || 960 + 100 < this.y) {
        this.remove();
        return;
      }

      instanceData[index + 0] = this.visible ? 1 : 0; // visible
      instanceData[index + 1] = this.x; // position.x
      instanceData[index + 2] = this.y; // position.y
      instanceData[index + 3] = this.rotation; // rotation
      instanceData[index + 4] = this.scaleX; // scale
      instanceData[index + 5] = this.scaleY; // scale
      instanceData[index + 6] = this.frameX; // frame.x
      instanceData[index + 7] = this.frameY; // frame.y
      instanceData[index + 8] = this.red; // red
      instanceData[index + 9] = this.green; // green
      instanceData[index + 10] = this.blue; // blue
      instanceData[index + 11] = this.alpha; // alpha

      this.age += 1;
    },

    onremoved: function() {
      this.visible = false;
      this.instanceData[this.index + 0] = 0;
    },
  });

});
