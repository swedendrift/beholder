const NODE = '192.168.0.5'

var lastLoc = {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.029345, 37.331020]
  },
  "properties": {
    "speed": 10,
    "heading": 0
  }
}

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
  console.log('position')
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
  if (lastLoc.geometry.coordinates[0] !== currentLoc.geometry.coordinates[0] && lastLoc.geometry.coordinates[1] !== currentLoc.geometry.coordinates[1]) {
    lastLoc = currentLoc
    postData(currentLoc, 'coords')
  } else {
    lastLoc = currentLoc
  }

}

function postData(locationObject, route) {
  const url = `http://${NODE}:6969/${route}`
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

let beaconInterval

document.getElementById("get-position").addEventListener("click", () => {
  beaconInterval = window.setInterval(() => {
    let beaconId = navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError,
      {enableHighAccuracy: true, timeout: 3000, maximumAge: 0})
    navigator.geolocation.clearWatch(beaconId)
  }, 10000)

}, false)


document.getElementById("clear-watch").addEventListener("click", () => {
  clearInterval(beaconInterval)
  console.log(`Cleared watch on watchId: ${beaconInterval}`)
}, false)
