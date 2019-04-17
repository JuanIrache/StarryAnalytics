var paletteHelper;
function setPaletteHelper() {
  paletteHelper = (function() {
    var palettesJSON = loadJSON('palettes.json');
    var palettes;
    return {
      loadPalettes: function() {
        palettes = palettesJSON.palettes;
        paletteHelper.loadPalette();
      },
      palette: [],
      loadPalette: function() {
        paletteHelper.palette = palettes[floor(random(0, palettes.length))];
      }
    };
  })();
}
