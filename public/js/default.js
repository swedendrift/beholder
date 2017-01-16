const DEV_NODE = '192.168.1.178'
// Add an #id property to getData to identify the user eventually
function search() {
  const url = `http://${DEV_NODE}:6969/coords`
  return fetch(url).then((response) => {
    return response.json()
  }).catch(function(error) {
    alert(`There was an error with your request: ${error}`)
  })
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('googleMap'), {
    zoom: 10,
    center: {lat: 37.2966853, lng: -122.0975973}
  });

  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var markers = geoObjects.map((location, i) => {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length]
    });
  });

  var markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'imgs/m'});
  geoObjects = []

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['circle', 'polygon']
    },
    circleOptions: {
      fillColor: 'red',
      fillOpacity: .2,
      strokeWeight: .5,
      clickable: false,
      editable: true,
      zIndex: 1
    },
    polygonOptions: {
      fillColor: 'red',
      fillOpacity: .2,
      strokeWeight: .5,
      clickable: true,
      editable: true,
      zIndex: 1
    }

  });
  drawingManager.setMap(map);
}

var geoObjects = []
const plots = []

function prepCoords(geoArray) {
  for (let i = 0; i < geoArray.length; i++) {
    if (typeof geoArray[i].lat === 'number' && typeof geoArray[i].lng === 'number') {
      const plot = {
        lat: parseFloat(geoArray[i].lat),
        lng: parseFloat(geoArray[i].lng),
        heading: geoArray[i].heading,
        speed: geoArray[i].speed,
        _id: geoArray[i]._id
      }
      plots.push(plot)
      const {lat, lng} = plot
      const latLng = {lat, lng}
      geoObjects.push(latLng)
    } else { continue }
  }
  initMap()
}

document.getElementById("get-position").addEventListener("click", () => {
  const thenable = search()
  thenable.then((response) => {
    prepCoords(response)
  })
}, false);
