# Change Log

All notable changes to the "anno-modding-tools" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 1.11 Live ModOp Analysis

- 1.10.2: Improved xmltest, annodiff performance
- 1.10.1: Changed live test to on save instead of on edit.
- 1.10.1: Groups show in outline.
- 1.10.1: Added ModOp performance decorations.
- Added live ModOp analysis with xmltest. Can be disabled in the VSCode settings.

## 1.10 Symbols & Fast Navigation by GUID

- 1.10.5: Fixed outline showing GUID instead of template name
- 1.10.4: Show ModOp time only in compare
- 1.10.4: Minor GUID tooltip, decoration improvements
- 1.10.3: Fixed compare on files and with Include tags
- 1.10.2: Increased annodiff buffer and added specific error for that case
- 1.10.1: Fixed workspace symbols for custom assets
- Added `F12` Go to symbols for custom and vanilla assets
- Added `Ctrl+T` workspace symbols for vanilla assets
- Fixed `Ctrl+Space` GUID auto completion

## 1.9 Inline GUID Decorations, Translation Helpers

- 1.9.4: Fixed GUID decorations not working due to invalid modinfo.json in some mods
- 1.9.3: Fixed GUID decorations being applied on all files
- 1.9.2: Added file `FileName` checks to `.cfg` files
- 1.9.2: File checks now also searches `ModDependencies`, `OptionalDependencies` and `LoadAfterIds` if `modsFolders` is set in the vscode configuration.
- 1.9.2: Improved GUID decoration for `<Asset>` and within `<Standard>` section
- 1.9.2: GUIDs from other mods now also show the mod name
- 1.9.1: Fixed crash with large XML files
- 1.9.1: Fixed `<Asset>` within triggers wrongly decorated with asset name
- 1.9.1: Added setting `Check File Names` to allow disabling file checks
- Support loader 10 features (i.e. Group, Condition, ...)
- Added inline GUID decoration with name and template
- Added `Anno: Find Missing Text`
- Added `Anno: Update Missing Text from English`
- Added file checks for `IconFilename`, `Filename` and `FileName`
- Compare with Vanilla: support `templates.xml` and `texts_*.xml`
- Buildmod: read `base64.jpg` as base64 image into `modinfo.json`

## 1.8 Compare ModOp Result

- Added support for multiple source folders in `annomod.json`.
- Added `Anno: Compare with Vanilla` command to `annomod.json` context menu.
- Added `Anno: Run Patch Tests` command to `annomod.json` context menu.
- Added `Anno: Compare with Vanilla` command to the code editor.
  All touched ModOps in within the selection will be checked.
- Added `Include` ModOps to outline.

## [1.7.0]

- Added `Anno: Compare with Vanilla` right click command for `assets*.xml` files.
  That command will apply the mod and show you all changed assets in a diff view.

## [1.6.5]

- Copy `assets_.xml` to `assets.xml` to allow fallback ModOps for wrong installations
- Fixed assets XML search being endless in some cases
- GUIDs for auto completion and hover will be searched in the complete mod folder now
- Updated assets, GUIDs for GU16

## [1.6.2]

### Changed

- Show outline for `texts_*.xml`
- Updated assets, GUIDs for GU15
- Updated `xmltest` to modloader 0.9
- Updated reserved GUID ranges

## [1.6.1]

### Changed

- Fixed `.rdp` and `.rdp.xml` conversions
- Fixed missing empty `ModOp` in outline
- Show outline for `templates.xml`
- `ImyaTweak`, `ImyaExpose` and `Include` as valid tags in `assets.xml`

## [1.6.0]

### Added

- Convert `_r_a.png` to `_metal.dds`

### Changed

- Issue scan will now only consider `assets*.xml` and `test/*-input.xml` / `test/*-expectation.xml`
- Double tick quotation (i.e. `GUID="`) properly triggers GUID conversion now

## [1.5.0]

### Added

- Right-click on `.gltf` to convert to `.rdm`

### Changed

- Allow more than one layer of bones for animations

## [1.4.0]

### Added

- Convert `_rga.png` to `_norm.dds`

### Changed

- Fixed import of dummies without mesh
- Better detection of tags expecting GUIDs in assets.xml
- Ignore `.001` etc. when importing `fc_` feedbacks or `dummy_` feedbacks

## [1.3.1]

### Changed

- Ignore assets.xml with 20MB+ size

## [1.3.0]

### Added

- XSD for validation and auto complete (in combination with Red Hat XML plugin)

### Changed

- Fixed GUIDs sometimes being not found
- Improved GUID auto conversion

## [1.2.0]

### Added

- CF7 support in cfgyaml

## [1.1.0]

### Added

