phina.namespace(function() {

  phina.define("glb.LoadScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
      });
      this.gl = options.gl;
      this.assetType = options.assetType;
      this.totalCount = 0;
      this.count = 0;

      this.fromJSON({
        children: {
          label: {
            className: "phina.display.Label",
            arguments: "loading",
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 2,
            fill: "white",
            stroke: null,
          },
        }
      });

      this.tweener.wait(66).call(function() {
        this.load();
      }.bind(this));
    },

    onprogress: function() {
      this.count += 1;

      // TODO
      this.label.text = this.count + "/" + this.totalCount;
    },

    oncomplete: function() {
      this.app.popScene();
    },

    load: function() {
      var self = this;
      var gl = this.gl;
      var manager = phina.asset.AssetManager;

      this.totalCount =
        Object.keys(manager.assets["vertexShader"]).length +
        Object.keys(manager.assets["obj"]).length +
        Object.keys(manager.assets["textureSource"]).length;

      var flows = [];

      manager.assets["vertexShader"].forIn(function(key, obj) {
        var flow = phina.util.Flow(function(resolve) {
          var name = key.replace(".vs", "");
          var shader = phigl.Program(gl)
            .attach(name + ".vs")
            .attach(name + ".fs")
            .link();

          manager.set("shader", name, shader);

          self.flare("progress");
          resolve();
        });

        flows.push(flow);
      });

      manager.assets["obj"].forIn(function(key, obj) {
        var flow = phina.util.Flow(function(resolve) {
          var attrData = obj.getAttributeData();
          var edgeData = obj.getAttributeDataEdges();

          var vbo = phigl.Vbo(gl).set(attrData);
          var ibo = phigl.Ibo(gl).set(Array.range(attrData.length / 8));
          var edgesVbo = phigl.Vbo(gl).set(edgeData);
          var edgesIbo = phigl.Ibo(gl).set(Array.range(edgeData.length / 3));

          manager.set("vbo", key, vbo);
          manager.set("ibo", key, ibo);
          manager.set("edgesVbo", key, edgesVbo);
          manager.set("edgesIbo", key, edgesIbo);

          self.flare("progress");

          resolve();
        });

        flows.push(flow);
      });

      manager.assets["textureSource"].forIn(function(key, image) {
        var flow = phina.util.Flow(function(resolve) {
          var texture = phigl.Texture(gl, image);

          manager.set("texture", key, texture);

          self.flare("progress");

          resolve();
        });

        flows.push(flow);
      });

      phina.util.Flow.all(flows).then(function() {
        self.flare("complete");
      });

      return this;
    },

    _static: {
      deleteAssets: function(assetType) {
        var assets = glb.Assets.get(assetType);
        var manager = phina.asset.AssetManager;

        if (assets["obj"]) {
          assets["obj"].forIn(function(key) {
            if (manager.get("vbo", key)) {
              manager.get("vbo", key).delete();
              delete manager.assets["vbo"][key];
            }
            if (manager.get("ibo", key)) {
              manager.get("ibo", key).delete();
              delete manager.assets["ibo"][key];
            }
            if (manager.get("edgesVbo", key)) {
              manager.get("edgesVbo", key).delete();
              delete manager.assets["edgesVbo"][key];
            }
            if (manager.get("edgesIbo", key)) {
              manager.get("edgesIbo", key).delete();
              delete manager.assets["edgesIbo"][key];
            }

            if (manager.assets["obj"]) {
              delete manager.assets["obj"][key];
            }
          });
        }

        if (assets["textureSource"]) {
          assets["textureSource"].forIn(function(key, obj) {
            if (manager.get("texture", key)) {
              manager.get("texture", key).delete();
              delete manager.assets["texture"][key];
            }

            if (manager.assets["textureSource"]) {
              delete manager.assets["textureSource"][key];
            }
          });
        }
      },
    },
  });

});
