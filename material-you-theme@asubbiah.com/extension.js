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

const WALLPAPER_SCHEMA = 'org.gnome.desktop.background';
const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';
const PREFS_SCHEMA = 'org.gnome.shell.extensions.material-you-theme';

const {Gio, GLib, Soup, GdkPixbuf, Gdk} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Me = ExtensionUtils.getCurrentExtension();
const theme_utils = Me.imports.utils.theme_utils;
const color_utils = Me.imports.utils.color_utils;
const string_utils = Me.imports.utils.string_utils;
const { base_presets } = Me.imports.base_presets;
const { color_mappings } = Me.imports.color_mappings;

const EXTENSIONDIR = Me.dir.get_path();

let _showNotifications = true;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations();
    }

    enable() {
        this._interfaceSettings = ExtensionUtils.getSettings(INTERFACE_SCHEMA);
        this._interfaceSettings.connect('changed::color-scheme', () => {
            apply_theme(base_presets, color_mappings, {width: 64, height: 64});
        });
        this._wallpaperSettings = ExtensionUtils.getSettings(WALLPAPER_SCHEMA);
        this._wallpaperSettings.connect('changed::picture-uri', () => {
            apply_theme(base_presets, color_mappings, {width: 64, height: 64});
        });

        apply_theme(base_presets, color_mappings, {width: 64, height: 64});
    }

    disable() {
        remove_theme();
        this._interfaceSettings = null;
        this._wallpaperSettings = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

function apply_theme(base_presets, color_mappings, size) {
    // Checking dark theme preference
    let is_dark = false;
    let interface_settings = new Gio.Settings({ schema: INTERFACE_SCHEMA });
    let dark_pref = interface_settings.get_string('color-scheme');
    if (dark_pref === "prefer-dark") {
        is_dark = true;
    }

    // Getting Material theme from img
    let desktop_settings = new Gio.Settings({ schema: WALLPAPER_SCHEMA });
    let wall_uri_type = "";
    if (is_dark) {
        wall_uri_type = "-dark";
    }
    let wall_uri = desktop_settings.get_string('picture-uri' + wall_uri_type);
    let wall_path = Gio.File.new_for_uri(wall_uri).get_path ()
    let pix_buf = GdkPixbuf.Pixbuf.new_from_file_at_size(wall_path, size.width, size.height);
    let theme = theme_utils.themeFromImage(pix_buf);

    // Configuring for light or dark theme
    let scheme = theme.schemes.light.props;
    let base_preset = base_presets.light;
    let color_mapping = color_mappings.light;
    let theme_str = _("Light");
    if (is_dark) {
        scheme = theme.schemes.dark.props;
        base_preset = base_presets.dark;
        color_mapping = color_mappings.dark;
        theme_str = _("Dark");
    }

    // Converting argb to hex
    for (const key in scheme) {
        scheme[key] = '#' + scheme[key].toString(16).substring(2);
    }

    // Overwriting keys in base_preset with material colors
    for (const key in color_mapping) {
        if (color_mapping[key].opacity == 1) {
            base_preset.variables[key] = scheme[color_mapping[key].color];
        } else {
            let argb = string_utils.argbFromHex(scheme[color_mapping[key].color]);
            let r = color_utils.redFromArgb(argb);
            let g = color_utils.greenFromArgb(argb);
            let b = color_utils.blueFromArgb(argb);
            rgba_str = "rgba(" + r + ", " + g + ", " + b + ", " + color_mapping[key].opacity + ")"
            base_preset.variables[key] = rgba_str;
        }
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
    create_dir(config_path + "/gtk-4.0");
    create_dir(config_path + "/gtk-3.0");
    write_str(css, config_path + "/gtk-4.0/gtk.css");
    write_str(css, config_path + "/gtk-3.0/gtk.css");

    // Get prefs
    const settings = ExtensionUtils.getSettings(PREFS_SCHEMA);
    const show_notifications = settings.get_boolean("show-notifications");

    // Notifying user on theme change
    if (show_notifications) {
        Main.notify("Applied Material You " + theme_str + " Theme",
        "Some apps may require re-logging in to update");
    }
}

function remove_theme() {
    // Undoing changes to theme when disabling extension
    delete_file(GLib.get_home_dir() + "/.config/gtk-4.0/gtk.css");
    delete_file(GLib.get_home_dir() + "/.config/gtk-3.0/gtk.css");

    // Get prefs
    const settings = ExtensionUtils.getSettings(PREFS_SCHEMA);
    const show_notifications = settings.get_boolean("show-notifications");

    // Notifying user on theme removal
    if (show_notifications) {
        Main.notify("Removed Material You Theme",
        "Some apps may require re-logging in to update");
    }
}

async function create_dir(path) {
    const file = Gio.File.new_for_path(path);
    try {
        await new Promise((resolve, reject) => {
            file.make_directory_async(
                GLib.PRIORITY_DEFAULT,
                null,
                (file_, result) => {
                    try {
                        resolve(file.make_directory_finish(result));
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    } catch (e) {
        log(e);
    }
}

async function delete_file(path) {
    const file = Gio.File.new_for_path(path);
    try {
        await new Promise((resolve, reject) => {
            file.delete_async(
                GLib.PRIORITY_DEFAULT,
                null,
                (file_, result) => {
                    try {
                        resolve(file.delete_finish(result));
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    } catch (e) {
        log(e);
    }
}

async function write_str(str, path) {
    const file = Gio.File.new_for_path(path);
    try {
        await new Promise((resolve, reject) => {
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
    } catch (e) {
        log(e);
    }
}
