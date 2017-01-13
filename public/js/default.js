// Add an #id property to getData to identify the user eventually
function search() {
  const url = 'http://localhost:6969/coords'
  return fetch(url).then((response) => {
    return response.json()
  }).catch(function(error) {
    alert(`There was an error with your request: ${error}`)
  })
}

function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 33.651000, lng: -117.888000}
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
}

const geoObjects = []
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
      console.log(plot)
      const {lat, lng} = plot
      const latLng = {lat, lng}
      geoObjects.push(latLng)
    } else { continue }
  }
  console.log(geoObjects)
  console.log(plots)
  initMap()

}

document.getElementById("get-position").addEventListener("click", () => {
  const thenable = search()
  thenable.then((response) => {
    prepCoords(response)
  })
}, false);
