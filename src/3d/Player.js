phina.namespace(function() {

  phina.define("glb.Player", {
    superClass: "glb.Obj",

    hp: 10,
    mutekiTime: 0,
    controllable: false,
    bits: null,
    shift: -1,
    roll: 0,

    tweener2: null,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);

      this.roll = 0;
      this.bits = [];
      this.tweener2 = phina.accessory.Tweener().attachTo(this);
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
          controllable: false,
          roll: R180,
        })
        .to({
          y: SCREEN_HEIGHT * 0.8,
          roll: 0,
        }, 1000, "easeOutBack")
        .set({
          controllable: true,
          mutekiTime: 90,
          shift: -1,
        })
        .call(function() {
          this.flare("launched");
        }.bind(this))
        .wait(3000);

      this.tweener2
        .clear()
        .set({
          scaleX: 20 * 5,
          scaleY: 20 * 5,
          scaleZ: 20 * 5,
        })
        .to({
          scaleX: 20,
          scaleY: 20,
          scaleZ: 20,
        }, 1000);
    },

    setBitJoin: function(bitJoin) {
      this.bitJoin = bitJoin;
      bitJoin
        .spawn({
          visible: true,
          scaleX: 20,
          scaleY: 20,
          scaleZ: 20,
          rotZ: (-90).toRadian(),
        });
    },

    setBarrier: function(barrier) {
      this.barrier = barrier;
      barrier.spawn({
        scaleX: 20,
        scaleY: 20,
        scaleZ: 20,
        rotZ: (-90).toRadian(),
      });
      return this;
    },

    update: function(app) {
      if (this.controllable) {
        this.control(app);
      }

      if (this.shift < 0) {
        this.shift = Math.min(this.shift + 0.1, 0);
      }

      var index = this.index;
      var instanceData = this.instanceData;

      quat.copy(this.quaternion, BASE_QUAT);
      quat.rotateX(this.quaternion, this.quaternion, this.roll);

      var v = this.shift;
      for (var i = 0; i < 4; i++) {
        var bit = this.bits[i];
        var bd0 = BIT_DATA0[i];
        var bd1 = BIT_DATA1[i];
        var bd2 = BIT_DATA2[i];

        if (v < 0) {
          var x = bd0.x * (-v) + bd1.x * (1 + v);
          var y = bd0.y * (-v) + bd1.y * (1 + v);
          var d = bd0.d * (-v) + bd1.d * (1 + v);
        } else {
          var x = bd1.x * (1 - v) + bd2.x * v;
          var y = bd1.y * (1 - v) + bd2.y * v;
          var d = bd1.d * (1 - v) + bd2.d * v;
        }

        if (bit) {
          bit.visible = this.controllable && this.shift < 1;
          if (bit.visible) {
            bit.x = this.x + x;
            bit.y = this.y + y;
            quat.setAxisAngle(bit.quaternion, [0, 0, 1], d);
            bit.rotateX(this.age * (i < 2 ? 0.2 : -0.2));
          }
        }
      }

      var bitJoin = this.bitJoin;
      bitJoin.visible = this.controllable && this.shift === 1;
      if (bitJoin) {
        bitJoin.x = this.x;
        bitJoin.y = this.y + -50;
        bitJoin.rotateX(0.2);
      }

      var barrier = this.barrier;
      if (barrier) {
        barrier.visible = this.muteki;
        if (barrier.visible) {
          barrier.x = this.x;
          barrier.y = this.y;
          barrier.rotateX(0.5);
        }
      }

      instanceData[index + 0] = this.visible ? 1 : 0;

      if (this.dirty) {
        quat.mul(tempQuat, RX, this.quaternion);
        mat4.fromRotationTranslationScale(this.matrix, tempQuat, this.position, this.scale);

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
        instanceData[index + 13] = this.alpha;
        this.dirty = false;
      }

      this.age += 1;
      this.mutekiTime -= 1;
    },

    control: function(app) {
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

      var pressShot = kb.getKey("SHOT") || gp.getKey("SHOT");
      var pressLaser = kb.getKey("LASER") || gp.getKey("LASER");

      if (this.shift >= 0) {
        if (kb.getKey("LASER") || gp.getKey("LASER")) {
          this.shift = Math.min(this.shift + 0.2, 1);
        } else {
          this.shift = Math.max(this.shift - 0.2, 0);
        }
      }

      if (pressShot && (0 <= this.shift && this.shift < 1) && frame % 2 === 0) {
        this.shot();
      } else if (pressLaser && this.shift == 1) {
        this.laser();
      }
    },

    hitBullet: function(bullet) {
      // TO25O
    },

    hitEnemy: function(enemy) {
      // TODO
    },

    laser: function() {
      var f = [6, 7, 8].pickup();
      this.flare("fireLaser", {
        x: this.x,
        y: this.y - 40,
        rotation: Math.PI * -0.5,
        scaleX: 12,
        scaleY: Math.randfloat(1.8, 2.2),
        frameX: f % 8,
        frameY: ~~(f / 8),
        alpha: 1.0,
        dx: 0,
        dy: -100,
        player: this,
      });
    },

    shot: function() {
      for (var i = -2; i < 2; i++) {
        this.flare("fireShot", {
          x: this.x + i * 20 + 10,
          y: this.y - 20,
          rotation: Math.PI * -0.5,
          scaleX: 4,
          scaleY: 4,
          frameX: [1, 2, 3, 4].pickup(),
          frameY: 1,
          alpha: 1.0,
          dx: 0,
          dy: -60,
        });
      }

      var v = this.shift;
      if (v < 0) return;

      for (var i = 0; i < 4; i++) {
        var bd0 = BIT_DATA0[i];
        var bd1 = BIT_DATA1[i];
        var bd2 = BIT_DATA2[i];
        if (v < 0) {
          var x = bd0.x * (-v) + bd1.x * (1 + v);
          var y = bd0.y * (-v) + bd1.y * (1 + v);
          var d = bd0.d * (-v) + bd1.d * (1 + v);
          var cw = bd0.cw * (-v) + bd1.cw * (1 + v);
          var sw = bd0.sw * (-v) + bd1.sw * (1 + v);
          var cr = bd0.cr * (-v) + bd1.cr * (1 + v);
          var sr = bd0.sr * (-v) + bd1.sr * (1 + v);
        } else {
          var x = bd1.x * (1 - v) + bd2.x * v;
          var y = bd1.y * (1 - v) + bd2.y * v;
          var d = bd1.d * (1 - v) + bd2.d * v;
          var cw = bd1.cw * (1 - v) + bd2.cw * v;
          var sw = bd1.sw * (1 - v) + bd2.sw * v;
          var cr = bd1.cr * (1 - v) + bd2.cr * v;
          var sr = bd1.sr * (1 - v) + bd2.sr * v;
        }
        [-1, 1].forEach(function(j) {
          this.flare("fireShot", {
            x: this.x + x + cw * 15 * j + cr * 30,
            y: this.y + y + sw * 15 * j + sr * 30,
            rotation: d,
            scaleX: 4,
            scaleY: 4,
            frameX: [1, 2, 3, 4].pickup(),
            frameY: 1,
            alpha: 1.0,
            dx: cr * 60,
            dy: sr * 60,
          });
        }.bind(this));
      }
    },

    _accessor: {
      muteki: {
        get: function() {
          return !this.controllable || this.mutekiTime > 0;
        },
        set: function() {},
      },
    }

  });

  var BASE_QUAT = quat.rotateZ(quat.create(), quat.create(), (-90).toRadian());
  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (10).toRadian());
  var tempQuat = quat.create();
  var R360 = (360).toRadian();
  var R180 = (180).toRadian();
  var R90 = (90).toRadian();
  var R45 = (45).toRadian();
  var R22_5 = (22.5).toRadian();

  var BIT_DATA0 = [{
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, {
    x: 0,
    y: 0,
    d: (0 - 90).toRadian(),
    sr: Math.sin((0 - 90).toRadian()),
    cr: Math.cos((0 - 90).toRadian()),
    sw: Math.sin((0).toRadian()),
    cw: Math.cos((0).toRadian()),
  }, ];

  var BIT_DATA1 = [{
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

  var BIT_DATA2 = [{
    x: 0,
    y: -50,
    d: (6 - 90).toRadian(),
    sr: Math.sin((6 - 90).toRadian()),
    cr: Math.cos((6 - 90).toRadian()),
    sw: Math.sin((6).toRadian()),
    cw: Math.cos((6).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (3 - 90).toRadian(),
    sr: Math.sin((3 - 90).toRadian()),
    cr: Math.cos((3 - 90).toRadian()),
    sw: Math.sin((3).toRadian()),
    cw: Math.cos((3).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (-3 - 90).toRadian(),
    sr: Math.sin((-3 - 90).toRadian()),
    cr: Math.cos((-3 - 90).toRadian()),
    sw: Math.sin((-3).toRadian()),
    cw: Math.cos((-3).toRadian()),
  }, {
    x: 0,
    y: -50,
    d: (-6 - 90).toRadian(),
    sr: Math.sin((-6 - 90).toRadian()),
    cr: Math.cos((-6 - 90).toRadian()),
    sw: Math.sin((-6).toRadian()),
    cw: Math.cos((-6).toRadian()),
  }, ];

});
