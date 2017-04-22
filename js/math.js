export let Vec4 = {
  create: (x, y, z, w) => {
    if(x === undefined) {
      x = y = z = 0;
    }
    if(y === undefined) {
      y = z = x;
    }
    if(w === undefined) {
      w = 1;
    }

    let multiplyComponent = (matrix, x, y, z, w, c) => {
      return (matrix.val[0][c] * x) +
        (matrix.val[1][c] * y) +
        (matrix.val[2][c] * z) +
        (matrix.val[3][c] * w);
    };
    
    let self = {
      x,
      y,
      z,
      w,
      load(other) {
        self.x = other.x;
        self.y = other.y;
        self.z = other.z;
        self.w = other.w;
      },
      multiply(matrix) {
        let ox = self.x;
        let oy = self.y;
        let oz = self.z;
        let ow = self.w;
        self.x = multiplyComponent(matrix, ox, oy, oz, ow, 0);
        self.y = multiplyComponent(matrix, ox, oy, oz, ow, 1);
        self.z = multiplyComponent(matrix, ox, oy, oz, ow, 2);
        self.w = multiplyComponent(matrix, ox, oy, oz, ow, 3);
        return self;
      },
    };
    return self;
  }
};

export let Mat4 = {  
  create: () => {
    let multBuffer = [[],[],[],[]];

    let gl = new Float32Array(16);
    let transform = null; // lazy initialized

    let tfMat = () => {
      if(transform == null) {
        transform = Mat4.create();
      }
      return transform;
    };
    
    let self = {
      val: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ],      

      toGL() {
        for(let i = 0; i < 4; i++) {
          for(let j = 0; j < 4; j++) {
            gl[i * 4 + j] = self.val[i][j];
          }
        }

        return gl;
      },

      transform: {
        translate(x, y, z) {
          return self.multiply(tfMat().load.translate(x, y, z));
        },
        translateFloor(x, y, z) {
          return self.multiply(tfMat().load.translateFloor(x, y, z));
        },
        scale(x, y ,z) {
          return self.multiply(tfMat().load.scale(x, y, z));
        },
        rotate(rad) {
          return self.multiply(tfMat().load.rotate(rad));
        },
      },
      
      load: {
        identity() {
          self.load.from(Mat4.identity);
          return self;
        },

        from(src) {
          for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
              self.val[i][j] = src.val[i][j];
            }
          }
          return self;
        },

        translateFloor(x, y, z) {
          if(z === undefined) {
            z = 0;
          }
          return self.load.translate(
            Math.floor(x),
            Math.floor(y),
            Math.floor(z));
        },
        
        translate(x, y, z) {
          if(z === undefined) {
            z = 0;
          }
          self.load.identity();
          self.val[3][0] = x;
          self.val[3][1] = y;
          self.val[3][2] = z;
          return self;
        },

        scale(x, y, z) {
          if(y === undefined) {
            y = x;
          }
          if(z === undefined) {
            z = 1;
          }
          self.load.identity();
          self.val[0][0] = x;
          self.val[1][1] = y;
          self.val[2][2] = z;
          return self;
        },
        rotate(rad) {
          self.load.identity();
          self.val[0][0] = Math.cos(rad);
          self.val[1][0] = -Math.sin(rad);
          self.val[0][1] = Math.sin(rad);
          self.val[1][1] = Math.cos(rad);
          return self;
        },
      },

      multiply(bMat) {
        let b = self.val;
        let a = bMat.val;

        for(let i = 0; i < 4; i++) {
          for(let j = 0; j < 4; j++) {
            multBuffer[i][j] = 0;
            for(let k = 0; k < 4; k++) {
              multBuffer[i][j]+= a[i][k] * b[k][j];
            }
          }
        }

        for(let i = 0; i < 4; i++) {
          for(let j = 0; j < 4; j++) {
            self.val[i][j] = multBuffer[i][j];
          }
        }
        return self;
      }
    }

    return self;
  }
};

Mat4.identity = Mat4.create();

export let Mat4Stack = {
  create(capacity=32, warning=-1) {
    let stack = [];
    for(let i = 0; i < (capacity < 0 ? 16 : capacity); i++) {
      stack[i] = Mat4.create();
    }
    
    let head = 0;
    
    let self = {
      reset() {
        head = 0;
      },
      push(matrix) {
        if(head+1 >= stack.length) {
          if(stack.length < capacity) {
            if(warning >= 0 && stack.length >= warning) {
              console.log("matrix stack reached warning (length=" + stack.length + ", warning=" + warning + ")");
            }
            stack[head+1] = Mat4.create();
          } else {
            throw "matrix stack overflow";
          }
        }
        head++;
        stack[head].load.from(matrix);
      },
      pop(matrix) {
        if(head < 0) {
          throw "matrix stack underflow";
        }
        matrix.load.from(stack[head--]);
      },
      peek(matrix) {
        if(head < 0) {
          throw "matrix stack underflow";
        }
        matrix.load.from(stack[head]);
      }
    };
    
    return self;
  }
};

export let lerp = (a, b, x) => {
  return a + x * (b-a);
};

export let invlerp = (a, b, x) => {
  return (x - a) / (b - a);
};

export let modulo = (a, b) => {
  return (a % b + b) % b;
};

export let roundNearest = (num, interval) => {
  return Math.round(num/interval)*interval;
};
