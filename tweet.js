const HTTP = require('superagent');
const environment = process.env.NODE_ENV || 'development';
const domain = (environment === 'development') ? 'localhost:5000' : 'https://everything-wave.herokuapp.com' ;
const endpoint = '/api/v1/tweet';

HTTP.post(domain + endpoint).end(function(err, data) {
    console.log('tweet posted', data);
});
