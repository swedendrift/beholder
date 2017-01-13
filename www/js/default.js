var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        console.log('Received Event: ' + id);
    }
};


function Geoloc(position) {
  this.lat = position.coords.lattoFixed(6)
  this.lng = position.coords.lngtoFixed(6)
  this.heading = position.coords.heading
  this.speed = position.coords.speed
}

function getLocation() {
  // how can i get a return value from this - just run the variable() to execute
  navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, { enableHighAccuracy: true });
}

var onGeoSuccess = function (position) {
  var currentLoc = new Geoloc(position)
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
    console.log(`successORfail: ${data}`)
  })
}

function onGeoError(error) {
    console.log(`code: ${error.code} \n`
        `message: ${error.message} \n`);
}

app.initialize();
document.addEventListener("deviceready", getLocation, false)


document.getElementById("get-position").addEventListener("click", getLocation, false);
