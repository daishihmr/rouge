var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1080;

phina.namespace(function() {

  phina.main(function() {
    phina.display.CanvasApp({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        fps: 30,
      })
      .replaceScene(
        phina.game.ManagerScene({
          scenes: [

            {
              label: "download",
              className: "phina.game.LoadingScene",
              arguments: {
                assets: {
                  image: {
                    "test": "__test.png",
                    "zanki": "../asset/image/zanki.png",
                  },
                  font: {
                    "Share_Tech_Mono": "../asset/font/Share_Tech_Mono/ShareTechMono-Regular.ttf",
                    "Aldrich": "../asset/font/Aldrich/Aldrich-Regular.ttf",
                  },
                },
              },
            },

            {
              label: "main",
              className: "MainScene",
            },

          ],
        })
      )
      .enableStats()
      .run();

  });

  phina.define("MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
      var self = this;
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });

      this.fromJSON({
        children: {
          uiLayer: {
            className: "glb.UILayer",
          },
        },
      });
    },

    update: function(app) {},
  });

});
