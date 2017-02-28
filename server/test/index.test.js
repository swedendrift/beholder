const { expect } = require('chai')
const calculator= require('../calculator')


describe('calculator', () => {

  describe('add', () => {
    it('sums two numbers', () => {
      const result = calculator.add(2, 2)
      expect(result).to.equal(4)
    })
  })

  describe('subtract', () => {
    it('subtracts the second parameter from the first', () => {
      const result = calculator.subtract(4, 2)
      expect(result).to.equal(2)
    })
  })

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      const result = calculator.multiply(4, 2)
      expect(result).to.equal(8)
    })
  })

  describe('divide', () => {
    it('divides the first number by the second number', () => {
      const result = calculator.divide(4, 2)
      expect(result).to.equal(2)
    })
  })

  describe('reduce', () => {
    it('sums all of the numbers', () => {
      const result = calculator.reduce([1, 2, 3], (sum, num) => sum + num, 0)
      expect(result).to.equal(6)
    })
  })


})
