/**
 * Created by svenc on 30/07/14.
 */

var debug = true;
var _dataCallback;
var __data = undefined;
var __users = undefined;

function load(callback)
{
    _dataCallback = callback;
    loadData();

}
function loadData()
{

    if(debug == false)
        $.getJSON('/wespot/inquiries/getById/39569/', data_loading_done, "json");
    else
        $.getJSON('/wespot/static/LARAe.TT/data/offlineData.json', data_loading_done, "json");
}

function data_loading_done(d)
{
    __data = d;
    loadUsers();
}

function loadUsers()
{
    if(debug == false)
        $.getJSON('/wespot/user/mapping', user_loading_done, "json");
    else
        $.getJSON('/wespot/static/LARAe.TT/data/offlineUserData.json', user_loading_done, "json");
}



function user_loading_done(u)
{
    __users = u;
    _dataCallback();
}
