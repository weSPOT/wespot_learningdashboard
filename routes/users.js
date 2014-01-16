var db = require('../dbConnection.js').db;
var http = require('http');
exports.list = function(request, res){

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
    //res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

    var filterAndReturnStudents = function(items) {
        var users = {};

        for(var i = 0; i < items.length; i++)
        {
            var item = items[i];
            var user = {};

            if(users[item.username] == null)
            {
                users[item.username] = {};
                user.awards = {};
            }
            else
                user = users[item.username];
            var json = null;
            //stuff is necessary for the crappy json in the db..
            try
            {
                json = JSON.parse(item.originalrequest);
            }
            catch(error)
            {
               console.log("incorrectly formatted json");
            }
            if(json){
                item.originalrequest = json;
                item.badge_image = item.originalrequest.badge != null ? item.originalrequest.badge.image : item.originalrequest.originalrequest.badge.image;
                 if(item.badge_image == null){
                    continue;
                 }
            }
            else continue;
            //end of ugly hacky stuff
            var id = item.badge_image.replace(/\/|\./g, "_");
            if(user.awards[id] == null)
                user.awards[id] = [];

            user.awards[id].push(item.event_id);
            user.username = item.username;


            users[item.username] = user;

        }
        db.collection('students_chi13', function(err, collection) {
            collection.find().toArray(function(err, items){
                    for(var i = 0; i < items.length;i++)
                    {
                        if(users[items[i].Twitter] != null)
                        {
                            users[items[i].Twitter].group = items[i].group_name;
                            users[items[i].Twitter].fullname = items[i].student_name;
                            users[items[i].Twitter].grade = items[i].grade;

                        }
                    }
                    console.log("starting to write data away");
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.write(JSON.stringify(users));
                    res.end();

                }
            );
        });



    };

    var fetchRequest = function(result) {
        console.log('STATUS: ' + result.statusCode);
        console.log('HEADERS: ' + JSON.stringify(result.headers));
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
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
                filterAndReturnStudents(totalData);
                return;
            }
            var req = http.request(options,fetchRequest);
            req.write('{"query":"select * from event where context=\'chikul13\' and verb=\'awarded\'", "pag":"' + page + '"}');
            req.end();

        });
    }

    var req = http.request(options,fetchRequest);
    req.write('{"query":"select * from event where context=\'chikul13\' and verb=\'awarded\'", "pag":"' + page + '"}');
    req.end();
    return;


};





