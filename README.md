# Material You Color Theming
Applies generated libadwaita theme from wallpaper using Material You

![extension-screenshot](https://i.imgur.com/VLXfoEa_d.webp?maxwidth=2160&shape=thumb&fidelity=high)

<div align="center">
  <a href="<div align="center">
  <h1>Rounded Window Corners</h1>
  <p><i>A gnome-shell extensions that try to add rounded corners for all windows</i></p>
  <a href="https://extensions.gnome.org/extension/5236/material-you-color-theming/">
    <img src="https://img.shields.io/badge/Install%20from-extensions.gnome.org-4A86CF?style=for-the-badge&logo=Gnome&logoColor=white"/>
  </a>  
</div>

## Installation
Copy the extension to your extensions folder (create the folder if it does not exist).
```
git clone https://github.com/avanishsubbiah/material-you-theme
cd material-you-theme
make && make install
```
Log out and log back in and you should be able to enable it in your extension manager.

NOTE: Using the extension now will theme your native installed libadwaita apps, follow the steps below to have the theme apply to GTK3 and flatpak apps.

### Libadwaita
#### Native
Theming for native libadwaita will work by default.
#### Flatpak
Install [Flatseal](https://github.com/tchx84/Flatseal), and add `xdg-config/gtk-4.0:ro` to **Other Files** under the category **Filesystem** in the **All Applications** section.

### GTK3
#### Native
Install the [adw-gtk3](https://github.com/lassekongo83/adw-gtk3) theme and apply it.
#### Flatpak
After installing the [adw-gtk3](https://github.com/lassekongo83/adw-gtk3) add `xdg-config/gtk-3.0:ro` to **Other Files** under the category **Filesystem** in the **All Applications** section using [Flatseal](https://github.com/tchx84/Flatseal).

## Usage
Once the extension is enabled there will be a paint icon in the status area. Toggling Dark Mode will apply the appropriate material light/dark theme generated using your current wallpaper. If you change your wallpaper, you will need to click **Refresh Material Theme** to regenerate and reapply a new material light/dark theme.
