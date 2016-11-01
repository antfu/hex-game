var express = require('express')
var router = express.Router()

router.use('/ws', require('./websocket'))

router.get('/', function (req, res) {
  res.render('home')
})

router.get('/a', function (req, res) {
  res.redirect('/r/default/a')
})

router.get('/b', function (req, res) {
  res.redirect('/r/default/b')
})

router.get('/help', function (req, res) {
  res.render('help')
})

router.get('/r/:room/a', function (req, res) {
  res.render('table')
})

router.get('/r/:room/b', function (req, res) {
  res.render('table')
})

// 404
router.get('*', function (req, res) {
  res.redirect('/')
})

module.exports = router
