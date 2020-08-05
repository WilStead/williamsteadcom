import Vector from './vector.js';
import Particle, { maxMass, minMass } from './particle.js';

class Universe {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    private _fps = 0;
    get fps() { return this._fps; }
    set fps(value: number) {
        this._fps = value;
        this.controls.fps.innerText = value.toString();
    }

    private _mass = 16;
    get mass() { return this._mass; }
    set mass(value: number) {
        this._mass = value;
        this.controls.mass.innerText = value.toString();
    }

    particles: Particle[] = [];

    private controls = {
        fps: document.getElementById('fps') as HTMLSpanElement,
        mass: document.getElementById('mass') as HTMLSpanElement,
        numParticles: document.getElementById('num-particles') as HTMLSpanElement,
    }

    private currentMouseX = 0;
    private currentMouseY = 0;

    private dragging = false;

    private frame = false;
    private frameCount = 0;

    private mouseInitX = 0;
    private mouseInitY = 0;

    private needFrame = true;

    private fpsInterval = 0;
    private frameInterval = 0;

    constructor(canvas: HTMLCanvasElement) {
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

    private absorbParticle = (firstIndex: number, secondIndex: number): void => {
        this.particles[firstIndex].absorb(this.particles[secondIndex]);
        this.particles.splice(secondIndex, 1);
        this.controls.numParticles.innerText = this.particles.length.toString();
    }

    private calcFrame = (): void => {
        this.frame = true;
        this.frameCount++;

        // This mechanism ensures that a new frame is generated immediately if the calculation has
        // taken longer than 15ms, or waits if not.
        this.needFrame = false;
        this.frameInterval = setTimeout(() => {
            if (this.frame) {
                this.needFrame = true;
            } else {
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
    }

    private canvasMouseDown = (e: MouseEvent) => {
        var rect = (e.srcElement as Element).getBoundingClientRect();
        this.mouseInitX = e.clientX - rect.left;
        this.mouseInitY = e.clientY - rect.top;
        this.dragging = true;
    }

    private canvasMouseMove = (e: MouseEvent) => {
        var rect = (e.srcElement as Element).getBoundingClientRect();
        this.currentMouseX = e.clientX - rect.left;
        this.currentMouseY = e.clientY - rect.top;
    }

    private canvasMouseUp = (e: MouseEvent) => {
        var rect = (e.srcElement as Element).getBoundingClientRect();
        let vx = (e.clientX - rect.left - this.mouseInitX) / 10;
        let vy = (e.clientY - rect.top - this.mouseInitY) / 10;
        this.newParticle(this.mass, new Vector(vx, vy), new Vector(this.mouseInitX, this.mouseInitY));
        this.dragging = false;
        this.controls.numParticles.innerText = this.particles.length.toString();
    }

    private canvasWheel = (e: WheelEvent) => {
        if (e.deltaY / 120 > 0) {
            this.mass *= 2;
        } else {
            this.mass /= 2;
        }
        this.constrainMass();
    }

    private clear = (): void => {
        this.particles = [];
        this.controls.numParticles.innerText = this.particles.length.toString();
    }

    private cloud = (centerX: number, centerY: number): void => {
        let baseV = new Vector(0, 0);
        if (this.dragging) {
            let vx = (this.currentMouseX - this.mouseInitX) / 10;
            let vy = (this.currentMouseY - this.mouseInitY) / 10;
            baseV = new Vector(vx, vy);
        }
        this.dragging = false;
        for (let i = 0; i < 1000; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let dist = (Math.random() * 15) ** 2;
            let position = new Vector(
                centerX + dist * Math.cos(angle),
                centerY + dist * Math.sin(angle)
            );
            let velocity = new Vector(
                dist * Math.sin(angle) / 10,
                -dist * Math.cos(angle) / 10
            ).add(baseV);
            this.newParticle(2, velocity, position);
        }
        this.controls.numParticles.innerText = this.particles.length.toString();
    }

    private constrainMass = (): void => {
        if (this.mass > maxMass) {
            this.mass = maxMass;
        } else if (this.mass < minMass) {
            this.mass = minMass;
        }
    }

    private documentKeyUp = (e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Spacebar") {
            this.cloud(this.currentMouseX, this.currentMouseY);
        } else if (e.key === "k") {
            this.randDist();
        } else if (e.key === "s") {
            this.solarSystem();
        } else if (e.key === "c") {
            this.clear();
        } else if (e.key === "ArrowUp" || e.key === "Up") {
            this.mass *= 2;
        } else if (e.key === "ArrowDown" || e.key === "Down") {
            this.mass /= 2;
        }
        this.constrainMass();
    }

    private gravity = (): void => {
        // while rather than for because elements may be removed during iteration
        let i = 0;
        while (i < this.particles.length) {
            let forceSum = new Vector(0, 0);
            let j = 0;
            // i must be retested because elements may have been removed
            while (j < this.particles.length && i < this.particles.length) {
                if (j != i && this.particles[i].interact(this.particles[j], forceSum)) {
                    this.absorbParticle(i, j);
                }
                j++;
            }
            // i must be retested because elements may have been removed
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
    }

    private newParticle = (
        mass: number,
        velocity: Vector,
        position: Vector,
        color?: string
    ): Particle => {
        let p = new Particle(mass, velocity, position, color);
        this.particles.push(p);
        return p;
    }

    private paintParticles = (): void => {
        if (this.ctx) {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].paint(this.ctx);
            }
        }
    }

    private randDist = (): void => {
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
            let position = new Vector(
                Math.random() * xMax,
                Math.random() * yMax
            );
            let velocity = new Vector(
                Math.random() * 30 - 15,
                Math.random() * 30 - 15
            ).add(baseV);
            this.newParticle(2, velocity, position);
        }
        this.controls.numParticles.innerText = this.particles.length.toString();
    }

    private resizeCanvas = () => {
        this.ctx.canvas.width = this.canvas.parentElement.clientWidth;
        this.ctx.canvas.height = this.canvas.parentElement.clientHeight;
    };

    private solarSystem = (): void => {
        let baseV = new Vector(0, 0);
        if (this.dragging) {
            let vx = (this.currentMouseX - this.mouseInitX) / 10;
            let vy = (this.currentMouseY - this.mouseInitY) / 10;
            baseV = new Vector(vx, vy);
        }
        this.dragging = false;
        let position = new Vector(
            this.currentMouseX,
            this.currentMouseY
        );
        let sun = this.newParticle((Math.random() * 300) + 100, baseV, position, "#ff0");
        this.particles.push(...sun.createRandomSatellites(baseV));
        this.controls.numParticles.innerText = this.particles.length.toString();
    }
}
window.addEventListener('load', function (this: Window, _ev: Event) {
    const canvas = document.getElementById("gravity-canvas") as HTMLCanvasElement;
    new Universe(canvas);
});
