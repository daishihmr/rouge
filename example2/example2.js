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
              className: "glb.DownloadScene",
              arguments: {
                assets: {
                  font: {
                    "Aldrich": "../asset/font/Aldrich/Aldrich-Regular.ttf",
                  }
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
          scoreLabel: {
            className: "strike.NumberSpriteArray",
            arguments: {
              fontFamily: "Aldrich",
              fontSize: 50,
              fill: "white",
              stroke: null,
              digit: 16,
            },
            x: 10,
            y: SCREEN_HEIGHT / 2,
            value: 1,
          },
        },
      });
    },
    
    update: function(app) {
      this.scoreLabel.value *= 1.01;
    },
  });

});
