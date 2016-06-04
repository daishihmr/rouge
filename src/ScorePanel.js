phina.namespace(function() {

  phina.define("glb.ScorePanel", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit();
      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          
        },
      });
    },
  });

});
