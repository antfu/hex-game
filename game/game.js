var Player = require('./player')
var utils = require('../public/static/scripts/utils')

class HexGame {
  constructor(name) {
    this.name = name
    this.players = [undefined, undefined]
    this.playing = false
    this.size = 13
  }

  start() {
    // TODO
    this.starttime = (new Date()).getTime()
    this.chess = utils.create_ground(this.size)
    this.current = 1
    this.turns = 0
    this.playing = true
    this.types = Math.floor(Math.random() * 2) == 1 ? [1, 2] : [2, 1]

    this.boardcast({ start: true, init: this.size, current: this.current })

    this.players[0].send_json({ your: this.types[0] })
    this.players[1].send_json({ your: this.types[1] })
  }

  abort() {
    this.playing = false
  }

  is_full() {
    return this.players[0] && this.players[1]
  }

  players_amount() {
    return !!this.players[0] + !!this.players[1] + 0
  }

  join(ws) {
    var index = !this.players[0] ? 0 : (!this.players[1] ? 1 : -1)
    if (index === -1)
      return false
    this.players[index] = ws

    ws.on('close', () => {
      this.players[index] = undefined
      if (this.players_amount() === 0)
        this.abort()
      else
        this.boardcast({ players_amount: this.players_amount() })
    })

    ws.send_json = data => {
      ws.send(JSON.stringify(data), error => {
        // if error is not defined, the send has been completed,
        // otherwise the error object will indicate what failed.
        if (error)
          console.log('ERROR sending message', error)
      })
    }

    ws.on('message', e => {
      console.log('INFO ws message:' + e)
      try {
        var msg = JSON.parse(e)
      } catch (e) {
        console.log('ERROR parsing message from client', e)
        return
      }

      if (msg.restart)
        this.start()
      if (msg.play)
        this.play(msg.play, index)
    })

    this.boardcast({ players_amount: this.players_amount() })

    if (this.playing)
      ws.send_json({
        start: true,
        chess: this.chess,
        current: this.current,
        your: this.types[index]
      })
    if (this.players_amount() === 2 && !this.playing)
      this.start()

    return true
  }

  play(coor, index) {
    if (this.playing && this.types[index] === this.current) {
      var chess = this.chess[coor[0]][coor[1]]
      if (chess.state === 0)
        chess.state = this.current

      this.turns += 1
      this.current = this.current === 1 ? 2 : 1
      this.boardcast({ played: { coordinate: coor, state: chess.state }, current: this.current })
      this.check()
    }
  }

  check() {
    var result = utils.check(this.chess, this.size)
    if (result)
      this.boardcast({ gameover: { win: result } })
  }

  all() {
    return {}
  }

  info() {
    return {}
  }

  boardcast(data) {
    for (let p of this.players)
      if (p)
        p.send_json(data)
  }

}

module.exports = HexGame
