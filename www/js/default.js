var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: () => {
        this.receivedEvent('deviceready');
    },
    receivedEvent: (id) => {
        document.getElementById(id).innerText = `Received Event: $${event}`
    }
}

var onGeoSuccess = function (geoposition) {
  var currentLoc = {
    lat: geoposition.coords.latitude,
    lng: geoposition.coords.longitude,
    speed: geoposition.coords.speed,
    heading: geoposition.coords.heading
  }
  console.log(currentLoc)
  postData(currentLoc)
}

function postData(locationObject) {
  const newLoc = JSON.stringify(locationObject)
  const url = 'http://localhost:6969/coords'
  var request = new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: newLoc
  })
  fetch(request).then((data) => {
    return data
  })
}

function onGeoError(error) {
    alert(`code: ${error.code} message: ${error.message} \n`)
}

app.initialize();

// document.addEventListener("deviceready", () => {
//   navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, { enableHighAccuracy: true })
//   , false
// })

document.getElementById("get-position").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, { enableHighAccuracy: true })
  , false
})
