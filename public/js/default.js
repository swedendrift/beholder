// const DEV_NODE = '192.168.0.11'
const DEV_NODE = '192.168.1.178'
const plots = []
var fences = []
var markers = []
var googleLatLngs = []
var googlePolys = []
var map
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

function initMap() {
  fences = [] // clear the geofence array to avoid duplicates
  var homeLatlng = new google.maps.LatLng(37.3310207, -122.0293453)
  var myOptions = {
    zoom: 15,
    center: homeLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('googleMap'), myOptions) //THIS HAS TO STAY 'googleMap' (for now)
  map.data.setStyle({
    fillColor: 'red',
    fillOpacity: .2,
    strokeWeight: .5,
    clickable: false,
    editable: false,
    draggable: true,
    zIndex: 1
  });


  var thenable = search("fences")
  thenable.then((data) => {
    data.forEach((el) => {
      let {coordinates} = el.geometry
      let polyArray = []

      for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
        let object = {'lat': coordinates[i][j][1], 'lng': coordinates[i][j][0]}
        var myLatlng = new google.maps.LatLng(object.lat, object.lng);
        polyArray.push(myLatlng)
        }
      }
      var fence = map.data.add({geometry: new google.maps.Data.Polygon([polyArray])})
      googlePolys.push(fence)
      polyArray = [] // clear the array for the next loop
    })
  })

  function testContains() {
    var triangleCoords = [
            {lat: 25.774, lng: -80.19},
            {lat: 18.466, lng: -66.118},
            {lat: 32.321, lng: -64.757}
          ];
    var bermudaTriangle = new google.maps.Polygon({paths: triangleCoords})
    console.log(bermudaTriangle)
    var latLng = new google.maps.LatLng(24.886, -70.269)
    console.log(latLng)
    console.log(google.maps.drawing)
    if (google.maps.geometry.poly.containsLocation(latLng, bermudaTriangle) === true) {
      console.log('it works')
    } else {
      console.log('denied')
    }
  }
  testContains()

  var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'imgs/m'})

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

    let coords = (event.overlay.getPath().getArray())
    // let vertices = document.getElementById('vertices') //remove or move
    // vertices.value = coords //remove or move
    let points = []
    coords.forEach((element) => {
      let point = [element.lng(), element.lat()]
      points.push(point)
    })
    var closePoly = points[0]
    points.push(closePoly)
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
    return response.status
  }, function(error) {
    error.message
  })
}

function prepCoords(geoArray) {
  var geoObjects = [] // clear the geoObjects array before it is reused
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
  return(geoObjects)
}

document.getElementById("get-plots").addEventListener("click", () => {
  event.preventDefault()
  let thenable = search("coords")
  thenable.then((data) => {
    googleLatLngs = prepCoords(data)
    markers = googleLatLngs.map((location) => {
      return new google.maps.Marker({
        position: location
      })
    })
    initMap()
  })
}, false);
