    $(document).ready(function(){
        var socket = io.connect('//' + window.location.host, {secure: true});
        
        var startStopCompetitionBtn = $("#startStopCompetition");
        startStopCompetitionBtn.click(function(e) {
            if ($(this).prop("checked") == true) {
                socket.emit("competitionStartReq", {
                    competitionId: "<%= competition._id %>"
                });
            } else {
                socket.emit("competitionStopReq", {
                    competitionId: "<%= competition._id %>"
                });
            }
        });
        
        socket.on("competitionActivateRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });
///tworzymy grupe koni--poczatek
        socket.emit("availableHorsesReq", {
            gender: "<%= competition.gender %>",
            competitionId: "<%= competition._id %>"
        });
        socket.on("availableHorsesRes", function(data) {
            var horsesList = $("#horses table tbody");
            horsesList.empty();

            for (var i=0; i<data.length; i++) {
                var row = $("<tr />");
                row.append("<td>" + data[i].horseName +"</td>");
                row.append("<td>" + ( data[i].gender == "MALE" ? "Ogier" : "Klacz" ) +"</td>");
                row.append("<td>" + data[i].owner +"</td>");
                row.append($("<td>").addClass("date").text(moment(Date.parse(data[i].dateOfBirth)).format("YYYY-MM-DD")));

                var addButton = $("<td>");
                addButton.attr("horseId", data[i]._id)
                $("<i class='material-icons'>add_circle_outline</i>").appendTo(addButton);
                addButton.click(function(e) {
                    socket.emit("horseAddToCompetitionReq", {
                        competitionId: '<%= competition._id %>',
                        horseId: $(this).attr("horseId")
                    });
                });
               
                    <%if(competition.isActive == false){%>
                    
                    row.append(addButton);
                    <% }%>
                horsesList.append(row);
            }
        });

        socket.on("horseAddToCompetitionRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });   

        socket.emit("horsesByCompetitionIDReq", {
            competitionId: "<%= competition._id %>"
        });
        socket.on("horsesByCompetitionIDRes", function(data) {
            var horsesInCompetition = $("#horsesInCompetition table tbody");
            horsesInCompetition.empty();

            for (var i=0; i<data.length; i++) {
                var row = $("<tr />");
                row.append("<td>" + data[i].horse.horseName +"</td>");
                row.append("<td>" + ( data[i].horse.gender == "MALE" ? "Ogier" : "Klacz" ) +"</td>");
                row.append("<td>" + data[i].horse.owner +"</td>");
                row.append($("<td>").addClass("date").text(moment(Date.parse(data[i].horse.dateOfBirth)).format("YYYY-MM-DD")));
                row.append("<td>" + ( data[i].isActive == true ? "TAK" : "NIE" ) +"</td>");

                <% if (competition.isActive === true) { %>
                    var activateButton = $("<td>");
                    activateButton.attr("horseId", data[i].horse._id);
                    if (data[i].isActive == true) {
                        $("<i class='material-icons'>highlight_off</i>").appendTo(activateButton);
                    } else {
                        $("<i class='material-icons'>done</i>").appendTo(activateButton);
                    }
                    activateButton.click(function(e) {
                        socket.emit("horseActivateInCompetitionReq", {
                            competitionId: '<%= competition._id %>',
                            horseId: $(this).attr("horseId")
                        });
                    });
                    row.append(activateButton);
                    horsesInCompetition.append(row);
                <% } else { %>
                    var deleteButton = $("<td>");
                    deleteButton.attr("horseId", data[i].horse._id);
                    $("<i class='material-icons'>remove_circle_outline</i>").appendTo(deleteButton);
                    deleteButton.click(function(e) {
                        socket.emit("horseDeleteFromCompetitionReq", {
                            competitionId: '<%= competition._id %>',
                            horseId: $(this).attr("horseId")
                        });
                    });
                    row.append(deleteButton);
                    horsesInCompetition.append(row);
                <% } %>
            }
        });
        socket.on("horseActivateInCompetitionRes", function(data) {
            if (typeof data.message != "undefined") {
                alert(data.message);
            }
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });
        socket.on("horseDeleteFromCompetitionRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });

        socket.emit("availableJuryReq", {
            competitionId: "<%= competition._id %>"
        });

        socket.on("availableJuryRes", function(data) {
            var juryList = $("#juries table tbody");
            juryList.empty();

            for (var i=0; i<data.length; i++) {
                var row = $("<tr />");
                row.append("<td>" + data[i].username +"</td>");
                row.append("<td>" + data[i].password +"</td>");
                row.append("<td>" + data[i].firstName +"</td>");
                row.append("<td>" + data[i].lastName +"</td>");

                var addButton = $("<td>");
                addButton.attr("juryId", data[i]._id)
                $("<i class='material-icons'>add_circle_outline</i>").appendTo(addButton);
                addButton.click(function(e) {
                    socket.emit("juryAddToCompetitionReq", {
                        competitionId: '<%= competition._id %>',
                        juryId: $(this).attr("juryId")
                    });
                });
                
                <% if (competition.isActive == false)  { %>
                row.append(addButton);
                <% } %>
                juryList.append(row);
            }
        });

        socket.on("juryAddToCompetitionRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });

        socket.on("juryDeleteFromCompetitionRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        }); 
        socket.emit("juriesByCompetitionIDReq", {
            competitionId: "<%= competition._id %>"
        });
        socket.on("juriesByCompetitionIDRes", function(data) {
            var juriesInCompetition = $("#juriesInCompetition table tbody");
            juriesInCompetition.empty();

            for (var i=0; i<data.length; i++) {
                var row = $("<tr />");
                row.append("<td>" + data[i].username +"</td>");
                row.append("<td>" + data[i].password +"</td>");
                row.append("<td>" + data[i].firstName+"</td>");
                row.append("<td>" + data[i].lastName +"</td>");

                var deleteButton = $("<td>");
                deleteButton.attr("juryId", data[i]._id)
                $("<i class='material-icons'>remove_circle_outline</i>").appendTo(deleteButton);
                deleteButton.click(function(e) {
                    socket.emit("juryDeleteFromCompetitionReq", {
                        competitionId: '<%= competition._id %>',
                        juryId: $(this).attr("juryId")
                    });
                });
                <%if(competition.isActive == false){ %>
                             row.append(deleteButton);
                
                   <%  } %>
                
                
                var hurryUpButton = $("<td>");
                hurryUpButton.attr("juryId", data[i]._id)
                $("<i class='material-icons'>hourglass_empty</i>").appendTo(hurryUpButton);
                hurryUpButton.click(function(e) {
                    socket.emit("juryHurryUpReq", {
                        competitionId: '<%= competition._id %>',
                        juryId: $(this).attr("juryId")
                    });
                });
                <%if(competition.isActive == true){ %>
                    row.append(hurryUpButton);
                <% } %>
        
                juriesInCompetition.append(row);
            }
        });
        socket.on("juriesDeleteFromCompetitionRes", function(data) {
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });
        
        $("#competitionStart").click(function(e) {
            socket.emit("competitionStartReq", {
                competitionId: "<%= competition._id %>"
            });
        });
        socket.on("competitionStartRes", function(data){
            $("#competitionStatus").text("Aktywne");
            window.location = "/newCompetitionStep2/" + data.competitionId;
        });
            
        $("#competitionStop").click(function(e) {
            socket.emit("competitionStopReq", {
                competitionId: "<%= competition._id %>"
                
            });
        });
        socket.on("competitionStopRes", function(data){
            if(data.status == "OK") {
                $("#competitionStatus").text("Nieaktywne");
                window.location = "/newCompetitionStep2/" + data.competitionId;
            } else if(data.status == "NOK") {
                alert(data.message);
            }
            
      
        });
        
        $("#competitionForm form").hide();
        <%if(competition.isActive == false){ %>
            $("#editCompetitionButton").show();
//            $("#horses").show();
//            $("#juries").show();
        <% } else { %>
            $("#editCompetitionButton").hide();
//            $("#horses").hide();
//            $("#juries").hide();
        <% } %>
        $("#editCompetitionButton").click(function(e) {
            <%if(competition.isActive == false){ %>
                $("#competitionForm form").toggle();
            <% } %>
        });
        
        
           ///pokazywanie i ukrywanie crudów i listy
        
    
//        $(document).ready(function(){
           
        $("#juries").hide();
        $("#horses").hide();
//        $("#horsesInCompetition").show();
//        $("#juryInCompetition").show();

        <% if (typeof showJuries != "undefined") { %>
            $("juryv").show();
        <% } %>

        $("#juryVbtn").click(function(){
//            $("#juryV").animate({
            $("#juries").animate({
                height: 'toggle'
            });
    //        $("juryv").toggle();
        });

        $("#horseVbtn").click(function(){
//            $("#horseV").animate({
            $("#horses").animate({
                height: 'toggle'
            });
    //        $("horsev").toggle();
        });

            $("input[type=date]").datepicker();
//        });
        
        
            
////tabela wyników            
        var competitionId = "<%= competition._id %>";

            socket.emit("horseMarkByCompetitionIdAdminReq", {
                competitionId: competitionId
            });
            
            setInterval(function() {
                socket.emit("horseMarkByCompetitionIdAdminReq", {
                    competitionId: competitionId
                });
            }, 5000);

            socket.on("horseMarkByCompetitionIdAdminRes", function(data) {
                var horseMarks = $("#horseMarks table tbody");
                horseMarks.empty();
                var horsesAvg = {};
                var horses = {};
                var juries = {};
                
                for (var i=0; i<data.horseMarks.length; i++) {
                    horses[data.horseMarks[i].jury._id] = [];
                }
                                                           // robimy pętle po odpowiedzi z serwera
                //Obliczenie liczby sędziów
                for (var i=0; i<data.horseMarks.length; i++) {
                    juries[data.horseMarks[i].jury._id] = 1;
                }
                var juriesNo = Object.keys(juries).length;
                
                //unikalna mapa koni z inicjalnymi wartościami średnich ocen
                for (var i=0; i<data.horseMarks.length; i++) {
                    horsesAvg[data.horseMarks[i].horse._id] = {
                        id: data.horseMarks[i].horse._id,
                        type: 0,
                        head: 0,
                        body: 0,
                        legs: 0,
                        movement: 0,
                        avg: 0
                    };
                }
                
                //obliczenie wartości średnich ocen koni - sumowanie
                for (var i=0; i<data.horseMarks.length; i++) {
                    horsesAvg[data.horseMarks[i].horse._id].type += data.horseMarks[i].type;
                    horsesAvg[data.horseMarks[i].horse._id].head += data.horseMarks[i].head;
                    horsesAvg[data.horseMarks[i].horse._id].body += data.horseMarks[i].body;
                    horsesAvg[data.horseMarks[i].horse._id].legs += data.horseMarks[i].legs;
                    horsesAvg[data.horseMarks[i].horse._id].movement += data.horseMarks[i].movement;
                }
                for(var key in horsesAvg) {
                    horsesAvg[key].type /= juriesNo;
                    horsesAvg[key].head /= juriesNo;
                    horsesAvg[key].body /= juriesNo;
                    horsesAvg[key].legs /= juriesNo;
                    horsesAvg[key].movement /= juriesNo;
                    horsesAvg[key].avg = (horsesAvg[key].type + horsesAvg[key].head + horsesAvg[key].body + horsesAvg[key].legs + horsesAvg[key].movement)/5;
                }
                
                var horsesSorted = [];
                for(var key in horsesAvg) {
                    horsesSorted.push(horsesAvg[key]);
                }
                horsesSorted.sort(function(a, b) {
                    return b.avg - a.avg;
                });
                console.log(horsesSorted);
                
                var trj;
                var trh;
                for (var j=0; j<horsesSorted.length; j++) {
                    for (var i=0; i<data.horseMarks.length; i++) {
                        if (horsesSorted[j].id == data.horseMarks[i].horse._id) {
                            trh = $("#"+data.horseMarks[i].horse._id+".horseRow");
                            if (!trh.length) {
                                trh = $("<tr>").attr("id", data.horseMarks[i].horse._id).addClass("horseRow");
                                $("<td>").text(data.horseMarks[i].horse.horseName).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].type).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].head).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].body).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].legs).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].movement).appendTo(trh);
                                $("<td>").text(horsesAvg[data.horseMarks[i].horse._id].avg).appendTo(trh);
                                horseMarks.append(trh);
                            }

                            trj = $("<tr>").addClass("juryRow").attr("horse", data.horseMarks[i].horse._id);

                            $("<td>").text(data.horseMarks[i].jury.firstName + " " + data.horseMarks[i].jury.lastName).appendTo(trj);
                            $("<td>").text(data.horseMarks[i].type).appendTo(trj);
                            $("<td>").text(data.horseMarks[i].head).appendTo(trj);
                            $("<td>").text(data.horseMarks[i].body).appendTo(trj);
                            $("<td>").text(data.horseMarks[i].legs).appendTo(trj);
                            $("<td>").text(data.horseMarks[i].movement).appendTo(trj);

                            horseMarks.append(trj);
                        }
                    }
                }
//                
//                $(".juryRow").hide();
//                $(".horseRow").click(function(e) {
//                    var juryRows = $(this).parent().children(".juryRow[horse="+$(this).attr("id")+"]");
//                    juryRows.toggle();
//                });
            });
       
            <% if(competition.isActive == false){ %>
                $("#horseMarks").hide();
                <%}%>
        
        
            
    });
     