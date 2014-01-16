var inquiry = require('./inquiry.js');
/*
 * GET home page.
 */

exports.userInquiryList = function(req, res){

  inquiry.getInquiriesOfUser(req.params.userAuthId, req.params.userAuthProvider, function(d){
    res.render('userInquiryList.html', {inquiries: d[0].result});}
  );
};