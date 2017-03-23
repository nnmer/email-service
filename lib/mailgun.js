'use strict';


var MailgunSDK = require('mailgun-js');
let validate   = require("validate.js");
let validatorConstraints = require('../lib/config_schema_constraints').serviceSendDataConstraints;

class Mailgun {
    constructor(config) {
        this.apiKey      = config.apiKey || null;
        this.domain      = config.domain || null;

        if (null === this.apiKey || this.apiKey.length <= 10){
            throw new Error('Mailgun api key should be provided');
        }
        if (null === this.domain || this.domain.length <= 3){
            throw new Error('Mailgun domain should be provided');
        }


    }

    send(from, to, subject, content){

        var data = {
            from:    from,
            to:      to,
            subject: subject,
            html:    content
        };

        let result = validate.validate(data, validatorConstraints.serviceSendDataConstraints,{format:'flat',fullMessages:true});
        if (undefined !== result){
            throw new Error(result);
        }


        var mailgun = new MailgunSDK({apiKey: this.apiKey, domain: this.domain});

        return new Promise((resolve, reject)=>{
            mailgun.messages().send(data, function (err, body) {

                if (err) {
                    console.log("Mailgun send error: ", err.message);
                    reject(err);
                }
                else {
                    resolve(body);
                }
            });
        });

    }
}

module.exports = Mailgun;