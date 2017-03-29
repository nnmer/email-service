'use strict';


var MandrillSDK= require('mandrill-api/mandrill');

let validate   = require("validate.js");
let validatorConstraints = require('../lib/config_schema_constraints').serviceSendDataConstraints;

class Mandrill {
    constructor(config) {
        this.apiKey      = config.apiKey || null;

        if (null === this.apiKey || this.apiKey.length <= 10){
            throw new Error('Mandrill api key should be provided');
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


        var mandrillClient = new MandrillSDK.Mandrill(this.apiKey);

        var message = {
            "html": `${content}`,
            "text": content,
            "subject": subject,
            "from_email": from,
            "from_name": "Example Name",
            "to": [{
                "email": to,
                "name": "Recipient Name",
                "type": "to"
            }],
            "headers": {
                "Reply-To": from
            },
            "important": false,
            "track_opens": null,
            "track_clicks": null,
            "auto_text": null,
            "auto_html": null,
            "inline_css": null,
            "url_strip_qs": null,
            "preserve_recipients": null,
            "view_content_link": null,
            "bcc_address": "message.bcc_address@example.com",
            "tracking_domain": null,
            "signing_domain": null,
            "return_path_domain": null,
            "merge": true,
            "merge_language": "mailchimp",
        };
        var async   = false;
        var ip_pool = "Main Pool";
        var send_at = new Date();

        return new Promise((resolve, reject)=>{
            mandrillClient.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at},
                function(result) {
                    resolve(result);
                }, function(e) {
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    reject(e);
                }
            );
        });

    }
}

module.exports = Mandrill;