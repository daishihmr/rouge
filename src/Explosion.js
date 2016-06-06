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
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scale: Math.randfloat(0.1, 0.2),
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
        var r = Math.randfloat(30, 45);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.2,
            y: y + Math.sin(a) * r * 0.2,
            rotation: 0,
            scale: 1,
            alpha: 3,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            scale: 3,
            alpha: 0,
          }, 333, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });

      (7).times(function() {
        var e = glLayer.spriteDrawer.get("effect");

        if (!e) return;
        var a = Math.randfloat(0, Math.PI * 2);
        var r = Math.randfloat(75, 125);
        e
          .spawn({
            x: x + Math.cos(a) * r * 0.1,
            y: y + Math.sin(a) * r * 0.1,
            rotation: 0,
            scale: Math.randfloat(0.2, 0.4),
            alpha: 5,
          })
          .addChildTo(glLayer);

        e.tweener
          .clear()
          .to({
            x: x + Math.cos(a) * r,
            y: y + Math.sin(a) * r,
            alpha: 0,
          }, 666, "easeOutQuad")
          .call(function() {
            e.remove();
          });
      });
    },
  });

});
