/**
 * Created by svenc on 22/04/15.
 */

var exportData = function(dataPerInquiry,phases,users)
{
    var w = window.open('', 'wnd');
    var popup = document.createElement("div");
    popup.setAttribute("id","report");
    popup.setAttribute("style","display:none");
    $("body").append(popup);
    $("#report").append("<h1>"+dataPerInquiry[Object.keys(dataPerInquiry)[0]].inquiry.title+"</h1>");
    $("#report").append("<a href='"+dataPerInquiry[Object.keys(dataPerInquiry)[0]].inquiry.url+"'>"+ dataPerInquiry[Object.keys(dataPerInquiry)[0]].inquiry.url +"</a>");
    $("#report").append("<p>"+dataPerInquiry[Object.keys(dataPerInquiry)[0]].inquiry.description+"</p>");
 //   document.body.appendChild(popup);
    phases.forEach(function(p){
        $("#report").append("<div id='phase" + p + "'/>");

        $("#phase"+p).append("<h2>Phase "+ p + "</h2>");

    });

    Object.keys(dataPerInquiry).forEach(function(inq){
       Object.keys(dataPerInquiry[inq].data.events).forEach(function(user){
           Object.keys(dataPerInquiry[inq].data.events[user]).forEach(function(phase){
               var phaseData = dataPerInquiry[inq].data.events[user][phase];
               if(phase != "username"
                   && phaseData.length > 0) {
                   if($("#table" + phase).length == 0) {
                       $("#phase" + phase).append("<table style='width:100%;' id='table" + phase + "'/>");
                   }
                   phaseData.forEach(function(event){


                       $("#table"+phase).append("<tr'>" +
                           "<td>" +
                           event.phase +
                           "</td>" +
                           "<td>" +
                           event.widget_title +
                           "</td>" +
                           "<td>" +
                           event.html +
                           "</td>" +
                           "<td>" +
                           users[event.username].name  +
                           "</td>" +
                           /*"<td>" +
                           (new Date(event.startTime)).toDateString() +
                           "</td>" +*/
                           "</tr>")
                   });

               }
           });
       });
    });


   /* w.document.body.innerHTML = JSON.stringify(dataPerInquiry);
    w.document.body.innerHTML += JSON.stringify(phases);
    w.document.body.innerHTML += JSON.stringify(users);*/

    $.ajax({
        url:"/wespot/static/stylesheets/report.css",
        success:function(data){
            $("<style></style>").appendTo(w.document.head).html(data);
            $(w.document.body).html($("#report").html());

            $("#report").empty();
        }
    })

    //$(w.document.head).append("<link rel='stylesheet' href='/wespot/static/stylesheets/report.css' type='text/css' />")


}