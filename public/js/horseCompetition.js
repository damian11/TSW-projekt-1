    $(function() {
        var socket = io.connect('//' + window.location.host, {secure: true});
        
        socket.emit("getActiveCompetitionHorseJuryReq", {
            loggedUserId: "<%= loggedUser._id %>"
        });
        setInterval(function() {
            socket.emit("getActiveCompetitionHorseJuryReq", {
                loggedUserId: "<%= loggedUser._id %>"
            });
        }, 2000);
        
        socket.on("getActiveCompetitionHorseJuryRes", function(data) {
            if(data.status === "OK"){
             $("#dataMark").show();
                var competitionId = data.competitionId;
                var juryId = data.juryId;
                var horseId = data.horseId;
                var horseStartNumber = data.horseGroup.startNumber;
                var competition = data.competition;

                $("#horseStartNumber").text("Ocena konia o numerze startowym: " + horseStartNumber).append( $("<h4>Zawody: " + competition.name + " </h4>") );

                socket.emit("horseMarkByCompetitionIdAndJuryIdAndHorseIdReq", {
                    competitionId: competitionId,
                    juryId: juryId,
                    horseId: horseId
                });


                //sprawdza czy admin nie deaktywował zawodów i jak tak to wywala ze strony
                socket.on("horseMarkByCompetitionIdAndJuryIdAndHorseIdRes", function(data) {
                    if(data.status == "NOK") {
                        window.location = "/";
                    }

                    $("#type div").removeClass("active");
                    var type = $("#type"+data.horseMark.type);
                    type.addClass("active");

                    $("#head div").removeClass("active");
                    var head = $("#head"+data.horseMark.head);
                    head.addClass("active");

                    $("#body div").removeClass("active");
                    var body = $("#body"+data.horseMark.body);
                    body.addClass("active");

                    $("#legs div").removeClass("active");
                    var legs = $("#legs"+data.horseMark.legs);
                    legs.addClass("active");

                    $("#movement div").removeClass("active");
                    var movement = $("#movement"+data.horseMark.movement);
                    movement.addClass("active");
                });

                socket.on("changeMarkRes", function(data) {
                    socket.emit("horseMarkByCompetitionIdAndJuryIdAndHorseIdReq", {
                    competitionId: competitionId,
                    juryId: juryId,
                    horseId: horseId
                    });
                });

                var type = $("#type");
                var head = $("#head");
                var body = $("#body");
                var legs = $("#legs");
                var movement = $("#movement");
                
                type.empty().append("<p>Typ</p>");
                head.empty().append("<p>Głowa</p>");
                body.empty().append("<p>Kłoda</p>");
                legs.empty().append("<p>Nogi</p>");
                movement.empty().append("<p>Ruch</p>");
                
                for (var i=1; i<21; i++) {
                    var div = $("<div>").attr("id", "type"+i).addClass("box").val(i).text(i);
                    div.click(function(e) {
                        socket.emit("changeTypeMarkReq", {
                            competitionId: competitionId,
                            juryId: juryId,
                            horseId: horseId,
                            type: $(this).val()
                        });
                    });
                    type.append(div);

                    if ( ($(document).width() <= 800) && (i==10)){
                        type.append($("<br>"));
                    }

                    var div = $("<div>").attr("id", "head"+i).addClass("box").val(i).text(i);
                    div.click(function(e) {
                        socket.emit("changeHeadMarkReq", {
                    competitionId: competitionId,
                    juryId: juryId,
                    horseId: horseId,
                            head: $(this).val()
                        });
                    });
                    head.append(div);

                       if ( ($(window).width() <= 800) && (i==10)){
                        head.append($("<br>"));
                    }
                    var div = $("<div>").attr("id", "body"+i).addClass("box").val(i).text(i);
                    div.click(function(e) {
                        socket.emit("changeBodyMarkReq", {
                        competitionId: competitionId,
                        juryId: juryId,
                        horseId: horseId,
                            body: $(this).val()
                        });
                    });
                    body.append(div);

                       if ( ($(window).width() <= 800) && (i==10)){
                        body.append($("<br>"));
                    }
                    var div = $("<div>").attr("id", "legs"+i).addClass("box").val(i).text(i);
                    div.click(function(e) {
                        socket.emit("changeLegsMarkReq", {
                        competitionId: competitionId,
                        juryId: juryId,
                        horseId: horseId,
                            legs: $(this).val()
                        });
                    });
                    legs.append(div);

                       if ( ($(window).width() <= 800) && (i==10)){
                        legs.append($("<br>"));
                    }
                    var div = $("<div>").attr("id", "movement"+i).addClass("box").val(i).text(i);
                    div.click(function(e) {
                        socket.emit("changeMovementMarkReq", {
                        competitionId: competitionId,
                        juryId: juryId,
                        horseId: horseId,
                            movement: $(this).val()
                        });
                    });
                    movement.append(div);

                      if ( ($(window).width() <= 800) && (i==10)){
                        movement.append($("<br>"));
                    }           
                }               
                setInterval(function() {
        //            console.log("shouldIHurryUpReq");
                    socket.emit("shouldIHurryUpReq", {
                        competitionId: competitionId,
                        juryId: juryId,
                        horseId: horseId
                    });
                }, 1000);

                socket.on("shouldIHurryUpRes", function(data) {
        //            console.log("shouldIHurryUpRes")
                    $("#message").text("Proszę się pośpieszyć!").addClass("hurryfont");

                  
                });
                
            } else if(data.status === "NODATA"){
                $("#message").text("Brak aktywnych koni w zawodach");
                $("#dataMark").hide();
            }
        });
        
    });
