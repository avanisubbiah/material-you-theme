const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const EXTENSIONDIR = Me.dir.get_path();

function check_sass() {
    const local_file = Gio.File.new_for_path(EXTENSIONDIR + "/node_modules/sass/sass.js");
    const global_file = Gio.File.new_for_path("/usr/bin/sassc");
    if (local_file.query_exists(null) || global_file.query_exists(null)) {
        return true
    } else {
        return false
    }
}

function get_sass_path() {
    const local_path = EXTENSIONDIR + "/node_modules/sass/sass.js";
    const global_path = "/usr/bin/sassc";
    const local_file = Gio.File.new_for_path(local_path);
    const global_file = Gio.File.new_for_path(global_path);
    if (local_file.query_exists(null)) {
        return local_path;
    } else if (global_file.query_exists(null)) {
        return global_path;
    }
}
