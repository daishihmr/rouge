(function(global) {

  var ObjParser;
  var AttributeBuilder;

  (function() {

    ObjParser = {};

    var ptnObject = /^o (.+)$/;
    var ptnGroup = /^g (.+)$/;
    var ptnSmoothShading = /^s (.+)$/;
    var ptnPosition = /^v (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnTexCoord = /^vt (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnNormal = /^vn (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;
    var ptnFace2 = /^f(?: -?\d+\/-?\d+)+$/;
    var ptnFace3 = /^f(?: -?\d+\/-?\d*\/-?\d+)+$/;

    ObjParser.parse = function(data) {
      this.lines = data.split("\n").map(function(line) {
        return line.trim();
      });
      this.cur = 0;

      var objects = {
        defaultObject: {
          groups: {
            defaultGroup: {
              positions: [],
              texCoords: [],
              normals: [],
              faces: [],
            },
          },
        },
      };

      var o = objects.defaultObject;
      var g = o.groups.defaultGroup;
      var len = this.lines.length;
      var m;
      while (this.cur < len) {
        var line = this.lines[this.cur];
        if (line.match(ptnObject)) {
          o = objects[line.substring(2)] = {
            groups: {
              defaultGroup: {
                positions: [],
                texCoords: [],
                normals: [],
                faces: [],
              },
            },
          };
          g = o.groups.defaultGroup;
        } else if (line.match(ptnGroup)) {
          g = o.groups[line.substring(2)] = {
            positions: [],
            texCoords: [],
            normals: [],
            faces: [],
          };
        } else if (line.match(ptnSmoothShading)) {
          var value = line.substring(2);
          if (value == "off") {
            g.smoothShading = false;
          } else {
            g.smoothShading = true;
          }
        } else if (m = line.match(ptnPosition)) {
          g.positions.push({
            x: +m[1],
            y: +m[2],
            z: +m[3],
          });
        } else if (m = line.match(ptnTexCoord)) {
          g.texCoords.push({
            u: +m[1],
            v: +m[2],
          });
        } else if (m = line.match(ptnNormal)) {
          g.normals.push({
            x: +m[1],
            y: +m[2],
            z: +m[3],
          });
        } else if (line.match(ptnFace2)) {
          var face = [];
          var vertices = line.substring(2).split(" ");
          vertices.forEach(function(vertex) {
            var elm = vertex.split("/");
            face.push({
              position: ~~elm[0],
              texCoord: ~~elm[1],
            });
          });
          g.faces.push(face);
        } else if (line.match(ptnFace3)) {
          var face = [];
          var vertices = line.substring(2).split(" ");
          for (var i = 0; i < vertices.length; i++) {
            var elm = vertices[i].split("/");
            face.push({
              position: ~~elm[0],
              texCoord: ~~elm[1],
              normal: ~~elm[2],
            });
          }
          g.faces.push(face);
        }

        this.cur += 1;
      }

      return objects;
    };

    ObjParser.trialgulate = function(obj) {
      var dst = {
        positions: obj.positions.slice(0),
        texCoords: obj.texCoords.slice(0),
        normals: obj.normals.slice(0),
        faces: [],
      };

      for (var i = 0; i < obj.faces.length; i++) {
        var of = obj.faces[i];
        var df = [];
        for (var j = 1; j < of.length - 1; j++) {
          df.push(of[0]);
          df.push(of[j]);
          df.push(of[j + 1]);
        }
        dst.faces.push(df);
      }

      return dst;
    };

    ObjParser.edge = function(obj) {
      var dst = {
        positions: obj.positions.slice(0),
        texCoords: obj.texCoords.slice(0),
        normals: obj.normals.slice(0),
        faces: [],
      };

      for (var i = 0; i < obj.faces.length; i++) {
        var of = obj.faces[i];
        var df = [];
        for (var j = 0; j < of.length - 1; j++) {
          df.push(of[j]);
          df.push(of[j + 1]);
        }
        dst.faces.push(df);
      }

      return dst;
    };

  })();

  (function() {

    AttributeBuilder = {};

    AttributeBuilder.build = function(obj) {
      var attr = {
        indices: [],
        attr: [],
      };

      var indices = {};
      var _i = 0;
      obj.faces.forEach(function(face) {
        face.forEach(function(vertex) {
          var hashCode = [vertex.position, vertex.normal, vertex.texCoord].join(",");
          if (indices[hashCode] === undefined) {
            indices[hashCode] = _i;
            _i += 1;

            var pos = obj.positions[vertex.position - 1];
            var nor = obj.normals[vertex.normal - 1];
            var tex = obj.texCoords[vertex.texCoord - 1];
            attr.attr.push(pos.x, pos.y, pos.z, tex.u, -tex.v, nor.x, nor.y, nor.z);
          }

          attr.indices.push(indices[hashCode]);
        });
      });

      return attr;
    };
    
    AttributeBuilder.buildEdges = function(obj) {
      var attr = {
        indices: [],
        attr: [],
      };

      var indices = {};
      var _i = 0;
      obj.faces.forEach(function(face) {
        face.forEach(function(vertex) {
          var hashCode = [vertex.position].join(",");
          if (indices[hashCode] === undefined) {
            indices[hashCode] = _i;
            _i += 1;

            var pos = obj.positions[vertex.position - 1];
            attr.attr.push(pos.x, pos.y, pos.z);
          }

          attr.indices.push(indices[hashCode]);
        });
      });

      return attr;
    };

  })();

  if (global["module"]) {
    module.exports = {
      ObjParser: ObjParser,
      AttributeBuilder: AttributeBuilder,
    };
  } else {
    global.globj = {
      ObjParser: ObjParser,
      AttributeBuilder: AttributeBuilder,
    };
  }

})(this);
