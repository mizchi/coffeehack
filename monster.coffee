  class Monster extends Player
    constructor : (@role, @hp, @char, @power, @gainExp, @action, devnull) ->
      super(null, @role, @hp)

    move : (map, x, y) ->
      fallback = (->
        table = ['u', 'd', 'r', 'l']
        @walk(map, table[Math.floor(Math.random()*4)])).bind(@)
      if not x? or not y?
        fallback()
      else
        if Math.floor(Math.random()*10) < 3 then fallback()
        else
          mp = @getPosition()
          direction = (
            if mp.x < x and map.isWalkable(mp.x+1, mp.y) then 'r'
            else if mp.x > x and map.isWalkable(mp.x-1, mp.y) then 'l'
            else if mp.y < y and map.isWalkable(mp.x, mp.y+1) then 'd'
            else if mp.y > y and map.isWalkable(mp.x, mp.y-1) then 'u'
            else false)
          if direction then @walk(map, direction)
          else fallback()