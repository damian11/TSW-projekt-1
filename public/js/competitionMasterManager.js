$(function() {
    var socket = io.connect('//' + window.location.host, {secure: true});
    socket.emit("competitionMasterListReq");
    socket.on("competitionMasterListRes", function(data){
        //console.log("aaaaaaa" + data.competitionmasters[2].name);
        $("#editForm").hide();
        var competitionMasterList = $("#competitionMasterList table tbody");
         competitionMasterList.empty();
            
            for(var i=0; i<data.competitionmasters.length; i++){
                var row = $("<tr />");
                $("<a>").attr("href", "/newCompetitionMasterStep2/" + data.competitionmasters[i]._id).text(data.competitionmasters[i].name).appendTo(row);
                row.append("<td>" + data.competitionmasters[i].date + "</td>");
                row.append("<td>" + data.competitionmasters[i].comments + "</td>");
                row.append("<td>" + (data.competitionmasters[i].isActive == true ? "TAK" : "NIE") + "</td>");
                row.append("<td>" + (data.competitionmasters[i].isArch == true ? "TAK" : "NIE") + "</td>")
                var buttons = $("<td>");
                
                var editButton = $("<span>");
                editButton.attr("competitionMasterId", data.competitionmasters[i]._id);
                var editIcon = $("<i class='material-icons'>mode_edit</i>").appendTo(editButton);
                editButton.click(function(e){
                    $("#editForm").show();
                    socket.emit("competitionMasterReadByIDReq",{
                    competitionMasterId: $(this).attr("competitionMasterId")
                    });    
                });
                buttons.append(editButton);
                
                
                var deleteButton = $("<span>");
                deleteButton.attr("competitionMasterId", data.competitionmasters[i]._id);
                var deleteIcon = $("<i class='material-icons'>remove_circle_outline</i>").appendTo(deleteButton);
                deleteButton.click(function(e) {
                    socket.emit("competitionMasterDeleteByIDReq",{
                        competitionMasterId: $(this).attr("competitionMasterId")    
                    });
                });
                buttons.append(deleteButton);
                
                var activateButton = $("<span>");
                activateButton.attr("competitionMasterId", data.competitionmasters[i]._id);
                var activateIcon = $("<i class='material-icons'>done</i>").appendTo(activateButton);
                activateButton.click(function(e){
                    socket.emit("competitionMasterActivateReq",{
                        competitionMasterId: $(this).attr("competitionMasterId")
                    });
                });
                buttons.append(activateButton);
                
                
                var archButton = $("<span>");
                archButton.attr("competitionMasterId", data.competitionmasters[i]._id);
                var archIcon = $("<i class='material-icons'>done_all</i>").appendTo(archButton);
                archButton.click(function(e){
                    socket.emit("competitionMasterArchReq",{
                        competitionMasterId:  $(this).attr("competitionMasterId")
                    });
                });
                buttons.append(archButton);
                
                row.append(buttons);
                competitionMasterList.append(row);
            }
    });
    
    
    socket.on("competitionMasterReadByIDRes", function(data){
        console.log(data);
        $("#competitionMasterId").val(data.data._id);
        $("#name").val(data.data.name);
        $("#date").val(data.data.date);
        $("#comments").val(data.data.comments);
        
    });
    
    socket.on("competitionMasterDeleteByIDRes", function(data){
        socket.emit("competitionMasterListReq");
    });
    socket.on("competitionMasterActivateRes", function(data){
        if(data.message != "" ){
         alert(data.message);
        }else{
            socket.emit("competitionMasterListReq");
        }
    });
    socket.on("competitionMasterArchRes",function(data){
       socket.emit("competitionMasterListReq"); 
    });
});