var fn

function openMongo() {
    setInterval(() => {
        console.log('say what?')
    }, 1000)

    function stopInterval() {
      clearInterval()
    }

    fn = stopInterval
}

function stopMongo() {
  fn()

}

openMongo()
