var inquiry = require('./inquiry.js');
/*
 * GET home page.
 */

exports.inquiryDashboard = function(req, res){

  inquiry.getInquiry(req.params.inquiryId, function(d){
    res.render('inquiryDashboard.html', {events: d, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider});}
  );
};