var Visualizer = {
    canvas: null,
    ctx: null,
    background: new Image(),
    planets: [],
    moves: [],
    config : {
      planet_font: 'bold 15px Arial,Helvetica ',
      planet_pixels: [10,13,18,21,23,29],
      display_size: 640,
      display_margin: 50,
      framerate: 5,
      teamColor: ['rgb(72,84,84)','rgb(120,168,192)','rgb(192,0,0)']
    },
    frameNumber: 0,
    
    setup: function() {
        // Setup Context
        this.canvas = document.getElementById('display');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = 'center'
        this.ctx.font = this.config.planet_font
        
        // Load background
        this.background.src = 'bg.jpg';

        // Calcucated configs
        this.config.unit_to_pixel = (this.config.display_size - this.config.display_margin * 2) / 24;
    },
    
    unitToPixel: function(unit) {
        return this.config.unit_to_pixel * unit;
    },
    
    setFrame: function(frameNumber) {
      this.frameNumber = frameNumber
      this.planets = this.moves[frameNumber].planets
      this.fleets = this.moves[frameNumber].moving
    },
    
    drawFrame: function() { 
        var disp_x = 0, disp_y = 0;
        var ctx = this.ctx;
        
        ctx.drawImage(this.background, 0, 0);

        for(var i = 0; i < this.planets.length; i++) {
            var planet = this.planets[i];

            disp_x = this.unitToPixel(planet.x) + this.config.display_margin;
            disp_y = this.unitToPixel(planet.y) + this.config.display_margin;

            // Add shadow
            ctx.beginPath();
            ctx.arc(this.canvas.width - disp_x + 1, disp_y + 2, this.config.planet_pixels[planet.growthRate], 0, Math.PI*2, true); 
            ctx.closePath();
            ctx.fillStyle = "#000";
            ctx.fill();

            // Draw circle
            ctx.beginPath();
            ctx.arc(this.canvas.width - disp_x, disp_y, this.config.planet_pixels[planet.growthRate], 0, Math.PI*2, true); 
            ctx.closePath();
            ctx.fillStyle = this.config.teamColor[planet.owner]
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.fillText(planet.numShips, this.canvas.width - disp_x, disp_y+5);
        }
    },
    
    parseData: function(data) {
        data = data.split('|');
        
        // planets: [(x,y,owner,numShips,growthRate)]
        var map = data[0].split(':').map(function(a) { return a.split(','); });
        this.initMap(map);

        // turns: [(owner,numShips)] 
        // ++ [(owner,numShips,sourcePlanet,destinationPlanet,totalTripLength,turnsRemaining)]
        var turns = data[1].split(':');
        for(var i = 0; i < turns.length; i++) {
            var turn = turns[i].split(',');
            
            this.moves.push({
               'planets': turn.slice(0, map.length).map(function(a) { return a.split('.'); }),
               'moving': turn.slice(map.length).map(function(a) { return a.split('.'); })
            });
        }
    },
    
    initMap: function(data) {
        // [(x,y,owner,numShips,growthRate)]
        for(var i = 0; i < data.length; i++) {
            var planet = {
                x: parseFloat(data[i][0]),
                y: parseFloat(data[i][1]),
                owner: parseInt(data[i][2]),
                numShips: parseInt(data[i][3]),
                growthRate: parseInt(data[i][4]),
                drawing: {circle: false, text: false} 
            };
            this.planets.push(planet);
        }
    },
    
    _eof: true
};

(function($) {
    Visualizer.setup();
    Visualizer.parseData(data);
    Visualizer.setFrame(0)
    Visualizer.drawFrame();
})(window.jQuery);