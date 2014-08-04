/**
 * Created by svenc on 30/07/14.
 */

var debug = true;

function load(callback)
{
    if(debug == false)
        $.getJSON('/wespot/inquiries/getById/26368/', callback, "json");
    else
        $.getJSON('/wespot/static/LARAe.TT/data/offlineData.json', callback, "json");
}

