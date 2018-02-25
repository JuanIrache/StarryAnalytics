var paletteHelper;
function setPaletteHelper() {
  paletteHelper = function() {
    let palettesJSON = loadJSON("palettes.json");
    let palettes;
    return {
      loadPalettes:function() {
        palettes = palettesJSON.palettes;
        paletteHelper.loadPalette();
      },
      palette:[],
      loadPalette:function() {
        paletteHelper.palette = palettes[floor(random(0,palettes.length))];
      }
    }
  }();
}
