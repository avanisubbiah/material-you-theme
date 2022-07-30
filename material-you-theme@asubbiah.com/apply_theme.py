import os, sys
import json
from PIL import Image
from utils.theme_utils import *

img = Image.open(sys.argv[2][7:])
small_img = img.resize((256, 256))
theme = themeFromImage(small_img)

f_bp = open(sys.argv[1] + '/base_presets.json')
f_cm = open(sys.argv[1] + '/color_mapping.json')
base_presets = json.load(f_bp)
color_mapping = json.load(f_cm)

scheme = None
base_dl = None
if (sys.argv[3] == "dark"):
    scheme = theme['schemes']['dark']
    base_dl = base_presets['dark']
elif (sys.argv[3] == "light"):
    scheme = theme['schemes']['light']
    base_dl = base_presets['light']

for key in scheme.props.keys():
    scheme.props[key] = '#' + hex(scheme.props[key])[4:]

for key in color_mapping.keys():
    base_dl["variables"][key] = scheme.props[color_mapping[key]]

css = ""
for key, val in base_dl["variables"].items():
    css += f"@define-color {key} {val};\n"
for prefix_key, prefix_val in base_dl["palette"].items():
    for key, val in base_dl["palette"][prefix_key].items():
        css += f"@define-color {prefix_key + key} {val};\n"

with open(os.environ['HOME'] + "/.config" + "/gtk-4.0/gtk.css", 'w', encoding="utf-8") as file:
    file.write(css)
with open(os.environ['HOME'] + "/.config" + "/gtk-3.0/gtk.css", 'w', encoding="utf-8") as file:
    file.write(css)

f_bp.close()
f_cm.close()