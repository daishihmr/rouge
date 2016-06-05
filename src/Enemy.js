phina.namespace(function() {

  phina.define("glb.Enemy", {
    superClass: "glb.Obj",

    _active: false,

    hp: 0,
    mutekiTime: 0,

    init: function(id, instanceData, instanceStride) {
      this.superInit(id, instanceData, instanceStride);
    },

    activate: function() {
      this._active = true;
      this.flare("activated");
      return this;
    },

    inactivate: function() {
      this._active = false;
      this.flare("inactivated");
      return this;
    },

    update: function(app) {
      var index = this.index;
      var instanceData = this.instanceData;

      if (this.dirty) {
        quat.mul(tempQuat, RX, this.quaternion);
        mat4.fromRotationTranslationScale(this.matrix, tempQuat, this.position, this.scale);

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
      this.mutekiTime -= 1;
    },

    damage: function(d) {
      if (this.mutekiTime > 0) {
        this.hp -= v;
        this.mutekiTime = 1;
        this.flare("damaged");
      }
    },

  });

  var RX = quat.setAxisAngle(quat.create(), [1, 0, 0], (30).toRadian());
  var tempQuat = quat.create();

});
