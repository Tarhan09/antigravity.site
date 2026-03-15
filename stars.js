/**
 * stars.js — Animated canvas starfield
 * Black background, white stars, parallax depth layers, subtle twinkle
 */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  let W, H, stars = [];

  const STAR_COUNT  = 280;
  const LAYERS      = 3;          // depth layers (0=slow/small … 2=fast/big)
  const SPEED_BASE  = 0.12;       // pixels per frame for layer 0
  const SPEED_MULT  = 1.8;        // speed multiplier per layer

  function rand(min, max) { return min + Math.random() * (max - min); }

  class Star {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.layer  = Math.floor(Math.random() * LAYERS);
      this.speed  = SPEED_BASE * Math.pow(SPEED_MULT, this.layer);
      this.r      = rand(0.4, 0.4 + this.layer * 0.55);
      this.x      = initial ? rand(0, W) : W + this.r;
      this.y      = rand(0, H);
      // twinkle
      this.alpha     = rand(0.4, 1);
      this.alphaDir  = Math.random() < 0.5 ? 1 : -1;
      this.alphaSpd  = rand(0.003, 0.012);
    }

    update() {
      this.x -= this.speed;
      this.alpha += this.alphaSpd * this.alphaDir;
      if (this.alpha >= 1)   { this.alpha = 1;   this.alphaDir = -1; }
      if (this.alpha <= 0.2) { this.alpha = 0.2; this.alphaDir =  1; }
      if (this.x < -this.r) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.alpha.toFixed(3)})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, () => new Star());
    requestAnimationFrame(loop);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('DOMContentLoaded', init);
})();
