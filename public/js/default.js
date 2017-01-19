// const DEV_NODE = '192.168.0.11'
const DEV_NODE = '192.168.1.178'
const plots = []
var fences = []
var markers = []
var geoObjects = []
var map

function postData(geoData, route) {
  const url = `http://${DEV_NODE}:6969/${route}`
  fetch(url, {
    method: "POST",
    body: JSON.stringify(geoData),
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "omit"
  }).then((response) => {
    response.status
    response.statusText
    response.headers
    response.url
    return response.text()
  }, function(error) {
    error.message
  })
}

function initMap() {
  var homeLatlng = new google.maps.LatLng(37.2966853, -122.0975973)
  var myOptions = {
    zoom: 10,
    center: homeLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('googleMap'), myOptions)
  map.data.setStyle({
    fillColor: 'red',
    fillOpacity: .2,
    strokeWeight: .5,
    clickable: false,
    editable: false,
    draggable: true,
    zIndex: 1
});

  markers = geoObjects.map((location) => {
    return new google.maps.Marker({
      position: location
    })
  })

  var markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'imgs/m'})

  geoObjects = [] // clear the geoObjects array

  var shapeOptions = {
    fillColor: 'red',
    fillOpacity: .2,
    strokeWeight: .5,
    clickable: false,
    editable: false,
    draggable: true,
    zIndex: 1
  }

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    // circleOptions: shapeOptions,
    polygonOptions: shapeOptions
  })

  drawingManager.setMap(map)

  google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => {
    // overlayClickListener(event.overlay)
    let vertices = document.getElementById('vertices') //remove or move
    let coords = (event.overlay.getPath().getArray())
    vertices.value = coords //remove or move
    fences = [] // clear the fences array
    let points = []
    coords.forEach((element) => {
      let point = [element.lng(), element.lat()]
      points.push(point)
    })

    // per Google the start and end coordinates of the polygon need to be the same
    var closePoly = points[0]
    points.push(closePoly)
    // enhancement : add a prompt for a name on overlaycomplete
    let fence = {
      "type": "Feature",
      "features": shapeOptions,
      "geometry": {
        "type": "Polygon",
        "coordinates": [points]
      }
    }
    fences.push(fence)
    postData(fences, 'fences')
  })
}

// need to enable editing and dragging of polygons - not working currently
// function overlayClickListener(overlay) {
//   google.maps.event.addListener(overlay, "mouseup", (event) => {
//     var paths = (overlay.getPath().getArray())
//     paths.forEach((path) => {
//       paths.push(path)
//     })
//   })
// }

// Add an #id property to getData to identify the user eventually
function search(route) {
  const url = `http://${DEV_NODE}:6969/${route}`
  return fetch(url).then((response) => {
    return response.json()
  }).catch((error) => {
    alert(`There was an error with your request: ${error}`)
  })
}

function prepCoords(geoArray) {
  for (let i = 0; i < geoArray.length; i++) {
      const plot = {
        lng: parseFloat(geoArray[i].geometry.coordinates[0]),
        lat: parseFloat(geoArray[i].geometry.coordinates[1]),
        heading: geoArray[i].properties.heading,
        speed: geoArray[i].properties.speed,
        _id: geoArray[i]._id
      }
      plots.push(plot)

      const {lat, lng} = plot
      const latLng = {lat, lng}
      geoObjects.push(latLng)
    }
  initMap()
}

document.getElementById("get-plots").addEventListener("click", () => {
  event.preventDefault()
  let thenable = search("coords")
  thenable.then((response) => {
    prepCoords(response)
  })

// ***feature
  thenable = search("fences")
  thenable.then((data) => {

    data.forEach((el) => {

      let {coordinates} = el.geometry
      console.log('coordinates ' + coordinates)
      let polyArray = []

      for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
          console.log(coordinates[i][j])
        let object = {'lat': coordinates[i][j][1], 'lng': coordinates[i][j][0]}
        console.log('object ' + object.lat, object.lng)
        var myLatlng = new google.maps.LatLng(object.lat, object.lng);
        polyArray.push(myLatlng)
        }
      }
    map.data.add({geometry: new google.maps.Data.Polygon([polyArray])})
    polyArray = [] // clear the array for the next loop
    })
  })
}, false);
//
// let geoJSON = response[0]
// let {coordinates} = geoJSON.geometry
// let polyArray = []
// coordinates.forEach((arrayData) => {
//   let object = {'lat': arrayData[1], 'lng': arrayData[0]}
//
//   var myLatlng = new google.maps.LatLng(object.lat, object.lng);
//
//   polyArray.push(myLatlng)
// })
// map.data.add({geometry: new google.maps.Data.Polygon([polyArray])})
//
// })
