phina.namespace(function() {

  phina.define("glb.Explosion", {

    glLayer: null,

    init: function(glLayer) {
      this.glLayer = glLayer;
    },
    
    spark: function(x, y) {
      var glLayer = this.glLayer;
      
      (1).times(function() {
        var e = glLayer.spriteDrawer.get("effect");

        if (!e) return;
        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(75, 125);
        var s = Math.randfloat(0.1, 0.2);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scaleX: s,
            scaleY: s,
            alpha: 5,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            alpha: 0,
          }, 666, "easeOutQuart")
          .call(function() {
            e.remove();
          });
      });
    },

    small: function(x, y) {
      var glLayer = this.glLayer;

      (10).times(function() {
        var e = glLayer.spriteDrawer.get("effect");
        if (!e) return;

        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(20, 35);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.2,
            y: y + Math.sin(a) * r * 0.2,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            frameX: 0,
            frameY: 0,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
          }, 500, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });

      (2).times(function() {
        var e = glLayer.spriteDrawer.get("effect");

        if (!e) return;
        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(75, 125);
        var s = Math.randfloat(0.2, 0.4);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scaleX: s,
            scaleY: s,
            alpha: 5,
            frameX: 0,
            frameY: 0,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            alpha: 0,
          }, 900, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });
    },
  });

});
