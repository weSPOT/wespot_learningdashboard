var http = require('http');

var RESTful = require('../RESTful.js').RESTful;

//---------------
//get inquiry data from jose's datastore
//PARAMETERS:
// - inquiryId
//---------------
exports.getInquiry_RF = function(req, res) {
    //param
    var inquiryId = req.params.inquiryId;

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

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end',function(){
            totalData = totalData.concat(JSON.parse(dataPerPage));
            dataPerPage = "";
            page++;
            if(true || lastChunk == "[]")
            {
                res.write(JSON.stringify(totalData));
                res.end();
                return;
            }
            var req = http.request(options,fetchRequest);
            req.write('{"query":"select * from event", "pag":"' + page + '"}');
            req.end();

        });
    }

    var req = http.request(options,fetchRequest);

// write data to request body
    //req.write('{"query":"select * from event where not context =\'thesis12\' and not context = \'chikul13\' and not context = \'mume12\' and not context = \'openBadges\'  and not context = \'gesyrt12\' and not context = \'thesis13\' and not context = \'mume13\' and not context = \'stefaan\'  and not context = \'chirevealit\' ", "pag":"' + page + '"}');

    req.write('{"query":"select * from event where context like \'%' + inquiryId + '%\'", "pag":"' + page + '"}');
    req.end();
    return;




}



//---------------
//get inquiries from ELGG
//PARAMETERS:
// -
//---------------
exports.getInquiries = function(callback)
{
    RESTful.doGET('inquiry.wespot.net','/services/api/rest/json/?method=site.inquiries&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}

exports.getInquiries_RF = function(req, res) {
    exports.getInquiries(function(d)
    {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(d));
        res.end();
        return;
    });
}

//---------------
//get inquiries of user from ELGG
//PARAMETERS:
// - userAuthProvider
// - userAuthId
//---------------
exports.getInquiriesOfUser = function(userAuthId, userAuthProvider, callback)
{
    RESTful.doGET('inquiry.wespot.net','/services/api/rest/json/?method=user.inquiries&oauthId='+userAuthId+'&oauthProvider='+userAuthProvider+'&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}
exports.getInquiriesOfUser_RF = function(req, res) {
    var userAuthId = req.params.userAuthId;
    var userAuthProvider = req.params.userAuthProvider;

    exports.getInquiriesOfUser(userAuthId, userAuthProvider,function(d){
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(d));
        res.end();
        return;
    });
}








