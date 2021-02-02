# sfdc-jwt-identity

## Create X.509 Certificate using OpenSSL

openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

## Create a connected app in salesforce

*Attach the server.crt to the connected app
*Attach the profiles to access the connected app
*OAuth policies - Admin approved users are pre-authorized
*Pre approve the app using the following URL.
    *https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=<consumer_key>redirect_uri=<callback_url>


## To run it locally create a .env file with the following key value pairs

SUBJECT (the username of the user to impersonate)
CLIENT_ID (the consumer key (client_id) of the Connected App you created)
AUDIENCE (https://login.salesforce.com or https://test.salesforce.com as appropriate)
PATH_PRIVATE_KEY (path to the pem-file with the private key (private_key.pemfrom above)) - local, In heroku copy paste the entire content
PATH_PUBLIC_KEY (path to the pem-file with the public key (public_key.pemfrom above)) - local, In heroku copy paste the entire content