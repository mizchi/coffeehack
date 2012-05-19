// Generated by CoffeeScript 1.3.3
var EventEmitter;

EventEmitter = (function() {

  function EventEmitter() {
    this.listenerStack = [];
  }

  EventEmitter.prototype.on = function(type, listener) {
    return this.listenerStack.push({
      type: type,
      listener: listener
    });
  };

  EventEmitter.prototype.off = function(type, listener) {
    var i, _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = this.listenerStack.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this.listenerStack[i] && this.listenerStack[i].type === type && this.listenerStack[i].listener === listener) {
        _results.push(this.listenerStack[i] = void 0);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  EventEmitter.prototype.fire = function(type, obj) {
    var item, _i, _len, _ref, _results;
    _ref = this.listenerStack;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item && item.type === type) {
        _results.push(item.listener(obj));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return EventEmitter;

})();
