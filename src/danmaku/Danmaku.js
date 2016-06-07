phina.namespace(function() {

  phina.define("glb.Danmaku", {
    init: function() {},
    _static: {
      _initialized: false,
      config: {},
      intervalRate: 1.0,
      speedRate: 15.0,

      initialize: function() {
        this._initialized = true;

        var R = bullet({ type: 2 });

        // 自機狙い単発
        this.basic0 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(speed(1), R),
            ]),
          ]),
        });

        // 自機狙い５連発
        this.basic1 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(speed(1), R),
              repeat(4, [
                interval(4),
                fire(dseq(0), sseq(0), R),
              ]),
            ]),
          ]),
        });

        // 自機狙い3way（広）
        this.basic2 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(direction(-15), speed(1), R),
              repeat(2, [
                fire(dseq(15), speed(1), R),
              ]),
            ]),
          ]),
        });

        // 自機狙い3way（狭）
        this.basic3 = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              interval(30),
              fire(direction(-8), speed(1), R),
              repeat(2, [
                fire(dseq(8), speed(1), R),
              ]),
            ]),
          ]),
        });

        this.test = new bulletml.Root({
          top: action([
            repeat(Infinity, [
              fire(dseq(1), speed(1), R),
              repeat(90 - 1, [
                fire(dseq(360 / 90), speed(1), R),
              ]),
              interval(5),
            ]),
          ]),
        });
      },

      createRunner: function(name) {
        if (!this._initialized) this.initialize();
        return this[name].createRunner(this.config);
      },
    },
  });

  var action = bulletml.dsl.action;
  var actionRef = bulletml.dsl.actionRef;
  var bullet = bulletml.dsl.bullet;
  var bulletRef = bulletml.dsl.bulletRef;
  var fire = bulletml.dsl.fire;
  var fireRef = bulletml.dsl.fireRef;
  var changeDirection = bulletml.dsl.changeDirection;
  var changeSpeed = bulletml.dsl.changeSpeed;
  var accel = bulletml.dsl.accel;
  var wait = bulletml.dsl.wait;
  var vanish = bulletml.dsl.vanish;
  var repeat = bulletml.dsl.repeat;
  var bindVar = bulletml.dsl.bindVar;
  var notify = bulletml.dsl.notify;
  var direction = bulletml.dsl.direction;
  var _speed = bulletml.dsl.speed;
  var horizontal = bulletml.dsl.horizontal;
  var vertical = bulletml.dsl.vertical;
  var fireOption = bulletml.dsl.fireOption;
  var offsetX = bulletml.dsl.offsetX;
  var offsetY = bulletml.dsl.offsetY;
  var autonomy = bulletml.dsl.autonomy;

  var interval = function(v) {
    return wait(Math.max(v * glb.Danmaku.intervalRate, 1));
  };

  var speed = function(v) {
    return _speed(v * glb.Danmaku.speedRate);
  };

  var dseq = function(v) {
    return direction(v, "sequence");
  };
  var sseq = function(v) {
    return _speed(v, "sequence");
  };

});
