phina.namespace(function() {

  phina.define("glb.Obj", {
    superClass: "phina.app.Element",

    id: -1,
    instanceData: null,

    visible: false,
    position: null,
    quaternion: null,
    scale: null,
    matrix: null,

    dirty: true,

    init: function(id, instanceData, instanceStride) {
      this.superInit();
      this.id = id;
      this.instanceData = instanceData;
      this.index = id * instanceStride;

      this.position = vec3.create();
      this.quaternion = quat.create();
      this.scale = vec3.create();
      this.matrix = mat4.create();
    },

    spawn: function(options) {
      options = {}.$extend({
        visible: true,
        x: 0,
        y: 0,
        z: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        scaleX: OBJ_SCALE,
        scaleY: OBJ_SCALE,
        scaleZ: OBJ_SCALE,
      }, options);

      var index = this.index;
      var instanceData = this.instanceData;
      this.age = 0;

      this.visible = options.visible;
      this.x = options.x;
      this.y = options.y;
      this.z = options.z;
      this.scaleX = options.scaleX;
      this.scaleY = options.scaleY;
      this.scaleZ = options.scaleZ;

      quat.identity(this.quaternion);
      quat.rotateZ(this.quaternion, this.quaternion, options.rotZ);
      quat.rotateY(this.quaternion, this.quaternion, options.rotY);
      quat.rotateX(this.quaternion, this.quaternion, options.rotX);

      this.dirty = true;
      this.update();

      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.dirty) {
        mat4.fromRotationTranslationScale(this.matrix, this.quaternion, this.position, this.scale);

        instanceData[index + 0] = this.visible ? 1 : 0;
        instanceData[index + 1] = this.matrix[0];
        instanceData[index + 2] = this.matrix[1];
        instanceData[index + 3] = this.matrix[2];
        instanceData[index + 4] = this.matrix[4];
        instanceData[index + 5] = this.matrix[5];
        instanceData[index + 6] = this.matrix[6];
        instanceData[index + 7] = this.matrix[8];
        instanceData[index + 8] = this.matrix[9];
        instanceData[index + 9] = this.matrix[10];
        instanceData[index + 10] = this.matrix[12];
        instanceData[index + 11] = this.matrix[13];
        instanceData[index + 12] = this.matrix[14];
        this.dirty = false;
      }

      this.age += 1;
    },

    onremoved: function() {
      this.instanceData[this.index + 0] = 0;
    },

    rotateX: function(rad) {
      quat.rotateX(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },
    rotateY: function(rad) {
      quat.rotateY(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },
    rotateZ: function(rad) {
      quat.rotateZ(this.quaternion, this.quaternion, rad);
      this.dirty = true;
      return this;
    },

    lookAt: function(target) {
      var mp = this.position;
      var tp = target.position;

      quat.identity(this.quaternion);
      this.rotateZ(Math.atan2(tp[1] - mp[1], tp[0] - mp[0]));

      var from = vec3.sub(vec3.create(), [tp[0], tp[1], 0], [mp[0], mp[1], 0]);
      var to = vec3.sub(vec3.create(), tp, mp);
      var q = quat.rotationTo(quat.create(), vec3.normalize(from, from), vec3.normalize(to, to));
      quat.mul(this.quaternion, this.quaternion, q);

      this.dirty = true;
      return this;
    },

    _accessor: {
      x: {
        get: function() {
          return this.position[0];
        },
        set: function(v) {
          this.position[0] = v;
          this.dirty = true;
        }
      },
      y: {
        get: function() {
          return this.position[1];
        },
        set: function(v) {
          this.position[1] = v;
          this.dirty = true;
        }
      },
      z: {
        get: function() {
          return this.position[2];
        },
        set: function(v) {
          this.position[2] = v;
          this.dirty = true;
        }
      },
      scaleX: {
        get: function() {
          return this.scale[0];
        },
        set: function(v) {
          this.scale[0] = v;
          this.dirty = true;
        }
      },
      scaleY: {
        get: function() {
          return this.scale[1];
        },
        set: function(v) {
          this.scale[1] = v;
          this.dirty = true;
        }
      },
      scaleZ: {
        get: function() {
          return this.scale[2];
        },
        set: function(v) {
          this.scale[2] = v;
          this.dirty = true;
        }
      },
    }
  });

});
