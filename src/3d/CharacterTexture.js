phina.namespace(function() {

  phina.define("glb.CharacterTexture", {
    superClass: "phina.graphics.Canvas",

    init: function(options) {
      this.superInit();
      options = {}.$extend({
        fontSize: 20,
        fontFamily: "sans-serif",
        fill: "white",
        stroke: null,
        fontWeight: "",
        characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        shadowColor: "transparent",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      }, options);

      var context = this.context;
      this.characters = options.characters;

      var u = Array.range(0, 10)
        .map(function(i) {
          context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
          return context.measureText("" + i).width;
        })
        .sort(function(lhs, rhs) {
          return lhs - rhs;
        })
        .map(function(u) {
          return u;
        })
        .last + 1 | 0;

      var log2 = function(v) {
        return Math.log(v) / Math.log(2);
      };

      var w = Math.pow(2, (log2(u) | 0) + 1);
      var h = Math.pow(2, (log2(options.fontSize) | 0) + 1);
      this.setSize(w * 8, h * 8);
      context.font = "{fontWeight} {fontSize}px '{fontFamily}'".format(options);
      context.fillStyle = options.fill;
      context.strokeStyle = options.stroke;
      context.textAlign = "center"
      context.textBaseline = "middle";
      context.shadowColor = options.shadowColor;
      context.shadowBlur = options.shadowBlur;
      context.shadowOffsetX = options.shadowOffsetX;
      context.shadowOffsetY = options.shadowOffsetY;
      for (var i = 0; i < this.characters.length; i++) {
        var c = this.characters[i];
        var x = i % 8;
        var y = ~~(i / 8);
        if (options.fill) context.fillText(c, w * (x + 0.5), h * (y + 0.5));
        if (options.stroke) context.strokeText(c, w * (x + 0.5), h * (y + 0.5));
      }
    },

    calcFrame: function(character) {
      var i = this.characters.indexOf(character);
      return {
        frameX: i % 8,
        frameY: ~~(i / 8),
      };
    },

  });

});
