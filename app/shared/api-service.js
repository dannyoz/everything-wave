import HTTP from 'superagent';
const constants = require('./constants');

class ApiService {

	request(url){
		return HTTP.get(`${constants.apiVersion}${url}`)
	}

	post(url,data){
		return HTTP.post(`${constants.apiVersion}${url}`).send(data)	
	}
}

export default ApiService;
