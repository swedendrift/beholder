// const DEV_NODE = '192.168.0.11'
const DEV_NODE = '192.168.1.178'

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        document.getElementById(id).innerText = `Received Event: ${event}`
    }
}

var onGeoSuccess = function (position) {
  var currentLoc = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [position.coords.longitude, position.coords.latitude]
    },
    "properties": {
      "speed": position.coords.speed,
      "heading": position.coords.heading
    }
  }
  postData(currentLoc, 'coords')
}

function postData(locationObject, route) {
  const url = `http://${DEV_NODE}:6969/${route}`
  fetch(url, {
    method: "POST",
    body: JSON.stringify(locationObject),
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "omit"
  }).then(function(response) {
    response.status
    response.statusText
    response.headers
    response.url
    return response.text()
  }, function(error) {
    error.message
  })
}

function onGeoError(error) {
    alert(`code: ${error.code} message: ${error.message} \n`)
}

app.initialize();
var watchId

document.getElementById("get-position").addEventListener("click", () => {
  watchId = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError,
    { enableHighAccuracy: true })
  }, false)


document.getElementById("clear-watch").addEventListener("click", () => {
  navigator.geolocation.clearWatch(watchId)
  console.log(`Cleared watch on watchId: ${watchId}`)
}, false)
