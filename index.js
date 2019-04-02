'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const API_KEY = require('./apiKey');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.post('/get-weather-details', (req, res) => {
    const cityToSearch = req.body.result && req.body.result.parameters && req.body.result.parameters.city ? req.body.result.parameters.city : 'Delhi';
    const reqUrl = encodeURI(`http://api.apixu.com/v1/current.json?key=${API_KEY}&q=${cityToSearch}`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });   
        responseFromAPI.on('end', () => {
            const city = JSON.parse(completeResponse);
            let dataToSend = cityToSearch === 'Delhi' ? `I don't have the required info on that. Here's some info on ${cityToSearch} instead.\n` : '';
            try{
                dataToSend += `${city.location.name} ${city.current.temp_c}`;
            } catch (e) {
                dataToSend = 'Delhi' ? `I don't have the required info on that. Please try another City` : '';
            }

            return res.json({
                speech: dataToSend,
                displayText: dataToSend,
                source: 'get-weather-details'
            });
        });        
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-weather-details'
        });
    });
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});
