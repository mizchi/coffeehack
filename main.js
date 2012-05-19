// Generated by CoffeeScript 1.3.3
var MAP_HEIGHT, MAP_WIDTH, MESSAGE_SIZE, commands, getKeyChar, monsterlist, ninjitsulist, traplist;

commands = typeof require !== "undefined" && require !== null ? require('commands') : window.commands;

monsterlist = typeof require !== "undefined" && require !== null ? require('monsterlist') : window.monsterlist;

traplist = typeof require !== "undefined" && require !== null ? require('traplist') : window.traplist;

ninjitsulist = typeof require !== "undefined" && require !== null ? require('ninjitsulist') : window.ninjitsulist;

MAP_WIDTH = 40;

MAP_HEIGHT = 30;

MESSAGE_SIZE = 4;

window.addEventListener('load', function() {
  var currentmonsterlist, game, i, m, message, monstermap, prevmapstr, tile, updateCanvas, _i, _len;
  game = new Game();
  game.setPlayer(new Player('ympbyc', 'Samurai', 12));
  game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT));
  game.nextMap();
  game.player.born(game.currentMap());
  tile = new Tile('ch-canvas');
  currentmonsterlist = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = monsterlist.length; _i < _len; _i++) {
      m = monsterlist[_i];
      if (m[6] <= 0) {
        _results.push(m);
      }
    }
    return _results;
  })();
  console.log(currentmonsterlist);
  message = ['', ' The following is written in a secret scroll you inherited from your ancestor.', '  "There once were mean dragons crawling all around us on the ground', '    In 1997 we have succeeded to lock them in the ancient underground dungeon at the centre of our town."', 'Welcome to coffeehack. You are a neutral male ninja. Slay the dragons!'];
  document.addEventListener('keypress', function(e) {
    var direction, keyChar;
    keyChar = getKeyChar(e.keyCode);
    direction = {
      'k': 'u',
      'j': 'd',
      'l': 'r',
      'h': 'l'
    };
    if (direction[keyChar]) {
      game.player.walk(game.currentMap(), direction[keyChar]);
    }
    if (commands[keyChar]) {
      commands[keyChar](game);
    }
    return game.fire('turn');
  });
  game.on('turn', function() {
    var monster;
    if (Math.random() * 10 < 0.2 && game.countMonster() < 10) {
      monster = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t = typeof result;
        return t == "object" || t == "function" ? result || child : child;
      })(Monster, currentmonsterlist[Math.floor(Math.random() * currentmonsterlist.length)], function(){});
      monster.on('attack', function(e) {
        var action, tgt;
        tgt = e.enemy.name ? 'You' : 'the ' + e.enemy.role;
        action = Math.round(Math.random()) ? e.me.action : 'hits';
        return game.fire('message', {
          message: messagelist.format(messagelist.monster.attack, e.me.role, action, tgt)
        });
      });
      game.addMonster(monster);
    }
    game.moveAllMonsters();
    return game.fire('turnend');
  });
  game.on('turnend', function() {
    var status;
    document.getElementById('jshack').innerHTML = game.drawStage();
    updateCanvas(game.drawStage());
    status = [game.player.name, '@ level', game.level, '\n', 'hp:', Math.floor(game.player.hp), '/', game.player.getMaxHP(), 'exp:', Math.floor(game.player.experience * 10) * 1 / 10, 'time:', game.time].join(' ');
    return game.fire('status', {
      status: status
    });
  });
  game.on('turnend', function() {
    if (message[MESSAGE_SIZE].length) {
      message.shift();
      document.getElementById('message').innerHTML = message.join('\n');
      return message.push('');
    }
  });
  game.on('godown', function() {
    if (!game.nextMap()) {
      game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT));
      game.nextMap();
    }
    return game.player.born(game.currentMap());
  });
  game.on('godown', function() {
    currentmonsterlist = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = monsterlist.length; _i < _len; _i++) {
        m = monsterlist[_i];
        if (m[6] <= game.level) {
          _results.push(m);
        }
      }
      return _results;
    })();
    return console.log(currentmonsterlist);
  });
  game.on('goup', function() {
    game.prevMap();
    return game.player.born(game.currentMap());
  });
  game.on('goup', function() {
    return currentmonsterlist = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = monsterlist.length; _i < _len; _i++) {
        m = monsterlist[_i];
        if (m[6] <= game.level) {
          _results.push(m);
        }
      }
      return _results;
    })();
  });
  game.on('message', function(e) {
    return message[MESSAGE_SIZE] += ' ' + e.message;
  });
  game.on('status', function(e) {
    return document.getElementById('status').innerHTML = e.status;
  });
  game.player.on('attack', function(e) {
    var mode;
    mode = e.enemy.isDead() ? 'killed' : 'hit';
    return game.fire('message', {
      message: messagelist.format(messagelist.player.attack, mode, e.enemy.role)
    });
  });
  game.player.on('move', function(e) {
    var pp;
    if ([Map.TRAP, Map.TRAP_ACTIVE].indexOf(game.currentMap().getCell(e.position.x, e.position.y)) > -1) {
      pp = game.player.getPosition();
      game.currentMap().setCell(pp.x, pp.y, Map.TRAP_ACTIVE);
      return traplist[Math.floor(Math.random() * traplist.length)](game);
    }
  });
  game.player.on('move', function(ev) {
    var listener, ninjitsu;
    if (game.currentMap().getCell(ev.position.x, ev.position.y) === Map.ITEM) {
      ninjitsu = ninjitsulist[Math.floor(Math.random() * ninjitsulist.length)];
      game.fire('message', {
        message: "" + ninjitsu.name + " : " + ninjitsu.description + ". spell? (y or anything else)"
      });
      listener = function(e) {
        document.removeEventListener('keypress', listener);
        if (getKeyChar(e.keyCode) === 'y') {
          ninjitsu.jitsu(game);
          game.fire('message', {
            message: ninjitsu.message
          });
          game.fire('turn');
          return game.currentMap().setCell(ev.position.x, ev.position.y, Map.ROOM);
        }
      };
      return document.addEventListener('keypress', listener);
    }
  });
  prevmapstr = ((function() {
    var _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = MAP_WIDTH * MAP_HEIGHT; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      _results.push('0');
    }
    return _results;
  })()).join('');
  monstermap = {};
  for (_i = 0, _len = monsterlist.length; _i < _len; _i++) {
    m = monsterlist[_i];
    monstermap[m[2]] = m[0];
  }
  updateCanvas = function(mapstr) {
    var cell, j, ptr, _j, _results;
    mapstr = mapstr.replace(/\n/g, '');
    ptr = -1;
    _results = [];
    for (i = _j = 0; 0 <= MAP_HEIGHT ? _j < MAP_HEIGHT : _j > MAP_HEIGHT; i = 0 <= MAP_HEIGHT ? ++_j : --_j) {
      _results.push((function() {
        var _k, _results1;
        _results1 = [];
        for (j = _k = 0; 0 <= MAP_WIDTH ? _k < MAP_WIDTH : _k > MAP_WIDTH; j = 0 <= MAP_WIDTH ? ++_k : --_k) {
          ptr++;
          if (prevmapstr[ptr] === mapstr[ptr]) {
            continue;
          }
          cell = (function() {
            switch (mapstr[ptr]) {
              case ' ':
                return ['map', 'blank'];
              case '.':
                return ['map', 'room'];
              case '#':
                return ['map', 'path'];
              case '|':
                return ['map', 'wall_vert'];
              case '-':
                return ['map', 'wall_horiz'];
              case '^':
                return ['map', 'trap_active'];
              case '<':
                return ['map', 'stair_up'];
              case '>':
                return ['map', 'stair_down'];
              case '*':
                return ['map', 'item'];
              case '@':
                return ['monster', 'player'];
              default:
                return ['monster', monstermap[mapstr[ptr]]];
            }
          })();
          _results1.push(tile.update(j, i, cell[0], cell[1]));
        }
        return _results1;
      })());
    }
    return _results;
  };
  return game.fire('turn');
});

getKeyChar = function(keyCode) {
  var keyChar;
  keyChar = {
    62: '>',
    60: '<',
    107: 'k',
    106: 'j',
    108: 'l',
    104: 'h',
    38: 'k',
    40: 'j',
    39: 'l',
    37: 'h',
    46: '.',
    121: 'y',
    110: 'n'
  };
  return keyChar[keyCode];
};
