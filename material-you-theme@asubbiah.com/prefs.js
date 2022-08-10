// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
/* exported init buildPrefsWidget */

const { Adw, Gio, GLib, GObject, Gtk } = imports.gi;

function init() {}

const ExtensionUtils = imports.misc.extensionUtils;

const PREFS_SCHEMA = "org.gnome.shell.extensions.material-you-theme";

// Todo: Add custom css
class ColorSchemeRow extends Adw.ActionRow {
    static {
        GObject.registerClass(this);
    }

    constructor(name) {
        const check = new Gtk.CheckButton({
            action_name: "color.scheme",
            action_target: new GLib.Variant("s", name),
        });

        super({
            title: name,
            activatable_widget: check,
        });
        this.add_prefix(check);
    }
}

class ColorSchemeGroup extends Adw.PreferencesGroup {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super({ title: "Color Profile" });

        this._actionGroup = new Gio.SimpleActionGroup();
        this.insert_action_group("color", this._actionGroup);

        this._settings = ExtensionUtils.getSettings(PREFS_SCHEMA);
        this._actionGroup.add_action(this._settings.create_action("scheme"));

        this.connect("destroy", () => this._settings.run_dispose());

        this._addTheme("Default");
        this._addTheme("Vibrant");
        this._addTheme("Expressive");
        this._addTheme("Fruit Salad");
        this._addTheme("Muted");
    }

    _addTheme(name) {
        const row = new ColorSchemeRow(name);
        this.add(row);
    }
}

function fillPreferencesWindow(window) {
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const color_scheme_group = new ColorSchemeGroup();
    page.add(color_scheme_group);

    // Add our page to the window
    window.add(page);
}
