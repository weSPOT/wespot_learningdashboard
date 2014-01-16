var db = require('../dbConnection.js').db;



function getBadgeRelatedEvents(badges, collection, callback)
{
    if(badges.length == 0){ callback([]); return;};
    var query = [];


    for(var i = 0; i <badges.length; i++)
    {
        query.push({'starttime':
        {$gte: (badges[0][0].periodstart),
            $lte: (badges[0][0].periodend)},
            'verb': badges[0][1]
            // NOT NECESSARY FOR WHAT WE'RE DOING HERE ATM 'username': badge.username
        });
    }

    collection.find({$or:query}).toArray(function(err, items)
        {
            callback(items);
        });
}

function tweetBadge(badge, collection, callback)
{
    var limit = 0;
    var desc = badge.object.toString();
    //use description
    //also, where is the actual tweet in the tweet object?
    /*if(desc.indexOf('5') != -1)
        limit = 5;
    else if(desc.indexOf('10') != -1)
        limit = 10;
    else
        limit = 15*/
    collection.find({'starttime':
        {$gte: (badge.periodstart),
          $lte: (badge.periodend)},
          'verb': 'tweeted',
          'username': badge.username
      })/*.limit(limit)*/.sort({'starttime':1}).toArray(function(err, items)
      {
          callback(items);
      });
}


function commentBadge(badge, collection, callback)
{
    var limit = 0;
    var desc = badge.object.toString();
    //use description
    //also, where is the actual tweet in the tweet object?
    /*if(desc.indexOf('Bronze') != -1)
        limit = 5;
    else if(desc.indexOf('Silver') != -1)
        limit = 10;
    else
        limit = 15*/
    collection.find({'starttime':
    {$gte: (badge.periodstart),
        $lte: (badge.periodend)},
        'verb': 'commented',
        'username': badge.username
    })/*.limit(limit)*/.sort({'starttime':1}).toArray(function(err, items)
        {
            callback(items);
        });
}


exports.list = function(req, _res){
    res = _res;
    db.collection('events', function(err, collection) {
        var eventid = parseInt(req.params.eventid);
        db.collection('events', function(err, collection) {
            collection.findOne({'event_id': eventid}, function(err, item) {
                if(item.object.indexOf('tweet'))
                    tweetBadge(item, collection, function(items){res.send(items);});
                else if(item.object.indexOf('Commenter'))
                    commentBadge(item, collection, function(items){res.send(items);});

            });
        });
    });
};


function getRelatedActivity(res, items, verb) {
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
    var query = {};
    if(verb != null)
    {
        query = {event_id: {$in:items}, verb: verb};
    }
    else
    {
        query =  {event_id: {$in:items}};
    }

    var options = {out: {inline: 1}, query: query};//, sort:{"starttime":1}};

    db.collection('events', function (err, collection) {
        collection.mapReduce(map, reduce, options,
            function (err, items) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.write(JSON.stringify(items));
                res.end();

            });
    });
}

exports.listActivity = function(req, _res){
    res = _res;
    db.collection('events', function(err, collection) {
        var eventidsRaw = JSON.parse(req.params.eventid);
        var eventids = [];
        for(var i = 0; i < eventidsRaw.length;i++)
            eventids.push(parseInt(eventidsRaw[i]));




        var verb = req.params.verb;

        db.collection('events', function(err, collection) {
            collection.find({'event_id': {$in: eventids}}).toArray(function(err, items) {
                for(var i=0; i < items.length; i++)
                {
                    var item = items[i];
                    var badgeTypes = [];
                    if(item.object.indexOf('tweet') != -1 && (verb == "total" || verb == "tweeted"))
                         if(badgeTypes.indexOf('tweeted') == -1)
                            badgeTypes.push([item,"tweeted"]);
                    if(item.object.indexOf('Commenter') != -1 && (verb == "total" || verb == "commented"))
                        if(badgeTypes.indexOf('commented') == -1)
                            badgeTypes.push([item,"commented"]);
                    if(item.object.indexOf('post') != -1 && (verb == "total" || verb == "posted"))
                        if(badgeTypes.indexOf('posted') == -1)
                            badgeTypes.push([item,"posted"]);
                }

                getBadgeRelatedEvents(badgeTypes, collection, function(items)
                {
                    var ids = [];
                    for(var i = 0; i < items.length; i++)
                         ids.push(items[i].event_id);
                    if(ids.length != 0)
                        getRelatedActivity(res,ids);
                    else
                    {
                        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        res.write(JSON.stringify([]));
                        res.end();
                    }
                });


            });
        });
    });
};
