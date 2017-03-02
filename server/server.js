/*eslint-disable no-console */
const
      MONGO = 'mongodb://localhost:27017/beholder',
      bodyParser = require('body-parser'),
      {MongoClient} = require('mongodb'),
      PORT = process.env.PORT || 6969,
      jsonParser = bodyParser.json(),
      express = require('express'),
      logger = require('morgan'),
      path = require('path'),
      fs = require('fs'),
      app = express()


// logging to the console for dev as well as server.log
const logpath = path.join(__dirname, '../logs/server.log')
const accessLogStream = fs.createWriteStream(logpath, {flags: 'a'})

app.use(logger('combined', {stream: accessLogStream}))
app.use(bodyParser.urlencoded({extended: false}))


// static path set to public
app.use(express.static(path.join(__dirname, '/public')))


app.get('/coords', (req, res) => {
  const {MongoClient} = require('mongodb')
  MongoClient.connect('mongodb://localhost:27017/beholder', (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('geospatial').find().toArray().then((docs) => {
        res.send(docs)
        db.close()
        console.log('Disconnected from the MongoDB server')
      }, (error) => {
        console.log('Unable to fetch data', error)
      })
  })
})

app.get('/fences', (req, res) => {
  const {MongoClient} = require('mongodb')
  MongoClient.connect('mongodb://localhost:27017/beholder', (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('geospatial').find({'geometry.type':'Polygon'}).toArray().then((docs) => {
        console.log(docs)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(docs))
        db.close()
      }, (error) => {
        console.log('Unable to fetch data', error)
      })
  })
})

app.post('/fences', jsonParser, (req, res) => {
  const data = req.body[0]
  MongoClient.connect(MONGO, (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('geospatial').insertOne(data, (error, result) => {
          if (error) {
              return console.log('Unable to insert data', error)
          }
          db.close()
      })

  })
  res.sendStatus(201)
})

app.post('/coords', jsonParser, (req, res, next) => {
  const data = req.body
  var newPoint

  if (data.geometry.type === 'Point') {
    newPoint = {'type': data.geometry.type, 'coordinates': data.geometry.coordinates}
  } else {
    return null
  }
  console.log(data.geometry.type + ' ' + data.geometry.coordinates)

  MongoClient.connect(MONGO, (error, db) => {
    if (error) {
      console.log('Unable to connect to MongoDB server')
    } else {
      console.log('Connected to the MongoDB server')
    }
    // if its true then alert, console is a placeholder for added functionality
    let matches = []
    db.collection('geospatial').find({geometry: {$geoIntersects: {$geometry: newPoint}}}).toArray().then((docs) => {
      Object.assign(matches, docs)
      if (matches[0] != null) {
        console.log('ALERT OOB DETECTED! ' + newPoint)
        return next
      } else {
        console.log('New point is in bounds ' + newPoint)
        return next
      }
    })
  })
  res.sendStatus(201)
})

app.post('/coords', jsonParser, (req, res) => {
  const data = req.body
  MongoClient.connect(MONGO, (error, db) => {
    if (error) {
      console.log('Unable to connect to MongoDB server')
    } else {
      console.log('Connected to the MongoDB server')
    }
    db.collection('geospatial').insertOne(data, (error, result) => {
      if (error) {
          return console.log('Unable to insert data', error)
      } else {
        return result
      }
    })
    db.close()
    console.log('Disconnected from the MongoDB server')
  })
  res.sendStatus(201)
})

// error-handling middlewares
app.use((error, req, res, next) => {
    console.log(error)
    next(error)
})

app.use((error, req, res, next) => {
  res.status(500)
  res.send("Internal server error")
})


app.use((req, res) => {
  res.status(404)
  res.send("File not found")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports.app = app
