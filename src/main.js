var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1080;
var OBJ_SCALE = 30.0;

phina.namespace(function() {

  var canvas = document.createElement("canvas");
  var gl = null;
  try {
    gl = canvas.getContext("webgl");
  } catch (e) {
    gl = null;
    glb.ErrorScene.message = "WebGL not supported";
  }

  phina.main(function() {
    phina.display.Label.defaults.fontFamily = "Aldrich";

    phina.asset.AssetLoader()
      .on("load", function() { start() })
      .load({ font: { "Aldrich": "./asset/font/Aldrich/Aldrich-Regular.ttf" } });
  });

  var start = function() {
    phina.display.CanvasApp({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
        fps: 30,
      })
      .replaceScene(gl ? glb.SceneFlow({ canvas: canvas, gl: gl }) : glb.ErrorScene())
      .enableStats()
      .run();
  };

});
