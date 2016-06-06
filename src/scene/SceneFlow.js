phina.namespace(function() {

  phina.define("glb.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        scenes: [

          // {
          //   label: "logo",
          //   className: "phina.game.SplashScene",
          //   arguments: {
          //     width: SCREEN_WIDTH,
          //     height: SCREEN_HEIGHT,
          //   },
          // },

          {
            label: "download-common",
            className: "glb.DownloadScene",
            arguments: {}.$extend(options, { assetType: "common" }),
          },

          {
            label: "arcade",
            className: "glb.ArcadeMode",
            arguments: {}.$extend(options, {}),
          },

        ],
      });
    },
  });

  phina.define("glb.ArcadeMode", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        scenes: [

          {
            label: "download-stage1",
            className: "glb.DownloadScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

          {
            label: "load-stage1",
            className: "glb.LoadScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

          {
            label: "stage",
            className: "glb.StageScene",
            arguments: {}.$extend(options, { assetType: "stage1" }),
          },

        ],
      });
    },
  });

});
