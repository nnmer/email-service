A package provide an abstraction between multiple email service providers.
If one of the services goes down, it will failover to another provider.

Currently supported:
- [Mailgun](http://www.mailgun.com)
- [Mandrill](https://mandrillapp.com)
- [SendGrid](https://sendgrid.com)


Installation
------------

```
npm install --save email-service
```

Usage
-----

MailService will return a Promise.

```
let sendService = new MailService({
    services: {
        mailgun: {
            enable: true,
            apiKey: 'mailgun-apiKey',
            domain: 'mailgun-domain',
        },
        sendgrid: {
            enable: true,
            apiKey: 'sendgrid-apiKey'
        },
        mandrill: {
            enable: true,
            apiKey: 'sendgrid-apiKey'
        },
        servicesFailoverOrder: {
            'mailgun',
            'mandrill',
            'sendgrid'
        }
    },
});

...

sendService.send(fromEmail, toEmail, subject, content)
    .then(...)
    .catch(...)

```

Testing
-------

create a file _./test/config.json_ with credentials:
```
{
  "sendFromEmail":  "",
  "sendToEmail":    "",
  "mailgunApikey":  "",
  "mailgunDomain":  "",
  "mandrillApikey": "",
  "sendgridApikey": "",
  "wrongApiKey":    ""
}
```

To run tests do:
```
npm test
```

TODO
----

- add to send attachments
- add to send HTML/plain content