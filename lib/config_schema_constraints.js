'use strict';

var validate = require("validate.js");
var v = require("validate.js").validate;

/**
 *  Custom validator to extend validate.js
 *
 *  checks whether the value is a Array
 *
 *  The following constraints can be applied:
 *      elementsGreaterThan - The input length has to be greater than this value. The error message is length must be greater than %{count}
 *      elementsGreaterThanOrEqualTo -  The input length has to be at least this value. The error message is length must be greater than or equal to %{count}
 *      elementsEqualTo -  The input length has to be exactly this value. The error message is length must be equal to %{count}
 *      elementsLessThanOrEqualTo -  The input length can be this value at the most. The error message is length must be less than or equal to %{count}
 *      elementsLessThan -  The input length has to be less than this value. The error message is length must be less than %{count}
 */
validate.validators.validArray = function(value, options, attribute) {
    // Empty values are allowed
    if (!v.isDefined(value)) {
        return v.format("Attribute %{attr} should be defined array", {attr: attribute});
    }

    options = v.extend({}, this.options, options);

    var errors = []
        , name
        , count
        , checks = {
        greaterThan:          function(v, c) { return v > c; },
        greaterThanOrEqualTo: function(v, c) { return v >= c; },
        equalTo:              function(v, c) { return v === c; },
        lessThan:             function(v, c) { return v < c; },
        lessThanOrEqualTo:    function(v, c) { return v <= c; },
    };

    if(!v.isArray(value)) {
        v.error(v.format("Attribute %{attr} should be an array", {attr: attribute}));
        return options.message || "should be an array";
    }

    var is = options.is
        , maximum = options.maximum
        , minimum = options.minimum
        , tokenizer = options.tokenizer || function(val) { return val; }
        , err
        , errors = [];

    value = tokenizer(value);


    for (name in checks) {
        count = options[name];
        if (v.isNumber(count) && !checks[name](value.length, count)) {
            // This picks the default message if specified
            // For example the greaterThan check uses the message from
            // this.notGreaterThan so we capitalize the name and prepend "not"
            var key = "not" + v.capitalize(name);
            var msg = options[key] ||
                this[key] ||
                this.message ||
                "length must be %{type} %{count}";

            errors.push(v.format(msg, {
                count: count,
                type: v.prettify(name)
            }));
        }
    }

    if (errors.length) {
        return options.message || errors;
    }
};

const schemaConfigConstraints = {
    /*
    TODO: add constraints for service property
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
    },*/
    servicesFailoverOrder: {
        presence:        true,
        validArray: {
            greaterThan: 0
        }

    },
    retryTimes:  {
        presence:        true,
        numericality: {
            onlyInteger: true,
            greaterThan: 0
        }
    }
};

const serviceSendDataConstraints = {
    from:       {
        presence:   true,
        email:      true            // TODO: add proper verification of email pattern of '"Name" <dd@dd.dd>',
                                    // and need to be sure that vendor's mail services support such pattern
    },
    to:       {
        presence:   true,
        email:      true            // TODO: add proper verification of email pattern of '"Name" <dd@dd.dd>',
                                    // and need to be sure that vendor's mail services support such pattern
    }
};

module.exports = {
    schemaConfigConstraints: schemaConfigConstraints,
    serviceSendDataConstraints:  serviceSendDataConstraints
};
