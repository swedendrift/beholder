/*
global
google
MarkerClusterer
*/
const React = require('react')
const ReactDOM = require('react-dom')
const Redux = require('redux')

const DEV_NODE = '192.168.0.8'
var map

const retro =
   [
     {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
     {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
     {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
     {
       featureType: 'administrative',
       elementType: 'geometry.stroke',
       stylers: [{color: '#c9b2a6'}]
     },
     {
       featureType: 'administrative.land_parcel',
       elementType: 'geometry.stroke',
       stylers: [{color: '#dcd2be'}]
     },
     {
       featureType: 'administrative.land_parcel',
       elementType: 'labels.text.fill',
       stylers: [{color: '#ae9e90'}]
     },
     {
       featureType: 'landscape.natural',
       elementType: 'geometry',
       stylers: [{color: '#dfd2ae'}]
     },
     {
       featureType: 'poi',
       elementType: 'geometry',
       stylers: [{color: '#dfd2ae'}]
     },
     {
       featureType: 'poi',
       elementType: 'labels.text.fill',
       stylers: [{color: '#93817c'}]
     },
     {
       featureType: 'poi.park',
       elementType: 'geometry.fill',
       stylers: [{color: '#a5b076'}]
     },
     {
       featureType: 'poi.park',
       elementType: 'labels.text.fill',
       stylers: [{color: '#447530'}]
     },
     {
       featureType: 'road',
       elementType: 'geometry',
       stylers: [{color: '#f5f1e6'}]
     },
     {
       featureType: 'road.arterial',
       elementType: 'geometry',
       stylers: [{color: '#fdfcf8'}]
     },
     {
       featureType: 'road.highway',
       elementType: 'geometry',
       stylers: [{color: '#f8c967'}]
     },
     {
       featureType: 'road.highway',
       elementType: 'geometry.stroke',
       stylers: [{color: '#e9bc62'}]
     },
     {
       featureType: 'road.highway.controlled_access',
       elementType: 'geometry',
       stylers: [{color: '#e98d58'}]
     },
     {
       featureType: 'road.highway.controlled_access',
       elementType: 'geometry.stroke',
       stylers: [{color: '#db8555'}]
     },
     {
       featureType: 'road.local',
       elementType: 'labels.text.fill',
       stylers: [{color: '#806b63'}]
     },
     {
       featureType: 'transit.line',
       elementType: 'geometry',
       stylers: [{color: '#dfd2ae'}]
     },
     {
       featureType: 'transit.line',
       elementType: 'labels.text.fill',
       stylers: [{color: '#8f7d77'}]
     },
     {
       featureType: 'transit.line',
       elementType: 'labels.text.stroke',
       stylers: [{color: '#ebe3cd'}]
     },
     {
       featureType: 'transit.station',
       elementType: 'geometry',
       stylers: [{color: '#dfd2ae'}]
     },
     {
       featureType: 'water',
       elementType: 'geometry.fill',
       stylers: [{color: '#b9d3c2'}]
     },
     {
       featureType: 'water',
       elementType: 'labels.text.fill',
       stylers: [{color: '#92998d'}]
     }
   ]

var settings = {
  // store markers and polys in GeoJSON and build
  // converters to googleLatLngs, objects and markers
  distanceBetweenMarkers: 5,
  geofences: [],
  markers: [],
  shapeOptions: {
    fillColor: 'red',
    fillOpacity: .2,
    strokeWeight: .5,
    clickable: false,
    editable: false,
    draggable: true,
    zIndex: 1
  }
}

function initMap() {
  var fences = []
  var homeLatlng = new google.maps.LatLng(37.3310207, -122.0293453)
  var mapOptions = {
    zoom: 18,
    center: homeLatlng,
    mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'terrain', 'retro']
    }
  }
  // create a new map
  map = new google.maps.Map(document.getElementById('map'), mapOptions)
  map.data.setStyle(settings.shapeOptions)
  var styledMapType = new google.maps.StyledMapType(retro, {name: 'retro'})
  map.mapTypes.set('retro', styledMapType);
  map.setMapTypeId('retro')
  // create a drawing manager instance - **replace with data layer
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    polygonOptions: settings.shapeOptions
  })
  // create a google listener for posting new geofences to mongodb
  google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => {
    let coords = (event.overlay.getPath().getArray())
    let points = []
    coords.forEach((element) => {
      let point = [element.lng(), element.lat()]
      points.push(point)
    })
    // add the first point to the end to close the polygon
    var closePoly = points[0]
    points.push(closePoly)
    let fence = {
      "type": "Feature",
      "features": settings.shapeOptions,
      "geometry": {
        "type": "Polygon",
        "coordinates": [points]
      }
    }
    fences.push(fence)
    postData(fences, 'fences')
  })

  drawingManager.setMap(map)
  refreshView()
  fetchCoordinates()
}

