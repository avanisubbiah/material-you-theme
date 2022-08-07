const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

// TODO: import this from extension.js
const PREFS_SCHEMA = 'org.gnome.shell.extensions.material-you-theme';

function init() {}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings(PREFS_SCHEMA);

    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // TODO: internationalize
    const vibrant_row = new Adw.ActionRow({
        title: "Use Vibrant Material You Colors",
    });
    group.add(vibrant_row);

    // Create the switch and bind its value
    const vibrant_toggle = new Gtk.Switch({
        active: settings.get_boolean("vibrant"),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        "vibrant",
        vibrant_toggle,
        "active",
        Gio.SettingsBindFlags.DEFAULT
    );

    vibrant_row.add_suffix(vibrant_toggle);
    vibrant_row.activatable_widget = vibrant_toggle;

    // Add our page to the window
    window.add(page);
}
