class Player {
  constructor(game, name) {
    this.game = game
    this.name = name
  }

  bind_ws(ws) {
    if (this.ws)
      this.ws.close()
    this.ws = ws
    ws.on('close', ()=>{
      this.game.leave(this)
      this.ws = undefined
    })
  }

  is_avaliable() {
    return this.ws !== undefined
  }

  send(data) {
    if (this.is_avaliable()) {
      this.ws.send(JSON.stringify(data), function ack(error) {
        // if error is not defined, the send has been completed,
        // otherwise the error object will indicate what failed.
        if (error)
          console.log('ERROR sending message', error)
      })
    }
  }
}


module.exports = Player
