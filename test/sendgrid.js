let assert   = require('assert');
let Sendgrid = require('../lib/sendgrid');
let config   = require('./config.json');

describe('Sendgrid tests', function() {
    describe('#instantiate & send', function() {
        it('should throw error if config not proper set', function() {
            assert.throws(function(){
                var mailer = new Sendgrid();
            })
        });
        it('should not throw error on proper config provided', function() {
            var mailer = new Sendgrid({
                apiKey: config.wrongApiKey,
            });
        });
        it('should error when not proper apiKey', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Sendgrid({
                    apiKey: config.wrongApiKey,
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Sendgrid', 'Some content here')
                    .then((body)=>resolve(body))
                    .catch((e)=>reject(e))
                ;
            })

            resolvingPromise
                .then((result)=>{})
                .catch((e)=>{assert.equal(e.message,'Response error');})
                .then(done,done)
        });

        it('should send successfully the mail', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Sendgrid({
                    apiKey: config.sendgridApikey,
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Sendgrid', 'Some content here')
                    .then((body)=>resolve(body))
                    .catch((e)=>reject(e))
                ;
            })

            resolvingPromise
                .then((result)=>{assert.ok(result)})
                .then(done,done)
        });
    });
});