 $(function() {
        var socket = io.connect('//' + window.location.host, {secure: true});
///////////////CRUD SĘDZIEGO        
        socket.emit("juryReq");
        socket.on("juryRes", function(data){
            console.log("data");
            console.log(data);

            var juryList = $("#juryList table tbody");
                juryList.empty();
    //              console.log(JSON.stringify(data));
                for (var i=0; i<data.length; i++) {
                    var row = $("<tr />");
                    row.append("<td>" + data[i].username +"</td>");
                    row.append("<td>" + data[i].firstName +"</td>");
                    row.append("<td>" + data[i].lastName +"</td>");
                    row.append("<td>" + data[i].password +"</td>");

                    var buttons = $("<td>");

                    var editButton = $("<span>");
                    editButton.attr("userId", data[i]._id)
                    var editIcon = $("<i class='material-icons'>mode_edit</i>").appendTo(editButton);
                    editButton.click(function(e) {
                    socket.emit("juryReadByIDReq", {
                    userId: $(this).attr("userId")
                        });
                    });
                    buttons.append(editButton);

                                    //remove_circle_outline
                    var deleteButton = $("<span>");    
                    deleteButton.attr("userId", data[i]._id)
                    var deleteIcon = $("<i class='material-icons'>remove_circle_outline</i>").appendTo(deleteButton);
                    deleteButton.click(function(e) {
                    socket.emit("juryDeleteByIDReq", {
                            userId: $(this).attr("userId")
                        });
                    });
                    buttons.append(deleteButton);
                    row.append(buttons);
                    juryList.append(row);
                }
             });
        socket.on("juryDeleteByIDRes", function(data) {
            socket.emit("juryReq");
        });
        
        socket.on("juryReadByIDRes", function(data) {
        console.log(data.data);
        $("#userId").val(data.data._id);
        $("#username").val(data.data.username);    
        $("#firstName").val(data.data.firstName);
        $("#lastName").val(data.data.lastName);
        $("#password").val(data.data.password);

    });
});