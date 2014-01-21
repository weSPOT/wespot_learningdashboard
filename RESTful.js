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
            totalData = totalData.concat(JSON.parse(dataPerPage));
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


exports.doGET = function(host, path, callback) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
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
            totalData = totalData.concat(JSON.parse(dataPerPage));
            callback(totalData);


        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}

