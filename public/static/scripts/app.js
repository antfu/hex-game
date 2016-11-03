console.info('Hi! The source code is available on github: https://github.com/antfu/hex-game.\nIf you have any questions, feel free to email me at anthonyfu117@hotmail.com.')

var THEMES = {
  default: {
    blank: '#f4f4f1',
    a: '#f1b6a7',
    b: '#a7ddf1',
    text: '#000',
    background: '#444'
  },
  blackwhite: {
    blank: '#888',
    a: '#000',
    b: '#fff',
    text: '#888',
    background: '#222'
  },
  forest: {
    blank: '#8ea774',
    a: '#486923',
    b: '#243611',
    text: '#e6d147',
    background: '#243610'
  },
  rena: {
    blank: "#FFF0A5",
    a: "#468966",
    b: "#B64926",
    text: "#FFB03B",
    background: "#444",
  },
  brown: {
    blank: "#FFEBBC",
    a: "#7F755E",
    b: "#BFB08D",
    text: "#F2F2F2",
    background: "#403B2F"
  },
  pheadra: {
    blank: "#FFFF9D",
    a: "#FF6138",
    b: "#00A388",
    text: "#F2F2F2",
    background: "#79BD8F"
  }
}

var user_theme = localStorage.getItem('hex-game-theme') || 'default'

var mixins = mixins || {}

var pressTimer;

mixins.common = {
  data: {
    url: location.protocol.replace('http', 'ws') + '//' + location.host + '/ws' + location.pathname,
    width: 13,
    height: 13,
    scale: 0.5,
    chess: [],
    current: 1,
    counter: 0,
    colors: THEMES[user_theme] || THEMES.default,
    theme: user_theme,
    disabled: true,
    prev: undefined,
    is_gameover: false
  },
  methods: {
    get_color: function (state) {
      return [
        this.colors.blank,
        this.colors.a,
        this.colors.b,
        'url(#gradient1)',
        'url(#gradient2)',
        'url(#gradient3)',
        'url(#gradient4)'
      ][state]
    },
    init: function () {
      this.chess = utils.create_ground(this.width)
      this.counter = 0
    },
    fullscreen: function () {
      if (this.fullscreened)
        this.fullscreened = utils.fullscreen_exit()
      else
        this.fullscreened = utils.fullscreen(document.body)
    },
    gameover: function (msg) {
      this.is_gameover = msg
    },
    change_theme: function () {
      var keys = Object.keys(THEMES)
      var i = Math.floor(Math.random() * keys.length)
      this.theme = keys[i]
    }
  },
  watch: {
    theme: function (val) {
      this.colors = THEMES[val] || this.colors
      localStorage.setItem('hex-game-theme', val)
    }
  }
}

mixins.local = {
  data: {
    local: true,
    disabled: false
  },
  methods: {
    click: function (q, r) {
      var c = this.chess[q][r]
      if (!c.state) {
        c.state = this.current
        this.current = this.current == 1 ? 2 : 1
        this.check()
        this.prev = c
        this.counter += 1
      }
    },
    check: function () {
      var result = utils.check(this.chess, this.width)
      if (result)
        this.gameover({
          title: 'Player ' + (result === 1 ? 'A' : 'B') + ' win!',
          desc: this.counter + ' steps token.'
        })
    },
    gameover: function (msg) {
      // Override
      this.is_gameover = msg
      if (!msg)
        this.init()
    },
    check_debug: function (q, r, c, state) {
      if (!this.chess[q] || !this.chess[q][r])
        return false
      if (!state)
        state = this.chess[q][r].state
      if (!state || this.chess[q][r].state !== state)
        return false
      c = c || 1
      if (r === 0 || q === 0)
        return true
      if (this.chess[q][r].text === undefined || this.chess[q][r].text > c)
        this.chess[q][r].text = c
      else
        return false
      var neighbors = utils.get_neighbors(q, r)
      for (var i = 0; i < neighbors.length; i++)
        if (this.check(neighbors[i][0], neighbors[i][1], c + 1, state))
          return true
      return false
    },
    rand: function () {
      for (var i = 0; i < this.width; i++)
        for (var j = 0; j < this.height; j++)
          if (!this.chess[i][j].state)
            this.chess[i][j].state = Math.floor(Math.random() * 3)
    },
  },
  created: function () {
    this.init()

    document.addEventListener('DOMContentLoaded', function () {
      cursor = document.getElementById('cursor')
    }, false);
  },
}

mixins.online = {
  data: {
    local: false,
    your: 0,
    connected: false,
    players_amount: 0
  },
  methods: {
    click: function (q, r) {
      var c = this.chess[q][r]
      if (!c.state)
        if (this.current === this.your)
          this.send({ play: [q, r] })
    },
    connect: function () {
      var vm = this
      this.ws = new WebSocket(this.url)

      this.ws.onclose = function () {
        vm.connected = false
      }
      this.ws.onopen = function () {
        vm.connected = true
      }
      this.ws.onmessage = function (data) {
        var msg = JSON.parse(data.data)
        console.log(msg)

        if (msg.chess)
          vm.chess = msg.chess
        if (msg.your)
          vm.your = msg.your
        if (msg.current) {
          vm.current = msg.current
          if (vm.current === vm.your)
            utils.vibrate(150)
        }
        if (msg.init) {
          vm.width = msg.init
          vm.height = msg.init
          vm.init()
        }
        if (msg.start)
          vm.disabled = false
        if (msg.played) {
          var c = vm.chess[msg.played.coordinate[0]][msg.played.coordinate[1]]
          c.state = msg.played.state
          vm.prev = c
        }
        if (msg.players_amount)
          vm.players_amount = msg.players_amount
        if (msg.gameover) {
          vm.disabled = true
          vm.gameover({
            title: 'You ' + (msg.gameover.win == vm.your ? 'WIN' : 'lose') + ' !',
            desc: 'Gameover, long press the triangle at the bottom start a new game.'
          })
        }
      }

      window.onbeforeunload = function () {
        vm.ws.close()
      }
    },
    send: function (data) {
      this.ws.send(JSON.stringify(data))
    },
    restart: function () {
      clearTimeout(pressTimer);
      this.send({ restart: true })
    },
    restart_up: function () {
      clearTimeout(pressTimer);
    },
    restart_down: function () {
      var vm = this
      pressTimer = setTimeout(function () {
        vm.restart()
      }, 700)
    }
  },
  created: function () {
    this.connect()
  }
}

function makeapp(mode) {
  window.app = new Vue({
    el: '#app',
    mixins: [mixins.common, mode == 'online' ? mixins.online : mixins.local],
  })
}

var cursor = undefined

function mouse_position(e) {
  if (cursor) {
    cursor.style.top = e.pageY + 10 + 'px'
    cursor.style.left = e.pageX + 10 + 'px'
  }
}
