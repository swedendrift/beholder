const Redux = require('redux')

const initialState = {
  loggedIn: false,
  alerts: [],
  count: 0,
  alertBoxOpen: true,
  preferenceBoxOpen: false,
  settingBoxOpen: false,
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
  },
  mapCenter: {
    lat: 37.3310207,
    lng: -122.0293453
  }
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
      case 'AUTH_ACTION':
        return Object.assign({}, state, {
        loggedIn: !state.loggedIn
      })
    default:
      return state;
  }
}

const store = Redux.createStore(reducer, initialState)

module.exports = store
