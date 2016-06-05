phina.namespace(function() {

  phina.define("strike.NumberSpriteArray", {
    superClass: "phina.display.DisplayElement",

    sprites: null,
    commas: null,
    digit: 0,

    _value: 0,

    init: function(options) {
      options = {}.$extend({
        digit: 8,
      }, options);

      this.digit = options.digit;

      this.sprites = Array.range(0, options.digit).map(function() {
        return strike.NumberSprite(options)
          .setOrigin(0, 0);
      });

      this.superInit({
        width: this.sprites[0].width * options.digit,
        height: options.fontSize,
      });

      var self = this;
      this.sprites.forEach(function(s, i, all) {
        s.x += (all.length - i - 1) * s.width;
        s.addChildTo(self);
      });

      this.commas = [];
      for (var i = 1; i < this.digit / 3; i++) {
        var c = phina.display.Label({
            text: ",",
          }.$extend(options))
          .setPosition((this.digit - i * 3) * this.sprites[0].width, this.sprites[0].height * 0.5)
          .addChildTo(this);
        this.commas.push(c);
      }
    },

    setValue: function(num) {
      this._value = num;
      var n = Math.floor(num);

      var s = ("" + n).length / 3 - 1;
      this.commas.forEach(function(c, i) {
        c.visible = i < s;
      });

      for (var i = 0; i < this.digit; i++) {
        if (n === 0) {
          this.sprites[i].visible = false;
        } else {
          this.sprites[i].visible = true;
          this.sprites[i].frameIndex = n % 10;
        }
        n = Math.floor(n / 10);
      }
    },

    _accessor: {
      value: {
        get: function() {
          return this._value;
        },
        set: function(v) {
          this.setValue(v);
        }
      }
    }
  });

  phina.define("strike.NumberSprite", {
    superClass: "phina.display.Sprite",

    init: function(options) {
      options = {}.$extend({
        fontSize: 20,
        fontFamily: "sans-serif",
        fill: "white",
        stroke: null,
        fontWeight: "",
      }, options);

      var canvas = phina.graphics.Canvas();
      var context = canvas.context;

      this.unitWidth = Array.range(0, 10)
        .map(function(i) {
          context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
          return context.measureText("" + i).width;
        })
        .sort(function(lhs, rhs) {
          return lhs - rhs;
        })
        .map(function(w) {
          return w;
        })
        .last + 1 | 0;

      this.unitWidth *= 1.15;

      var w = this.unitWidth * 10;
      var h = options.fontSize;
      canvas.setSize(Math.pow(2, Math.log2(w) + 1 | 0), Math.pow(2, Math.log2(h) + 1 | 0));

      context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
      context.fillStyle = options.fill;
      context.strokeStyle = options.stroke;
      context.textAlign = "center"
      context.textBaseline = "middle";
      for (var i = 0; i < 10; i++) {
        if (options.fill) context.fillText("" + i, this.unitWidth * (0.5 + i), h / 2);
        if (options.stroke) context.strokeText("" + i, w * (0.5 + i), h / 2);
      }

      this.superInit(canvas, this.unitWidth, h);
      this.setFrameIndex(0);
    },
  });

});
