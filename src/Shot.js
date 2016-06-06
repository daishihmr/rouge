phina.namespace(function() {
  phina.define("glb.Shot", {
    superClass: "glb.Sprite",
    
    power: 0,

    _active: false,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.dx = options.dx;
      this.dy = options.dy;
      return glb.Sprite.prototype.spawn.call(this, options);
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    update: function(app) {
      this.x += this.dx;
      this.y += this.dy;
      glb.Sprite.prototype.update.call(this, app);
    },

    hitEnemy: function(e) {
      // TODO
      this.flare("hitEnemy");
      this.remove();
    },

  });
});
