console.info('Hi. The source code is available on github: https://github.com/antfu/hex-game.\nIf you have any questions, feel free to email me at anthonyfu117@hotmail.com.')

window.app = new Vue({
  el: '#app',
  data: {
    url: location.protocol.replace('http', 'ws') + '//' + location.host + '/ws' + location.pathname,
    width: 11,
    height: 11,
    scale: 0.5,
    chess: [],
    current: 1,
    colors: {
      blank: '#f4f4f1',
      a: '#f1b6a7',
      b: '#a7ddf1'
    }
  },
  methods: {
    click: function (chess) {
      if (!chess.state) {
        chess.state = this.current
        this.current = this.current == 1 ? 2 : 1
      }
    },
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
    clear: function () {
      for (var q = 0; q < this.width; q++)
        for (var r = 0; r < this.height; r++) {
          var state = 0
          if (q === 0 || q === this.width - 1)
            state = 1
          if (r === 0 || r === this.width - 1) {
            if (q === r)
              state = q === 0 ? 5 : 6
            else
              state = state === 0 ? 2 : (q === 0 ? 4 : 3)
          }
          this.chess.push({ q: q, r: r, state: state })
        }
    }
  },
  created: function () {
    this.clear()
  }
})
