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
            const theme = theme_utils.themeFromImage(pix_buf);
            log(JSON.stringify(theme, null, 2));
            Main.notify("Applying Material You Light Theme", "Some apps may require re-logging in to update")
        });
        item_dark.connect('activate', () => {
            const theme = theme_utils.themeFromImage(pix_buf);
            log(JSON.stringify(theme, null, 2));
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
