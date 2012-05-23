// Generated by CoffeeScript 1.3.3
var messagelist_ja,
  __slice = [].slice;

messagelist_ja = {};

messagelist_ja.format = function() {
  var args, str, variable, _i, _len;
  str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    variable = args[_i];
    str = str.replace('?', variable);
  }
  return str;
};

messagelist_ja.trap = {
  stone: "頭上から石が落ちてきてあなたに当たった.",
  hole: "足下で隠し扉が開いた.",
  teleport: "おえっぷ、はきそう…"
};

messagelist_ja.player = {
  attack: "あなたの攻撃は?に当たった."
};

messagelist_ja.monster = {
  attack: "?は?に?."
};