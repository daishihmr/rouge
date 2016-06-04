phina.namespace(function() {

  var BASE_QUAT = quat.rotateZ(quat.create(), quat.create(), (-90).toRadian());

  phina.define("glb.Fighter", {
    superClass: "glb.Obj",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      // this.isEnemy = true;
      this.roll = 0;

      this.on("enterframe", function(e) {
        var app = e.app;
        this.move(app);
      });
    },

    move: function(app) {
      var kb = app.keyboard;
      var dir = kb.getKeyDirection();

      this.x = Math.clamp(this.x + dir.x * 22, 0, SCREEN_WIDTH - 0);
      this.y = Math.clamp(this.y + dir.y * 22, 0, SCREEN_HEIGHT - 0);

      if (dir.x) {
        this.roll = Math.clamp(this.roll - dir.x * 0.2, (-90).toRadian(), (90).toRadian());
      } else {
        if (this.roll < -0.2) {
          this.roll += 0.2;
        } else if (0.2 < this.roll) {
          this.roll -= 0.2;
        } else {
          this.roll = 0;
        }
      }

      quat.copy(this.quaternion, BASE_QUAT);
      quat.rotateX(this.quaternion, this.quaternion, this.roll);
    },

  });
});