function refreshView () {
  const thenable = search('fences')
  thenable.then((data) => {
    data.map((element) => {
      // create a new GeoJSON object removing the _id
      let gjPolygon = Object.assign({}, element)
      delete gjPolygon._id
      // load the GeoJSON to the map
      map.data.addGeoJson(gjPolygon)
      // reorganize data for oob checking
      let { coordinates } = element.geometry
      var polyArray = []
      for (let i = 0; i < coordinates.length; i++) {
        let arrayAggregator = []
        for (let j = 0; j < coordinates[i].length; j++) {
          let object = {'lat': coordinates[i][j][1], 'lng': coordinates[i][j][0]}
          arrayAggregator.push(object)
          var myLatlng = new google.maps.LatLng(object.lat, object.lng);
          polyArray.push(myLatlng)
        }
        settings.geofences.push([arrayAggregator])
        arrayAggregator = []
      }
       // clear the array for the next loop
      polyArray = []
      return gjPolygon
    })
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

function search(route) {
  const url = `http://${DEV_NODE}:6969/${route}`
  return fetch(url).then((response) => {
    return response.json()
  }).catch((error) => {
    console.log(`There was an error with your request: ${error}`)
  })
}

function handleMarkerData(geoJSONdata) {
  const markerLatLngs = geoJSONdata.map((element) => {
    // Create the Google LatLng objects from GeoJSON data
    let lat = element.geometry.coordinates[1]
    let lng = element.geometry.coordinates[0]
    let latLng = new google.maps.LatLng(lat, lng)
    return latLng
    })

  var filtered = []
  // test the distance between maker coordinates **optimize
  for (let i = 0; i < markerLatLngs.length -1; i++) {
    let distance = google.maps.geometry.spherical.computeDistanceBetween(markerLatLngs[i], markerLatLngs[i + 1])
    if (i === 0) {
      filtered.unshift(markerLatLngs[i])
    } else if (distance > settings.distanceBetweenMarkers && distance !== 0) {
      filtered.unshift(markerLatLngs[i])
    }
  }
  // transform data into objects for making markers
  let coordinates = filtered.map((element) => {
    let coordObj = {
      lat: element.lat(),
      lng: element.lng()
    }
    checkOob(coordObj)
    return coordObj
  })
  // coordinates into markers for clusterer
  let markers = coordinates.map((element) => {
    let marker = new google.maps.Marker({
      position: element,
      map: map
    })
    return marker
  })
  // Add a marker clusterer to manage the markers.
  const mcOptions = {
    gridSize: 50,
    maxZoom: 15,
    minimumClusterSize: 4,
    imagePath: 'imgs/m'}
  // create a new cluster marker manager
  const markerCluster = new MarkerClusterer(map, markers, mcOptions)
}

function checkOob(coord) {
  let myFences = []
  settings.geofences.forEach((element) => {
    var polyFence = new google.maps.Polygon({paths: element})
    myFences.push(polyFence)
  })
  var googleLatLng = new google.maps.LatLng(coord)
  myFences.forEach((polygon) => {
      if(google.maps.geometry.poly.containsLocation(googleLatLng, polygon)) {
        console.log('Marker added inside polygon')
      }
  })
}

function fetchCoordinates () {
  const thenable = search('coords')
  thenable.then((data) => {
    handleMarkerData(data)
  })
}

document.getElementById('get-plots').addEventListener('click', () => {
  fetchCoordinates()
},false)

/* react components here for now */
const initialState = {
  alerts: [],
  count: 0,
  alertBoxOpen: false
}

function reducer(state, action) {
  switch (action.type) {
    case 'ALERT_RECEIVED':
      return Object.assign({}, state, {
        // take the old alerts + new message and return a new array
        alerts: [...state.alerts, action.alerts],
        // alerts: action.alerts,
        count: state.count + 1
      })
    case 'ALERT_CLEARED':
      return Object.assign({}, state, {
        count: action.count = 0,
        alertBoxOpen: true

      })
    case 'SHOW_ALERTS':
      return Object.assign({}, state, {
        alertBoxOpen: !state.alertBoxOpen

      })
    default:
      return state;
  }
}

function accordion(elementState, level ) {
  const active = {"className": `${level} active`}
  const inactive = {"className": `${level}`}
  if (elementState === true) {
    return active
  } else {
    return inactive
  }
}

function AlertMonitor() {
  const count = store.getState().count
  const alerts = store.getState().alerts
  const alertBoxOpen = store.getState().alertBoxOpen

  const handleClickAlerts = () => {
    store.dispatch({ type: 'ALERT_CLEARED'})
  }

  const handleClickAccordian = () => {
    store.dispatch({ type: 'SHOW_ALERTS'})
  }
  return (
    React.createElement(
      "div",
      { "className": "ui styled accordion", id: "accordion-menu" },
      React.createElement(
        "div",
        accordion(alertBoxOpen, 'title'),
        React.createElement("i", { "className": "dropdown icon", onClick: handleClickAccordian}),
          "Alerts"
      ),
      React.createElement(
        "div", accordion(alertBoxOpen, 'content'),
        React.createElement(
          "div",
          {  id: "alertsList", className: "ui list" },
          alerts.reverse().map((alert, i) =>
            i === 0
            ? React.createElement(
                "div",
                {id: "red", className: "item", key: i},
                null,
                React.createElement("i", { "className": "warning circle icon" }),
                React.createElement(
                  "div",
                  { "className": "content" },
                  message
                )
              )
            : React.createElement(
              "li",
              {className: "item", key: i},
              null,
              React.createElement("i", { "className": "child icon" }),
              React.createElement(
                "div",
                { "className": "content" },
                message
              )
            )
          )
        )
      )
    )
  )
}

/* eslint-disable no-underscore-dangle */
const store = Redux.createStore(reducer, initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
/* eslint-enable */
// var store = Redux.createStore(reducer, initialState)

function randomize () {
  return chance.sentence({words: 6})
}

function redraw() {
  ReactDOM.render(React.createElement(alertMonitor, null), document.getElementById('root'));
}
redraw();

store.subscribe(redraw)

window.setInterval(() => {
  store.dispatch({ type: 'ALERT_RECEIVED',  alerts: randomize() })
  console.log(store.getState())
}, 10000)
