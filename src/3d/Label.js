phina.namespace(function() {

  phina.define("glb.Label", {
    superClass: "phina.app.Element",
    
    scale: 1.0,
    red: 1,
    green: 1,
    blue: 1,
    alpha: 1,

    init: function(options) {
      this.superInit();
      options = {}.$extend({
        spriteDrawer: null,
        spriteType: "characters",
        texture: "characters.png",
        text: "0",
        x: 0,
        y: 0,
      }, options);

      this.spriteDrawer = options.spriteDrawer;
      this.spriteType = options.spriteType;
      this.characterTexture = phina.asset.AssetManager.get("textureSource", options.texture);
      this.x = options.x;
      this.y = options.y;
      this.text = options.text;

      var self = this;
      this.text.split("").forEach(function(c, i) {
        var frame = self.characterTexture.calcFrame(c);
        var sprite = self.spriteDrawer.get(self.spriteType);
        if (sprite) {
          sprite
            .spawn(frame)
            .addChildTo(self);
        }
      });
    },

    setText: function(text) {
      var self = this;
      self.text = text;
      text.split("").forEach(function(c, i) {
        var frame = self.characterTexture.calcFrame(c);
        var sprite = self.children[i];
        if (!sprite) {
          sprite = self.spriteDrawer.get(self.spriteType);
          if (sprite) {
            sprite
              .spawn({})
              .addChildTo(self);
          }
        }

        if (sprite) sprite.$extend(frame);
      });
    },

    update: function() {
      var self = this;
      this.children.forEach(function(c, i) {
        c.visible = true;
        c.x = self.x + (i - self.text.length / 2) * 15 * self.scale;
        c.y = self.y;
        c.scaleX = self.scale * 1.0;
        c.scaleY = self.scale * 2.0;
        c.red = self.red;
        c.green = self.green;
        c.blue = self.blue;
        c.alpha = self.alpha;
      });
    },

    onremoved: function() {
      this.children.clone().forEach(function(child) {
        child.remove();
      });
    },

  });
});
