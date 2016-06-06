phina.namespace(function() {

  phina.define("glb.Assets", {
    _static: {
      get: function(options) {
        var assets;

        switch (options.assetType) {
          case "common":
            return {
              obj: {
                "fighter.obj": "./asset/obj/fighter.obj",
                "hex.obj": "./asset/obj/hex.obj",
                "barrier.obj": "./asset/obj/barrier.obj",
              },
              textureSource: {
                "fighter.png": "./asset/image/fighter.png",
                "shot.png": "./asset/image/shot.png",
                "bullets.png": "./asset/image/bullets.png",
                "effect.png": "./asset/image/effect.png",
                "barrier.png": "./asset/image/barrier.png",
              },
              vertexShader: {
                "bullets.vs": "./asset/shader/bullets.vs",
                "sprites.vs": "./asset/shader/sprites.vs",
                "terrain.vs": "./asset/shader/terrain.vs",
                "terrainEdge.vs": "./asset/shader/terrainEdge.vs",
                "obj.vs": "./asset/shader/obj.vs",
                "objEdge.vs": "./asset/shader/objEdge.vs",
                "objGlow.vs": "./asset/shader/objGlow.vs",
                "postproccess_copy.vs": "./asset/shader/postproccess.vs",
                "postproccess_blur.vs": "./asset/shader/postproccess.vs",
                "postproccess_zoom.vs": "./asset/shader/postproccess.vs",
              },
              fragmentShader: {
                "bullets.fs": "./asset/shader/bullets.fs",
                "sprites.fs": "./asset/shader/sprites.fs",
                "terrain.fs": "./asset/shader/terrain.fs",
                "terrainEdge.fs": "./asset/shader/terrainEdge.fs",
                "obj.fs": "./asset/shader/obj.fs",
                "objEdge.fs": "./asset/shader/objEdge.fs",
                "objGlow.fs": "./asset/shader/objGlow.fs",
                "postproccess_copy.fs": "./asset/shader/postproccess_copy.fs",
                "postproccess_blur.fs": "./asset/shader/postproccess_blur.fs",
                "postproccess_zoom.fs": "./asset/shader/postproccess_zoom.fs",
              },
            };
          case "stage1":
            return {
              obj: {
                "enemyS1.obj": "./asset/obj/enemyS1.obj",
                "enemyS2.obj": "./asset/obj/enemyS2.obj",
                "enemyS3.obj": "./asset/obj/enemyS3.obj",
                "enemyS4.obj": "./asset/obj/enemyS4.obj",
              },
              textureSource: {
                "enemyS1.png": "./asset/image/enemyS1.png",
                "enemyS2.png": "./asset/image/enemyS2.png",
                "enemyS3.png": "./asset/image/enemyS3.png",
                "enemyS4.png": "./asset/image/enemyS4.png",
              },
            };
          default:
            console.log(options.assetType);
            throw "invalid assetType";
        }
      },
    },
  });

});
