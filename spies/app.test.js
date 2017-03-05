/*
global
describe
it
*/


var expect = require('expect'),
    rewire = require('rewire'),
    app = rewire('./app')

describe('App', () => {
  const db = {
    saveUser: expect.createSpy()
  }
  app.__set__('db', db)

  it('Should call the spy correctly', () => {
    var spy = expect.createSpy()
    spy('Erick', 47)
    expect(spy).toHaveBeenCalledWith('Erick', 47)

  })

  it('Should call saveUser with the user object', () => {
    var email = 'adndres@example.com',
        password = '123abc'

    app.handleSignup(email, password)
    expect(db.saveUser).toHaveBeenCalledWith({email, password})
  })

})
