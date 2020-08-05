import Vector from './vector.js';
import Particle, { maxMass, minMass } from './particle.js';
class Universe {
    constructor(canvas) {
        this._fps = 0;
        this._mass = 16;
        this.particles = [];
        this.controls = {
            fps: document.getElementById('fps'),
            mass: document.getElementById('mass'),
            numParticles: document.getElementById('num-particles'),
        };
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        this.dragging = false;
        this.frame = false;
        this.frameCount = 0;
        this.mouseInitX = 0;
        this.mouseInitY = 0;
        this.needFrame = true;
        this.fpsInterval = 0;
        this.frameInterval = 0;
        this.absorbParticle = (firstIndex, secondIndex) => {
            this.particles[firstIndex].absorb(this.particles[secondIndex]);
            this.particles.splice(secondIndex, 1);
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.calcFrame = () => {
            this.frame = true;
            this.frameCount++;
            this.needFrame = false;
            this.frameInterval = setTimeout(() => {
                if (this.frame) {
                    this.needFrame = true;
                }
                else {
                    this.calcFrame();
                }
            }, 15);
            this.gravity();
            this.ctx.clearRect(0, 0, this.canvas.scrollWidth, this.canvas.scrollHeight);
            this.paintParticles();
            if (this.dragging) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.mouseInitX, this.mouseInitY);
                this.ctx.lineTo(this.currentMouseX, this.currentMouseY);
                this.ctx.strokeStyle = "white";
                this.ctx.stroke();
            }
            if (this.needFrame) {
                this.calcFrame();
            }
            this.frame = false;
        };
        this.canvasMouseDown = (e) => {
            var rect = e.srcElement.getBoundingClientRect();
            this.mouseInitX = e.clientX - rect.left;
            this.mouseInitY = e.clientY - rect.top;
            this.dragging = true;
        };
        this.canvasMouseMove = (e) => {
            var rect = e.srcElement.getBoundingClientRect();
            this.currentMouseX = e.clientX - rect.left;
            this.currentMouseY = e.clientY - rect.top;
        };
        this.canvasMouseUp = (e) => {
            var rect = e.srcElement.getBoundingClientRect();
            let vx = (e.clientX - rect.left - this.mouseInitX) / 10;
            let vy = (e.clientY - rect.top - this.mouseInitY) / 10;
            this.newParticle(this.mass, new Vector(vx, vy), new Vector(this.mouseInitX, this.mouseInitY));
            this.dragging = false;
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.canvasWheel = (e) => {
            if (e.deltaY / 120 > 0) {
                this.mass *= 2;
            }
            else {
                this.mass /= 2;
            }
            this.constrainMass();
        };
        this.clear = () => {
            this.particles = [];
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.cloud = (centerX, centerY) => {
            let baseV = new Vector(0, 0);
            if (this.dragging) {
                let vx = (this.currentMouseX - this.mouseInitX) / 10;
                let vy = (this.currentMouseY - this.mouseInitY) / 10;
                baseV = new Vector(vx, vy);
            }
            this.dragging = false;
            for (let i = 0; i < 1000; i++) {
                let angle = Math.random() * 2 * Math.PI;
                let dist = Math.pow((Math.random() * 15), 2);
                let position = new Vector(centerX + dist * Math.cos(angle), centerY + dist * Math.sin(angle));
                let velocity = new Vector(dist * Math.sin(angle) / 10, -dist * Math.cos(angle) / 10).add(baseV);
                this.newParticle(2, velocity, position);
            }
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.constrainMass = () => {
            if (this.mass > maxMass) {
                this.mass = maxMass;
            }
            else if (this.mass < minMass) {
                this.mass = minMass;
            }
        };
        this.documentKeyUp = (e) => {
            if (e.key === " " || e.key === "Spacebar") {
                this.cloud(this.currentMouseX, this.currentMouseY);
            }
            else if (e.key === "k") {
                this.randDist();
            }
            else if (e.key === "s") {
                this.solarSystem();
            }
            else if (e.key === "c") {
                this.clear();
            }
            else if (e.key === "ArrowUp" || e.key === "Up") {
                this.mass *= 2;
            }
            else if (e.key === "ArrowDown" || e.key === "Down") {
                this.mass /= 2;
            }
            this.constrainMass();
        };
        this.gravity = () => {
            let i = 0;
            while (i < this.particles.length) {
                let forceSum = new Vector(0, 0);
                let j = 0;
                while (j < this.particles.length && i < this.particles.length) {
                    if (j != i && this.particles[i].interact(this.particles[j], forceSum)) {
                        this.absorbParticle(i, j);
                    }
                    j++;
                }
                if (i < this.particles.length) {
                    this.particles[i].velocity.x += forceSum.x / this.particles[i].mass;
                    this.particles[i].velocity.y += forceSum.y / this.particles[i].mass;
                }
                i++;
            }
            for (i = 0; i < this.particles.length; i++) {
                this.particles[i].position.x += this.particles[i].velocity.x / 10;
                this.particles[i].position.y += this.particles[i].velocity.y / 10;
            }
        };
        this.newParticle = (mass, velocity, position, color) => {
            let p = new Particle(mass, velocity, position, color);
            this.particles.push(p);
            return p;
        };
        this.paintParticles = () => {
            if (this.ctx) {
                for (let i = 0; i < this.particles.length; i++) {
                    this.particles[i].paint(this.ctx);
                }
            }
        };
        this.randDist = () => {
            let baseV = new Vector(0, 0);
            if (this.dragging) {
                let vx = (this.currentMouseX - this.mouseInitX) / 10;
                let vy = (this.currentMouseY - this.mouseInitY) / 10;
                baseV = new Vector(vx, vy);
            }
            this.dragging = false;
            let xMax = window.innerWidth;
            let yMax = window.innerHeight;
            for (let i = 0; i < 1000; i++) {
                let position = new Vector(Math.random() * xMax, Math.random() * yMax);
                let velocity = new Vector(Math.random() * 30 - 15, Math.random() * 30 - 15).add(baseV);
                this.newParticle(2, velocity, position);
            }
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.resizeCanvas = () => {
            this.ctx.canvas.width = this.canvas.parentElement.clientWidth;
            this.ctx.canvas.height = this.canvas.parentElement.clientHeight;
        };
        this.solarSystem = () => {
            let baseV = new Vector(0, 0);
            if (this.dragging) {
                let vx = (this.currentMouseX - this.mouseInitX) / 10;
                let vy = (this.currentMouseY - this.mouseInitY) / 10;
                baseV = new Vector(vx, vy);
            }
            this.dragging = false;
            let position = new Vector(this.currentMouseX, this.currentMouseY);
            let sun = this.newParticle((Math.random() * 300) + 100, baseV, position, "#ff0");
            this.particles.push(...sun.createRandomSatellites(baseV));
            this.controls.numParticles.innerText = this.particles.length.toString();
        };
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas);
        canvas.addEventListener("mousedown", this.canvasMouseDown);
        canvas.addEventListener("mouseup", this.canvasMouseUp);
        canvas.addEventListener("mousemove", this.canvasMouseMove);
        canvas.addEventListener("wheel", this.canvasWheel);
        document.body.addEventListener("keyup", this.documentKeyUp);
        this.calcFrame();
        this.fpsInterval = setInterval(() => {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }, 1000);
    }
    get fps() { return this._fps; }
    set fps(value) {
        this._fps = value;
        this.controls.fps.innerText = value.toString();
    }
    get mass() { return this._mass; }
    set mass(value) {
        this._mass = value;
        this.controls.mass.innerText = value.toString();
    }
}
window.addEventListener('load', function (_ev) {
    const canvas = document.getElementById("gravity-canvas");
    new Universe(canvas);
});
