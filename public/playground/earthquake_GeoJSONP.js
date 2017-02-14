const initialState = {
  alerts: [],
  count: 0,
  alertBoxOpen: false
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
  const active = {'className': `${level} active`}
  const inactive = {'className': `${level}`}
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
        <div className='ui styled fluid accordion wide column' id='accordion-menu'>
          <div className={ 'title', accordion(alertBoxOpen, 'content')}>
            <i className='dropdown icon' onClick={handleClickAccordian} />
            Alerts
          </div>
          <div className={'content', accordion(alertBoxOpen, 'content')}></div>

          <div className={'title', accordion(alertBoxOpen, 'content')}>
            <i className='dropdown icon' onClick={ handleClickAccordian } />
            Preferences
          </div>
          <div className={'content', accordion(alertBoxOpen, 'content')}></div>

          <div className={'title', accordion(alertBoxOpen, 'content')}>
            <i className='dropdown icon' onClick={ handleClickAccordian } />
            Settings
          </div>
          <div className={'content', accordion(alertBoxOpen, 'content')}>
            <div className='ui list' id='alertList'>
              {alerts.reverse().map((alert, i) => (
                i === 0
                ? <li id='latestAlert' className='item' key={i}>
                    <i className='warning icon' />
                    <div className={content}>
                      alert
                    </div>
                  </li>
                : <li id='latestAlert' className='item' key={i}>
                    <i className='child icon' />
                    <div className={content}>
                      alert
                    </div>
                  </li>
              ))}
            </div>
          </div>
        </div>
      )
}
/* eslint-disable no-underscore-dangle */
// const store = Redux.createStore(reducer, initialState,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// )
/* eslint-enable */
var store = Redux.createStore(reducer, initialState)

function randomize () {
  return chance.sentence({words: 6})
}

function redraw() {
  ReactDOM.render(
    React.createElement(AlertMonitor, null), document.getElementById('root'));
}
redraw();

store.subscribe(redraw)

window.setInterval(() => {
  store.dispatch({ type: 'ALERT_RECEIVED',  alerts: randomize() })
  console.log(store.getState())
}, 5000)



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
