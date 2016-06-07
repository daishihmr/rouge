phina.namespace(function() {

  phina.define("glb.Player", {
    superClass: "glb.Obj",

    hp: 10,
    muteki: false,
    mutekiTime: 0,
    controllable: false,
    bits: null,
    bitData: null,
    shift: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      this.roll = 0;
      this.bits = [];

      this.bitData0 = [{
        x: -120,
        y: 35,
        d: (-20 - 90).toRadian(),
        sr: Math.sin((-20 - 90).toRadian()),
        cr: Math.cos((-20 - 90).toRadian()),
        sw: Math.sin((-20).toRadian()),
        cw: Math.cos((-20).toRadian()),
      }, {
        x: -70,
        y: 20,
        d: (-10 - 90).toRadian(),
        sr: Math.sin((-10 - 90).toRadian()),
        cr: Math.cos((-10 - 90).toRadian()),
        sw: Math.sin((-10).toRadian()),
        cw: Math.cos((-10).toRadian()),
      }, {
        x: 70,
        y: 20,
        d: (10 - 90).toRadian(),
        sr: Math.sin((10 - 90).toRadian()),
        cr: Math.cos((10 - 90).toRadian()),
        sw: Math.sin((10).toRadian()),
        cw: Math.cos((10).toRadian()),
      }, {
        x: 120,
        y: 35,
        d: (20 - 90).toRadian(),
        sr: Math.sin((20 - 90).toRadian()),
        cr: Math.cos((20 - 90).toRadian()),
        sw: Math.sin((20).toRadian()),
        cw: Math.cos((20).toRadian()),
      }, ];

      this.bitData1 = [{
        x: -80,
        y: 10,
        d: (6 - 90).toRadian(),
        sr: Math.sin((6 - 90).toRadian()),
        cr: Math.cos((6 - 90).toRadian()),
        sw: Math.sin((6).toRadian()),
        cw: Math.cos((6).toRadian()),
      }, {
        x: -50,
        y: 20,
        d: (3 - 90).toRadian(),
        sr: Math.sin((3 - 90).toRadian()),
        cr: Math.cos((3 - 90).toRadian()),
        sw: Math.sin((3).toRadian()),
        cw: Math.cos((3).toRadian()),
      }, {
        x: 50,
        y: 20,
        d: (-3 - 90).toRadian(),
        sr: Math.sin((-3 - 90).toRadian()),
        cr: Math.cos((-3 - 90).toRadian()),
        sw: Math.sin((-3).toRadian()),
        cw: Math.cos((-3).toRadian()),
      }, {
        x: 80,
        y: 10,
        d: (-6 - 90).toRadian(),
        sr: Math.sin((-6 - 90).toRadian()),
        cr: Math.cos((-6 - 90).toRadian()),
        sw: Math.sin((-6).toRadian()),
        cw: Math.cos((-6).toRadian()),
      }, ];

      this.on("enterframe", function(e) {
        var app = e.app;
        this.control(app);
      });
    },

    spawn: function() {
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

      var v = this.shift;

      for (var i = 0; i < 4; i++) {
        var bit = this.bits[i];
        var bd0 = this.bitData0[i];
        var bd1 = this.bitData1[i];
        var x = bd0.x * (1 - v) + bd1.x * v;
        var y = bd0.y * (1 - v) + bd1.y * v;
        var d = bd0.d * (1 - v) + bd1.d * v;
        if (bit) {
          bit.visible = this.visible;
          bit.x = this.x + x;
          bit.y = this.y + y;
          quat.setAxisAngle(bit.quaternion, [0, 0, 1], d);
          bit.rotateX(this.age * (i < 2 ? 0.2 : -0.2));
        }
      }

      var barrier = this.barrier;
      if (barrier) {
        barrier.visible = this.muteki;
        barrier.x = this.x;
        barrier.y = this.y;
        barrier.rotateX(0.5);
      }

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
    },

    control: function(app) {
      if (!this.controllable) return;

      var frame = app.ticker.frame;
      var kb = app.keyboard;
      var gp = app.gamepadManager.get();
      var dir = kb.getKeyDirection();

      var gpdir = gp.getStickDirection();
      if (gpdir.length() > 0.5) {
        var x = 0;
        var y = 0;
        if (gpdir.x < -0.5) x = -1.0;
        else if (0.5 < gpdir.x) x = 1.0;
        if (gpdir.y < -0.5) y = -1.0;
        else if (0.5 < gpdir.y) y = 1.0;
        dir.add(phina.geom.Vector2(x, y).normalize());
      }

      dir.add(gp.getKeyDirection());

      dir.normalize();

      var speed = (kb.getKey("LASER") || gp.getKey("LASER")) ? 13 : 24;

      this.x = Math.clamp(this.x + dir.x * speed, 10, SCREEN_WIDTH - 10);
      this.y = Math.clamp(this.y + dir.y * speed, 10, SCREEN_HEIGHT - 10);

      if (dir.x) {
        this.roll = Math.clamp(this.roll - dir.x * 0.2, -R90, R90);
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

      if (kb.getKey("LASER") || gp.getKey("LASER")) {
        this.shift = Math.min(this.shift + 0.2, 1);
      } else {
        this.shift = Math.max(this.shift - 0.2, 0);
      }

      if ((kb.getKey("SHOT") || gp.getKey("SHOT")) && frame % 2 === 0) {
        this.shot();
      }
    },

    hitBullet: function(bullet) {
      // TO25O
    },

    hitEnemy: function(enemy) {
      // TODO
    },

    shot: function() {
      for (var i = -2; i < 2; i++) {
        this.flare("fireShot", {
          x: this.x + i * 20 + 10,
          y: this.y - 20,
          rotation: Math.PI * -0.5,
          scale: 4,
          frameX: 0,
          frameY: 1,
          alpha: 0.25,
          dx: 0,
          dy: -60,
        });
      }

      var v = this.shift;

      for (var i = 0; i < 4; i++) {
        var bd0 = this.bitData0[i];
        var bd1 = this.bitData1[i];
        var x = bd0.x * (1 - v) + bd1.x * v;
        var y = bd0.y * (1 - v) + bd1.y * v;
        var d = bd0.d * (1 - v) + bd1.d * v;
        var cw = bd0.cw * (1 - v) + bd1.cw * v;
        var sw = bd0.sw * (1 - v) + bd1.sw * v;
        var cr = bd0.cr * (1 - v) + bd1.cr * v;
        var sr = bd0.sr * (1 - v) + bd1.sr * v;
        [-1, 1].forEach(function(j) {
          this.flare("fireShot", {
            x: this.x + x + cw * 15 * j + cr * 30,
            y: this.y + y + sw * 15 * j + sr * 30,
            rotation: d,
            scale: 4,
            frameX: 3,
            frameY: 1,
            alpha: 0.25,
            dx: cr * 60,
            dy: sr * 60,
          });
        }.bind(this));
      }
    },

  });

  var BASE_QUAT = quat.rotateZ(quat.create(), quat.create(), (-90).toRadian());
  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (10).toRadian());
  var tempQuat = quat.create();
  var R90 = (90).toRadian();
  var R45 = (45).toRadian();
  var R225 = (22.5).toRadian();

});
