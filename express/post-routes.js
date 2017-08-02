var routes = {};
var constants = require('../app/shared/constants.js');
var HTTP = require('superagent');
var webshot = require('webshot');
var fs = require('fs');

routes[`${constants.apiVersion}wordlist`] = function(req, res){

    var apiPath = "https://od-api.oxforddictionaries.com:443/api/v1/wordlist/en/";
    var filter = req.body.filter;
    var limit = req.body.limit;
    var minLength = req.body.minLength;
    var maxLength = req.body.maxLength;
    var offset = req.body.offset;
    var url = `${apiPath}${filter}?limit=${limit}&word_length=>${minLength},<${maxLength}&offset=${offset}`;
    console.log(url);

    HTTP.get(url)
        .set('Accept', 'application/json')
        .set('app_id', process.env.DICTIONARY_APP_ID)
        .set('app_key', process.env.DICTIONARY_APP_KEY)
        .end(function(err, data){
            if(err) {
                res.status(500).send(err);
            } else {
                var json = JSON.parse(data.text)
                res.status(200).json(json);
            }
        });
};

routes[`${constants.apiVersion}screengrab`] = function(req, res) {
    var renderStream = webshot('http://localhost:5000/');
    var file = fs.createWriteStream('app/img/test.png', {encoding: 'binary'});
    var headerSent = false;
    
    renderStream.on('data', function(data) {
        file.write(data.toString('binary'), 'binary', function(err) {
            if (err) {
                res.status(500).send(err);
            } else if (!headerSent) {
                headerSent = true;
                res.status(200).send({data: 'Success'});
            }
        });
    });
};

module.exports = routes;
