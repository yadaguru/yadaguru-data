'use strict';

var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var mockData = require('../mockData');
var config = require('../testConfig');
var dbServices;
var reminderService;

describe('The reminderService', function() {
  beforeEach(function(done) {
    dbServices = require('../..')(config);
    reminderService = dbServices.reminderService;
    dbServices.models.sequelize.sync({force: true})
      .then(function() {
        mockData.createMockData(dbServices.models)
          .then(function() {
            done();
          });
      });
  });

  it('should get all reminders for a user, with joined data', function() {
    return reminderService.findByUserWithBaseReminders(1).then(function(reminders) {
      reminders.length.should.equal(6);
      reminders[0].name.should.equal('Write Essay');
      reminders[0].category.should.equal('Essays');
      reminders[0].schoolName.should.equal('Temple');
    });
  });

  it('should get one reminders by id from the database', function() {
    return reminderService.findByIdForUserWithBaseReminders(1, 1).then(function(reminders) {
      reminders.length.should.equal(1);
      reminders[0].id.should.equal(1);
    });
  });

  it('should get all reminders for one school for a user', function() {
    return reminderService.findByUserForSchoolWithBaseReminders(1, 1).then(function(reminders) {
      reminders.length.should.equal(3);
      reminders[0].schoolId.should.equal(1);
    });
  });
});
