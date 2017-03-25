var assert = require('assert');

let MailService = require('../index');
let config      = require('./config.json');

let mailerConfig = {
    services: {
        mailgun: {
            apiKey: config.mailgunApikey,
            domain: config.mailgunDomain,
        },
        sendgrid: {
            apiKey: config.sendgridApikey
        },
        mandrill: {
            apiKey: config.mandrillApikey
        }
    },
    retryTimes: 2
}

describe('MailService', function() {
    describe('#instantiate', function() {

        it('should throw error if config not proper and doesn\'t pass validation', function() {
            assert.throws(function(){
                var mailer = new MailService({servicesFailoverOrder:[]});
            })
        });

        it('loop through all services and retry times and stop with cannot send error', function() {
            // assert.throws(function() {
            this.timeout(0);

            let localConfig = JSON.parse(JSON.stringify(mailerConfig));
            // making wrong apiKeys so the sending action can failover and iterate through other services
            localConfig.services.mailgun.apiKey = localConfig.services.mailgun.apiKey+'123abc';
            localConfig.services.mandrill.apiKey= localConfig.services.mandrill.apiKey+'123abc';
            localConfig.services.sendgrid.apiKey= localConfig.services.sendgrid.apiKey+'123abc';

            return new Promise((resolve, reject) => {

                (new MailService(localConfig))
                    .send(config.sendFromEmail, config.sendToEmail, 'Sending email with failover', 'Should be delivered at the end')
                    .then(resolve)
                    .catch(reject)
            })
            .then((s)=>{console.log('Success result: ',s);assert.fail(s,'234')})
            .catch((err)=>{console.log('Error result: ',err);assert.ok(err)})
        });

        it('message should be sent from 3rd service "sendgrid"', function(){
            this.timeout(0);

            let localConfig = JSON.parse(JSON.stringify(mailerConfig));
            // making wrong apiKeys for mailgun and mandrill so message should be sent through SendGrid
            localConfig.services.mailgun.apiKey = localConfig.services.mailgun.apiKey+'123abc';
            localConfig.services.mandrill.apiKey= localConfig.services.mandrill.apiKey+'123abc';

            return new Promise((resolve,reject)=>{
                (new MailService(localConfig))
                    .send(config.sendFromEmail,config.sendToEmail, 'Sending email with failover', 'Should be delivered at the end')
                    .then(resolve)
                    .catch(reject)
            })
            .then((result)=>{assert.ok(result);})
            .catch((err)=>{console.log('Catched error: ',err);assert.fail(err,'234')})
        })
    });
});

