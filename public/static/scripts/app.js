console.info('Hi! The source code is available on github: https://github.com/antfu/hex-game.\nIf you have any questions, feel free to email me at anthonyfu117@hotmail.com.')

var mixins = mixins || {}

mixins.common = {
  data: {
    url: location.protocol.replace('http', 'ws') + '//' + location.host + '/ws' + location.pathname,
    width: 13,
    height: 13,
    scale: 0.5,
    chess: [],
    current: 1,
    colors: {
      blank: '#f4f4f1',
      a: '#f1b6a7',
      b: '#a7ddf1'
    },
    disabled: true
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
    },
    fullscreen: function () {
      if (this.fullscreened)
        this.fullscreened = utils.fullscreen_exit()
      else
        this.fullscreened = utils.fullscreen(document.body)
    },
    gameover: function (msg) {
      this.disabled = true
      alert(msg)
    }
  }
}

mixins.local = {
  data: {
    local: true,
    disabled: false
  },
  methods: {
    click: function (chess) {
      if (!chess.state) {
        chess.state = this.current
        this.current = this.current == 1 ? 2 : 1
      }
    },
    check: function () {
      var result = utils.check(this.chess, this.width)
      if (result)
        this.gameover('Gameover!\n' + (result === 1 ? 'Red' : 'Blue') + ' win!')
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
    click: function (c) {
      if (!c.state)
        if (this.current === this.your)
          this.send({ play: [c.q, c.r] })
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
          vm.chess[msg.played.coordinate[0]][msg.played.coordinate[1]].state = msg.played.state
        }
        if (msg.players_amount)
          vm.players_amount = msg.players_amount
        if (msg.gameover)
          vm.gameover('Gameover!\nYou ' + (msg.gameover.win == vm.your ? 'win' : 'lose') + ' !')

      }

      window.onbeforeunload = function () {
        vm.ws.close()
      }
    },
    send: function (data) {
      this.ws.send(JSON.stringify(data))
    },
    restart: function () {
      this.send({ restart: true })
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
