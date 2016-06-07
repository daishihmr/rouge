phina.namespace(function() {

  phina.define("glb.EnemySpawner", {
    superClass: "phina.app.Element",

    init: function(options) {
      this.superInit();

      this.name = options.name;
      this.pattern = options.pattern;
      this.runner = options.runner;
      this.x = options.x;
      this.y = options.y;

      // TODO
    },
  });

});
