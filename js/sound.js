import * as BlobUtil from "blob-util";

import {AssetManager} from "./assetmgr.js";

export let SoundEngine = (game) => {
  let ctx = new AudioContext();

  let sfx = {
    createAssetLoader() {
      let loaders = {
        "sound": (placeholder) => {
          return AssetManager.getFile(placeholder.spec.src).then((blob) => {
            return BlobUtil.blobToArrayBuffer(blob);
          }).then((ab) => {
            return ctx.decodeAudioData(ab);
          }).then((audio) => {
            return audio;
          });
        },
        "music": (placeholder) => {
          let trackPath = placeholder.spec.src;
          let media = new Audio();
          media.loop = false;
          return new Promise((resolve, reject) => { //pre-buffer enough of the track
            media.oncanplaythrough = () => {resolve(media);};
            media.onerror = () => {
              reject(["!?!?!",
                      "MEDIA_ERR_ABORTED",
                      "MEDIA_ERR_NETWORK",
                      "MEDIA_ERR_DECODE",
                      "MEDIA_ERR_SRC_NOT_SUPPORTED"][media.error.code] + " on track '" + name + "', source " + i + " (" + track[i] + " -> " + AssetManager.getURL(track[i]) + ")");
            };
            AssetManager.getFile(trackPath).then((blob) => {
              media.src = BlobUtil.createObjectURL(blob);
            });
          });
        }
      };
      
      return {
        canLoad(placeholder) {
          return loaders[placeholder.spec.type] != undefined;
        },
        load(placeholder) {
          return loaders[placeholder.spec.type](placeholder);
        }
      };
    },
    playSound(buffer) {
      if(buffer) {
        let source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        return source;
      }
    },
    createSound(buffer) {
      let source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      return source;
    },
    playMusic(asset) {
      let gain = ctx.createGain();
      let src = ctx.createMediaElementSource(asset);
      src.connect(gain);
      gain.connect(ctx.destination);
      asset.currentTime = 0;
      asset.play();
      
      let music = {
        update() {
        },
        stop() {
          src.pause();
        },
        fadeOut() {
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        }
      };
      return music;
    }
  };

  return sfx;
};
