var routes = {};
var words = require('../app/shared/words-clean.json');

routes['/word/:index'] = function(req, res) {
	const index = req.params.index;
	res.render('word.html', {
		word: words[index]
	});
};

module.exports = routes;
