module.exports = {

  add: function (a, b) {
    return a + b
    },

  asyncAdd: function (a, b, callback) {
    setTimeout(() => {
      callback(a + b)
    }, 1)
  }

}
