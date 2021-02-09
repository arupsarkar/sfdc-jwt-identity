'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');

// read .env
require("dotenv").config();

// must expire within 5 minutes for Salesforce
const expiresIn = 60 * 60;
// Salesforce only supports RS256
const algorithm = "RS256";
// issuer = client_id / consumer key of Connected App
const issuer = process.env.CLIENT_ID;
// subject = the username of the user in Salesforce we're requesting an access token for
//const subject = process.env.SUBJECT;
// audience = where is this JWT any good (https://login.salesforce.com, https://test.salesforce.com or commmunity url
const audience = process.env.AUDIENCE || 'https://login.salesforce.com';

// read keys
var privateKEY;
var publicKEY
const env = process.env.NODE_ENV || 'development';
if(env == 'development') {
    privateKEY = fs.readFileSync(process.env.PATH_PRIVATE_KEY, 'utf8');
    publicKEY = fs.readFileSync(process.env.PATH_PUBLIC_KEY, 'utf8');
}else {
    privateKEY = process.env.PATH_PRIVATE_KEY, 'utf8';
    publicKEY = process.env.PATH_PUBLIC_KEY, 'utf8';    
}


console.log('issuer', issuer)
console.log('subject', subject)
console.log('private key', privateKEY)
console.log('public key', publicKEY)
console.log('audience', audience)

function jwt_assertion(sub) {
    const subject = sub || process.env.SUBJECT
    console.log('subject : ' + subject)
    // additonal payload to add
    const additionalPayload = {
    };

    // specify main payload
    var signOptions = {
        issuer,
        subject,
        audience,
        expiresIn,
        algorithm,
    };

    // add thumbprint of certificate if using with azure
    if (process.env.CERTIFICATE_THUMBPRINT) {
        signOptions.header = {
            "x5t": process.env.CERTIFICATE_THUMBPRINT
        }
    }

    // sign token with private key
    const token = jwt.sign(additionalPayload, privateKEY, signOptions);
    console.log('token', token);

    // verify that it was signed correctly
    const verifyOptions = {
        issuer,
        subject,
        audience,
        expiresIn,
        algorithm
    };
    // const legit = jwt.verify(token, publicKEY, verifyOptions);
    // return {
    //     token,
    //     legit
    // }
    return {
        token,
    }
}

const execute = () => {
    // additonal payload to add
    const additionalPayload = {
    };

    // specify main payload
    var signOptions = {
        issuer,
        subject,
        audience,
        expiresIn,
        algorithm,
    };

    // add thumbprint of certificate if using with azure
    if (process.env.CERTIFICATE_THUMBPRINT) {
        signOptions.header = {
            "x5t": process.env.CERTIFICATE_THUMBPRINT
        }
    }

    // sign token with private key
    const token = jwt.sign(additionalPayload, privateKEY, signOptions);
    console.log('token', token);

    // verify that it was signed correctly
    const verifyOptions = {
        issuer,
        subject,
        audience,
        expiresIn,
        algorithm
    };
    // const legit = jwt.verify(token, publicKEY, verifyOptions);
    // return {
    //     token,
    //     legit
    // }
    return {
        token,
    }    
}

// module.exports = execute;
module.exports = {jwt_assertion};