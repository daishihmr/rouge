phina.namespace(function() {

  phina.define("glb.Assets", {
    _static: {
      get: function(options) {
        switch (options.assetType) {
          case "common":
            return {
              image: {
                "zanki": "./asset/image/zanki.png",
              },
              obj: {
                "fighter.obj": "./asset/obj/fighter.obj",
                "bit.obj": "./asset/obj/bit.obj",
                "bitJoin.obj": "./asset/obj/bitJoin.obj",
                "hex.obj": "./asset/obj/hex.obj",
                "barrier.obj": "./asset/obj/barrier.obj",
              },
              textureSource: {
                "fighter.png": "./asset/image/fighter.png",
                "bit.png": "./asset/image/bit.png",
                "bitJoin.png": "./asset/image/bit.png",
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
                "enemyS5.obj": "./asset/obj/enemyS5.obj",
                "enemyS6.obj": "./asset/obj/enemyS6.obj",
                "enemyS7.obj": "./asset/obj/enemyS7.obj",
                "enemyM1.obj": "./asset/obj/enemyM1.obj",
                "enemyM2.obj": "./asset/obj/enemyM2.obj",
                "enemyM3.obj": "./asset/obj/enemyM3.obj",
                "enemyM4.obj": "./asset/obj/enemyM4.obj",
              },
              textureSource: {
                "enemyS1.png": "./asset/image/enemyS1.png",
                "enemyS2.png": "./asset/image/enemyS2.png",
                "enemyS3.png": "./asset/image/enemyS3.png",
                "enemyS4.png": "./asset/image/enemyS4.png",
                "enemyS5.png": "./asset/image/enemyS5.png",
                "enemyS6.png": "./asset/image/enemyS6.png",
                "enemyS7.png": "./asset/image/enemyS7.png",
                "enemyM1.png": "./asset/image/enemyM1.png",
                "enemyM2.png": "./asset/image/enemyM2.png",
                "enemyM3.png": "./asset/image/enemyM3.png",
                "enemyM4.png": "./asset/image/enemyM4.png",
              },
            };
          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});
