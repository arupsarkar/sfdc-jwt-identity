require("dotenv").config();
const data = (require("../jwt"))()
const fetch = require("node-fetch");
var express = require('express');
var jsforce = require('jsforce');
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


  router.post('/register', async (req, res, next) => {

    try{

        
        var conn = new jsforce.Connection({
          instanceUrl : req.query.instance_url,
          accessToken : req.query.token
        });

        const url = process.env.AUDIENCE || 'https://login.salesforce.com'
        const userPayload = req.body
        const token = req.query.token
        console.log('req.body', userPayload)        
        console.log('req.query', token)        
        const response = await conn.sobject("User").create(
            { 
                Username: req.body.Username,
                Lastname: req.body.Lastname,
                Email: req.body.Email,
                Alias: req.body.Alias,
                TimezoneSidKey: req.body.TimezoneSidKey,
                LocaleSidKey: req.body.LocaleSidKey,
                EmailEncodingKey: req.body.EmailEncodingKey,
                LanguageLocaleKey: req.body.LanguageLocaleKey,
                ProfileId: req.body.ProfileId

            }, 
            function(err, ret) {
                if (err || !ret.success) 
                { return console.error(err, ret); }
                    console.log("Created record id : " + ret.id);
                    res.send({"record_id" : ret.id})
          });
        // const response = await fetch(`${url}/services/data/v50.0/sobjects/User`, {
        //     "method": "post",
        //     "headers": {
        //         "content-type": "application/json",
        //         "Authorization": "Bearer " + token
        //     },            
        //     "body": userPayload
        // })
        // .then(response => {
        //     response.json()
        // }) 
        // .then(data => {
        //     console.log('data -> ', data)
        //     res.send(data)
        // })

    }catch(err) {
        console.log(err)
    }

  })

  router.post('/newpwd', async (req, res, next) => {

    try{
          const host = req.query.instance_url          
          const userPayload = JSON.stringify(req.body)
          const token = req.query.token
          const userId = req.query.userid
          const url = host + '/services/data/v50.0/sobjects/User/' + userId + '/password'
          console.log('url', url)
          console.log('body', userPayload)                     
        const response = await fetch(url, {
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },            
            "body": userPayload
        })
        .then(response => {
            status = response.status
            console.log('status -> ', status )
            return response.json()
        }) 
        .then(data => {
            console.log('data -> ', data)
            res.send(data)
        })
        .catch((err) => {
            // handle error
            console.error(err);
          })        
    }catch(err) {
        console.log('Error -> ', err)
        res.json({"Error" : err})
    }
  })

  router.delete('/resetpwd', async(req, res, next) => {
    try{
        const host = req.query.instance_url          
        const userPayload = JSON.stringify(req.body)
        const token = req.query.token
        const userId = req.query.userid
        const url = host + '/services/data/v50.0/sobjects/User/' + userId + '/password'
        console.log('url', url)
        console.log('body', userPayload)                     
        const response = await fetch(url, {
            "method": "delete",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },            
            "body": userPayload
        })
        .then(response => {
            status = response.status
            console.log('status -> ', status )
            return response.json()
        }) 
        .then(data => {
            console.log('data -> ', data)
            res.send(data)
        })
        .catch((err) => {
          // handle error
          console.error(err);
        })        
  }catch(err) {
      console.log('Error -> ', err)
      res.json({"Error" : err})
  }
  })

module.exports = router;