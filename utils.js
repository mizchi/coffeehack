// Generated by CoffeeScript 1.3.3
var utils;

utils = {};

utils.dice = function(n, x) {
  var i, p, _i;
  n = n || 1;
  x = x || 4;
  p = 0;
  for (i = _i = 1; 1 <= n ? _i <= n : _i >= n; i = 1 <= n ? ++_i : --_i) {
    p += Math.floor(Math.random() * (x - 1) + 1);
  }
  return p;
};
