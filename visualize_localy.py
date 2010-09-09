#!/usr/bin/env python
"""
This module lets you run a command like:

    java -jar tools/PlayGame.jar map.txt 100 100 log "./bot1" "./bot2" | \
    python visualizer/visualize_localy.py

It then generates the visualisation and opens it in your browser. Awesome!
"""

import re
import sys
import os
import webbrowser

def generate(data, generated_path):
    path = os.path.dirname(__file__)
    template_path = os.path.join(path, 'index.php')
    template = open(template_path, 'r')
    content = template.read()
    template.close()

    php_re = re.compile(r"<\?php.*?\?>", re.S)
    javascript = "var data = '%s';" % data
    content = php_re.sub(javascript, content)

    output = open(generated_path, 'w')
    output.write(content)
    output.close()

if __name__ == "__main__":
    data = raw_input()

    path = os.path.dirname(__file__)
    generated_path = os.path.realpath(os.path.join(path, 'generated.htm'))

    generate(data, generated_path)
    webbrowser.open('file://'+generated_path)
