phina.namespace(function() {

  /**
   * @param {Function} [fn] return true if lhs and rhs are equivalence.
   */
  Array.prototype.$method("uniq", function(fn) {
    if (fn) {
      return this.filter(function(me, index, self) {
        return !self.slice(0, index).some(function(another) {
          return fn(me, another);
        });
      });
    } else {
      return this.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    }
  });
  
  Number.prototype.$method("separateComma", function() {
    var str = "" + this;
    var result = "";
    for (var i = 0, len = str.length; i < len; i++) {
      if (i !== 0 && i % 3 === 0) result = "," + result;
      result = str[len - i - 1] + result;
    }
    return result;
  });

});
