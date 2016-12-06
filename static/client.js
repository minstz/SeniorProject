function setUpClient(requestURL) {
	

	var peerID = "";
	var hash = 0;

	if(firstSetup) {
		firstSetup = false;
		//When the connection with server is opened
		peer.on('open', function(id) {

			console.log('My peer ID is: ' + id);

			//Get peerID and hash from server
			// console.log('GETting /' + id + requestURL + '_metadata' )
			$.ajax({
				url: '/' + id + requestURL + '_metadata',
				// data: id,
				dataType: 'json',
				async: false,
				success: function(json) {
					console.log("Received from Server", json);
					peerID = json["peer_id"];
					hash = json["content_hash"];
				}
			});

			//This means we are currently the only active connection on the server
			//We will now get the content directly from server
			if (peerID == peer.id || peerID == "peer_id") {
				setTimeout(function() {
				$.ajax({
					url: '/' + peer.id + requestURL,
					dataType: 'html',
					async: false,
					success: function(html) {
						console.log("Got the html ", html);
						document.documentElement.innerHTML = html;
						console.log(sha256(html));
						console.log(html.length);
						// document.write(html);
					}
				});

			},2000); //simulate resource delay
			}

			else {

				//connect to the specified peer id given by server
				var connection = peer.connect(peerID);

				//wait for data
			  connection.on('data', function(data){
			    console.log("received from peer", data);

			    //calculate hash
			    var recievedHash = sha256(data);

			    console.log(recievedHash);

			    //compare hash to hash supplied by server
			    //if not equal, close connection, send error to server, and get new peer
					console.log(data.length);

			    if (hash == recievedHash) {
				    //write data (html) to the DOM
				    document.documentElement.innerHTML = data;
				    alert("This page was served by " + peerID);
			    }
			    else {
			    	console.log("Hashes do not match");

						$.ajax({
							url: '/error' + '/' + peerID + requestURL,
							dataType: 'html',
							async: false,
							success: function(html) {
								console.log("Got the html ", html);
								document.documentElement.innerHTML = html;
								// document.write(html);
							}
						});

			    }

			  });
			}
		});

		//On connection
		peer.on('connection', function(conn) {
			conn.on('open',function() {
				var data = document.documentElement.outerHTML;
				console.log("sending html ");
				//Send data (html) to new peer
				conn.send(data);
				console.log("SENT");
				console.log(data);
			});


		});

	} else {
		$.ajax({
				url: '/' + peer.id + requestURL + '_metadata',
				// data: id,
				dataType: 'json',
				async: false,
				success: function(json) {
					console.log("Received from Server", json);
					peerID = json["peer_id"];
					hash = json["content_hash"];
				}
			});
		if (peerID == peer.id || peerID == "peer_id") {
			
			setTimeout(function() {
				$.ajax({
					url: '/' + peer.id + requestURL,
					dataType: 'html',
					async: false,
					success: function(html) {
						console.log("Got the html ", html);
						document.documentElement.innerHTML = html;
						console.log(sha256(html));
						console.log(html.length);
						// document.write(html);
					}
				});

			},2000); //simulate resource delay
		} else {
			console.log('disconnecting');
			peer.disconnect();
		}

		peer = new Peer( {host: 'localhost', port: 9000, path: '/api'});
		var connection = peer.connect(peerID);

		connection.on('data', function(data){

		//calculate hash
	    var recievedHash = sha256(data);

	    console.log(recievedHash);

	    //compare hash to hash supplied by server
	    //if not equal, close connection, send error to server, and get new peer
			console.log(data.length);

	    if (hash == recievedHash) {
		    //write data (html) to the DOM
		    document.documentElement.innerHTML = data;
		    alert("This page was served by " + peerID);
	    }
	    else {
	    	console.log("Hashes do not match");

				$.ajax({
					url: '/error' + '/' + peerID + requestURL,
					dataType: 'html',
					async: false,
					success: function(html) {
						console.log("Got the html ", html);
						document.documentElement.innerHTML = html;
						// document.write(html);
					}
				});

	    }


	});
}
	
}