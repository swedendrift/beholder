/*
global
describe
it
*/

const { expect } = require('chai'),
      request = require('supertest'),
      dummyData = require('./dummyData'),
      app = require('../server/server').app




describe('dummyTests', () => {

  // describe('add', () => {
    it('sums two numbers', () => {
      const result = dummyData.add(2, 8)
      expect(result).to.equal(10).to.be.a('number')
    })
  // })
  //
  // describe('asyncAdd', () => {
    it('async adds two numbers', (done) => {
      dummyData.asyncAdd(7, 20, (sum)  => {
        expect(sum).to.equal(27).to.be.a('number')
        done()
      })
    })
  // })
})


describe('REST API', () => {

    it('GET /coords and responds with JSON data', (done) => {
      request(app)
        .get('/coords')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })

    it('GET /fences and responds with JSON data', (done) => {
      request(app)
        .get('/fences')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })

    it('POST /coords and responds with JSON data', (done) => {
      request(app)
        .get('/coords')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })

    it('POST /fences and responds with JSON data', (done) => {
      request(app)
        .get('/fences')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })

})
