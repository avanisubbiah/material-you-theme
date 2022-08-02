all: update-po build

build:
	gnome-extensions pack -f \
		./material-you-theme@asubbiah.com/ \
		--extra-source=blend \
		--extra-source=hct \
		--extra-source=palettes \
		--extra-source=quantize \
		--extra-source=scheme \
		--extra-source=score \
		--extra-source=utils \
		--extra-source=base_presets.js \
		--extra-source=color_mappings.js \
		-o .

install:
	gnome-extensions install -f \
		material-you-theme@asubbiah.com.shell-extension.zip

pot:
	mkdir -p material-you-theme@asubbiah.com/po
	xgettext --from-code=UTF-8 \
		material-you-theme@asubbiah.com/extension.js \
		-o material-you-theme@asubbiah.com/po/material-you-theme.pot

update-po: pot
	for po_file in material-you-theme@asubbiah.com/po/*.po; do \
		msgmerge --update "$$po_file" material-you-theme@asubbiah.com/po/material-you-theme.pot; \
	done
