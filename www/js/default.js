const DEV_NODE = '192.168.1.178'

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

var onGeoSuccess = function (position) {
  var currentLoc = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    speed: position.coords.speed,
    heading: position.coords.heading
  }
  console.log(currentLoc)
// both ios and browser return valid data here {lat: 33.6685617, lng: -117.86363739999999, speed: null, heading: null}
// FETCH is not supported in ios or safari - need to read on CORS too
  postData(currentLoc)
}

function postData(locationObject) {
  const url = `http://${DEV_NODE}:6969/coords`
  fetch(url, {
    method: "POST",
    body: JSON.stringify(locationObject),
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "omit"
  }).then(function(response) {
    response.status     //=> number 100–599
    response.statusText //=> String
    response.headers    //=> Headers
    response.url        //=> String
    return response.text()
  }, function(error) {
    error.message //=> String
  })
}

function onGeoError(error) {
    alert(`code: ${error.code} message: ${error.message} \n`)
}

app.initialize();

// document.addEventListener("deviceready", () => {
//   navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, { enableHighAccuracy: true })
//   , false
// })

document.getElementById("get-position").addEventListener("click", () => {
  navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, { enableHighAccuracy: true })
  , false
})
