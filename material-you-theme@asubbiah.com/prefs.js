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
    const show_notifications_row = new Adw.ActionRow({
        title: "Show Notifications",
    });
    group.add(show_notifications_row);

    // Create the switch and bind its value
    const show_notifications_toggle = new Gtk.Switch({
        active: settings.get_boolean("show-notifications"),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        "show-notifications",
        show_notifications_toggle,
        "active",
        Gio.SettingsBindFlags.DEFAULT
    );

    show_notifications_row.add_suffix(show_notifications_toggle);
    show_notifications_row.activatable_widget = show_notifications_toggle;

    // Add our page to the window
    window.add(page);
}
