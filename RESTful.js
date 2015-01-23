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
var http = require('http');

//do post (for jose's system with his pagination)
exports.doPOST_Jose_Query = function(host, path, callback)
{
    var page = 0;
    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'POST'
    };
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";

    var fetchRequest = function(result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end',function(){
            try{
            totalData = totalData.concat(JSON.parse(dataPerPage));
            }
            catch(e)
            {
                console.log(e);
                callback(null, "Failed to parse learning analytics data for user.")
                return;
            }
            dataPerPage = "";
            page++;
            if(lastChunk == "[]")
            {
                callback(totalData);
                return;
            }
            var req = http.request(options,fetchRequest);
            req.write('{"pag":"' + page + '"}');
            req.end();

        });
    }

    var req = http.request(options,fetchRequest);

    req.write('{"pag":"' + page + '"}');
    req.end();
    return;
}

exports.doGETPORT = function(host,port, path, callback) {

    var options = {
        host: host,
        port: port,
        path: path,
        method: 'GET'
    };
    console.log(host);
    console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";


    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            //console.log(dataPerPage);
            totalData = totalData.concat(JSON.parse(dataPerPage));
            callback(totalData);


        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

exports.doGET = function(host, path, callback, auth) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
    if(auth != undefined)
    {
        options.headers = {"Authorization": auth};
    }
    console.log(host);
    console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";


    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            //console.log(dataPerPage);
            totalData = totalData.concat(JSON.parse(dataPerPage));

            callback(totalData);



        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

exports.doGET_many = function(host, path, callback) {

    var options = {
        host: host,
        port: 80,
        path: path + "&offset=0",
        method: 'GET'
    };
    console.log(host);
    console.log(path);
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";
    var page = 0;

    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            //console.log(dataPerPage);
            totalData = totalData.concat(JSON.parse(dataPerPage).result);
            if(JSON.parse(dataPerPage).result.length ==0)
            {

                callback(totalData);
                return;
            }
            dataPerPage = "";
            page+=100;
            options.path = path + "&offset=" + page;
            var req = http.request(options, fetchRequest);
            req.end();



        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}
