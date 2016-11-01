(function (exports) {

  exports.directions = [
    [+1, 0], [+1, -1], [0, -1],
    [-1, 0], [-1, +1], [0, +1]
  ]

  exports.create_ground = function (size) {
    size = size || 13
    return exports.repeat(size, function (q) {
      return exports.repeat(size, function (r) {
        var state = 0
        if (q === 0 || q === size - 1)
          state = 1
        if (r === 0 || r === size - 1) {
          if (q === r)
            state = q === 0 ? 5 : 6
          else
            state = state === 0 ? 2 : (q === 0 ? 4 : 3)
        }
        return { q: q, r: r, state: state, text: undefined }
      })
    })
  }

  exports.get_neighbors = function (q, r) {
    return exports.repeat(exports.directions.length, function (i) {
      return [q + exports.directions[i][0], r + exports.directions[i][1]]
    })
  }

  exports.check = function (chess, size) {
    exports.unvisit(chess, size)
    if (exports.check_inner(chess, size - 1, 1))
      return 1
    if (exports.check_inner(chess, 1, size - 1))
      return 2
    return 0
  }

  exports.unvisit = function (chess, size) {
    for (var i = 0; i < size; i++)
      for (var j = 0; j < size; j++)
        delete chess[i][j].visited
  }

  exports.check_inner = function (chess, q, r, c, state) {
    if (!chess[q] || !chess[q][r])
      return false
    if (!state)
      state = chess[q][r].state
    if (!state || chess[q][r].state !== state)
      return false
    c = c || 1
    if (r === 0 || q === 0)
      return true
    if (chess[q][r].visited)
      return false

    chess[q][r].visited = true
    var neighbors = exports.get_neighbors(q, r)
    for (var i = 0; i < neighbors.length; i++)
      if (exports.check_inner(chess, neighbors[i][0], neighbors[i][1], c + 1, state))
        return true
    return false
  }

  exports.is_func = function (object) {
    return typeof object === "function"
  }

  exports.repeat = function (n, v) {
    var result = []
    for (var i = 0; i < n; i++)
      result.push(exports.is_func(v) ? v(i) : v)
    return result
  }

  exports.range = function (start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
      foo.push(i);
    }
    return foo;
  }

  exports.inarr = function (value, array) {
    return array.indexOf(value) !== -1
  }

  exports.vibrate = function (time) {
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate
    if (navigator.vibrate)
      navigator.vibrate(time || 500)
  }

  exports.fullscreen = function (el) {
    if (
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    ) {
      if (el.requestFullscreen)
        el.requestFullscreen();
      else if (el.mozRequestFullScreen)
        el.mozRequestFullScreen()
      else if (el.webkitRequestFullScreen)
        el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      else
        return false
    } else
      return false
    return true
  }

  exports.fullscreen_exit = function () {
    if (document.exitFullscreen)
      document.exitFullscreen()
    else if (document.mozExitFullscreen)
      document.mozExitFullscreen()
    else if (document.webkitExitFullscreen)
      document.webkitExitFullscreen();
    return false
  }

})(typeof exports === 'undefined' ? utils = {} : exports);
