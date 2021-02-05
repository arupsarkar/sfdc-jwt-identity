require("dotenv").config();
const data = (require("../jwt"))()
const fetch = require("node-fetch");
var express = require('express');
var router = express.Router();

/* return jwt */
router.get('/', function(req, res, next) {

    console.log(`Json Web Token:\n${data.token}\n\n`);
    console.log(`JWT verification result:\n ${JSON.stringify(data.legit)}`);    
    res.send(data.token);
  });


  router.get('/token', (req, res, next) => {
    const url = process.env.AUDIENCE || 'https://login.salesforce.com';
    fetch(`${url}/services/oauth2/token`, {
        "method": "post",
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        "body": `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${data.token}`
    }).then(resp => 
            resp.json()
            
        ).then(data => {
            if (data.error) 
                return console.log(data);
        console.log(data);
        res.send(data)
    
        // compute url
        let url;
        if (data.hasOwnProperty("sfdc_community_url")) {
            // community user
            let idx = data.sfdc_community_url.lastIndexOf("/");
            let retURL = `${data.sfdc_community_url.substring(idx)}/s`;
            url = `${data.sfdc_community_url}/secur/frontdoor.jsp?sid=${data.access_token}&retURL=${retURL}`;
        } else {
            url = `${data.instance_url}/secur/frontdoor.jsp?sid=${data.access_token}`;
        }
        console.log(`Access token: ${data.access_token} `);
        console.log(url);
    })    
  })


  router.get('/register', async (req, res, next) => {

    try{
        const url = process.env.AUDIENCE || 'https://login.salesforce.com'
        const userPayload = req.body
        const token = req.query.token
        console.log(userPayload)        
        console.log(token)        
        const response = await fetch(`${url}/services/data/v50.0/sobjects/User`, {
            "method": "post",
            "headers": {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
            },            
            "body": userPayload
        })
        .then((response) => {
            response.json()
        }) 
        .then((data) => {
            console.log(data)
            res.send(data)
        })

    }catch(err) {
        console.log(err)
    }

  })
module.exports = router;