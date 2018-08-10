const AWS = require('aws-sdk'),
    dynamoDbDoc = new AWS.DynamoDB.DocumentClient(),
    dynamoDb = new AWS.DynamoDB();
const jwt = require('jsonwebtoken');
const request = require('request');
const LambdaReq = require('lambda-req').default;
const LambdaReqError = require('lambda-req').LambdaReqError;
const lambda = new LambdaReq()
const bearerPrefix = "Bearer ";
const secret = process.env.TWITCH_SECRET;
const configSecret = process.env.TWITCH_CONFIG_SECRET;
const clientId = process.env.TWITCH_CLIENT_ID;
const clientVersion = process.env.TWITCH_CLIENT_VERSION;
const ownerUserId = process.env.TWITCH_USER_ID;

function processResponse(isCors, body, statusCode) {
    const status = statusCode || (body ? 200 : 404);
    const headers = { 'Content-Type': 'application/json' };
    if (isCors) {
        Object.assign(headers, {
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,GET',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN,
            'Access-Control-Max-Age': '86400'
        });
    }
    return {
        statusCode: status,
        body: JSON.stringify(body) || '',
        headers: headers
    };
};

function verifyAndDecode(header) {
    if (header && header.startsWith(bearerPrefix)) {
        try {
            const token = header.substring(bearerPrefix.length);
            console.log('token', token);
            console.log('secret', secret);
            var secret_buffer = new Buffer(secret, 'base64');
            return jwt.verify(token, secret_buffer, { algorithms: ['HS256'] });
        }
        catch (ex) {
            console.log(ex);
        }
    }
    throw error('Invalid JWT Token', 500);
}

// we have to do this because LambdaReqError has a bug
function error(message, status) {
    var err = new LambdaReqError('');
    err.message = { 'status': 'error', 'error': message };
    err.status = status;
    return err;
}

function success(message) {
    return { 'status': 'success', 'message': message }
}

// set handlers
lambda.get('/api/get/{userid}', (req, router)=> {
    const requestedItemId = req.params.userid;
    if (!requestedItemId) {
        throw error('You missing the id parameter', 400);
    }

    // make sure the request is valid
    var header = req.headers.Authorization || req.headers.authorization;
    const payload = verifyAndDecode(header);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
    if (opaqueUserId != requestedItemId) {
        throw error('Invalid credentials', 500);
    }

    const key = {};
    key['userid'] = requestedItemId;
    const params = {
        TableName: 'CodAffiliate',
        Key: key
    }
    return new Promise((resolve, reject) => {
        dynamoDbDoc.get(params)
            .promise()
            .then(response => {
                console.log('/api/get/', requestedItemId, response.Item);
                if (response.Item)
                    resolve(response.Item);
                else
                    reject(error('Not found', 404));
            })
            .catch(reject);
        });

});
lambda.post('/api/save', (req, router)=> {

    // make sure the request is valid
    var header = req.headers.Authorization || req.headers.authorization;
    const payload = verifyAndDecode(header);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
    if (opaqueUserId != req.params.userid) {
        throw error('Invalid credentials', 500);
    }

    // https://dev.twitch.tv/docs/extensions/reference/#set-extension-required-configuration
    // set the required configuration value
    var url = `https://api.twitch.tv/extensions/${clientId}/${clientVersion}/required_configuration?channel_id=${channelId}`
    var ebs_token = {
        "exp": parseInt(Date.now()/1000) + 3600,
        "user_id": ownerUserId,
        "role": "external"
    }
    var secret_buffer = new Buffer(secret, 'base64');
    var encoded_ebs_token = jwt.sign(ebs_token, secret_buffer, { algorithm: 'HS256' });
    request.put({
        url: url,
        headers: {
            'Authorization': 'Bearer ' + encoded_ebs_token,
            'Client-Id': clientId
        },
        body: {
            'required_configuration': configSecret
        },
        json: true
    }).on('response', function(response) {
        console.log('set-extension-required-configuration response', response.statusCode); // 200
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
         });
    });

    return new Promise((resolve, reject) => {
        var tableName = "CodAffiliate";
        // values are expected to be strings
        var datetime = String(Date.now());
        console.log('/api/save', req.params, datetime);
        dynamoDb.putItem({
                "TableName": tableName,
                "Item": {
                    "userid": {
                        "S": req.params.userid
                    },
                    "affiliateid": {
                        "S": req.params.affiliateid
                    },
                    "ts": {
                        "N": datetime
                    },
                }
            }, function(err, data) {
                if (err) {
                    reject(error(err, 500));
                } else {
                    resolve(success());
                }
            });
    });

});

// export the handler
// pass the event params on invocation time
module.exports = { handler: lambda.invoke };
