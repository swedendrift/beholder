// Add an #id property to getData to identify the user eventually
function search() {
  const url = 'http://localhost:6969/coords'
  return fetch(url).then((response) => {
    return response.json()
  }).catch(function(error) {
    alert(`There was an error with your request: ${error}`)
  })
}

document.getElementById("get-position").addEventListener("click", () => {
  const thenable = search()
  thenable.then((response) => {
    initMap(response)
  })
}, false)

function initMap(geoArray) {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: {lat: -33.668, lng: -117.863}
  })

  const markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  var markers = geoArray.map((location, i) => {
    const loc = {
      _id: location._id,
      geoloc: `lat: ${location.latitude}, lng: ${location.longitude}`,
      heading: location.heading,
      speed: location.speed
    }
    return new google.maps.Marker({
      position: loc.geoloc,
      markerLabel: markerLabels[i % markerLabels.length]
    });
  });
}

var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'imgs/m'})
