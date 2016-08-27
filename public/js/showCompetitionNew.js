var socket = io.connect('//' + window.location.host, {secure: true});

socket.emit("getActiveCompetitionMasterAndCompetitionReq");