$(function(){
    

///////////////////CRUD KONIA    
            var socket = io.connect('//' + window.location.host, {secure: true});
            socket.emit("horsesReq");
            socket.on("horsesRes", function(data) {
            var horsesList = $("#horsesList table tbody");
            horsesList.empty();

            for (var i=0; i<data.length; i++) {
                var row = $("<tr />");
                row.append("<td>" + data[i].horseName +"</td>");
    //            row.append("<td>" + data[i].gender +"</td>");
                row.append("<td>" + ( (data[i].gender)=="MALE" ? "Ogier" : "Klacz" ) + "</td>");
                row.append("<td>" + data[i].owner +"</td>");
//                row.append("<td>" + (moment(Date.parse(data[i].dateOfBirth)).format("YYYY-MM-DD")) +"</td>");
                row.append($("<td>").addClass("date").text(moment(Date.parse(data[i].dateOfBirth)).format("YYYY-MM-DD")));
                  ///$(this).val(moment(res.planStartDate).format("YYYY-MM-DD"));

                var buttons = $("<td>");

                var editButton = $("<span>");
                editButton.attr("horseId", data[i]._id)
                var editIcon = $("<i class='material-icons'>mode_edit</i>").appendTo(editButton);
                editButton.click(function(e) {
                    socket.emit("horseReadByIDReq", {
                        horseId: $(this).attr("horseId")
                    });
                });
                buttons.append(editButton);

                //remove_circle_outline
                var deleteButton = $("<span>");    
                deleteButton.attr("horseId", data[i]._id)
                 var deleteIcon = $("<i class='material-icons'>remove_circle_outline</i>").appendTo(deleteButton);
                deleteButton.click(function(e) {
                    socket.emit("horseDeleteByIDReq", {
                        horseId: $(this).attr("horseId")
                    });
                });
                buttons.append(deleteButton);
                row.append(buttons);
                horsesList.append(row);
            }
        });

        socket.on("horseDeleteByIDRes", function(data) {
            socket.emit("horsesReq");
        });

        socket.on("horseReadByIDRes", function(data) {
            console.log(data.data);
            $("#horseId").val(data.data._id);
            $("#horseName").val(data.data.horseName);
            $("#gender").val(data.data.gender);
            $("#owner").val(data.data.owner);
            $("#dateOfBirth").val(data.data.dateOfBirth);
        });

});