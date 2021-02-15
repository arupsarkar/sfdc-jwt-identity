const fetch = require("node-fetch");
var express = require('express');
var jsforce = require('jsforce');
var router = express.Router();

router.get('/', async (ereq, res, next) => {
    let access_token = req.query.access_token
    let instance_url = req.query.instance_url

    var conn = new jsforce.Connection({
        instanceUrl : instance_url,
        accessToken : access_token
      });

      let contacts = [];
      let soql = 'SELECT Id, FirstName, LastName, Email. MobilePhone from Contact';
      let query = await conn.query(soql)
          .on("record", (record) => {
              contacts.push(record);
          })
          .on("end", async () => {
              console.log(`Fetched Contacts. Total records fetched: ${contacts.length}`);
              res.json(contacts)
          })
          .on("error", (err) => {
              console.error(err);
          })
          .run({
              autoFetch: true,
              maxFetch: 5000
          });
})

module.exports = router;