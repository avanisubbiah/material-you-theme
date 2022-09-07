#!/bin/bash

make && make install
rm -r ~/.local/share/gnome-shell/extensions/material-you-theme@asubbiah.com/*
cp 'material-you-theme@asubbiah.com.shell-extension.zip' ~/.local/share/gnome-shell/extensions/material-you-theme@asubbiah.com
rm 'material-you-theme@asubbiah.com.shell-extension.zip'
cd ~/.local/share/gnome-shell/extensions/material-you-theme@asubbiah.com
unzip 'material-you-theme@asubbiah.com.shell-extension.zip'
rm 'material-you-theme@asubbiah.com.shell-extension.zip'
