Planet Wars Canvas Visualizer
=============================

This is an HTML 5 Canvas based visualizer for the 2010 Google AI Challenge.


Chrome, Safari, and Firefox support. IE not supported.


Local Usage
-----------

To see your games locally, get a copy of visualizer, place it in a folder called 'visualizer', then pipe the output of the game to `visualize_localy.py`. For example:

    java -jar tools/PlayGame.jar map.txt 100 100 log "./bot1" "./bot2" | \
    python visualizer/visualize_localy.py
    
    
Website Use
-----------

Modify index.php to include your saved gamedata.