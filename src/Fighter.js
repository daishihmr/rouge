phina.namespace(function() {

  phina.define("glb.Fighter", {
    superClass: "glb.Obj",

    hp: 10,
    muteki: false,
    mutekiTime: 0,
    controllable: false,

    glLayer: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      this.roll = 0;

      this.on("enterframe", function(e) {
        var app = e.app;
        this.control(app);
      });
    },

    spawn: function(glLayer) {
      this.glLayer = glLayer;

      glb.Obj.prototype.spawn.call(this, {
        visible: false,
        x: SCREEN_WIDTH * 0.5,
        y: SCREEN_HEIGHT * 1.2,
        rotZ: (-90).toRadian(),
        scaleX: 20,
        scaleY: 20,
        scaleZ: 20,
      });

      return this;
    },

    launch: function() {
      this.tweener
        .clear()
        .set({
          x: SCREEN_WIDTH * 0.5,
          y: SCREEN_HEIGHT * 1.2,
          visible: true,
          muteki: true,
          controllable: false,
        })
        .to({
          y: SCREEN_HEIGHT * 0.9,
        }, 1000, "easeOutBack")
        .set({
          controllable: true,
        })
        .wait(3000)
        .set({
          muteki: false,
        });
    },

    setBarrier: function(barrier) {
      this.barrier = barrier;
      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.dirty) {
        quat.mul(tempQuat, RX, this.quaternion);
        mat4.fromRotationTranslationScale(this.matrix, tempQuat, this.position, this.scale);

        instanceData[index + 0] = this.visible ? 1 : 0;
        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        this.dirty = false;
      }

      this.age += 1;
      this.mutekiTime -= 1;

      var barrier = this.barrier;
      if (barrier) {
        barrier.visible = this.muteki;
        barrier.x = this.x;
        barrier.y = this.y;
        barrier.rotateX(0.5);
      }
    },

    control: function(app) {
      if (!this.controllable) return;

      var frame = app.ticker.frame;
      var kb = app.keyboard;
      var dir = kb.getKeyDirection();
      
      var speed = kb.getKey("shift") ? 14 : 22;

      this.x = Math.clamp(this.x + dir.x * speed, 10, SCREEN_WIDTH - 10);
      this.y = Math.clamp(this.y + dir.y * speed, 10, SCREEN_HEIGHT - 10);

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

      if (kb.getKey("z") && frame % 2 === 0) {
        this.shot();
      }
    },

    hitBullet: function(bullet) {
      // TODO
    },

    hitEnemy: function(enemy) {
      // TODO
    },

    shot: function() {
      var glLayer = this.glLayer;

      for (var i = 0; i < 2; i++) {
        var shot = glLayer.spriteDrawer.get("shot");
        if (shot) {
          shot
            .spawn({
              x: this.x + -15 + i * 30,
              y: this.y - 20,
              rotation: Math.PI * -0.5,
              scale: 2,
              frameX: 0,
              frameY: 1,
              alpha: 0.5,
              dx: 0,
              dy: -60,
            })
            .addChildTo(glLayer);
          this.flare("fireShot", { shot: shot });
        }
      }
    },

  });

  var BASE_QUAT = quat.rotateZ(quat.create(), quat.create(), (-90).toRadian());
  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (10).toRadian());
  var tempQuat = quat.create();

});
