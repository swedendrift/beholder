//containsLocation(point:LatLng, polygon:Polygon) to chieck if in/out of a fence
const DEV_NODE = '192.168.1.178'
const plots = []
var fences = []
var paths = []
var markers = []
var geoObjects = []
var drawingManager
var map

// Add an #id property to getData to identify the user eventually
function search(route) {
  const url = `http://${DEV_NODE}:6969/${route}`
  return fetch(url).then((response) => {
    return response.json()
  }).catch((error) => {
    alert(`There was an error with your request: ${error}`)
  })
}
//Valid - First vertex of the polygon is provided at both the beginning and end of a LinearRing. this is the format we need ot adhere to
// { "type": "Polygon",
//     "coordinates": [
//       [ [ 100.0 , 0.0 ] , [ 101.0 , 0.0 ] , [ 101.0 , 1.0 ] , [ 100.0 , 1.0 ] , [ 100.0 , 0.0 ] ]
//     ]

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

function initMap() {
  var homeLatlng = new google.maps.LatLng(37.2966853, -122.0975973)
  var myOptions = {
    zoom: 10,
    center: homeLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('googleMap'), myOptions)

  markers = geoObjects.map((location) => {
    return new google.maps.Marker({
      position: location
    })
  })

  var markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'imgs/m'})

  geoObjects = []

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
    circleOptions: shapeOptions,
    polygonOptions: shapeOptions
  })

  drawingManager.setMap(map)


  // Polygon representation (Square) of GeoJSON
  // {
  //   name: "Truckapalooza Square",
  //   loc: {
  //     type : "Polygon",
  //     coordinates : [ [ [ 0 , 0 ] , [ 0 , 1 ] , [ 1 , 1 ] , [  1 , 0 ] , [ 0 , 0 ] ] ]
  //   }
  // }

  google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => {
    // overlayClickListener(event.overlay)
    var vertices = document.getElementById('vertices') //remove or move
    var coords = (event.overlay.getPath().getArray())
    vertices.value = coords //remove or move
    fences = [] // clear the fences array
    let points = []
    coords.forEach((element) => {
      let point = [element.lat(), element.lng()]
      points.push(point)
    })
    var closePoly = points[0]
    // per Google the start and end coordinates of the polygon need to be the same
    points.push(closePoly)
    // format the coordinates into a geoJSON document
    // enhancement : add a prompt for a name on overlaycomplete
    let fence = {
      "name": "geofence",
      "loc": {
        "type": "Polygon",
        "coordinates": points
      }
    }
    fences.push(fence)
    postData(fences, 'fences')

    console.log(fences)
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

// function getLatLngFromString(location) {
//     var latlng = location.split(/, ?/)
//     var geolocation =  new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]))
//     console.log(JSON.stringify(geolocation))
//     return geolocation
// }

document.getElementById("get-plots").addEventListener("click", () => {
  const thenable = search("coords")
  thenable.then((response) => {
    prepCoords(response)
  })
}, false);

// it would be nice to determine if a device is inside or outside the polygon before sending the data back to the end user
// code for creating an MVC array w from coords
// example unconverted array[[44.465332670616895, 26.143829190988], [44.466098355169805, 26.1465114000029]]
//
// for(var i=0; i < points.length; ++i){
//      points[i] = new google.maps.LatLng(Number(points[i][0]),
//                                         Number(points[i][1]));
// }
