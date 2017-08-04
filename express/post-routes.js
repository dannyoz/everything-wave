var routes = {};
var constants = require('../app/shared/constants.js');
var HTTP = require('superagent');
var webshot = require('webshot');
var fs = require('fs');
var words = require('../app/shared/words-clean.json');
var screenshot = require('screenshot-stream');

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
    var imgIndex = req.body.imgIndex;
    var url = `http://localhost:5000/word/${imgIndex}`;
    // var stream = screenshot(url, '1024x768', {crop: true});
    
    // stream.pipe(fs.createWriteStream('app/img/test.png'));
    // stream.on('end', function() {
    //     console.log
    //     res.status(200).send({data: 'Success'});
    // });
    var renderStream = webshot(url);
    var file = fs.createWriteStream('app/img/test.png', {encoding: 'binary'});
    var headerSent = false;
    
    renderStream.on('data', function(data) {
        file.write(data.toString('binary'), 'binary', function(err) {
            if(err) {
                res.status(500).send(err);
            } else if(!headerSent) {
                headerSent = true;
                res.status(200).send({data: 'Success'});
            }
        });
    });
};

routes[`${constants.apiVersion}nextword`] = function(req, res) {
    var headerSent = false;
    var dest = 'app/shared/current-word.json';
    var newJson = createNext();
    
    function createNext() {
        var current = require('../' + dest);
        var nextIndex = current.index + 1;
        var nextWord = words[nextIndex];
        return {
            index: nextIndex,
            text: nextWord
        };
    };

    console.log(newJson);

    fs.writeFile(dest, JSON.stringify(newJson), (err) => {
        if(err) {
            res.status(500).send(err);
        } else if(!headerSent) {
            headerSent = true;
            newJson = createNext();
            res.status(200).send({data: 'file written'});
        }
    });
}

routes[`${constants.apiVersion}clean-json`] = function(req, res) {
    var headerSent = false;
    var newList = words.filter((word) => {
        return word.length > 2 && word.length <= 12 && word.indexOf('�') < 0;
    });

    var longest = newList.reduce(function (a, b) { return a.length > b.length ? a : b; });
    console.log(newList.length, longest);

    fs.writeFile('app/shared/words-clean.json', JSON.stringify(newList), (err) => {
        if(err) {
            res.status(500).send(err);
        } else if(!headerSent) {
            headerSent = true;
            res.status(200).send({data: 'Success'});
        }
    });
};

module.exports = routes;
