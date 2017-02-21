/*
global
google
MarkerClusterer
*/
const React = require('react')
const ReactDOM = require('react-dom')
const Redux = require('redux')
let { List } = require('semantic-ui-react')

const NODE = 'localhost'

let map

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
  distanceBetweenMarkers: "NOT CURRENTLY ACTIVE",
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
  },
  mapCenter: {
    lat: 37.331020,
    lng: -122.029345
  }
}

window.initMap = () => {
  let homeLatlng = new google.maps.LatLng(settings.mapCenter.lat, settings.mapCenter.lng)
  let mapOptions = {
    zoom: 11,
    center: homeLatlng,
    mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'terrain', 'retro']
    }
  }
  // create a new map
  map = new google.maps.Map(document.getElementById('map'), mapOptions)
  map.data.setStyle(settings.shapeOptions)
  const styledMapType = new google.maps.StyledMapType(retro, {name: 'retro'})
  map.mapTypes.set('retro', styledMapType);
  map.setMapTypeId('roadmap')
  // create a drawing manager instance - **replace with data layer
  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    polygonOptions: settings.shapeOptions
  })
  // create a google listener for posting new geofences to mongodb
  google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
    let fences = [] // clear fences array
    let points = []
    const coords = (event.overlay.getPath().getArray())
    coords.forEach((element) => {
      let point = [element.lng(), element.lat()]
      points.push(point)
    })
    // add the first point to the end to close the polygon
    //  winding is automatic with GeoJSON -- test and remove drawingManager
    const closePoly = points[0]
    points.push(closePoly)
    const fence = {
      'type': 'Feature',
      'features': settings.shapeOptions,
      'geometry': {
        'type': 'Polygon',
        'coordinates': [points]
      }
    }
    fences.push(fence)
    postData(fences, 'fences')
    // see if this can be more elegant than refreshing the whole thing
    // this partially solves the new polygon bug
    settings.geofences = []
    refreshView()
    fetchCoordinates()
  })

  drawingManager.setMap(map)
  refreshView()
  fetchCoordinates()

  google.maps.event.addListener(map, "rightclick", function(event) {
      var lat = event.latLng.lat()
      var lng = event.latLng.lng()
      alert("Lat=" + lat + "; Lng=" + lng)
  })
}
/* END OF INITMAP */

function postData(geoData, route) {
  const url = `http://${NODE}:6969/${route}`
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(geoData),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'omit'
  }).then((response) => {
    return response.status
  }, function(error) {
    error.message
  })
}

