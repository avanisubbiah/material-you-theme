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
const {Gio, GLib, Soup, GdkPixbuf} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Me = ExtensionUtils.getCurrentExtension();
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
        item_light.connect('activate', () => {
            let gsettings = new Gio.Settings({ schema: WALLPAPER_SCHEMA });
            let wall_path = gsettings.get_string('picture-uri');
            let command = 'python ' + EXTENSIONDIR + '/' + PYTHONFILE + " " + EXTENSIONDIR + " " + wall_path + " light";
            refresh({"command": command, "interval": 60});
            Main.notify("Applying Material You Dark Theme", "Some apps may require re-logging in to update")
            // let loop = GLib.MainLoop.new(null, false);

            // try {
            //     let proc = Gio.Subprocess.new(
            //         ['python', EXTENSIONDIR + '/' + PYTHONFILE, EXTENSIONDIR, wall_path],
            //         Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            //     );
    
            //     proc.communicate_utf8_async(null, null, (proc, res) => {
            //         try {
            //             let [, stdout, stderr] = proc.communicate_utf8_finish(res);
    
            //             if (proc.get_successful()) {
            //                 Main.notify(_(stdout));
            //             } else {
            //                 throw new Error(stderr);
            //             }
            //         } catch (e) {
            //             logError(e);
            //         } finally {
            //             loop.quit();
            //         }
            //     });
            // } catch (e) {
            //     logError(e);
            // }
    
            // loop.run();
        });
        item_dark.connect('activate', () => {
            let gsettings = new Gio.Settings({ schema: WALLPAPER_SCHEMA });
            let wall_path = gsettings.get_string('picture-uri');
            let command = 'python ' + EXTENSIONDIR + '/' + PYTHONFILE + " " + EXTENSIONDIR + " " + wall_path + " dark";
            refresh({"command": command, "interval": 60});
            Main.notify("Applying Material You Dark Theme", "Some apps may require re-logging in to update")
            // let loop = GLib.MainLoop.new(null, false);

            // try {
            //     let proc = Gio.Subprocess.new(
            //         ['python', EXTENSIONDIR + '/' + PYTHONFILE, EXTENSIONDIR, wall_path],
            //         Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            //     );
    
            //     proc.communicate_utf8_async(null, null, (proc, res) => {
            //         try {
            //             let [, stdout, stderr] = proc.communicate_utf8_finish(res);
    
            //             if (proc.get_successful()) {
            //                 Main.notify(_(stdout));
            //             } else {
            //                 throw new Error(stderr);
            //             }
            //         } catch (e) {
            //             logError(e);
            //         } finally {
            //             loop.quit();
            //         }
            //     });
            // } catch (e) {
            //     logError(e);
            // }
    
            // loop.run();
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

async function refresh(command) {
    try {
        await updateGui(command);

        // Don't use MainLoop anymore, just use GLib directly
        GLib.timeout_add_seconds(0, command.interval, () => {
            if (cancellable && !cancellable.is_cancelled())
                // refresh(command);

            // Always explicitly return false (or this constant)
            // unless you're storing the returned ID to remove the
            // source later.
            //
            // Returning true (GLib.SOURCE_CONTINUE) or a value that
            // evaluates to true will cause the source to loop. You
            // could refactor your code to take advantage of that
            // instead of constantly creating new timeouts each
            // second.
            return GLib.SOURCE_REMOVE;
        });
    } catch (e) {
        // We can skip logging cancelled errors, since we probably
        // did that on purpose if it happens
        if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
            logError(e, 'Failed to refresh');
    }
}

// `updateGui()` is wrapped in a try...catch above so it's safe to
// skip that here.
async function updateGui(command) {
    let stdout = await execCommand(command.command);

    // This will probably always be true if the above doesn't throw,
    // but you can check if you want to.
    if (stdout) {
        let outputAsOneLine = stdout.replace('\n', '');

        // No need to check the cancellable here, if it's
        // triggered the command will fail and throw an error
        log(outputAsOneLine);
        // let outputLabel = panelBox.get_first_child();
        // outputLabel.set_text(outputAsOneLine);   
    }
}

function execCommand(argv, input = null, cancellable = null) {
    try {
        /* If you expect to get output from stderr, you need to open
         * that pipe as well, otherwise you will just get `null`. */
        let flags = (Gio.SubprocessFlags.STDOUT_PIPE |
                     Gio.SubprocessFlags.STDERR_PIPE);

        if (input !== null)
            flags |= Gio.SubprocessFlags.STDIN_PIPE;

        /* Using `new` with an initable class like this is only really
         * necessary if it's possible you might pass a pre-triggered
         * cancellable, so you can call `init()` manually.
         *
         * Otherwise you can just use `Gio.Subprocess.new()` which will
         * do exactly the same thing for you, just in a single call
         * without a cancellable argument. */
        log(argv)
        let proc = new Gio.Subprocess({
            argv: argv.split(" "),
            flags: flags
        });
        proc.init(cancellable);

        /* If you want to actually quit the process when the cancellable
         * is triggered, you need to connect to the `cancel` signal */
        if (cancellable instanceof Gio.Cancellable)
            cancellable.connect(() => proc.force_exit());

        /* Remember the process start running as soon as we called
         * `init()`, so this is just the threaded call to read the
         * processes's output.
         */
        return new Promise((resolve, reject) => {
            proc.communicate_utf8_async(input, cancellable, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);

                    /* If you do opt for stderr output, you might as
                     * well use it for more informative errors */
                    if (!proc.get_successful()) {
                        let status = proc.get_exit_status();

                        throw new Gio.IOErrorEnum({
                            code: Gio.io_error_from_errno(status),
                            message: stderr ? stderr.trim() : GLib.strerror(status)
                        });
                    }

                    resolve(stdout);
                } catch (e) {
                    reject(e);
                }
            });
        });

    /* This should only happen if you passed a pre-triggered cancellable
     * or the process legitimately failed to start (eg. commmand not found) */
    } catch (e) {
        return Promise.reject(e);
    }
}