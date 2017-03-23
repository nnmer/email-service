let assert   = require('assert');
let Mandrill = require('../lib/mandrill');
let config   = require('./config.json');

describe('Mandrill tests', function() {
    describe('#instantiate & send', function() {
        it('should throw error if config not proper set', function() {
            assert.throws(function(){
                var mailer = new Mandrill();
            })
        });
        it('should not throw error on proper config provided', function() {
            var mailer = new Mandrill({
                apiKey: config.wrongApiKey,
            });
        });
        it('should error when not proper apiKey', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Mandrill({
                    apiKey: config.wrongApiKey,
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Sendgrid', 'Some content here')
                    .then((body)=>resolve(body))
                    .catch((e)=>reject(e))
                ;
            })

            resolvingPromise
                .then((result)=>{})
                .catch((e)=>{assert.equal(e.message,'Invalid API key');})
                .then(done,done)
        });

        it('should send successfully the mail', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Mandrill({
                    apiKey: config.mandrillApikey,
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Mandrill', 'Some content here')
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