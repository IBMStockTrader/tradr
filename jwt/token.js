/*
       Copyright 2018 IBM Corp All Rights Reserved

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Generate an Access Token for the given User ID
function generateAccessToken(decryptedTokenInfo) {
    var key = fs.readFileSync('./certs/liberty.pem');
    //console.log(decryptedTokenInfo);
    //console.log('update iss for stocktrader');
    decryptedTokenInfo.iss = process.env.JWT_ISSUER;
    decryptedTokenInfo.aud = process.env.JWT_AUDIENCE;
    decryptedTokenInfo.upn = decryptedTokenInfo.uniqueSecurityName;
    delete decryptedTokenInfo.ext;
    //console.log("here is the decrypted token");
    //console.log(decryptedTokenInfo);
    if(decryptedTokenInfo.address){
        //For some reason Liberty fails if the address attribute is present
        delete decryptedTokenInfo.address;
    }
    const token = jwt.sign(decryptedTokenInfo, key, { algorithm: 'RS256'});
    // console.log('token');
    // console.log(token);
    return token;
}

module.exports.generateAccessToken = generateAccessToken;