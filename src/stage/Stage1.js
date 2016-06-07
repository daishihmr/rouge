phina.namespace(function() {

  phina.define("glb.Stage1", {
    superClass: "glb.Stage",

    init: function() {
      this.superInit();

      this
        .addTask({ type: "waitTask", time: 1000 })
        .addTask({ type: "enemyTask", name: "", pattern: 0, runner: "", x: 0, y: 0 });
    },

  });

});
