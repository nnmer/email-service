'use strict';

var serviceMailgun  = require('./lib/mailgun');
var serviceMandrill = require('./lib/mandrill');
var serviceSendgrid = require('./lib/sendgrid');

let validate             = require("validate.js");
let validatorConstraints = require('./lib/config_schema_constraints');

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var servicesInstances = {
    serviceMailgun,
    serviceMandrill,
    serviceSendgrid
};

class MailService {

    constructor(config) {
        config = config || {};

        this.supportedVendors = [
            'mailgun',
            'sendgrid',
            'mandrill'
        ];

        this.config = {
            services: {
                mailgun: {
                    apiKey: '',
                    domain: '',
                },
                sendgrid: {
                    apiKey: ''
                },
                mandrill: {
                    apiKey: ''
                }
            },
            servicesFailoverOrder: this.supportedVendors,
            retryTimes:     3,    // the number of times to start the sending loop
        };

        if (typeof config === 'object'){
            this.config = Object.assign({}, this.config, config);
        }else{
            throw new Error('config should be an Object type');
        }

        this.validateConfig();

        var $config    = this.config;
        (this.config.servicesFailoverOrder).forEach(function(value, index, servicesList){
            value = value.toLowerCase();
            $config.servicesFailoverOrder[index] = value;

            if (!$config.services[value]){
                throw new Error(`Provided vendor ${value} is not supported`);
            }
        });

    }

    validateConfig() {
        let result = validate.validate(this.config, validatorConstraints.schemaConfigConstraints,{format:'flat',fullMessages:true});
        if (undefined !== result){
            throw new Error(result);
        }
    }

    validateSendData(data) {
        let result = validate.validate(data, validatorConstraints.serviceSendDataConstraints,{format:'flat',fullMessages:true});
        if (undefined !== result){
            throw new Error(result);
        }
    }

    /**
     *
     * @param serviceName
     * @param data
     * @returns {Promise}
     */
    sendViaService(serviceName, data){

        return new Promise((resolve,reject)=>{
            console.log(`Sending via ${serviceName}...`);
            let serviceToCall = `service${serviceName.capitalizeFirstLetter()}`;
            var Service =  new servicesInstances[serviceToCall](this.config.services[serviceName]);

            Service.send(data.from, data.to, data.subject, data.content)
                .then((s)=>{console.log('Emails was successfully sent');resolve(s)})
                .catch((e)=>{
                    console.log(`Fail to send via ${serviceName}`);
                    reject(e)
                });
        });
    }

    /**
     * Send a email through the send mail service
     *
     * @param from
     * @param to
     * @param subject
     * @param content
     * @returns {Promise}
     */
    send(from, to, subject, content) {

        var $config = this.config;
        var retryTimesIndex = 1;
        var serviceIndex    = 0;

        var data = {
            from:    from,
            to:      to,
            subject: subject,
            content: content
        };
        this.validateSendData(data);

        return new Promise((resolve,reject)=>{
            const failOverHandler = (e)=>{
                console.log(`Failover:: serviceIndex: ${serviceIndex}, retryTimesIndex: ${retryTimesIndex}, error: ${e.message}`);

                ++serviceIndex;
                if (serviceIndex > (this.config.servicesFailoverOrder.length-1) ){
                    serviceIndex =0;
                    ++retryTimesIndex;
                }
                if (retryTimesIndex > $config.retryTimes){
                    let message = 'The message was not sent, all the send mail services are unavailable';
                    reject(message);
                }
                this.sendViaService(this.config.servicesFailoverOrder[serviceIndex], data)
                    .then(resolve)
                    .catch(failOverHandler)
            };

            this.sendViaService(this.config.servicesFailoverOrder[serviceIndex], data)
                .then(resolve)
                .catch(failOverHandler)
        });
    }

}


module.exports = MailService;