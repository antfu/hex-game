var express = require('express')
var router = express.Router()
var Game = require('../game/game')

var rooms = {}

router.ws('/r/:room/:player', function (ws, req) {
  var room = rooms[req.params.room] = rooms[req.params.room] || new Game(req.params.room)
  var player = room.get_player(req.params.player)

  player.bind_ws(ws)

  ws.on('message', function (e) {
    console.log('INFO ws message:' + e)
    try {
      var msg = JSON.parse(e)
    } catch (e) {
      console.log('ERROR parsing message from client', e)
      return
    }
    // TODO
  });
})

module.exports = router
