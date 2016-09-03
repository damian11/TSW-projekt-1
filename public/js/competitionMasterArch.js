$(function(){
    
    var socket = io.connect('//' + window.location.host, {secure: true});
    socket.emit("competitionMasterArchListReq");
    setInterval(function(){
       socket.emit("competitionMasterArchListReq"); 
    }, 5000);
    socket.on("competitionMasterArchListRes", function(data){console.log(data);
        
        var competitionMasterArchList = $("#competitionMasterArchList table tbody");
        competitionMasterArchList.empty();
        for(var i=0; i<data.competitionmasters.length; i++){
            var row = $("<tr />");
            $("<a>").attr("href", "/showCompetitionNew/" + data.competitionmasters[i]._id).text(data.competitionmasters[i].name).appendTo(row);
            row.append("<td>" + data.competitionmasters[i].date + "</td>");
            row.append("<td>" + data.competitionmasters[i].comments + "</td>");
            
            competitionMasterArchList.append(row);
        }
    });
});