function search(route) {
  const url = `http://${NODE}:6969/${route}`
  return fetch(url).then((response) => {
    return response.json()
  }).catch((error) => {
    console.log(`There was an error with your request: ${error}`)
  })
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

function handleMarkerData(geoJSONdata) {
  const markerLatLngs = geoJSONdata.map((element) => {
    // Create the Google LatLng objects from GeoJSON data
    let lat = element.geometry.coordinates[1]
    let lng = element.geometry.coordinates[0]
    let latLng = new google.maps.LatLng(lat, lng)
    return latLng
    })

  // transform data into objects for making markers
  let coordinates = markerLatLngs.map((element) => {
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
        store.dispatch({ type: 'ALERT_RECEIVED',  alerts: 'Out of bounds detected near ADDRESS' })
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
  store.dispatch({ type: 'ALERT_CLEARED'})
  fetchCoordinates()

},false)


/* react components here for now */
const initialState = {
  loggedIn: false,
  alerts: [],
  count: 0,
  alertBoxOpen: true,
  preferenceBoxOpen: false,
  settingBoxOpen: false,
  drawingControls: true
}

function reducer(state, action) {
  switch (action.type) {
    case 'ALERT_RECEIVED':
      return Object.assign({}, state, {
        // take the old alerts + new alert and return a new array
        alerts: [...state.alerts, action.alerts],
        // alerts: action.alerts,
        count: state.count + 1
      })
    case 'ALERT_CLEARED':
      return Object.assign({}, state, {
        count: action.count = 0,
        alerts: [],
        alertBoxOpen: true
      })
    case 'SHOW_ALERTS':
      return Object.assign({}, state, {
        alertBoxOpen: !state.alertBoxOpen
      })
    case 'SHOW_PREFS':
      return Object.assign({}, state, {
        preferenceBoxOpen: !state.preferenceBoxOpen
      })
    case 'SHOW_SETTINGS':
      return Object.assign({}, state, {
        settingBoxOpen: !state.settingBoxOpen
      })
      case 'SHOW_DRAWING':
        return Object.assign({}, state, {
        loggedIn: !state.drawingControls
      })
    default:
      return state;
  }
}

function accordion(elementState, level ) {
  const active = {className: `${level} active`}
  const inactive = {className: `${level}`}
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
  const preferenceBoxOpen = store.getState().preferenceBoxOpen
  const settingBoxOpen = store.getState().settingBoxOpen

  const handleClickAlerts = () => {
    store.dispatch({ type: 'SHOW_ALERTS'})
  }

  const handleClickPrefs = () => {
    store.dispatch({ type: 'SHOW_PREFS'})
  }

  const handleClickSettings = () => {
    store.dispatch({ type: 'SHOW_SETTINGS'})
  }

  const handleRemoveData = () => {
    // Hide the Data layer.
    map.data.setStyle({visible: false})
    // build a delete route for this + need to figure how to id each geofence
  }

  const handleShowControls = () => {
    // Hide the Data layer.
    store.dispatch({ type: 'SHOW_DRAWING'})
    // build a delete route for this + need to figure how to id each geofence
  }

  return (
    React.createElement(
      'div',
      { className: 'ui styled accordion', id: 'accordion-menu' },
      React.createElement(
        'div',
        accordion(alertBoxOpen, 'title'),
        React.createElement('i', { className: 'dropdown icon', onClick: handleClickAlerts}),
          'Alerts'
      ),
      React.createElement(
        'div', accordion(alertBoxOpen, 'content'),
        React.createElement(
          'div',
          {  id: 'alertsList', className: 'ui list' },
          alerts.reverse().map((alert, i) =>
            i === 0
            ? React.createElement(
                'div',
                {className: 'item', key: i},
                null,
                React.createElement('i', {id: 'red', className: 'warning circle icon' }),
                React.createElement(
                  'div',
                  { className: 'content' },
                  alert
                )
              )
            : React.createElement(
              'li',
              {className: 'item', key: i},
              null,
              React.createElement('i', {id: 'darkred', className: 'child icon' }),
              React.createElement(
                'div',
                { className: 'content' },
                alert
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        accordion(preferenceBoxOpen, 'title'),
        React.createElement('i', { className: 'dropdown icon', onClick: handleClickPrefs}),
          'Preferences'
      ),
      React.createElement(
        'div', accordion(preferenceBoxOpen, 'content'),
        React.createElement(
          'div',
          {  id: 'preferences', className: 'ui list' },
            React.createElement(
              'div',
              {className: 'item'},
              null,
              React.createElement(
                'div',
                { className: 'content' },
                React.createElement(
                  List,
                  { divided: true, relaxed: true },
                  React.createElement(
                    List.Item,
                    null,
                    React.createElement(List.Icon, { name: 'map', size: 'large', verticalAlign: 'top' }),
                    React.createElement(
                      List.Content,
                      null,
                      React.createElement(
                        List.Header,
                        { as: 'a' , id: 'geofenceStyling', onClick: handleRemoveData},
                        'Geofence syling options'
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current fill color: ${settings.shapeOptions.fillColor}`
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current fill opacity: ${settings.shapeOptions.fillOpacity}`
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current stroke weight: ${settings.shapeOptions.strokeWeight}`
                      )
                    )
                  ),
                  React.createElement(
                    List.Item,
                    null,
                    React.createElement(List.Icon, { name: 'map', size: 'large', verticalAlign: 'top' }),
                    React.createElement(
                      List.Content,
                      null,
                      React.createElement(
                        List.Header,
                        { as: 'a' , id: 'showControls', onClick: handleShowControls},
                        'Toggle drawing controls'
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Drawing controls are on: ${store.getState().drawingControls}`
                      )
                    )
                  )
                )
              )
            )
        )
      ),
      React.createElement(
        'div',
        accordion(settingBoxOpen, 'title'),
        React.createElement('i', { className: 'dropdown icon', onClick: handleClickSettings}),
          'Settings'
      ),
      React.createElement(
        'div', accordion(settingBoxOpen, 'content'),
        React.createElement(
          'div',
          {  id: 'settings', className: 'ui list' },
            React.createElement(
              'div',
              {className: 'item'},
              null,
              React.createElement(
                'div',
                { className: 'content' },
                React.createElement(
                  List,
                  { divided: true, relaxed: true },
                  React.createElement(
                    List.Item,
                    null,
                    React.createElement(List.Icon, { name: 'setting', size: 'large', verticalAlign: 'top' }),
                    React.createElement(
                      List.Content,
                      null,
                      React.createElement(
                        List.Header,
                        { as: 'a' },
                        'Map Center'
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current latitude value: ${settings.mapCenter.lat}`
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current longitude value: ${settings.mapCenter.lng}`
                      )
                    )
                  ),
                  React.createElement(
                    List.Item,
                    null,
                    React.createElement(List.Icon, { name: 'setting', size: 'large', verticalAlign: 'top' }),
                    React.createElement(
                      List.Content,
                      null,
                      React.createElement(
                        List.Header,
                        { as: 'a' },
                        'Min Distance Between Markers'
                      ),
                      React.createElement(
                        List.Description,
                        { as: 'a' },
                        `Current minimum distance: ${settings.distanceBetweenMarkers}`
                      )
                    )
                  )
                )
              )
            )
        )
      )
    )
  )
}

const store = Redux.createStore(reducer, initialState)

function redraw() {
  ReactDOM.render(React.createElement(AlertMonitor, null), document.getElementById('root'))
}
redraw()
store.subscribe(redraw)
