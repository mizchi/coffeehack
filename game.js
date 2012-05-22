// Generated by CoffeeScript 1.3.3
var Game,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Game = (function(_super) {

  __extends(Game, _super);

  function Game() {
    Game.__super__.constructor.call(this);
    this.monsterStack = [[]];
    this.mapStack = [];
    this.level = -1;
    this.time = 0;
    this.on('turn', (function() {
      return this.turnInit();
    }).bind(this));
    this.on('turnend', (function() {
      return this.turnEnd();
    }).bind(this));
  }

  Game.prototype.setPlayer = function(player) {
    this.player = player;
  };

  Game.prototype.addMap = function(map) {
    return this.mapStack.push(map);
  };

  Game.prototype.currentMap = function() {
    return this.mapStack[this.level];
  };

  Game.prototype.nextMap = function() {
    if (!(this.mapStack[this.level + 1] != null)) {
      return false;
    }
    this.player.fire('godown', {
      prevMap: this.currentMap()
    });
    this.level++;
    this.levelInit();
    return this.mapStack[this.level];
  };

  Game.prototype.prevMap = function() {
    this.player.fire('goup', {
      prevMap: this.currentMap()
    });
    this.level--;
    return this.mapStack[this.level];
  };

  Game.prototype.levelInit = function() {
    if (!this.monsterStack[this.level]) {
      return this.monsterStack.push([]);
    }
  };

  Game.prototype.addMonster = function(monster) {
    monster.born(this.currentMap());
    return this.monsterStack[this.level].push(monster);
  };

  Game.prototype.killMonsters = function() {
    var i, ms, pos, _i, _ref, _results;
    ms = this.monsterStack[this.level];
    _results = [];
    for (i = _i = 0, _ref = ms.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (ms[i] && ms[i].isDead()) {
        pos = ms[i].getPosition();
        this.currentMap().clearReservation(pos.x, pos.y);
        _results.push(delete ms[i]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Game.prototype.countMonster = function() {
    var ctr, m, _i, _len, _ref;
    ctr = 0;
    _ref = this.monsterStack[this.level];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      if (m != null) {
        ctr++;
      }
    }
    return ctr;
  };

  Game.prototype.moveAllMonsters = function() {
    var m, pp, _i, _len, _ref, _results;
    pp = this.player.getPosition();
    _ref = this.monsterStack[this.level];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      if (m) {
        m.move(this.currentMap(), pp.x, pp.y);
        _results.push(m.fire('move'));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Game.prototype.turnInit = function() {
    this.time++;
    if (this.player.hp < this.player.getMaxHP()) {
      return this.player.hp += 0.2;
    }
  };

  Game.prototype.turnEnd = function() {
    this.killMonsters();
    if (this.player.isDead()) {
      return alert('you died');
    }
  };

  Game.prototype.drawStage = function() {
    var m, map, monsterPos, playerPos, ret, s, saveMonsterCell, savePlayerCell, _i, _j, _len, _len1, _ref;
    map = this.currentMap();
    playerPos = this.player.getPosition();
    savePlayerCell = map.getCell(playerPos.x, playerPos.y);
    map.setCell(playerPos.x, playerPos.y, '@');
    saveMonsterCell = [];
    _ref = this.monsterStack[this.level];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      if (m) {
        monsterPos = m.getPosition();
        saveMonsterCell.push({
          x: monsterPos.x,
          y: monsterPos.y,
          save: map.getCell(monsterPos.x, monsterPos.y)
        });
        map.setCell(monsterPos.x, monsterPos.y, m.char);
      }
    }
    ret = map.show();
    map.setCell(playerPos.x, playerPos.y, savePlayerCell);
    for (_j = 0, _len1 = saveMonsterCell.length; _j < _len1; _j++) {
      s = saveMonsterCell[_j];
      map.setCell(s.x, s.y, s.save);
    }
    return ret;
  };

  return Game;

})(EventEmitter);