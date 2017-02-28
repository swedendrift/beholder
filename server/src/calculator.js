module.exports = {

  add: function(a, b) {
    return a + b
  },

  subtract: function(a, b) {
    return a - b
  },

  multiply: function(a, b) {
    return a * b
  },

  divide: function(a, b) {
    return a/b
  },

  reduce: function(collection, reduction , init) {
    var sum = init
    for(let i = 0; i < collection.length; i++) {
      let num = collection[i]
      sum = sum + num
    }
    return sum
  }



}
