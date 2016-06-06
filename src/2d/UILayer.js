phina.namespace(function() {

  phina.define("glb.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          scorePanel: { className: "glb.ScorePanel" },
        },
      });
    },
  });

});
