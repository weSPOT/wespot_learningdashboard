var db = require('../dbConnection.js').db;
var http = require('http');



exports.list = function(req, res){

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


    var filterAndReturnBadges = function(items){
        var badges = {};

        for(var i = 0; i < items.length; i++)
        {
            var item = items[i];

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
                item.badge_description = item.originalrequest.badge != null ? item.originalrequest.badge.description : item.originalrequest.originalrequest.badge.description;
                item.badge_connotation = item.originalrequest.badge != null ? item.originalrequest.connotation : item.originalrequest.originalrequest.connotation;
                if(item.badge_image == null){
                    continue;
                }
            }
            else continue;
            //end of ugly hacky stuff

            var badge = {};

            if(badges[item.badge_image] == null)
            {
                badges[item.badge_image] = {};
                badge.awardedTo = {};
                badge.awardedToFlat = [];
            }
            else
                badge = badges[item.badge_image];

            if(badge.awardedTo[item.username] == null)
                badge.awardedTo[item.username] = [];

            badge.awardedTo[item.username].push({student: item.username, event: item.event_id, timestamp: item.starttime});
            badge.awardedToFlat.push({student: item.username, event: item.event_id, timestamp: new Date(item.timestamp).valueOf()});
            if(badge.eventIds == null) badge.eventIds = [];
            badge.eventIds.push(item.event_id);
            badge.description = item.badge_description;
            badge.connotation = item.badge_connotation;
            badge.name = item.object;
            badge.id = item.badge_image.replace(/\/|\./g, "_");
            badge.image = item.badge_image.replace("/img", "http://degas.cs.kuleuven.be:3013/images");

            badges[item.badge_image] = badge;

        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(badges));
        res.end();
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
                filterAndReturnBadges(totalData);
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



