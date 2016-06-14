phina.namespace(function() {
  
  phina.define("glb.Laser", {
    superClass: "glb.Shot",
    
    player: null,
    iScaleX: 1,
    iScaleY: 1,
    fScaleX: 1,
    fScaleY: 1,
    
    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    spawn: function(options) {
      this.dx = options.dx;
      this.dy = options.dy;
      this.player = options.player;
      
      glb.Shot.prototype.spawn.call(this, options);

      this.iScaleX = this.scaleX * 2;
      this.iScaleY = this.scaleY * 2;
      this.fScaleX = this.scaleX * 1;
      this.fScaleY = this.scaleY * 1;

      return this;
    },

    update: function(app) {
      this.bx = this.x;
      this.by = this.y;
      this.x = this.player.x;
      this.y += this.dy;
      var t = Math.clamp(this.age / 4, 0.0, 1.0);
      // this.scaleX = this.iScaleX + (this.fScaleX - this.iScaleX) * t;
      this.scaleY = this.iScaleY + (this.fScaleY - this.iScaleY) * t;
      glb.Sprite.prototype.update.call(this, app);
    },

  });

});
