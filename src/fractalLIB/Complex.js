export default class Complex {
  constructor(real, img) {
    // Constructor
    this.real = real;
    this.img = img;
  }

  square() {
    let real = this.real;
    this.img = 2 * (real * this.img);
  }

  pow2() {
    this.real = this.real ** 2 - this.img ** 2;
    this.img = 2 * this.real * this.img;
  }

  plus(other) {
    this.real += other.real;
    this.img += other.img;
  }

  magnitude() {
    return Math.sqrt(this.real ** 2 + this.img ** 2);
  }

  toString() {
    return this.real + ", " + this.img + "i";
  }
}
