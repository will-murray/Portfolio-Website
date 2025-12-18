class RenderingFunctionManager {
  constructor() {
    this.fset = {
      0: function mandlebrot(z) {
        const real = z.real;
        z.real = real ** 2 - z.img ** 2;
        z.img = 2 * real * z.img;
      },

      1: function modular(z) {
        const real = z.real;
        z.real = Math.sin(real ** 2 * real ** 5) % 23;
        z.img = 2 * (real * z.img);
      },

      2: function cosine(z) {
        const real = z.real;
        z.real = Math.cos(2 * real ** 2 + z.img ** 2);
        z.img = Math.E ** Math.sin(z.img * z.real);
      },
      3: function toad(z) {
        const real = z.real;
        z.real = real ** 3 - z.img ** 3;
        z.img = 3 * real * z.img;
      },
    };
    this.state = 0;
    this.num_functions = Object.keys(this.fset).length;
    this.current_fns = this.fset[this.state];
  }
  next_state() {
    this.state = (this.state + 1) % (this.num_functions - 1);

    this.current_fns = this.fset[this.state];
  }

  eval(z) {
    this.current_fns(z);
  }
}

export { RenderingFunctionManager };
