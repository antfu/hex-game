var Player = require('./player')

class HexGame {
  constructor(name) {
    this.name = name
    this.players = {}
    this.start()
  }

  start() {
    // TODO
    this.starttime = (new Date()).getTime()
  }

  player_amount() {
    return Object.keys(this.players).length
  }

  all() {
    return {}
  }

  info() {
    return {}
  }

  get_player(name) {
    return this.players[name] = this.players[name] || new Player(this, name)
  }

  gameover() {
    this.endtime = (new Date()).getTime()
    // TODO
    this.start()
  }

  leave(player) {
    delete this.players[player.name]
    this.boardcast({ players: this.player_amount() })
  }

  boardcast(data) {
    for (var name in this.players)
      this.players[name].send(data)
  }

}

module.exports = HexGame
