var Visualizer = {
    canvas: null,
    ctx: null,
    frame: 0,
    playing: false,
    haveDrawnBackground: false,
    frameDrawStarted: null,
    frameDrawEnded: null,
    players: ["Player A", "Player B"],
    playerIds: ["-1", "-1"],
    planets: [],
    moves: [],
    dirtyRegions: [],
    config : {
      planet_font: 'bold 15px Arial,Helvetica',
      fleet_font: 'normal 12px Arial,Helvetica',
      planet_pixels: [10,13,18,21,23,29],
      showFleetText: true,
      display_margin: 50,
      turnsPerSecond: 8,
      teamColor: ['#455','#c00','#7ac']
    },
    
    setup: function(data) {
        // Setup Context
        this.canvas = document.getElementById('display');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = 'center'
        
        // Parse data
        this.parseData(data);
        
        // Calculated configs
        this.config.unit_to_pixel = (this.canvas.height - this.config.display_margin * 2) / 24;
        
        // Draw first frame
        this.drawFrame(0);        
    },
    
    unitToPixel: function(unit) {
        return this.config.unit_to_pixel * unit;
    },
    
    drawBackground: function(){
      var ctx = this.ctx;
      
      // Draw background
      ctx.fillStyle = '#000';
      if(this.haveDrawnBackground==false){  
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.haveDrawnBackground = true;
      }
      for(var i = 0; i < this.dirtyRegions.length; i++) {
        var region = this.dirtyRegions[i];
        ctx.fillRect(
          parseInt(region[0]),
          parseInt(region[1]),
          parseInt(region[2]),
          parseInt(region[3])
        );
      }
      this.dirtyRegions = [];
      
    },
    
    drawFrame: function(frame) { 
        var disp_x = 0, disp_y = 0;
        var ctx = this.ctx;
        var frameNumber = Math.floor(frame);
        
        var planetStats = this.moves[frameNumber].planets;
        var fleets = this.moves[frameNumber].moving;
        
        this.drawBackground();
        
        // Draw Planets
        ctx.font = this.config.planet_font;
        ctx.textAlign = 'center';
        for(var i = 0; i < this.planets.length; i++) {
            var planet = this.planets[i];
            planet.owner = planetStats[i].owner;
            planet.numShips = planetStats[i].numShips;

            disp_x = this.unitToPixel(planet.x) + this.config.display_margin;
            disp_y = this.unitToPixel(planet.y) + this.config.display_margin;

            // Add shadow
            ctx.beginPath();
            ctx.arc(disp_x + 0.5, this.canvas.height - disp_y + 0.5, this.config.planet_pixels[planet.growthRate] + 1, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fillStyle = "#000";
            ctx.fill();

            // Draw circle
            ctx.beginPath();
            ctx.arc(disp_x, this.canvas.height - disp_y, this.config.planet_pixels[planet.growthRate], 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fillStyle = this.config.teamColor[planet.owner];
            // TODO: hightlight planet when a fleet has reached them
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.fillText(planet.numShips, disp_x, this.canvas.height - disp_y + 5);
        }
        
        // Draw Fleets
        this.ctx.font = this.config.fleet_font
        for(var i = 0; i < fleets.length; i++) {
          var fleet = fleets[i];
          
          var progress = (fleet.progress + 1 + (frame - frameNumber)) / (fleet.tripLength + 2);
          fleet.x = fleet.source.x + (fleet.destination.x - fleet.source.x) * progress
          fleet.y = fleet.source.y + (fleet.destination.y - fleet.source.y) * progress
          disp_x = this.unitToPixel(fleet.x) + this.config.display_margin;
          disp_y = this.unitToPixel(fleet.y) + this.config.display_margin;
          
          // Draw ship
          ctx.fillStyle = this.config.teamColor[fleet.owner];
          ctx.beginPath();
          ctx.save();
          ctx.translate(disp_x, this.canvas.height - disp_y);
          
          var scale = Math.log(Math.max(fleet.numShips,4)) * 0.03;
          ctx.scale(scale, scale);
          
          var angle = Math.PI/2 - Math.atan(
              (fleet.source.y - fleet.destination.y) /
              (fleet.source.x - fleet.destination.x)
          );
          if(fleet.source.x - fleet.destination.x < 0) {
              angle = angle - Math.PI;
          }
          ctx.rotate(angle);
          
          ctx.moveTo(0, -10);
          ctx.lineTo(40,-30);
          ctx.lineTo(0, 100);
          ctx.lineTo(-40, -30);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#fff"
          ctx.stroke();
          ctx.restore();

          // Draw text
          if(this.config.showFleetText==true){
            angle = -1 * (angle + Math.PI/2); // switch the axis around a little
            disp_x += -11 * Math.cos(angle);
            disp_y += -11 * Math.sin(angle) - 5;
            ctx.fillText(fleet.numShips, disp_x, this.canvas.height - disp_y);
          }
          
          this.dirtyRegions.push([disp_x - 25 , this.canvas.height - disp_y - 35, 50, 50])
        }
        
        $(this.canvas).trigger('drawn');
    },
    
    drawChart: function(){
        var canvas = document.getElementById('chart')
        var ctx = canvas.getContext('2d');
        ctx.scale(1,-1)
        ctx.translate(0,-canvas.height)
        
        // Total the ship counts
        var mostShips = 100;
        for(var i=0; i < this.moves.length; i++ ){
            var turn = this.moves[i]
            turn.shipCount=[0,0,0]
            for(var j=0; j < turn.moving.length; j++ ){
                var fleet = turn.moving[j]
                turn.shipCount[fleet.owner]+=fleet.numShips
            }
            for(var j=0; j < turn.planets.length; j++ ){
                var planet = turn.planets[j]
                turn.shipCount[planet.owner]+=planet.numShips
            }
                        
            for(var j=0; j < turn.shipCount.length; j++ ){
                mostShips = Math.max(mostShips, turn.shipCount[j] )
            }
        }

        var heightFactor = canvas.height / mostShips / 1.05
        var widthFactor = canvas.width / Math.max(200, this.moves.length)
        for(var i = 1; i <= 2; i++ ){
            ctx.strokeStyle = this.config.teamColor[i];
            ctx.fillStyle = this.config.teamColor[i];
            ctx.beginPath();
            ctx.moveTo(0,this.moves[0].shipCount[i] * heightFactor)
            for(var j=1; j < this.moves.length; j++ ){
                var shipCount = this.moves[j].shipCount[i]
                ctx.lineTo(j*widthFactor, shipCount*heightFactor)
            }
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc((j-1)*widthFactor, shipCount*heightFactor, 2, 0, Math.PI*2, true);
            ctx.fill();
        }
        
    },
    
    start: function() {
        this.playing = true;
        setTimeout(function() { Visualizer.run.apply(Visualizer); }, 1);
        $("#play-button").html("&#9553;");
    },
    
    stop: function() {
        this.playing = false;
        $('#play-button').html("&#9654;");
    },
    
    run: function() {
      if(!this.playing) return;
      this.frameDrawStarted = new Date().getTime()
      
      if(this.frame >= Visualizer.moves.length ){
        this.stop();
        return;
      }
      this.drawFrame(this.frame);
      
      var frameAdvance = (this.frameDrawStarted - this.frameDrawEnded) / (1000 / this.config.turnsPerSecond )
      if(isNaN(frameAdvance)){
        frameAdvance = 0.3;
      }
      
      this.frame += Math.min(1,Math.max(0.0166, frameAdvance ));
      this.frameDrawEnded = new Date().getTime();
      
      
      // Todo: If frameAdvance is the miniumum size (on a super fast system), then 
      // we need to delay drawing the next frame.
      var timeToNextDraw = 1;
      setTimeout(function() { Visualizer.run.apply(Visualizer); }, timeToNextDraw);
    },
    
    setFrame: function(targetFrame, wholeNumber){
      if(wholeNumber===true){
        targetFrame = Math.floor(targetFrame);
      }
      this.frame = Math.max(0,Math.min(this.moves.length-1, targetFrame));
    },
    
    parseData: function(input) {
        input = input.split(/\n/);
        
        var data;
        if(input.length == 1) data = input[0];
        else {
            for(var i = 0; i < input.length; i++) {
                var value = input[i].split('=');
                switch(value[0]) {
                    case "player_one": this.players[0] = value[1]; break;
                    case "player_two": this.players[1] = value[1]; break;
                    case "playback_string": data = value[1]; break;
                    case "player_one_id": this.playerIds[0] = value[1]; break;
                    case "player_two_id": this.playerIds[1] = value[1]; break;
                }
            }
        }
        
        var data = data.split('|');
        
        // planets: [(x,y,owner,numShips,growthRate)]
        this.planets = data[0].split(':').map(ParserUtils.parsePlanet);
        
        // insert planets as first move
        this.moves.push({
           'planets': this.planets.map(function(a) { return {
                owner: parseInt(a.owner),
                numShips: parseInt(a.numShips)
            }; }),
           'moving': []
        });

        // turns: [(owner,numShips)] 
        // ++ [(owner,numShips,sourcePlanet,destinationPlanet,totalTripLength,turnsRemaining)]
        if(data.length < 2){ 
          return // No turns.
        } 
        var turns = data[1].split(':').slice(0,-1);
        for(var i = 0; i < turns.length; i++) {
            var turn = turns[i].split(',');
            var move = {}
            
            move.planets = turn.slice(0, this.planets.length).map(ParserUtils.parsePlanetState)
            var fleet_strings = turn.slice(this.planets.length)
            if( fleet_strings.length == 1 && fleet_strings[0] == '' ){
                fleet_strings = []
            }
            move.moving = fleet_strings.map(ParserUtils.parseFleet)
            
            this.moves.push(move);
        }
    },
    
    _eof: true
};

var ParserUtils = {    
    parseFleet: function(data) {
        data = data.split('.');
        // (owner,numShips,sourcePlanet,destinationPlanet,totalTripLength,turnsRemaining)
        return {
            owner: parseInt(data[0]),
            numShips: parseInt(data[1]),
            source: Visualizer.planets[data[2]],
            destination: Visualizer.planets[data[3]],
            tripLength: parseInt(data[4]),
            progress: parseInt(data[4] - data[5])
        };
    },
    
    parsePlanet: function(data) {
        data = data.split(',');
        // (x,y,owner,numShips,growthRate)
        return {
            x: parseFloat(data[0]),
            y: parseFloat(data[1]),
            owner: parseInt(data[2]),
            numShips: parseInt(data[3]),
            growthRate: parseInt(data[4])
        };
    },
    
    parsePlanetState: function(data) {
        data = data.split('.');
        // (owner,numShips)
        return {
            owner: parseInt(data[0]),
            numShips: parseInt(data[1])
        };
    },
    
    _eof: true
};

(function($) {
    Visualizer.setup(data);
    
    // Hook buttons
    var playAction = function() {
        if(!Visualizer.playing){
          if(Visualizer.frame > Visualizer.moves.length - 2){
            Visualizer.setFrame(0);
          }
          Visualizer.start();
        } else {
          Visualizer.stop();
        }
        return false;
    }
    $('#play-button').click(playAction);
    
    $('#start-button').click(function() {
        Visualizer.setFrame(0);
        Visualizer.drawFrame(Visualizer.frame);
        Visualizer.stop();
        return false;
    });
    
    $('#end-button').click(function() {
        Visualizer.setFrame(Visualizer.moves.length - 1, true);
        Visualizer.drawFrame(Visualizer.frame);
        Visualizer.stop();
        return false;
    });

    var prevAction = function() {
        Visualizer.setFrame(Visualizer.frame - 1, true);
        Visualizer.drawFrame(Visualizer.frame);
        Visualizer.stop();
        return false;
    }
    $('#prev-frame-button').click(prevAction);
    
    var nextAction = function() {
        Visualizer.setFrame(Visualizer.frame + 1);
        Visualizer.drawFrame(Visualizer.frame);
        Visualizer.stop();
        return false;
    }
    $('#next-frame-button').click(nextAction);
    
    $(document.documentElement).keydown(function(evt){
        if(evt.keyCode == '37'){ // Left Arrow
            prevAction();
            return false;
        }else if(evt.keyCode == '39'){ // Right Arrow
            nextAction();
            return false;
        }else if(evt.keyCode == '32'){ // Spacebar
            playAction();
            return false;
        }
    })
    
    $('#display').bind('drawn', function(){
      $('#turnCounter').text('Turn: '+Math.floor(Visualizer.frame+1)+' of '+Visualizer.moves.length)
    })
    
    $('.player1Name').html('<a href="profile.php?user_id=' + Visualizer.playerIds[0] + '">' + Visualizer.players[0] + '</a>')
    $('.player1Name a').css({'color':Visualizer.config.teamColor[1],'text-decoration':'none'})
    $('.player2Name').html('<a href="profile.php?user_id=' + Visualizer.playerIds[1] + '">' + Visualizer.players[1] + '</a>')
    $('.player2Name a').css({'color':Visualizer.config.teamColor[2],'text-decoration':'none'})
    $('.playerVs').text('v.s.')
    $('title').text(Visualizer.players[0]+' v.s. '+Visualizer.players[1]+' - Planet Wars')
    
    Visualizer.start();
    Visualizer.drawChart();
})(window.jQuery);
