<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <!--[if IE]><![endif]-->

  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title></title>
  <meta name="description" content="">
  <meta name="author" content="">
  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
  <link rel="stylesheet" href="css/style.css?v=1">
  <script src="js/modernizr-1.5.min.js"></script>
  
  <script>
<?php
$input = file_get_contents('input');
echo 'var data = "' . $input . '"';
?>
  </script>

</head>
<!--[if lt IE 7 ]> <body class="ie6"> <![endif]-->
<!--[if IE 7 ]>    <body class="ie7"> <![endif]-->
<!--[if IE 8 ]>    <body class="ie8"> <![endif]-->
<!--[if IE 9 ]>    <body class="ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <body> <!--<![endif]-->

  <div id="container">
    <header>
        <h1>PlanetWars visualizer</h1>
    </header>
    
    <div id="main">
        <canvas id="display" width="640" height="640"></canvas>
        <p id="controls">
            <a href="#" id="start-button">Begin</a> | 
            <a href="#" id="prev-frame-button">&lt;</a> | 
            <a href="#" id="play-button">Start</a> | 
            <a href="#" id="next-frame-button">&gt;</a> | 
            <a href="#" id="end-button">End</a>
        </p>
    </div>
    
    <footer>

    </footer>
  </div> <!-- end of #container -->

  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
  <script>!window.jQuery && document.write('<script src="js/jquery-1.4.2.min.js"><\/script>')</script>
  <script src="js/visualizer.js?v=1"></script>

  <!--[if lt IE 7 ]>
    <script src="js/dd_belatedpng.js?v=1"></script>
  <![endif]-->  
</body>
</html>