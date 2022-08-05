const {GLib, Gio} = imports.gi;

var Stats = class Stats {
    constructor(g_info) {
        this.info = g_info
    }

    isFile() {
        const type = this.info.get_file_type();
        if (type == 1) {
            return true;
        } else {
            return false;
        }
    }

    isDirectory() {
        const type = this.info.get_file_type();
        if (type == 2) {
            return true;
        } else {
            return false;
        }
    }
}

var sussyfs = class sussyfs {
    static readFileSync(path, encoding) {
        const file = Gio.File.new_for_path(path);

        // Synchronous, blocking method
        const [, contents, etag] = file.load_contents(null);
        const decoder = new TextDecoder(encoding);
        const contentsString = decoder.decode(contents);
        return contentsString
        // return fs.readFileSync(path, encoding);
    }
    static writeFileSync(path, contents) {
        const file = Gio.File.new_for_path(path);
        const [, etag] = file.replace_contents(contents, null, false,
            Gio.FileCreateFlags.REPLACE_DESTINATION, null);
        // fs.writeFileSync(path, contents);
    }
    static existsSync(path) {
        return true;
        // return fs.existsSync(path);
    }
    static unlinkSync(path) {
        const file = Gio.File.new_for_path(path);
        // Synchronous, blocking method
        file.delete(null);
        // fs.unlinkSync(path);
    }
    // static readdirSync(path) {
    //     // return fs.readdirSync(path);
    // }
    static statSync(path) {
        const file = Gio.File.new_for_path(path);
        const info = file.query_info('standard::*',
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
        return new Stats(info);
        // return fs.statSync(path);
    }
    static mkdirSync(path) {
        const file = Gio.File.new_for_path(path);
        file.make_directory(null);
        // fs.mkdirSync(path);
    }
}