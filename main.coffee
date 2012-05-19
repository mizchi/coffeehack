commands =  if require? then require('commands') else window.commands
monsterlist =  if require? then require('monsterlist') else window.monsterlist
traplist = if require? then require('traplist') else window.traplist

MAP_WIDTH = 25
MAP_HEIGHT = 18

window.addEventListener('load', ->
  game = new Game()
  game.setPlayer(new Player('ympbyc', 'Samurai', 12))
  game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT))
  game.nextMap()
  game.player.born(game.currentMap())
  tile = new Tile('ch-canvas')
  currentmonsterlist = (m for m in monsterlist when m[6] <= 0)
  console.log(currentmonsterlist)
  message = ' '

  document.addEventListener('keypress', (e) ->
    keyChar = getKeyChar(e.keyCode)
    direction = {'k' : 'u', 'j' : 'd', 'l' : 'r',  'h' : 'l'} #kjlh
    if direction[keyChar]
      game.player.walk(game.currentMap(),  direction[keyChar])

    if commands[keyChar]
      commands[keyChar](game)

    game.fire('turn')
  )

  game.on('turn', ->
    if (Math.random()*10 < 0.2 and game.countMonster() < 10)
      monster = new Monster(currentmonsterlist[Math.floor(Math.random()*currentmonsterlist.length)]...)
      monster.on('attack', (e) ->
        tgt = if e.enemy.name then 'You' else 'the ' + e.enemy.role
        action = if Math.round(Math.random()) then e.me.action else 'hits'
        game.fire('message', {message : messagelist.format(messagelist.monster.attack, e.me.role, action, tgt)})
      )
      game.addMonster(monster)
    game.moveAllMonsters()
    game.fire('turnend')
  )

  game.on('turnend', ->
    #document.getElementById('jshack').innerHTML = game.drawStage()
    updateCanvas(game.drawStage())
    status = [game.player.name, '@ level', game.level, '\n',
      'hp:', Math.floor(game.player.hp), '/', game.player.getMaxHP(), 'exp:', Math.floor(game.player.experience*10)*1/10, 'time:', game.time
    ].join(' ')
    game.fire('status', {status : status})
  )

  game.on('turnend', ->
    document.getElementById('message').innerHTML = message
    message = ' '
  )

  game.on('godown', ->
    game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT))
    game.nextMap()
    game.player.born(game.currentMap())
  )
  game.on('godown', ->
    currentmonsterlist = (m for m in monsterlist when m[6] <= game.level)
    console.log(currentmonsterlist)
  )
  game.on('goup', ->
    game.prevMap()
    game.player.born(game.currentMap())
  )
  game.on('goup', ->
    currentmonsterlist = (m for m in monsterlist when m[6] <= game.level)
  )
  game.on('message', (e) ->
    message += ' ' + e.message
  )

  game.on('status', (e) ->
    document.getElementById('status').innerHTML = e.status
  )

  game.player.on('attack', (e) ->
    mode = if e.enemy.isDead() then 'killed' else 'hit'
    game.fire('message', {message : messagelist.format(messagelist.player.attack, mode, e.enemy.role)})
  )

  game.player.on('move', (e) ->
    if [Map.TRAP, Map.TRAP_ACTIVE].indexOf(game.currentMap().getCell(e.position.x, e.position.y)) > -1
      pp = game.player.getPosition()
      game.currentMap().setCell(pp.x, pp.y, Map.TRAP_ACTIVE)
      traplist[Math.floor(Math.random()*traplist.length)](game)
  )

  prevmapstr = (for i in [0...MAP_WIDTH*MAP_HEIGHT]
    '0').join('')
  monstermap = {}
  for m in monsterlist
    monstermap[m[2]] = m[0]

  updateCanvas = (mapstr) ->
    mapstr = mapstr.replace(/\n/g, '')
    ptr = -1
    for i in [0...MAP_HEIGHT]
      for j in [0...MAP_WIDTH]
        ptr++;
        if prevmapstr[ptr] is mapstr[ptr] then continue
        cell = switch mapstr[ptr]
          when ' ' then ['map', 'blank']
          when '.' then ['map', 'room']
          when '#' then ['map', 'path']
          when '|' then ['map', 'wall_vert']
          when '-' then ['map', 'wall_horiz']
          when '^' then ['map', 'trap_active']
          when '<' then ['map', 'stair_up']
          when '>' then ['map', 'stair_down']
          when '*' then ['map', 'item']
          when '@' then ['monster', 'player']
          else
            ['monster', monstermap[mapstr[ptr]]]

        tile.update(j, i, cell[0], cell[1])
)

getKeyChar = (keyCode) ->
  keyChar = {
    62 : '>',
    60 : '<',
    107 : 'k',
    106 : 'j',
    108 : 'l',
    104 : 'h',
    38 : 'k',
    40 : 'j',
    39 : 'l',
    37 : 'h',
    46 : '.'
  }
  keyChar[keyCode]
