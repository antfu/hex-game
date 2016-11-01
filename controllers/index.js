var express = require('express')
var router = express.Router()
var Game = require('../game/game')

router.get('/', function (req, res) {
  res.render('home')
})

router.get('/online', function (req, res) {
  res.redirect('/r/default')
})

router.get('/help', function (req, res) {
  res.render('help')
})

router.get('/local', function (req, res) {
  res.render('local')
})

var rooms = {}

router.get('/r/:room', function (req, res) {
  var room = rooms[req.params.room] = rooms[req.params.room] || new Game(req.params.room)
  if (room.is_full())
    res.render('error', { error: 'ROOM FULL' })
  else
    res.render('online')
})

router.ws('/ws/r/:room', function (ws, req) {
  var room = rooms[req.params.room] = rooms[req.params.room] || new Game(req.params.room)

  if (!room.join(ws))
    ws.close()
})

// 404
router.get('*', function (req, res) {
  res.render('error', { error: 'PAGE NOT FOUND' })
})

module.exports = router
