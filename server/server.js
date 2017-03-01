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


// error-handling middlewares
app.use((error, req, res, next) => {
    console.log(error)
    next(error)
})
app.use((error, req, res, next) => {
  res.status(500)
  res.send("Internal server error")
})


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
        console.log('Disconnected from the MongoDB server')
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
        console.log('Disconnected from the MongoDB server')
      })

  })
  res.sendStatus(201)
})

// validation middleware to ensure that the incomign data is correct
app.use('/coords', (req, res, next) => {
  if (req.method ==! 'POST' && req.body) return next()
    // Perform  validations.
  if (data.geometry.type !== 'Point') return null
    // Validation failed
  if (err) return res.sendStatus(400)
    // Validation passed.
    return next();
})

//  alerting middleware to do realtime OOB checking
app.use(jsonParser, (req, res, next) => {
  const data = req.body[0]
  MongoClient.connect(MONGO, (error, db) => {
    if (error) {
      console.log('Unable to connect to MongoDB server')
    } else {
      console.log('Connected to the MongoDB server')
    }
    let matches = []
    db.collection('geospatial').find({
      geometry: {
        $geoIntersects: {
          $geometry: data
        }
      }
    }).toArray().then((docs) => {
      Object.assign(matches, docs)
      if (matches[0] != null) {
        // placeholder for features
        console.log('ALERT OOB DETECTED! ' + data)
        db.close()
        console.log('Disconnected from the MongoDB server')
        return next()
      } else {
        console.log('New point is in bounds ' + data)
        db.close()
        console.log('Disconnected from the MongoDB server')
        return next()
      }
    })
  })
})

app.post('/coords', jsonParser, (req, res) => {
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
      } else {
        return result
      }
    })
    db.close()
    console.log('Disconnected from the MongoDB server')

    res.sendStatus(201)
  })
})


app.use((req, res) => {
  res.status(404)
  res.send("File not found")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


var validator = function(req, res, next) {

}
