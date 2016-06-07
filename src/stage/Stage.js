phina.namespace(function() {

  phina.define("glb.Stage", {
    superClass: "phina.app.Element",

    seq: null,
    waitTime: 0,

    init: function() {
      this.superInit();
      this.seq = [];
    },

    update: function() {
      this.waitTime -= 1;
      if (this.waitTime > 0) return;

      var task = this.seq.shift();
      if (task) {
        this.fire(task);
      }
    },
    
    addTask: function(task) {
      this.seq.push(task);
      return this;
    },
    
    onwaitTask: function(e) {
      this.waitTime = e.time;
    },
    
    onstartBgmTask: function(e) {
      phina.asset.SoundManager.playMusic(e.name, e.fadeTime, e.loop);
    },
    
  });

});
