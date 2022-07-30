/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';
const WALLPAPER_SCHEMA = 'org.gnome.desktop.background';

const { GObject, St } = imports.gi;
const {Gio, GLib, Soup, GdkPixbuf, Gdk} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Me = ExtensionUtils.getCurrentExtension();
const math_utils = Me.imports.utils.math_utils;
const image_utils = Me.imports.utils.image_utils;
const theme_utils = Me.imports.utils.theme_utils;
const { base_presets } = Me.imports.base_presets;
const { color_mapping } = Me.imports.color_mapping;

const EXTENSIONDIR = Me.dir.get_path();
const PYTHONFILE = "apply_theme.py"

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));
        // face-smile-symbolic
        this.add_child(new St.Icon({
            icon_name: 'applications-graphics-symbolic',
            style_class: 'system-status-icon',
        }));

        let item_light = new PopupMenu.PopupMenuItem(_('Apply Material Light Theme'));
        let item_dark = new PopupMenu.PopupMenuItem(_('Apply Material Dark Theme'));
        let gsettings = new Gio.Settings({ schema: WALLPAPER_SCHEMA });
        let wall_path = gsettings.get_string('picture-uri');
        let pix_buf = GdkPixbuf.Pixbuf.new_from_file_at_size(wall_path.substring(7), 256, 256);
        item_light.connect('activate', () => {
            apply_theme(pix_buf, base_presets, color_mapping, false);
            Main.notify("Applying Material You Light Theme", "Some apps may require re-logging in to update")
        });
        item_dark.connect('activate', () => {
            apply_theme(pix_buf, base_presets, color_mapping, true);
            Main.notify("Applying Material You Dark Theme", "Some apps may require re-logging in to update")
        });
        this.menu.addMenuItem(item_light);
        this.menu.addMenuItem(item_dark);
    }
});


let cancellable = null;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        if (cancellable === null)
            cancellable = new Gio.Cancellable();
        
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);

        log(math_utils.signum(3));
    }

    disable() {
        if (cancellable !== null) {
            cancellable.cancel();
            cancellable = null;
        }

        log("Executor stopped");

        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

function apply_theme(pix_buf, base_presets, color_mapping, is_dark = false) {
    // Getting Material theme from img
    let theme = theme_utils.themeFromImage(pix_buf);

    // Configuring for light or dark theme
    let scheme = theme.schemes.light.props;
    let base_preset = base_presets.light;
    if (is_dark) {
        scheme = theme.schemes.dark.props;
        base_preset = base_presets.dark;
    }

    // Converting argb to hex
    for (const key in scheme) {
        scheme[key] = '#' + scheme[key].toString(16).substring(2);
    }

    // Overwritting keys in base_preset with material colors
    for (const key in color_mapping) {
        base_preset.variables[key] = scheme[color_mapping[key]];
    }

    // Generating gtk css from preset
    let css = "";
    for (const key in base_preset.variables) {
        css += "@define-color " + key + " " + base_preset.variables[key] + ";\n"
    }
    for (const prefix_key in base_preset.palette) {
        for (const key_2 in base_preset.palette[prefix_key]) {
            css += "@define-color " + prefix_key + key_2 + " " + base_preset.palette[prefix_key][key_2] + ";\n"
        }
    }

    let config_path = GLib.get_home_dir() + "/.config";
    write_str(css, config_path + "/gtk-4.0/gtk.css");
    write_str(css, config_path + "/gtk-3.0/gtk.css");
}

async function write_str(str, path) {
    const file = Gio.File.new_for_path(path);

    const [, etag] = await new Promise((resolve, reject) => {
        file.replace_contents_bytes_async(
            new GLib.Bytes(str),
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null,
            (file_, result) => {
                try {
                    resolve(file.replace_contents_finish(result));
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
}