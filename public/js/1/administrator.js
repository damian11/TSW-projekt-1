 $(function() {
        
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
   
        //WALIDACJE
        $("#username").blur(function(e) {
            if ($(this).val() == "") {
                var msg = $("<p>").text("Podaj nazwę użytkownika");
                $(this).parent().children("p").remove();
                $(this).parent().append(msg);
            } else {
                $(this).parent().children("p").remove();
            }
        });     
            
        $("#dateOfBirth").blur(function(e) {
            if ($(this).val() == "") {
                var msg = $("<p>").text("Podaj datę urodzenia konia");
                $(this).parent().children("p").remove();
                $(this).parent().append(msg);
            } else {
                $(this).parent().children("p").remove();
            }
        });
            
            
     
            
        $("#juryMark").click(function(e) {
           socket.emit('adminSaveMarksReq'); 
        });    
            
           
    
        $("input[type=date]").datepicker(); 
    });
        
        
        
        
        
        
   ///pokazywanie i ukrywanie crudów i listy
        
    
$(document).ready(function(){
    $("juryv").hide();
    $("horsev").hide();
    $("competitionv").hide();
    
    <% if (typeof showJuries != "undefined") { %>
        $("juryv").animate({
            height: 'toggle'
        });
    <% } %>
    
    <% if (typeof showHorses != "undefined") { %>
        $("horsev").animate({
            height: 'toggle'
        });
    <% } %>
    
    $("#juryvid").click(function(){
        $("juryv").animate({
            height: 'toggle'
        });
//        $("juryv").toggle();
    });
    
    $("#horsevid").click(function(){
        $("horsev").animate({
            height: 'toggle'
        });
//        $("horsev").toggle();
    });
    
    $("#competitionvid").click(function(){
        $("competitionv").animate({
            height: 'toggle'
        });
//        $("competitionv").toggle();
    });
});
        