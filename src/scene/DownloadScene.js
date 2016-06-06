phina.namespace(function() {

  phina.define("glb.DownloadScene", {
    superClass: "phina.game.LoadingScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        assets: glb.Assets.get({ assetType: options.assetType }),
      });

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "downloading",
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });
    },
  });

});
