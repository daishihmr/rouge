phina.namespace(function() {
  
  phina.define("glb.Shape", {
    
    positions: null,
    normals: null,
    uvs: null,
    indices: null,

    init: function() {
      this.positions = [];
      this.normals = [];
      this.uvs = [];
      this.indices = [];
    },

    getDate: function(names) {
      names = Array.prototype.concat([], arguments);
    },

  });
  
});
