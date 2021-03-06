$(function(){
        var competitionMasterArchId = "<%= competitionMasterArchId %>";
        var socket = io.connect('//' + window.location.host, {secure: true});

        if(competitionMasterArchId == ""){
        socket.emit("getActiveCompetitionMasterAndCompetitionReq");
        } else{
        socket.emit("getArchCompetitionMasterAndCompetitionReq",{
            competitionMasterArchId: competitionMasterArchId
        });
            
        }
        socket.on("getActiveCompetitionMasterAndCompetitionRes", function(data) {
            var title = "";
            var competitionMasterId = "";
            
            for (var i in data.competitions) {
                var horseMarksTable = buildHorseMarksInGroupTable(data.competitions[i]._id);
                
                $("#horseMarksInGroups").append( $("<h3>"+data.competitions[i].name+"</h3>") );
                $("#horseMarksInGroups").append(horseMarksTable);
                
                if (data.competitions[i].competitionMaster != null) {
                    title = data.competitions[i].competitionMaster.name;
                    competitionMasterId = data.competitions[i].competitionMaster._id;
                }
            }
            if (title == "") {
                $("#title").text("Obecnie nie trwają żadne zawody");   
            } else {
                if(competitionMasterArchId != "") {
                    $("#title").text(title); 
                } else {
                    $("#title").text("Obecnie trwają zawody: " + title); 
                }
            }
        
            socket.emit("horseMarkReq", {gender: "MALE", competitionMasterId: competitionMasterId});
            socket.emit("horseMarkReq", {gender: "FEMALE", competitionMasterId: competitionMasterId});
            socket.on("horseMarkRes", function(data) {
                var horsesGRAvg = evalHorsesGRAvg(data);

                var tbody = $("<tbody>");
                for (var i=0; i<horsesGRAvg.length; i++) {
                    var tr = $("<tr>");
                    tr.append("<td>"+(i+1)+".</td>").append("<td>"+horsesGRAvg[i].name+"</td>").append("<td>"+horsesGRAvg[i].avg.toFixed(2)+"</td>");
                    tr.appendTo(tbody);
                }

                if (data.gender == "MALE") {
                    $("#horseMarksGRMale").append(tbody);
                } else {
                    $("#horseMarksGRFemale").append(tbody);
                }
            });
        });

        socket.on("horseMarkByCompetitionIdRes", function(data) {
            var horseMarks = $("#horseMarkTable" + data.competitionId);
            horseMarks.empty();
            var horsesAvg = {};
            var horses = {};
            var juries = {};
            var horsesSorted = [];

            evalHorsesAvg(data, horsesAvg, horses, juries, horsesSorted);

            buildHorsesAvgHtml(data, horsesAvg, horsesSorted, horseMarks);

            $(".juryRow").hide();
            $(".horseRow").click(function(e) {
                var juryRows = $(this).parent().children(".juryRow[horse="+$(this).attr("id")+"]");
                juryRows.toggle();
            });
        });
        
        socket.on("getHorseStartNumberByCompetitionRes", function(data) {
            var horseStartNumber = $("#horseStartNumber"+data.horseGroup.horse);
            horseStartNumber.text("Koń #" + data.horseGroup.startNumber);
        });
        
        function buildHorseMarksInGroupTable(competitionId) {
            var table = $("<table>");
            table.append("<thead><tr><td>Koń</td><td>Typ</td><td>Głowa</td><td>Ciało</td><td>Nogi</td><td>Ruch</td><td>Średnia</td></tr></thead>");
            var tbody = $("<tbody>").appendTo(table);
            tbody.attr("id", "horseMarkTable" + competitionId);

            socket.emit("horseMarkByCompetitionIdReq", {
                competitionId: competitionId
            });
            
            return table;
        }
        
        function buildHorsesAvgHtml(data, horsesAvg, horsesSorted, horseMarks) {
            var trj;
            var trh;
            for (var j=0; j<horsesSorted.length; j++) {
                for (var i=0; i<data.horseMarks.length; i++) {
                    //Pobieranie numeru startowego konia
                    socket.emit("getHorseStartNumberByCompetitionReq", {
                        horseId: horsesSorted[j].id,
                        competitionId: data.horseMarks[i].competition._id
                    });
                    
                    //Budowanie tabeli z ocenami
                    if (horsesSorted[j].id == data.horseMarks[i].horse._id) {
                        trh = $("#"+data.horseMarks[i].horse._id+".horseRow");
                        if (!trh.length) {//to zeby koń był tylko raz wyświetlony
                            trh = $("<tr>").attr("id", data.horseMarks[i].horse._id).addClass("horseRow");
                            $("<td>").text(data.horseMarks[i].horse.horseName).attr("id","horseStartNumber"+data.horseMarks[i].horse._id).appendTo(trh);
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
        }
        
        function evalHorsesAvg(data, horsesAvg, horses, juries, horsesSorted) {
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

            for(var key in horsesAvg) {
                horsesSorted.push(horsesAvg[key]);
            }
            horsesSorted.sort(function(a, b) {
                return b.avg - a.avg;
            });
        }
        
        function evalHorsesGRAvg(data) {
            var horsesGRAvg = {};

            //unikalna mapa koni z inicjalnymi wartościami średnich ocen
            for (var i=0; i<data.horseMarks.length; i++) {
                horsesGRAvg[data.horseMarks[i].horse._id] = {
                    id: data.horseMarks[i].horse._id,
                    name: data.horseMarks[i].horse.horseName,
                    type: 0,
                    head: 0,
                    body: 0,
                    legs: 0,
                    movement: 0,
                    marksCount: 0,
                    avg: 0
                };
            }
            
            //sumowanie ocen
            for (var i=0; i<data.horseMarks.length; i++ ) {
                horsesGRAvg[data.horseMarks[i].horse._id].type     += data.horseMarks[i].type;
                horsesGRAvg[data.horseMarks[i].horse._id].head     += data.horseMarks[i].head;
                horsesGRAvg[data.horseMarks[i].horse._id].body     += data.horseMarks[i].body;
                horsesGRAvg[data.horseMarks[i].horse._id].legs     += data.horseMarks[i].legs;
                horsesGRAvg[data.horseMarks[i].horse._id].movement += data.horseMarks[i].movement;
                horsesGRAvg[data.horseMarks[i].horse._id].marksCount++;
            }
            
            //obliczenie średnich
            for(var key in horsesGRAvg) {
                horsesGRAvg[key].avg = (horsesGRAvg[key].type+horsesGRAvg[key].head+horsesGRAvg[key].body+horsesGRAvg[key].legs+horsesGRAvg[key].movement) / (horsesGRAvg[key].marksCount * 5);
            }
                
            var horsesSorted = [];
            for(var key in horsesGRAvg) {
                horsesSorted.push(horsesGRAvg[key]);
            }
            horsesSorted.sort(function(a, b) {
                return b.avg - a.avg;
            });
            
            return horsesSorted;
        }
            
            
    if(competitionMasterArchId != ""){
        $("#ButtonArchCompetition").hide();
       
    }
   
        
});     