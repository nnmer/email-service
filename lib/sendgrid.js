'use strict';


var SendGridSDKHelper = require('sendgrid').mail;
var SendGridSDK       = require('sendgrid');
let validate          = require("validate.js");
let validatorConstraints = require('../lib/config_schema_constraints').serviceSendDataConstraints;


class Sendgrid {
    constructor(config) {
        this.apiKey = config.apiKey || null;

        if (null === this.apiKey || this.apiKey.length <= 10){
            throw new Error('Sendgrid api key should be provided');
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

        var mail = new SendGridSDKHelper.Mail(
            new SendGridSDKHelper.Email(from),
            subject,
            new SendGridSDKHelper.Email(to),
            new SendGridSDKHelper.Content("text/html", content)
        );
        var sg = SendGridSDK(this.apiKey);
        var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });


        return new Promise((resolve, reject)=>{
            sg.API(request)
                .then(resolve)
                .catch((error)=>{
                    console.log(`Sendgrid send error:  ${error.message}, `,error.response.body.errors);
                    reject(error);
                });
        });

    }
}

module.exports = Sendgrid;