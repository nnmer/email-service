var assert = require('assert');

let Mailgun = require('../lib/mailgun');
let config  = require('./config.json');


describe('Mailgun tests', function() {
    describe('#instantiate & send', function() {
        it('should throw error if config not proper set', function() {
            assert.throws(function(){
                var mailer = new Mailgun({domain:'sdf'});
            })
        });
        it('should not throw error on proper config provided', function() {
            var mailer = new Mailgun({
                apiKey: config.wrongApiKey,
                domain: 'no-reply.com'
            });
        });
        it('should Forbidden error when not proper apiKey', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Mailgun({
                    apiKey: config.wrongApiKey,
                    domain: 'no-reply.com'
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Mailgun', 'Some content here')
                    .then((body)=>resolve(body))
                    .catch((e)=>reject(e))
                ;
            })

            resolvingPromise
                .catch((e)=>{assert.equal(e.message,'Forbidden','Mailgun apiKey|domain are forbidden');})
                .then(done,done)
        });

        it('should send successfully the mail', function(done) {

            const resolvingPromise = new Promise((resolve,reject)=>{

                var mailer = new Mailgun({
                    apiKey: config.mailgunApikey,
                    domain: config.mailgunDomain
                });

                mailer.send(config.sendFromEmail, config.sendToEmail, 'Subject from Mailgun', 'Some content here')
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