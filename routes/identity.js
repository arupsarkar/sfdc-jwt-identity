require("dotenv").config();
//const data = (require("../jwt"))()
const data = require("../jwt")
const fetch = require("node-fetch");
var express = require('express');
var jsforce = require('jsforce');
var router = express.Router();

/* return jwt */
router.get('/', function(req, res, next) {
    let token = data.jwt_assertion('b.tom+123@example.com');
    console.log('Response : ' , JSON.stringify(token));
    // console.log(`Json Web Token:\n${data.token}\n\n`);
    // console.log(`JWT verification result:\n ${JSON.stringify(data.legit)}`);    
    res.json(JSON.stringify(token));
  });

  async function getJWTAssertiontoken(subject) {

    let jwt_data = await data.jwt_assertion(subject)
    if(jwt_data.token != undefined) {
        console.log('Returning JWT ', jwt_data.token)
        return jwt_data.token
    }else {
        throw new Error('There was a problem generating JWT Assertion')
    }
  }

  async function getSfdcToken() {
    console.log('invoking jwt token', 'started')
    let jwt_data = data.jwt_assertion()
    console.log('assertion : ', jwt_data.token)
    console.log('invoking sfdc token', 'started')
    const url = process.env.AUDIENCE || 'https://login.salesforce.com';
    await fetch(`${url}/services/oauth2/token`, {
        method: 'POST',
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt_data.token}`,        
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(resp => {
        console.log('sfdc-token resp', resp)        
        // resp.json()
        return resp.json()
    })
    .then(data => {   
        console.log('sfdc-token data', data)     
        return data
    })            
    .catch(err =>{
        console.error('Error getting sfdc token : ', err);
        return err
    })
  }

  router.get('/jwt-token', async (req, res, next) => {
    let subject = req.query.subject      
    const response = await  getJWTAssertiontoken(subject)
    .then((response) => {
        console.log('JWT Received ', response)
        res.json({"jwt-token": response})
    })
    .catch((error) => {
        res.json({"jwt-error": error})
    }) 
  })

  router.get('/sfdc-token', async (req, res, next) => {

    try{
        // const token = req.query.token
        let subject = req.query.subject              
        const url = process.env.AUDIENCE || 'https://login.salesforce.com';
        const response = await getJWTAssertiontoken(subject)
        .then((response) => {
            console.log('JWT Received ', response)
            // res.json({"jwt-token": response})
            fetch(`${url}/services/oauth2/token`, {
                "method": "post",
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "body": `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${response}`
            }).then(resp => resp.json()).then(data => {
                if (data.error) res.json(data)//return console.log('error 1 : ', data);
                console.log('error 2 : ', data);
                res.json(data)
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
        .catch((error) => {
            res.json({"jwt-error": error})
        }) 
        
        
        
        // fetch(`${url}/services/oauth2/token`, {
        //     "method": "post",
        //     "headers": {
        //         "content-type": "application/x-www-form-urlencoded"
        //     },
        //     "body": `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`
        // }).then(resp => resp.json()).then(data => {
        //     if (data.error) return console.log(data);
        //     console.log(data);
        //     res.json(data)
        //     // compute url
        //     let url;
        //     if (data.hasOwnProperty("sfdc_community_url")) {
        //         // community user
        //         let idx = data.sfdc_community_url.lastIndexOf("/");
        //         let retURL = `${data.sfdc_community_url.substring(idx)}/s`;
        //         url = `${data.sfdc_community_url}/secur/frontdoor.jsp?sid=${data.access_token}&retURL=${retURL}`;
        //     } else {
        //         url = `${data.instance_url}/secur/frontdoor.jsp?sid=${data.access_token}`;
        //     }
        //     console.log(`Access token: ${data.access_token} `);
        //     console.log(url);
        // })
    }catch(err) {
        console.log('Error', err)
    }
  })

  router.get('/token', (req, res, next) => {
    const url = process.env.AUDIENCE || 'https://login.salesforce.com';

    //let subject = req.query.subject
    let jwt_token = req.query.token
    // const response = await  getJWTAssertiontoken(subject)
    //     .then((response) => {
    //         console.log('JWT Received ', response)
            fetch(`${url}/services/oauth2/token`, {
                "method": "post",
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "body": `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt_token}`
                //"body": "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + data
            }).then(resp => {
                //console.log('Resolved ', JSON.stringify(resp))
                resp.json()
            }).then(data => {
                    if (data.error != undefined)
                        return console.log(data);
                    
                        
                console.log('Output : ', data);
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
                    console.log('Instance URL : ', url);

            })                

        // }).catch((err) => {
        //     console.log('Error fetching JWT', err)
        // }) 

  })


  router.post('/register', async (req, res, next) => {

    try{

        await getSfdcToken()
            .then((data) => {
                console.log('access_token', data.access_token)
                console.log('instance_url', data.instance_url)
            })
            .catch((error) => {
                console.error(error)
            })


        // var conn = new jsforce.Connection({
        //   instanceUrl : req.query.instance_url,
        //   accessToken : req.query.token
        // });

        // const url = process.env.AUDIENCE || 'https://login.salesforce.com'
        // const userPayload = req.body
        // const token = req.query.token
        // console.log('req.body', userPayload)        
        // console.log('req.query', token)        
        // const response = await conn.sobject("User").create(
        //     { 
        //         Username: req.body.Username,
        //         Lastname: req.body.Lastname,
        //         Email: req.body.Email,
        //         Alias: req.body.Alias,
        //         TimezoneSidKey: req.body.TimezoneSidKey,
        //         LocaleSidKey: req.body.LocaleSidKey,
        //         EmailEncodingKey: req.body.EmailEncodingKey,
        //         LanguageLocaleKey: req.body.LanguageLocaleKey,
        //         ProfileId: req.body.ProfileId

        //     }, 
        //     function(err, ret) {
        //         if (err || !ret.success) 
        //         { return console.error(err, ret); }
        //             console.log("Created record id : " + ret.id);
        //             res.json({"record_id": ret.id})
        //   });
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