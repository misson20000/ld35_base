import * as BlobUtil from "blob-util";
import {AssetManager} from "./assetmgr.js";
import {Colors, Color, ColorUtils} from "./gfxutils.js";
import TexturedMaterial from "./material/textured.js";

export let FontLoader = {
  canLoad(placeholder) {
    return placeholder.spec.type == "font";
  },
  load(placeholder){
    return AssetManager.getFile(placeholder.spec.xml).then((blob) => {
      return BlobUtil.blobToBinaryString(blob).then((str) => {
        return new DOMParser().parseFromString(str, "application/xml");
      });
    }).then((doc) => {
      let root = doc.firstChild;
      if(root.nodeName != "Font") {
        throw "Bad font descriptor file (root element is <" + root.nodeName + ">)";
      }
      
      let font = {
        height: parseInt(root.getAttribute("height")),
        glyphs: {}
      };
      
      for(let i = 0; i < root.children.length; i++) {
        let ch = root.children[i];
        let glyph = {};
        
        let offset = ch.getAttribute("offset").split(" ");
        glyph.offsetx = parseInt(offset[0]);
        glyph.offsety = parseInt(offset[1]);
        
        let rect = ch.getAttribute("rect").split(" ").map((str) => {
          return parseInt(str);
        });
        glyph.rectx = rect[0];
        glyph.recty = rect[1];
        glyph.rectw = rect[2];
        glyph.recth = rect[3];
        
        glyph.width = parseInt(ch.getAttribute("width"));
        
        font.glyphs[ch.getAttribute("code")] = glyph;
      }
      return placeholder.depend(placeholder.spec.texture).then((tex) => {
        font.texture = tex;
        return font;
      });
    });
  }
};


export default (r, asset) => {
  let material = TexturedMaterial(r, AssetManager.getAsset("base.shader.flat.texcolor"));

  let color = Colors.WHITE;
  let shadow = Color(0, 0, 0, 0.5);
  material.setColor(color);
  
  let self = {
    setColor(newColor) {
      material.setColor(newColor);
      color = newColor;
    },
    setMatrix(matrix) {
      material.setMatrix(matrix);
    },
    height() {
      return asset.height;
    },
    width(str) {
      let w = 0;
      for(let i = 0; i < str.length; i++) {
        w+= (asset.glyphs[str[i]] || asset.glyphs["?"]).width;
      }
      return w;
    },
    draw(str, x, y, z) {
      if(z === undefined) { z = 0; }
      for(let i = 0; i < str.length; i++) {
        let g = asset.glyphs[str[i]] || asset.glyphs["?"];
        if(!asset.glyphs[str[i]]) {
          console.log("no glyph for '" + str[i] + "'");
        }
        material.rect(x + g.offsetx, y + g.offsety,
                      g.rectw, g.recth, asset.texture,
                      g.rectx / asset.texture.width,
                      g.recty / asset.texture.height,
                      g.rectw / asset.texture.width,
                      g.recth / asset.texture.height);

        x+= g.width;
      }
    },
    drawShadowed(str, x, y, z=0) {
      material.setColor(shadow);
      self.draw(str, x-1, y+1, z);
      material.setColor(color);
      self.draw(str, x, y, z);
    }
  };
  return self;
};
