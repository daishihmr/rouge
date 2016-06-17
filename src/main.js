var SCREEN_WIDTH = 720;
var SCREEN_HEIGHT = 1080;
var OBJ_SCALE = 30.0;

phina.namespace(function() {

  phina.input.Keyboard.KEY_CODE["SHOT"] = phina.input.Keyboard.KEY_CODE["z"];
  phina.input.Keyboard.KEY_CODE["BOMB"] = phina.input.Keyboard.KEY_CODE["x"];
  phina.input.Keyboard.KEY_CODE["LASER"] = phina.input.Keyboard.KEY_CODE["c"];
  phina.input.Gamepad.BUTTON_CODE["SHOT"] = phina.input.Gamepad.BUTTON_CODE["R2"];
  phina.input.Gamepad.BUTTON_CODE["BOMB"] = phina.input.Gamepad.BUTTON_CODE["a"];
  phina.input.Gamepad.BUTTON_CODE["LASER"] = phina.input.Gamepad.BUTTON_CODE["x"];

});
