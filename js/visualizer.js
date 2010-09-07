var Visualizer = {
    canvas: null,
    ctx: null,
    planets: [],
    config : {
      planet_font: 'bold 15px Arial,Helvetica ',
      planet_pixels: [10,13,18,21,23,29],
      display_size: 640,
      display_margin: 50,
      framerate: 5,
      teamColor: ['rgb(72,84,84)','rgb(120,168,192)','rgb(192,0,0)']
    },
    
    setup: function() {
        // Setup Context
        this.canvas = document.getElementById('display');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = 'center'
        this.ctx.font = this.config.planet_font

        // Calucated configs
        this.config.unit_to_pixel = (this.config.display_size - this.config.display_margin * 2) / 24;
    },
    
    unitToPixel: function(unit) {
        return this.config.unit_to_pixel * unit;
    },

    drawFrame: function() { 
        var disp_x = 0, disp_y = 0;

        var ctx = this.ctx;
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.config.display_size, this.config.display_size);

        for(var i = 0; i < this.planets.length; i++) {
            var planet = this.planets[i];

            ctx.fillStyle = this.config.teamColor[planet.owner]

            disp_x = this.unitToPixel(planet.x) + this.config.display_margin;
            disp_y = this.unitToPixel(planet.y) + this.config.display_margin;
            ctx.beginPath();
            ctx.arc(this.canvas.width - disp_x, disp_y, this.config.planet_pixels[planet.growthRate], 0, Math.PI*2, true); 
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.fillText(planet.numShips, this.canvas.width - disp_x, disp_y+5);
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
        this.drawFrame();
    },
    
    _eof: true
};

(function($) {
    Visualizer.setup();
    Visualizer.initMap(data.map);
})(window.jQuery);