phina.namespace(function() {

  phina.define("glb.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      
      var self = this;

      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          // __test: {
          //   className: "phina.display.Sprite",
          //   arguments: ["test"],
          //   originX: 0,
          //   originY: 0,
          //   onenterframe: function() {
          //     self.scoreGroup.scoreLabel.text = Math.randint(0, 999999999999).separateComma();
          //   },
          // },

          scoreGroup: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
            children: {
              bg: {
                className: "phina.display.RectangleShape",
                arguments: {
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT * 0.04,
                  fill: "black",
                  stroke: null,
                  padding: 0,
                },
                originX: 0,
                originY: 0,
                alpha: 0.8,
              },
              score: {
                className: "glb.UILabel",
                arguments: {
                  text: "SCORE:",
                  align: "left",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.04,
                y: SCREEN_HEIGHT * 0.02,
              },
              scoreLabel: {
                className: "glb.UILabel",
                arguments: {
                  text: "999,999,999,999",
                  align: "right",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.49,
                y: SCREEN_HEIGHT * 0.02,
              },
              highScore: {
                className: "glb.UILabel",
                arguments: {
                  text: "HI:",
                  align: "left",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.54,
                y: SCREEN_HEIGHT * 0.02,
              },
              highScoreLabel: {
                className: "glb.UILabel",
                arguments: {
                  text: "999,999,999,999",
                  align: "right",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.025,
                },
                x: SCREEN_WIDTH * 0.99,
                y: SCREEN_HEIGHT * 0.02,
              },
            },
          },

          gemGroup: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
            x: SCREEN_WIDTH * 0.01,
            y: SCREEN_HEIGHT * 0.04,
            children: {
              bg: {
                className: "phina.display.RectangleShape",
                arguments: {
                  width: SCREEN_WIDTH * 0.3,
                  height: SCREEN_HEIGHT * 0.10,
                  fill: "hsl(240, 100%, 50%)",
                  stroke: null,
                  padding: 0,
                },
                originX: 0,
                originY: 0,
                alpha: 0.25,
              },
              gem: {
                className: "glb.UILabel",
                arguments: {
                  text: "GEM",
                  align: "left",
                  baseline: "top",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.02,
                },
                x: SCREEN_WIDTH * 0.021,
                y: SCREEN_HEIGHT * 0.01,
              },
              gemLabel: {
                className: "glb.UILabel",
                arguments: {
                  text: "9999",
                  align: "right",
                  baseline: "top",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.04,
                },
                x: SCREEN_WIDTH * 0.29,
                y: SCREEN_HEIGHT * 0.01,
              },
              totalGemLabel: {
                className: "glb.UILabel",
                arguments: {
                  text: "999999",
                  align: "right",
                  baseline: "top",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.03,
                },
                x: SCREEN_WIDTH * 0.29,
                y: SCREEN_HEIGHT * 0.06,
              },
            },
          },

          zankiGroup: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
            x: SCREEN_WIDTH * 0.01,
            y: SCREEN_HEIGHT * 0.15,
            children: [{
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.03 * 0,
              y: SCREEN_WIDTH * 0.03 * 0,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.03 * 1,
              y: SCREEN_WIDTH * 0.03 * 1,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.03 * 2,
              y: SCREEN_WIDTH * 0.03 * 0,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.03 * 3,
              y: SCREEN_WIDTH * 0.03 * 1,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.03 * 4,
              y: SCREEN_WIDTH * 0.03 * 0,
            }, ],
          },

          bombGroup: {
            className: "phina.display.DisplayElement",
            originX: 0,
            originY: 0,
            x: 0,
            y: SCREEN_HEIGHT * 0.96,
            children: {
              bg: {
                className: "phina.display.RectangleShape",
                arguments: {
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT * 0.04,
                  fill: "hsl(210, 100%, 20%)",
                  stroke: null,
                  padding: 0,
                },
                originX: 0,
                originY: 0,
                alpha: 0.8,
                children: [{
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 0.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 1.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 2.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 3.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 4.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 5.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, {
                  className: "glb.BombSprite",
                  x: SCREEN_WIDTH * 0.05 * 6.5,
                  y: SCREEN_HEIGHT * 0.02,
                }, ],
              },
            },
          },

        },
      });
    },
  });

  phina.define("glb.UILabel", {
    superClass: "phina.display.Label",
    init: function(options) {
      options.fontFamily = "Share_Tech_Mono";
      this.superInit(options);
    },
    renderFill: function(canvas) {
      var context = canvas.context;
      context.save();
      context.translate(3, 3);
      context.fillStyle = "hsl(190, 100%, 20%)";
      this._lines.forEach(function(line, i) {
        context.fillText(line, 0, i*this.lineSize+this._offset);
      }, this);
      context.restore();
      context.save();
      this._lines.forEach(function(line, i) {
        context.fillText(line, 0, i*this.lineSize+this._offset);
      }, this);
      context.restore();
    },
  });

  phina.define("glb.ZankiSprite", {
    superClass: "phina.display.Sprite",

    init: function() {
      var size = SCREEN_WIDTH * 0.08;
      this.superInit("zanki", size * 0.75, size * 0.75);
    },
  });

  phina.define("glb.BombSprite", {
    superClass: "phina.display.PolygonShape",

    init: function() {
      var size = SCREEN_WIDTH * 0.05;
      this.superInit({
        width: size,
        height: size,
        backgroundColor: "transparent",
        fill: "hsl(240, 100%, 10%)",
        stroke: "hsl(240, 100%, 80%)",
        strokeWidth: 1,
        padding: 0,
        sides: 6,
        radius: size / 2,
      });

      this.fromJSON({
        onenterframe: function() {
          this.rotation += 5;
        },
        children: [{
          className: "glb.UILabel",
          arguments: {
            text: "B",
            fill: "yellow",
            align: "center",
            baseline: "middle",
            fontSize: SCREEN_WIDTH * 0.04,
          },
          x: 0,
          y: 0,
          onenterframe: function() {
            this.rotation -= 5;
          },
        }],
      });
    },
  });

});
