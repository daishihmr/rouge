phina.namespace(function() {

  phina.define("glb.ErrorScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
      });

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "error: " + glb.ErrorScene.message,
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });
    },

    _static: {
      message: "",
    },
  });

});
