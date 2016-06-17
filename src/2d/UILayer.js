phina.namespace(function() {

  phina.define("glb.UILayer", {
    superClass: "phina.display.DisplayElement",

    init: function() {
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });

      this.fromJSON({
        originX: 0,
        originY: 0,
        children: {
          __test: {
            className: "phina.display.Sprite",
            arguments: ["test"],
            originX: 0,
            originY: 0,
          },

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
                  fill: "hsl(240, 100%, 20%)",
                  stroke: null,
                  padding: 0,
                },
                originX: 0,
                originY: 0,
                alpha: 0.8,
              },
              score: {
                className: "phina.display.Label",
                arguments: {
                  text: "SCORE:",
                  fontFamily: "Aldrich",
                  align: "left",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.02,
                },
                x: SCREEN_WIDTH * 0.04,
                y: SCREEN_HEIGHT * 0.02,
              },
              scoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "999,999,999,999",
                  fontFamily: "Aldrich",
                  align: "right",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.02,
                },
                x: SCREEN_WIDTH * 0.49,
                y: SCREEN_HEIGHT * 0.02,
              },
              highScore: {
                className: "phina.display.Label",
                arguments: {
                  text: "HI:",
                  fontFamily: "Aldrich",
                  align: "left",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.02,
                },
                x: SCREEN_WIDTH * 0.54,
                y: SCREEN_HEIGHT * 0.02,
              },
              highScoreLabel: {
                className: "phina.display.Label",
                arguments: {
                  text: "999,999,999,999",
                  fontFamily: "Aldrich",
                  align: "right",
                  baseline: "middle",
                  fill: "white",
                  stroke: null,
                  fontSize: SCREEN_HEIGHT * 0.02,
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
                className: "phina.display.Label",
                arguments: {
                  text: "GEM",
                  fontFamily: "Aldrich",
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
                className: "phina.display.Label",
                arguments: {
                  text: "9999",
                  fontFamily: "Aldrich",
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
                className: "phina.display.Label",
                arguments: {
                  text: "999999",
                  fontFamily: "Aldrich",
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
              x: SCREEN_WIDTH * 0.045 * 0,
              y: SCREEN_WIDTH * 0.045 * 0,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.045 * 1,
              y: SCREEN_WIDTH * 0.045 * 1,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.045 * 2,
              y: SCREEN_WIDTH * 0.045 * 0,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.045 * 3,
              y: SCREEN_WIDTH * 0.045 * 1,
            }, {
              className: "glb.ZankiSprite",
              originX: 0,
              originY: 0,
              x: SCREEN_WIDTH * 0.045 * 4,
              y: SCREEN_WIDTH * 0.045 * 0,
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

  phina.define("glb.ZankiSprite", {
    superClass: "phina.display.Shape",

    init: function() {
      var size = SCREEN_WIDTH * 0.08;
      this.superInit({
        width: size,
        height: size,
        backgroundColor: "transparent",
        fill: "hsl(240, 100%, 10%)",
        stroke: "hsl(240, 100%, 80%)",
        strokeWidth: 1,
        padding: 0,
      });

      this.fromJSON({
        children: [{
          className: "phina.display.Sprite",
          arguments: ["zanki", size * 0.75, size * 0.75],
          x: size / 2,
          y: size / 2,
          originX: 0.5,
          originY: 0.5,
        }],
      });
    },

    prerender: function(canvas) {
      var size = SCREEN_WIDTH * 0.08;
      canvas.moveTo(0, -size / 2);
      canvas.lineTo(size / 2, 0);
      canvas.lineTo(0, size / 2);
      canvas.lineTo(-size / 2, 0);
      canvas.closePath();
      canvas.fill();
      canvas.stroke();
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
          className: "phina.display.Label",
          arguments: {
            text: "B",
            fontFamily: "Aldrich",
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
