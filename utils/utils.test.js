/*
global
describe
it
*/

const { expect } = require('chai')
const utils= require('./utils')


describe('utils', () => {

  describe('add', () => {
    it('sums two numbers', () => {
      const result = utils.add(2, 8)
      expect(result).to.equal(10).to.be.a('number')
    })
  })

  describe('asyncAdd', () => {
    it('async adds two numbers', (done) => {
      utils.asyncAdd(7, 20, (sum)  => {
        expect(sum).to.equal(27).to.be.a('number')
        done()
      })
    })
  })
})
