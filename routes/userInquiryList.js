var inquiry = require('./inquiry.js');
var user = require('./user.js');
/*
 * GET home page.
 */

exports.userInquiryList = function(req, res){

  inquiry.getInquiriesOfUser(req.params.userAuthId, req.params.userAuthProvider, function(d){
    res.render('userInquiryList.html', {users: user.users, inquiries: d[0].result, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider });}
  );
};