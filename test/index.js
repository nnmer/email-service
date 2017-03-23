var assert = require('assert');

let MailService = require('../index');


describe('MailService', function() {
    describe('#instantiate', function() {
        it('should throw error if config not proper and doesn\'t pass validation', function() {
            assert.throws(function(){
                var mailer = new MailService({servicesFailoverOrder:[]});
            })
        });
        it('should not throw error on proper config provided', function() {
            var mailer = new MailService({});
        });
    });
});

