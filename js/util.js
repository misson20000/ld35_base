export let blobToImage = (blob) => {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (evt) => {
      reject(evt.type);
    };
    image.src = URL.createObjectURL(blob);
  });
};
