// Generated by CoffeeScript 1.3.3
var Monster,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Monster = (function(_super) {

  __extends(Monster, _super);

  function Monster(role, hp, char, power, gainExp, action, devnull) {
    this.role = role;
    this.hp = hp;
    this.char = char;
    this.power = power;
    this.gainExp = gainExp;
    this.action = action;
    Monster.__super__.constructor.call(this, null, this.role, this.hp);
  }

  Monster.prototype.move = function(map, x, y) {
    var direction, fallback, mp;
    fallback = (function() {
      var table;
      table = ['u', 'd', 'r', 'l'];
      return this.walk(map, table[Math.floor(Math.random() * 4)]);
    }).bind(this);
    if (!(x != null) || !(y != null)) {
      return fallback();
    } else {
      if (Math.floor(Math.random() * 10) < 3) {
        return fallback();
      } else {
        mp = this.getPosition();
        direction = (mp.x < x && map.isAttackable(mp.x + 1, mp.y) ? 'r' : mp.x > x && map.isAttackable(mp.x - 1, mp.y) ? 'l' : mp.y < y && map.isAttackable(mp.x, mp.y + 1) ? 'd' : mp.y > y && map.isAttackable(mp.x, mp.y - 1) ? 'u' : false);
        if (direction) {
          return this.walk(map, direction);
        } else {
          return fallback();
        }
      }
    }
  };

  return Monster;

})(Player);