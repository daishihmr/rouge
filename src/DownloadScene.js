phina.namespace(function() {

  phina.define("glb.DownloadScene", {
    superClass: "phina.game.LoadingScene",

    init: function(options) {
      this.superInit(options.$extend({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "white",
      }));
    },
  });

});