- GU14 GUIDs
- Added `PriorityFeedbackBlocker` to IFO import
- Added multiple `BuildBlocker` to IFO import
- Support hitbox rotation for IFO import

## [1.0.0]

Bump version to 1.0 as the majority of features I want as of now are implemented.

### Added

- Cache textures when building mods
- Support mesh-less objects in gltf (for props)
- Support arrays in cfgyaml

### Modified

- Fixed bug in cfgyaml conversion where `ADJUST_TO_TERRAIN_HEIGHT` would turn into `ADJUST.TO_TERRAIN_HEIGHT`.
- Fixed rotation in Feedbackblocker etc not being applied.
- Decal import now imports `y` instead of setting it to always 0.25

## [0.7.0]

### Added

- `xpath-add` to add new sections with `.cfg.yaml` files.

## [0.6.1]

### Changed

- Fixed CF7 `<Dummies><i>` import not finding elements.

## [0.6.0]

### Added

- Anno Prop Config `.prp` outline and syntax highlighting
- Outlines for files with `</>` syntax
- Hitbox import from glTF into `.ifo`
- UnevenBlocker import from glTF into `.ifo`
- FeedbackBlocker import from glTF into `.ifo`
- Dummy import from glTF into `.ifo`

## [0.5.2]

### Changed

- Fixed issue with buildmod failing with files.json when no .modcache is needed

## [0.5.1]

### Changed

- Improved outline name detection for .cf7 feedback definitions
- Support `${annoRda}` in command line mode
- Fixed issue with some features not loading properly

## [0.5.0]

### Added

- Build mod command as script in NPM package for standalone execution
- First unit tests

### Changed

- Fixed GUID hover in XPath strings
- Added Clothes/CLOTH to outlines
- Internal optimizations
- Replaced texconv with annotex/bc7enc for better non-GPU build performance

## [0.4.1]

### Changed

- Fixed outline issues with self-closing or unkown tags in .cfg files

## [0.4.0]

### Added

- assets.xml outline
- GUID hover and auto-complete now also consider GUIDs from the open assets.xml
- Path variable `${annoRda}` to derive from vanilla .cfg files in .cfg.yaml
- Automatic `xmltest.exe` execution for builds on assets.xml.

## [0.3.2]

### Changed

- Use BC1_UNORM for `_mask.png` textures.
- cfgyaml source can now be in a different folder.

## [0.3.1]

### Changed

- Renamed to Modding Tools for Anno to be less trademark offensive.

## [0.3.0]

### Added

- `.rdp.xml` <> `.rdp` conversion for annomod.json and right-click menus.
- `.cfg.yaml` > `.cfg`, `.ifo`, `.fc` generation for annomod.json and right-click menus.
- Import CFG `FILE` sections with `Import PROPs from glTF`.
- Import FC `Dummy` position and orientation with `Import from glTF`.
- Don't overwrite files with `Convert to ..` context menu commands
- Hover info for asset keywords like `UpgradeList` and `ResidenceUpgrade`
- Auto-complete after typing `GUID='`

### Changed

- Included AnnoFCConverter fix to deal with ending empty lines in .cf7

## [0.2.0]

### Added

- Support animations in glTF conversion.
- Show model animation in .cfg outline
- Option to move files to `maps`, `rdm` and `anim`

### Changed

- Allow lods: 0 for gltf exporter to disable adding `_lod0` to the name.

## [0.1.1]

### Changed

- Activate on .xml. This fixes an issue when opening single assets.xml files.
  Activation on assets.xml is unfortunately only possible when opening folders and workspaces.

## [0.1.0]

### Added

- LOD generation for `texture` converter
- Asset name on hover over GUIDs in XPath strings and in tags `Ingredient`, `Product`, `ItemLink` or `GUID`.
  Supported assets are limited to products, items, buildings, pools (to maintain speed and usability).
- Asset name to GUID conversion when in tags (same as hover).
  Supported assets are limited to products and items.
- Setting to control folder depth shown in .cfg outline
- Right-click `Build Anno Mod` on `annomod.json`

## [0.0.11]

### Added

- Better license information

## [0.0.10]

- Initial prototyping release
- Anno-specific outlines: `.cfg`, `.ifo`, `.cf7`
- Anno-specific syntax highlighting: `.cfg`, `.ifo`, `.cf7`
- Right-click `Import from glTF` (targets: `.cfg`, `.ifo`)
- Right-click `Convert to Anno .cf7`, `Convert to Anno .fc`
- Right-click `Convert to glTF Binary` from `.rdm`
- Right-click `Convert to DDS`, `Convert to PNG`
- Command `Build Anno Mod` to build project using `annomod.json` description.
