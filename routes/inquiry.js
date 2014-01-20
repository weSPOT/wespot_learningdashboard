var http = require('http');

var RESTful = require('../RESTful.js');

//---------------
//get inquiry data from jose's datastore
//PARAMETERS:
// - inquiryId
//---------------
exports.getInquiry = function(inquiryId, callback)
{
    RESTful.doPOST_Jose_Query('ariadne.cs.kuleuven.be','/wespot-dev-ws/rest/getEvents/'+ inquiryId , callback);
}

exports.getInquiry_RF = function(req, res) {
    //param
    var inquiryId = req.params.inquiryId;
    exports.getInquiry(inquiryId, function(d)
        {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(d));
            res.end();
            return;
        }
    );

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








