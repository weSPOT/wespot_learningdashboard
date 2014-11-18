/* ****************************************************************************
 * Copyright (C) 2014 KU Leuven
 * <p/>
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 * <p/>
 * Contributors: Sven Charleer
 * *************************************************************************** */
var db = require('../dbConnection.js').db;
var http = require('http');
function getActivity(res, _query) {
    var map = function () {
        day = Date.UTC(new Date(this.timestamp).getFullYear(), new Date(this.timestamp).getMonth(), new Date(this.timestamp).getDate());

        emit({day: day}, {count: 1});
    }

    var reduce = function (key, values) {
        var count = 0;

        values.forEach(function (v) {
            count += v['count'];
        });

        return {count: count};
    }
    var options = {out: {inline: 1}, query: _query};//, sort:{"starttime":1}};

    db.collection('events', function (err, collection) {
        collection.mapReduce(map, reduce, options,
            function (err, items) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.write(JSON.stringify(items));
                res.end();

            });
    });
}
exports.list = function(req, res){
    getActivity(res, {verb: { $ne: 'awarded'}});
};

exports.listForUser = function(req, res){
    var _user = JSON.parse(req.params.user);
    getActivity(res, {verb: { $ne: 'awarded'}, username:{$in:_user}});
};

exports.listForVerb = function(req, res){
    var _verb = req.params.verb;
    getActivity(res, {verb: _verb});
};

exports.listForVerbAndUser = function(req, res){
    var _verb = req.params.verb;
    var _user = JSON.parse(req.params.user);
    getActivity(res, {verb: _verb, username: {$in:_user}});
};


exports.date = function(req, res){
    var verb = req.params.verb;
    var starttime = new Date(parseInt(req.params.date)).toISOString();
    var nextday = new Date(parseInt(req.params.date) + 86400000).toISOString();
    var query = verb != null ? {'starttime': {$gte:starttime, $lte: nextday}, 'verb': verb} : {'starttime': {$gte:starttime, $lte: nextday},verb: { $ne: 'awarded'}} ;

    //console.log('Retrieving event: ' + starttime);
    db.collection('events', function(err, collection) {
        collection.find(query).toArray(function(err, items) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(items));
            res.end();
        });
    });
};


exports.flatList = function(req, res) {

    var page = 0;
    var options = {
        host: 'ariadne.cs.kuleuven.be',
        port: 80,
        path: '/wespot-dev-ws/rest/getEvents',
        method: 'POST'
    };
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

    var fetchRequest = function(result) {
       // console.log('STATUS: ' + result.statusCode);
       // console.log('HEADERS: ' + JSON.stringify(result.headers));
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
           // console.log('BODY: ' + chunk);
            dataPerPage += chunk;
            //res.write((chunk));
            lastChunk = chunk;

        });
        result.on('end',function(){
            totalData = totalData.concat(JSON.parse(dataPerPage));
            dataPerPage = "";
            page++;
            if(lastChunk == "[]")
            {
                res.write(JSON.stringify(totalData));
                res.end();
                return;
            }
            var req = http.request(options,fetchRequest);
            req.write('{"query":"select * from event where context=\'chikul13\'", "pag":"' + page + '"}');
            req.end();

        });
    }

    var req = http.request(options,fetchRequest);

// write data to request body
    req.write('{"query":"select * from event where context=\'chikul13\'", "pag":"' + page + '"}');
    req.end();
    return;




}

