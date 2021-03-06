'use strict';

var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

describe('The BaseReminders Service', function() {
  var mocks = require('../mocks')('BaseReminder');
  mocks.addResource('Timeframe');
  var baseReminderService;

  var baseRemindersDbResponse, baseReminders;

  beforeEach(function() {
    mocks.stubMethods('BaseReminder');
    mocks.stubMethods('Timeframe');

    baseReminderService = require('../../services/baseReminderService')(mocks.modelMock);

    baseRemindersDbResponse = [{
      id: 1,
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      Timeframes: [
        {id: 1, name: '90 Days'},
        {id: 2, name: '60 Days'}
      ],
      Category: {
        id: 1, name: 'Essays'
      },
      toJSON: function() {
        return {
          id: this.id,
          name: this.name,
          message: this.message,
          detail: this.detail,
          lateMessage: this.lateMessage,
          lateDetail: this.lateDetail,
          categoryId: this.categoryId,
          Timeframes: this.Timeframes,
          Category: this.Category
        };
      }
    }, {
      id: 1,
      name: 'Get Recommendations',
      message: 'Ask counselor for recommendations',
      detail: 'More detail about recommendations',
      lateMessage: 'Your recommendations are late',
      lateDetail: 'What to do about late recommendations',
      categoryId: 1,
      Timeframes: [
        {id: 3, name: '30 Days'}
      ],
      Category: {
        id: 1, name: 'Essays'
      },
      toJSON: function() {
        return {
          id: this.id,
          name: this.name,
          message: this.message,
          detail: this.detail,
          lateMessage: this.lateMessage,
          lateDetail: this.lateDetail,
          categoryId: this.categoryId,
          Timeframes: this.Timeframes,
          Category: this.Category
        };
      }
    }];
    baseReminders = [{
      id: 1,
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2],
      timeframes: ['90 Days', '60 Days'],
      categoryName: 'Essays'
    }, {
      id: 1,
      name: 'Get Recommendations',
      message: 'Ask counselor for recommendations',
      detail: 'More detail about recommendations',
      lateMessage: 'Your recommendations are late',
      lateDetail: 'What to do about late recommendations',
      categoryId: 1,
      timeframeIds: [3],
      timeframes: ['30 Days'],
      categoryName: 'Essays'
    }];
  });

  afterEach(function() {
    baseRemindersDbResponse = undefined;
    baseReminders = undefined;
    mocks.restoreStubs('BaseReminder');
    mocks.restoreStubs('Timeframe');
  });

  describe('The findAll function', function() {
    it('should resolve with an array of objects representing baseReminders', function() {
      mocks.stubs.BaseReminder.findAll.returns(Promise.resolve(baseRemindersDbResponse));

      return baseReminderService.findAll().should.eventually.deep.equal(baseReminders);
    });

    it('should resolve with an empty array there are no baseReminders', function() {
      mocks.stubs.BaseReminder.findAll.returns(Promise.resolve([]));

      return baseReminderService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findAllIncludingTimeframes function', function() {
    var baseRemindersIncludingTimeframes;

    beforeEach(function() {
      baseRemindersIncludingTimeframes = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        Timeframes: [{
          id: 1,
          name: 'Today',
          type: 'now',
          formula: undefined
        }, {
          id: 2,
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        }],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        Timeframes: [{
          id: 3,
          name: 'January 1',
          type: 'absolute',
          formula: '2017-01-01'
        }],
        categoryId: 2
        }
      ];
    });

    it('should resolve with baseReminder objects that include an array of Timeframes belonging to it', function() {
      mocks.stubs.BaseReminder.findAll.withArgs({include: mocks.modelMock.Timeframe})
        .returns(Promise.resolve(baseRemindersIncludingTimeframes));

      var response = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframes: [{
          id: 1,
          name: 'Today',
          type: 'now',
          formula: undefined
        }, {
          id: 2,
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        }],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        timeframes: [{
          id: 3,
          name: 'January 1',
          type: 'absolute',
          formula: '2017-01-01'
        }],
        categoryId: 2
      }];

      return baseReminderService.findAllIncludingTimeframes()
        .should.eventually.deep.equal(response);
    })
  });

  describe('The findById function', function() {
    it('should resolve with an array with the matching baseReminder object', function() {
      mocks.stubs.BaseReminder.findById.withArgs(1)
        .returns(Promise.resolve(baseRemindersDbResponse[0]));

      return baseReminderService.findById(1).should.eventually.deep.equal([baseReminders[0]]);
    });

    it('should resolve with an empty array if no baseReminders were found', function() {
      mocks.stubs.BaseReminder.findById.withArgs(3)
        .returns(Promise.resolve(null));

      return baseReminderService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var setTimeframes, newBaseReminderDbResponse, newTimeframeAssociations;

    var newBaseReminder = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    };

    beforeEach(function() {
      newBaseReminderDbResponse = {
        name: 'Write Essays',
        message: 'Write Your Essays',
        detail: 'More detail about essays',
        lateMessage: 'Your Essays are late',
        lateDetail: 'What to do about late essays',
        categoryId: 1,
        setTimeframes: function(){},
        toJSON: function() {
          return {
            name: this.name,
            message: this.message,
            detail: this.detail,
            lateMessage: this.lateMessage,
            lateDetail: this.lateDetail,
            categoryId: this.categoryId
          };
        }
      };

      newTimeframeAssociations = [[{
        TimeframeId: 1
      }, {
        TimeframeId: 2
      }]];

      setTimeframes = sinon.stub(newBaseReminderDbResponse, 'setTimeframes');
    });

    afterEach(function() {
      newBaseReminderDbResponse = undefined;
      newTimeframeAssociations = undefined;
      setTimeframes.restore();
    });

    it('should resolve with an array containing the new baseReminder object', function() {
      mocks.stubs.BaseReminder.create.returns(Promise.resolve(newBaseReminderDbResponse));
      setTimeframes.returns(Promise.resolve(newTimeframeAssociations));

      return baseReminderService.create(newBaseReminder).should.eventually.deep.equal([newBaseReminder]);
    });
  });

  describe('The update function', function() {
    var setTimeframes, getTimeframes, associatedTimeframes, baseReminder, update,
        updatedBaseReminderDbResponse, updatedTimeframeAssociations;

    var updatedBaseReminder = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1,
      timeframeIds: [1, 2]
    };

    var updatedBaseReminderNoTimeframes = {
      name: 'Write Essays',
      message: 'Write Your Essays',
      detail: 'More detail about essays',
      lateMessage: 'Your Essays are late',
      lateDetail: 'What to do about late essays',
      categoryId: 1
    };

    beforeEach(function() {
      updatedBaseReminderDbResponse = {
        name: 'Write Essays',
        message: 'Write Your Essays',
        detail: 'More detail about essays',
        lateMessage: 'Your Essays are late',
        lateDetail: 'What to do about late essays',
        categoryId: 1,
        setTimeframes: function(){},
        getTimeframes: function(){},
        toJSON: function() {
          return {
            name: this.name,
            message: this.message,
            detail: this.detail,
            lateMessage: this.lateMessage,
            lateDetail: this.lateDetail,
            categoryId: this.categoryId
          };
        }
      };

      updatedTimeframeAssociations = [[{
        TimeframeId: 1
      }, {
        TimeframeId: 2
      }]];

      associatedTimeframes = [{
        id: 1
      }, {
        id: 2
      }];

      baseReminder = {
        update: function(){}
      };

      setTimeframes = sinon.stub(updatedBaseReminderDbResponse, 'setTimeframes');
      getTimeframes = sinon.stub(updatedBaseReminderDbResponse, 'getTimeframes');
      update = sinon.stub(baseReminder, 'update');
    });

    afterEach(function() {
      updatedBaseReminderDbResponse = undefined;
      updatedTimeframeAssociations = undefined;
      setTimeframes.restore();
      getTimeframes.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated baseReminder object', function() {
      mocks.stubs.BaseReminder.findById.returns(Promise.resolve(baseReminder));
      update.returns(Promise.resolve(updatedBaseReminderDbResponse));
      setTimeframes.returns(Promise.resolve(updatedTimeframeAssociations));

      return baseReminderService.update(1, updatedBaseReminder).should.eventually.deep.equal([updatedBaseReminder]);
    });

    it('should resolve with an array containing the updated baseReminder object, even if timeframes are not updated', function() {
      mocks.stubs.BaseReminder.findById.returns(Promise.resolve(baseReminder));
      update.returns(Promise.resolve(updatedBaseReminderDbResponse));
      getTimeframes.returns(Promise.resolve(associatedTimeframes));

      return baseReminderService.update(1, updatedBaseReminderNoTimeframes).should.eventually.deep.equal([updatedBaseReminder]);
    });

    it('should resolve with false if the id does not exist', function() {
      mocks.stubs.BaseReminder.findById.returns(Promise.resolve(null));

      return baseReminderService.update(1, updatedBaseReminder).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var baseReminder, destroy, setTimeframes;

    beforeEach(function() {
      baseReminder = {
        destroy: function(){},
        setTimeframes: function(){}
      };
      destroy = sinon.stub(baseReminder, 'destroy');
      setTimeframes = sinon.stub(baseReminder, 'setTimeframes')
    });

    afterEach(function() {
      destroy.restore();
      setTimeframes.restore();
    });

    it('should resolve with true when the row is destroyed', function() {
      mocks.stubs.BaseReminder.findById.returns(Promise.resolve(baseReminder));
      setTimeframes.returns(Promise.resolve());
      destroy.returns(Promise.resolve(undefined));

      return baseReminderService.destroy(1).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      mocks.stubs.BaseReminder.findById.returns(Promise.resolve(null));

      return baseReminderService.destroy(1).should.eventually.be.false;
    });
  });
});
