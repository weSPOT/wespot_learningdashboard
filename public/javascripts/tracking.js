function trackData(username, verb, object, inquiry, originalrequest){
    var context = '"context": { "course": "'+inquiry+'", "phase": "0", "widget_type": "larae" }';
    var data = '';
    if (originalrequest==''){
        data = '{"username":"'+username+'","verb":"'+verb+'","object":"'+object+'","starttime":"'+new Date().toISOString()+'",'+context+'}';
    }else{
        //data = '{"username":"'+username+'","verb":"'+verb+'","object":"'+object+'","starttime":"'+new Date().toISOString()+'",'+context+'}';
        //console.log(originalrequest);
        data = '{"username":"'+username+'","verb":"'+verb+'","object":"'+object+'","starttime":"'+new Date().toISOString()+'",'+context+', "originalrequest":'+JSON.stringify(originalrequest)+'}';
    }
    $.ajax({
        type: 'POST',
        url: 'http://ariadne.cs.kuleuven.be/wespot-ws/eventc',
        crossDomain: true,
        data: data,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(responseData, textStatus, jqXHR) {
            var value = responseData.someKey;
            //console.log('POST succeed.'+data);
            //console.log('POST succeed.'+JSON.stringify(responseData));
        },
        error: function (responseData, textStatus, errorThrown) {
            //console.log('POST failed.'+JSON.stringify(responseData));
            //console.log('POST failed.'+errorThrown);
        }
    });
}