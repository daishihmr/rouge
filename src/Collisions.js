phina.namespace(function() {

  phina.define("glb.Collisions", {
    superClass: "phina.util.EventDispatcher",

    player: null,
    bullets: null,
    enemies: null,
    shots: null,

    init: function() {
      this.superInit();

      this.player = null;
      this.bullets = [];
      this.enemies = [];
      this.shots = [];
    },

    setPlayer: function(v) {
      this.player = v;
      v.on("inactivated", function() {
        this.player = null;
      }.bind(this));
      v.on("removed", function() {
        this.player = null;
      }.bind(this));
    },

    addBullet: function(v) {
      this.bullets.push(v);
      v.on("inactivated", function() {
        this.bullets.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.bullets.erase(v);
      }.bind(this));
    },

    addEnemy: function(v) {
      this.enemies.push(v);
      v.on("inactivated", function() {
        this.enemies.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.enemies.erase(v);
      }.bind(this));
    },

    addShot: function(v) {
      this.shots.push(v);
      v.on("inactivated", function() {
        this.shots.erase(v);
      }.bind(this));
      v.on("removed", function() {
        this.shots.erase(v);
      }.bind(this));
    },

    update: function(app) {
      this._hitTestShotEnemy();
      this._hitTestPlayerBullet();
      this._hitTestPlayerEnemy();
    },

    _hitTestShotEnemy: function() {
      var ss = this.shots.clone();
      var es = this.enemies.clone();
      var s;
      var e;
      for (var j = 0, jl = es.length; j < jl; j++) {
        e = es[j];

        if (e.muteki || !e.visible || e.mutekiTime > 0 || e.hp <= 0) continue;

        for (var i = 0, il = ss.length; i < il; i++) {
          s = ss[i];

          if ((e.x - s.x) * (e.x - s.x) + (e.y - s.y) * (e.y - s.y) < e.radius * e.radius) {
            e.hitShot(s);
            s.hitEnemy(e);
          }
        }
      }
    },

    _hitTestPlayerBullet: function() {
      var p = this.player;
      var bs = this.bullets.clone();

      if (p.muteki || !p.visible || p.mutekiTime > 0 || p.hp <= 0) return;

      var b;
      for (var i = 0, il = bs.length; i < il; i++) {
        b = bs[i];
        if ((p.x - b.x) * (p.x - b.x) + (p.y - b.y) * (p.y - b.y) < b.radius * b.radius) {
          p.hitBullet(b);
          b.hitPlayer(p);
        }
      }
    },

    _hitTestPlayerEnemy: function() {
      var p = this.player;
      var es = this.enemies.clone();

      if (p.muteki || !p.visible || p.mutekiTime > 0 || p.hp > 0) return;

      var e;
      for (var i = 0, il = es.length; i < il; i++) {
        e = es[i];
        if ((p.x - e.x) * (p.x - e.x) + (p.y - e.y) * (p.y - e.y) < e.radius * e.radius) {
          p.hitEnemy(e);
          e.hitPlayer(p);
        }
      }
    },

  });

});
