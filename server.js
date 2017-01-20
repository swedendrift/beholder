const {MongoClient} = require('mongodb')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const path = require('path')
const fs = require('fs')
const app = express()
const jsonParser = bodyParser.json()
const PORT = process.env.PORT || 6969
const MONGO = 'mongodb://localhost:27017/beholder'

// const logpath = path.join(__dirname, './server.log')
// const accessLogStream = fs.createWriteStream(logpath, {flags: 'a'})
// app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.urlencoded({extended: false}));

const staticPath = path.join(__dirname, '/public')
app.use(express.static(staticPath));

app.get('/coords', (req, res) => {
  const {MongoClient} = require('mongodb')
  MongoClient.connect('mongodb://localhost:27017/beholder', (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('geolocation-data').find().toArray().then((docs) => {
        res.send(docs)
        // console.log(docs)
        db.close()
      }, (error) => {
        console.log('Unable to fetch data', error)
      })
  })
})

app.post('/coords', jsonParser, (req, res) => {
  const data = req.body
  MongoClient.connect(MONGO, (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('geolocation-data').insertOne(data, (error, result) => {
          if (error) {
              return console.log('Unable to insert data', error)
          }
          // console.log(result.ops)
          db.close()
      })

  })
  res.sendStatus(201)
})

app.get('/fences', (req, res) => {
  const {MongoClient} = require('mongodb')
  MongoClient.connect('mongodb://localhost:27017/beholder', (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('fences').find().toArray().then((docs) => {
        // console.log(docs)
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
  console.log(data)
  MongoClient.connect(MONGO, (error, db) => {
      if (error) {
        console.log('Unable to connect to MongoDB server')
      } else {
        console.log('Connected to the MongoDB server')
      }
      db.collection('fences').insertOne(data, (error, result) => {
          if (error) {
              return console.log('Unable to insert data', error)
          }
          console.log(result.ops)
          db.close()
      })

  })
  res.sendStatus(201)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
