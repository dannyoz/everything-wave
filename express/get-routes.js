const routes = {};
const words = require('../app/shared/words-clean.json');
const constants = require('../app/shared/constants.js');
const fs = require('fs');

routes['/word/'] = function(req, res) {
	var dest = 'app/shared/current-word.json';
	var content = fs.readFileSync(dest, 'utf8');
	var word = JSON.parse(content).text;
	var wordClass = "";

	if (word.length > 8) {
		wordClass = 'large'
	} else if (word.length > 4) {
		wordClass = 'medium'
	} else {
		wordClass = 'small'
	}

	res.render('word.html', {
		word: word,
		wordClass: wordClass
	});
};

routes['/word/:index'] = function(req, res) {
	const index = req.params.index;
	res.render('word.html', {
		word: words[index]
	});
};

routes[`${constants.apiVersion}current-word`] = function(req, res) {
	var dest = 'app/shared/current-word.json';
	var content = fs.readFileSync(dest, 'utf8');
    var current = JSON.parse(content);
	res.status(200).json(current);
};

module.exports = routes;
