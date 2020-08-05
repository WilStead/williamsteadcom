import Vector from './vector.js';
export const maxMass = 32768;
export const minMass = 2;
export default class Particle {
    constructor(mass, velocity, position, color) {
        this.mass = mass;
        this.velocity = velocity;
        this.position = position;
        this.absorb = (other) => {
            this.velocity.x = (this.velocity.x * this.mass + other.velocity.x * other.mass) / (this.mass + other.mass);
            this.velocity.y = (this.velocity.y * this.mass + other.velocity.y * other.mass) / (this.mass + other.mass);
            this.position.x = (this.position.x * this.mass + other.position.x * other.mass) / (this.mass + other.mass);
            this.position.y = (this.position.y * this.mass + other.position.y * other.mass) / (this.mass + other.mass);
            if (this.mass < other.mass) {
                this.color = other.color;
            }
            this.mass += other.mass;
        };
        this.createRandomSatellite = (distance, baseV) => {
            let angle = Math.random() * 2 * Math.PI;
            if (!distance) {
                distance = Math.pow((Math.random() * 15), 2);
            }
            let position = new Vector(this.position.x + distance * Math.cos(angle), this.position.y + distance * Math.sin(angle)).add(baseV || new Vector(0, 0));
            let mass = Math.max(2, this.mass * Math.random() * 0.1);
            let velocity = this.getOrbitalVelocity(mass, position);
            return new Particle(mass, velocity, position);
        };
        this.createRandomSatellites = (baseV) => {
            let maxNum = Math.round(Math.random() * 10);
            let distance = 22.5 + (Math.pow(((Math.random() * 7.5) + 1), 2));
            let satellites = [];
            while (satellites.length < maxNum && distance <= 225) {
                satellites.push(this.createRandomSatellite(distance, baseV));
                distance += 45 + (Math.pow(((Math.random() * 11.4) + 1), 2));
                if (distance > 500) {
                    break;
                }
            }
            return satellites;
        };
        this.getOrbitalVelocity = (mass, position) => {
            if (this.mass < mass) {
                return new Vector(0, 0);
            }
            let xDist = position.x - this.position.x;
            let yDist = position.y - this.position.y;
            let distance = Math.sqrt((Math.pow(xDist, 2)) + (Math.pow(yDist, 2)));
            let V0;
            if (Math.random() < 0.5) {
                V0 = new Vector(-yDist, xDist);
            }
            else {
                V0 = new Vector(yDist, -xDist);
            }
            return V0.divide(V0.length()).multiply(Math.sqrt(this.mass * mass / distance));
        };
        this.interact = (other, forceSum) => {
            let xDist = this.position.x - other.position.x;
            let yDist = this.position.y - other.position.y;
            let distance2 = (Math.pow(xDist, 2)) + (Math.pow(yDist, 2));
            let distance = Math.sqrt(distance2);
            if (distance == 0) {
                return true;
            }
            else {
                let forceMag = (this.mass * other.mass) / distance2;
                let nextStep = forceMag / this.mass + forceMag / other.mass;
                if (distance < nextStep + this.radius) {
                    return true;
                }
                else {
                    forceSum.x -= Math.abs(forceMag * (xDist / distance)) * Math.sign(xDist);
                    forceSum.y -= Math.abs(forceMag * (yDist / distance)) * Math.sign(yDist);
                    return false;
                }
            }
        };
        this.paint = (ctx) => {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        };
        if (color) {
            this.color = color;
        }
        else {
            this.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    }
    get radius() {
        return (Math.pow((Math.log(this.mass) + 1), 2)) / 5;
    }
}
