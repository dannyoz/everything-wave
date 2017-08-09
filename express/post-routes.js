const routes = {};
const constants = require('../app/shared/constants.js');
const HTTP = require('superagent');
const webshot = require('webshot');
const twit = require('twit');
const fs = require('fs');
const del = require('node-delete');
const words = require('../app/shared/words-clean.json');
const screenshot = require('screenshot-stream');
const environment = process.env.NODE_ENV || 'development';
const envPath = './environments/'+environment+'/';

const Twit = new twit({
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  
});

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
    var file = envPath + '/img/test.png';

    webshot(url, file, function(err) {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send({data: 'Success'});
        }
    });
};

routes[`${constants.apiVersion}nextword`] = function(req, res) {
    var headerSent = false;
    var dest = 'app/shared/current-word.json';
    var newJson = createNext();
    

    function createNext() {
        var content = fs.readFileSync(dest, 'utf8');
        var current = JSON.parse(content);
        var nextIndex = current.index + 1;
        var nextWord = words[nextIndex];
        var newString = JSON.stringify({
            index: nextIndex,
            text: nextWord
        });
        return newString;
    };

    fs.writeFile(dest, newJson, (err) => {
        if(err) {
            res.status(500).send(err);
        } else if(!headerSent) {
            headerSent = true;
            newJson = createNext();
            res.status(200).send({data: 'file written'});
        }

    });
};

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

routes[`${constants.apiVersion}clean`] = function(req, res) {
    var file = envPath + '/img/test.png';
    del([file], function (err, paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
        if(err) {
            res.status(500).send(err);
        } else  {
            res.status(200).send({data: 'file deleted'});
        }
    });
};

routes[`${constants.apiVersion}tweet`] = function(req, res) {

    nextWord();

    function nextWord() {
        console.log('Generating new word...');

        var headerSent = false;
        var dest = 'app/shared/current-word.json';
        var newJson = createNext();
        var word = "";
        
        function createNext() {
            var content = fs.readFileSync(dest, 'utf8');
            var current = JSON.parse(content);
            var nextIndex = current.index + 1;
            var nextWord = words[nextIndex];
            var newString = JSON.stringify({
                index: nextIndex,
                text: nextWord
            });
            word = current.text;
            return newString;
        };

        fs.writeFile(dest, newJson, (err) => {
            if(err) {
                res.status(500).send(err);
            } else if(!headerSent) {
                headerSent = true;
                newJson = createNext();
                console.log('New word generated!');
                screenGrab(word);
            }
        });
    }

    function screenGrab(word) {
        console.log('Generating screen grab...');
        var url = `http://localhost:5000/word/`;
        var file = envPath + '/img/test.png';
        var options = {
            phantomPath: 'node_modules/phantomjs/bin/phantomjs'
        };

        webshot(url, file, options, function(err) {
            if(err) {
                res.status(500).send(err);
            } else {
                console.log('Screen grab generated!');
                tweet(word);
            }
        });
    };
    
    function tweet(word) {
        console.log('Creating tweet...');
        var file = envPath + '/img/test.png';
        var b64content = fs.readFileSync(file, { encoding: 'base64' });

        Twit.post('media/upload', { media_data: b64content }, function (err, data, response) {
            // now we can assign alt text to the media, for use by screen readers and 
            // other text-based presentations and interpreters 
            var mediaIdStr = data.media_id_string
            var altText = word + 'wave';
            var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
            
            Twit.post('media/metadata/create', meta_params, function (err, data, response) {
                if (!err) {
                    // now we can reference the media and post a tweet (media will attach to the tweet) 
                    var params = { status: word + 'wave', media_ids: [mediaIdStr] }
                
                    Twit.post('statuses/update', params, function (err, data, response) {
                        console.log('Tweet created!');
                        clean(word);
                    })
                }
            });
        });
    };

    function clean(word) {
        console.log('Cleaning directory...');
        var file = envPath + '/img/test.png';
        del([file], function (err, paths) {
            if(err) {
                res.status(500).send(err);
            } else {
                console.log('Deleted files/folders:\n', paths.join('\n'));
                console.log('Tweet successfully posted: '+word+'wave')
                res.status(200).send({
                    status: 'success',
                    word: word+'wave'
                });
            }
        });
    };
};

module.exports = routes;
