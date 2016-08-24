$(function() {
    var socket = io.connect('//' + window.location.host, {secure: true});
    socket.emit("competitionMasterListReq");
    socket.on("competitionMasterListRes", function(data){
        console.log("aaaaaaa" + data.competitionmasters[2].name);
        var competitionMasterList = $("#competitionMasterList table tbody");
         competitionMasterList.empty();
            
            for(var i=0; i<data.competitionmasters.length; i++){
                var row = $("<tr />");
                $("<a>").attr("href", "/newCompetitionMasterStep2/" + data.competitionmasters[i]._id).text(data.competitionmasters[i].name).appendTo(row);
                row.append("<td>" + data.competitionmasters[i].date + "</td>");
                row.append("<td>" + data.competitionmasters[i].comments + "</td>");
                row.append("<td>" + (data.competitionmasters[i].isActive == true ? "TAK" : "NIE") + "</td>");
                competitionMasterList.append(row);
            }
    });
    
});