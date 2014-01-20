var cas = require('grand_master_cas');

exports.accessDenied = function(req, res)
{
    res.send("access denied");
}

exports.logout = function(req,res)
{
    cas.logout(req,res);
    //req.session.destroy();

    res.send("logged out");
}