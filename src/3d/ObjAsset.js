phina.namespace(function() {

  phina.define("glb.ObjAsset", {
    superClass: "phina.asset.File",
    
    init: function() {
      this.superInit();
    },
    
    getAttributeData: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";
      
      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      obj = globj.ObjParser.trialgulate(obj);
      return globj.AttributeBuilder.build(obj);
    },

    getAttributeDataEdges: function(objectName, groupName) {
      objectName = objectName || "defaultObject";
      groupName = groupName || "defaultGroup";

      var obj = globj.ObjParser.parse(this.data)[objectName].groups[groupName];
      obj = globj.ObjParser.edge(obj);
      return globj.AttributeBuilder.buildEdges(obj);
    },
  });

  phina.asset.AssetLoader.assetLoadFunctions["obj"] = function(key, path) {
    var shader = glb.ObjAsset();
    return shader.load({
      path: path,
    });
  };

});
