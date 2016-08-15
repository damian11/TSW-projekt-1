$(function() { 
     var socket = io.connect('//' + window.location.host, {secure: true});
        socket.emit("competitionListReq");
        socket.on("competitionListRes", function(data){
          var  competitionList = $("#competitionList table tbody");
            competitionList.empty();
            
            for(var i=0; i<data.competitions.length; i++){
                var row = $("<tr />");
               // row.append("<td>" + data.competitions[i].name + "</td>");
                $("<a>").attr("href","/newCompetitionStep2/" + data.competitions[i]._id).text(data.competitions[i].name).appendTo(row);
                row.append("<td>" + data.competitions[i].date + "</td>");
                row.append("<td>" + data.competitions[i].comments + "</td>");
                row.append("<td>" + ( data.competitions[i].gender == "MALE" ? "Ogier" : "Klacz" ) + "</td>");
                row.append("<td>" + ( data.competitions[i].isActive == true ? "TAK" : "NIE" ) + "</td>");
                competitionList.append(row);
            }
        });
    });