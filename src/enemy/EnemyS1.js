phina.namespace(function() {

  phina.define("glb.EnemyS1", {
    superClass: "glb.Enemy",

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

  });

  glb.Enemy.data["enemyS1"] = {
    count: 100,
    className: "glb.EnemyS1",
  };

});
