###
# main.cofffee
# Handles all the user interaction, and bridges between classes.
# Other files should not depend on this file to work.
#
# The only file you have to modify when you port this project to a new environment is this.
# This version targets html5 web browsers.
#
# Newing classes should only happen in this file.
#
# dependencies - command.coffee, game.coffee, (index.html),
#                (lib/jquery), map.coffee, messagelist.coffee, monster.coffee,
#                monsterlist.coffee, (nhtiles/*.gif), ninjitsulist.coffee, player.coffee,
#                (tile.coffee), traplist.coffee
###

MAP_WIDTH = 40
MAP_HEIGHT = 30
MAX_MONSTER = 10 #maximum number of monsters that can exist on the map
MESSAGE_SIZE = 4 #number of massages to save

main_ja = ->
  game = new Game()
  game.setPlayer(new Player('コーヒー飲み', 'Ninja', 12))
  game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT))
  game.nextMap()
  game.player.born(game.currentMap())
  tile = new Tile('ch-canvas') #set up the canvas element
  currentmonsterlist = (m for m in monsterlist when m[1] <= 1)
  message = [
    '',
    '忍者の一族の末裔であるあなたの家には、次のように書かれた巻物が代々伝わっている.',
    '  "以前、このあたりは竜どもが這い回る荒れ果てた土地だった.',
    '   1997年に私たちは県知事の命を受けこの土地を開拓し、その際竜どもを街の中心部にあるダンジョンに閉じ込めた."',
    'coffeehackへようこそ！あなたの街の市長はあなたに竜退治を依頼している.地下鉄を敷きたいそうだ！']

  ## Use jQuery for cross-browser keyboard event handling.
  ## This should be replaced with a lighter function specialized for this occasion.
  $(document).on('keypress', (e) ->
    keyChar = getKeyChar(e.which) #middleware wraps the keycode difference in each browser
    direction = {'k' : 'u', 'j' : 'd', 'l' : 'r',  'h' : 'l'} #kjlh
    if direction[keyChar]
      game.player.walk(game.currentMap(),  direction[keyChar])

    if commands[keyChar]
      commands[keyChar](game)

    game.fire('turn')
  )

  game.on('turn', ->
    ## 0.5 may well be too much, nedd more conideration
    if (Math.random()*10 < 0.5 and game.countMonster() < MAX_MONSTER)
      monster = new Monster(currentmonsterlist[Math.floor(Math.random()*currentmonsterlist.length)]...) # NETHACK LOGIC
      monster.on('attack', (e) ->
        tgt = if e.enemy.name then 'あなた' else e.enemy.role
        action = if Math.round(Math.random()) then e.me.action else '攻撃した'
        game.fire('message', {message : messagelist.format(messagelist.monster.attack, e.me.role, tgt, action)})
      )
      game.addMonster(monster)
    game.moveAllMonsters()
    game.fire('turnend')
  )

  game.on('turnend', ->
    #document.getElementById('jshack').innerHTML = game.drawStage() #activate when you want the text-mode
    updateCanvas(game.drawStage()) #draw the current map on the canvas
    status = [game.player.name, '@ 地下', game.level, '階\n',
      'HP:', Math.floor(game.player.hp), '/', game.player.getMaxHP(), '経験値:', Math.floor(game.player.experience*10)*1/10, '経過ターン:', game.time
    ].join(' ')
    game.fire('status', {status : status}) #writes out the status line at the botttom
  )

  game.on('turnend', ->
    if message[MESSAGE_SIZE].length
      message.shift()
      document.getElementById('message').innerHTML = message.join('\n')
      message.push('')
  )

  game.on('godown', ->
    if not game.nextMap() #false when there is no map deeper than the current
      game.addMap(new Map(MAP_WIDTH, MAP_HEIGHT))
      game.nextMap()
    game.player.born(game.currentMap())
  )
  game.on('godown', ->
    currentmonsterlist = (m for m in monsterlist when m[1] <= (((game.player.explevel or 1) + game.level)/2)) #NETHACK LOGIC
    console.log(currentmonsterlist)
  )
  game.on('goup', ->
    game.prevMap()
    game.player.born(game.currentMap())
  )
  game.on('goup', ->
    currentmonsterlist = (m for m in monsterlist when m[1] <= ((game.player.explevel + game.level)/2 or 1)) #NETHACK LOGIC
  )
  game.on('message', (e) ->
    message[MESSAGE_SIZE] += ' ' + e.message
  )

  game.on('status', (e) ->
    document.getElementById('status').innerHTML = e.status
  )

  game.player.on('attack', (e) ->
    mode = if e.enemy.isDead() then '倒した' else '攻撃した'
    game.fire('message', {message : messagelist.format(messagelist.player.attack, e.enemy.role, mode)})
  )

  game.player.on('move', (e) ->
    if [Map.TRAP, Map.TRAP_ACTIVE].indexOf(game.currentMap().getCell(e.position.x, e.position.y)) > -1
      pp = game.player.getPosition()
      game.currentMap().setCell(pp.x, pp.y, Map.TRAP_ACTIVE)
      traplist[Math.floor(Math.random()*traplist.length)](game) #trap type is decided randomly on the fly
  )

  game.player.on('move', (ev) ->
    if game.currentMap().getCell(ev.position.x, ev.position.y) is Map.ITEM
      ninjitsu = ninjitsulist[Math.floor(Math.random()*ninjitsulist.length)] #ninjutsus, too decided randomly
      game.fire('message', {message :"#{ ninjitsu.name} : #{ninjitsu.description}. ニンジュツを使いますか? (y もしくはy以外)"})
      listener = (e) ->
        document.removeEventListener('keypress', listener)
        if getKeyChar(e.keyCode) is 'y'
          ninjitsu.jitsu(game)
          game.fire('message', {message : ninjitsu.message})
          game.fire('turn')
          game.currentMap().setCell(ev.position.x, ev.position.y, Map.ROOM)
      document.addEventListener('keypress', listener)
  )
  game.player.on('explevelup', (e) ->
    game.fire('message', {message : "経験レベル#{e.explevel}へようこそ！."})
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

  game.fire('turn')


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
    46 : '.',
    121 : 'y',
    110 : 'n'
  }
  keyChar[keyCode]


unless Function::bind
  Function::bind = (oThis) ->
    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")  if typeof this isnt "function"
    aArgs = Array::slice.call(arguments, 1)
    fToBind = this
    fNOP = ->

    fBound = ->
      fToBind.apply (if this instanceof fNOP then this else oThis or window), aArgs.concat(Array::slice.call(arguments))

    fNOP:: = @::
    fBound:: = new fNOP()
    fBound