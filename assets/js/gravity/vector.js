export default class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.abs = () => {
            this.x = Math.abs(this.x);
            this.y = Math.abs(this.y);
            if (this.dimension === 3) {
                this.z = Math.abs(this.z);
            }
            return this;
        };
        this.add = (vec) => {
            this.x += vec.x;
            this.y += vec.y;
            if (this.dimension === 3 && vec.dimension === 3) {
                this.z += vec.z;
            }
            return this;
        };
        this.angleFromUp = () => {
            if (this.dimension === 3) {
                return Math.atan2(new Vector(this.z, 0, -this.x).magnitude(), -this.y);
            }
            else {
                return Math.PI - Math.atan2(this.y, this.x);
            }
        };
        this.clone = () => new Vector(this.x, this.y, this.z);
        this.cross = (vec) => {
            if (this.dimension === 3 && vec.dimension === 3) {
                return new Vector((this.x * vec.z) - (this.z * vec.y), (this.z * vec.x) - (this.x * vec.z), (this.x * vec.y) - (this.y * vec.x));
            }
            return new Vector(this.y, -this.x);
        };
        this.distance = (vec) => Math.sqrt(this.distanceSq(vec));
        this.distanceSq = (vec) => {
            let x = this.x - vec.x;
            let y = this.y - vec.y;
            let result = (x * x) + (y * y);
            if (this.dimension === 3 && vec.dimension === 3) {
                let z = this.z - vec.z;
                result += (z * z);
            }
            return result;
        };
        this.divide = (obj) => {
            if (obj instanceof Vector) {
                this.divideByVector(obj);
            }
            else {
                this.divideByScalar(obj);
            }
            return this;
        };
        this.divideByScalar = (n) => {
            this.x /= n;
            this.y /= n;
            if (this.dimension === 3) {
                this.z /= n;
            }
            return this;
        };
        this.divideByVector = (vec) => {
            this.x /= vec.x;
            this.y /= vec.y;
            if (this.dimension === 3 && vec.dimension === 3) {
                this.z /= vec.z;
            }
            return this;
        };
        this.dot = (vec) => {
            let result = (vec.x * this.x) + (vec.y * this.y);
            if (this.dimension === 3 && vec.dimension === 3) {
                result += vec.z * this.z;
            }
            return result;
        };
        this.equals = (obj) => {
            if (obj instanceof Vector) {
                return obj.x === this.x && obj.y === this.y && obj.z === this.z;
            }
            else {
                return false;
            }
        };
        this.isZero = () => this.dimension === 3 ? this.equals(Vector.zero3d) : this.equals(Vector.zero2d);
        this.length = () => this.magnitude();
        this.lengthSq = () => this.magnitudeSq();
        this.magnitude = () => Math.sqrt(this.magnitudeSq());
        this.magnitudeSq = () => {
            let result = (this.x * this.x) + (this.y * this.y);
            if (this.dimension === 3) {
                result += this.z * this.z;
            }
            return result;
        };
        this.multiply = (obj) => {
            if (obj instanceof Vector) {
                this.multiplyByVector(obj);
            }
            else {
                this.multiplyByScalar(obj);
            }
            return this;
        };
        this.multiplyByScalar = (n) => {
            this.x *= n;
            this.y *= n;
            if (this.dimension === 3) {
                this.z *= n;
            }
            return this;
        };
        this.multiplyByVector = (vec) => {
            this.x *= vec.x;
            this.y *= vec.y;
            if (this.dimension === 3 && vec.dimension === 3) {
                this.z *= vec.z;
            }
            return this;
        };
        this.normalize = () => this.divideByScalar(this.magnitude());
        this.reverse = () => {
            this.x = -this.x;
            this.y = -this.y;
            if (this.dimension === 3) {
                this.z = -this.z;
            }
            return this;
        };
        this.rotate = (rads, axis = "z") => {
            let cos = Math.cos(rads);
            let sin = Math.sin(rads);
            let x = this.x;
            let y = this.y;
            let z = this.z;
            if (this.dimension === 3 && axis === "x") {
                this.y = y * cos - z * sin;
                this.z = y * cos + z * cos;
            }
            else if (this.dimension === 3 && axis === "y") {
                this.z = z * cos - x * sin;
                this.x = z * sin + x * cos;
            }
            else {
                this.x = x * cos - y * sin;
                this.y = x * sin + y * cos;
            }
            return this;
        };
        this.round = (n = 2) => {
            var p = Vector.precision[n];
            this.x = ((0.5 + (this.x * p)) << 0) / p;
            this.y = ((0.5 + (this.y * p)) << 0) / p;
            if (this.dimension === 3) {
                this.z = ((0.5 + (this.z * p)) << 0) / p;
            }
            return this;
        };
        this.setAxes = (x, y, z) => {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        };
        this.subtract = (vec) => {
            this.x -= vec.x;
            this.y -= vec.y;
            if (this.dimension === 3 && vec.dimension === 3) {
                this.z -= vec.z;
            }
            return this;
        };
        this.toArray = () => this.dimension === 3 ? [this.x, this.y, this.z] : [this.x, this.y];
        this.toString = (round = false) => {
            if (round) {
                if (this.dimension === 3) {
                    return `(${Math.round(this.x)}, ${Math.round(this.y)}, ${Math.round(this.z)})`;
                }
                else {
                    return `(${Math.round(this.x)}, ${Math.round(this.y)})`;
                }
            }
            else if (this.dimension === 3) {
                return `(${this.x}, ${this.y}, ${this.z})`;
            }
            else {
                return `(${this.x}, ${this.y})`;
            }
        };
        this.truncate = (n) => {
            if (this.length() > n) {
                this.normalize();
                this.multiplyByScalar(n);
            }
            return this;
        };
        this.zero = () => {
            this.x = this.y = 0;
            if (this.dimension === 3) {
                this.z = 0;
            }
            return this;
        };
        if (z === undefined) {
            this.dimension = 2;
        }
        else {
            this.dimension = 3;
        }
    }
    static fromArray(arr) {
        if (!arr || arr.length < 2) {
            return undefined;
        }
        else if (arr.length === 3) {
            return new Vector(arr[0], arr[1], arr[2]);
        }
        else {
            return new Vector(arr[0], arr[1]);
        }
    }
    static abs(vec) { return vec.clone().abs(); }
    static add(vec1, vec2) { return vec1.clone().add(vec2); }
    angle(vec) {
        if (this.dimension === 3 && vec.dimension === 3) {
            return Math.atan2(this.cross(vec).magnitude(), this.dot(vec));
        }
        else {
            return Math.atan2(vec.y, vec.x) - Math.atan2(this.y, this.x);
        }
    }
    static divide(vec, obj) { return vec.clone().divide(obj); }
    static divideByScalar(vec, n) { return vec.clone().divideByScalar(n); }
    static divideByVector(vec1, vec2) { return vec1.clone().divideByVector(vec2); }
    static isZero(obj) {
        if (!obj) {
            return true;
        }
        if (obj instanceof Vector) {
            return obj.isZero();
        }
        else {
            return false;
        }
    }
    static multiply(vec, obj) { return vec.clone().multiply(obj); }
    static multiplyByScalar(vec, n) { return vec.clone().multiplyByScalar(n); }
    static multiplyByVector(vec1, vec2) { return vec1.clone().multiplyByVector(vec2); }
    static reverse(vec) { return vec.clone().reverse(); }
    static rotate(vec, rads) { return vec.clone().rotate(rads); }
    static subtract(vec1, vec2) { return vec1.clone().subtract(vec2); }
    static truncate(vec, n) { return vec.clone().truncate(n); }
}
Vector.precision = [
    1,
    10,
    100,
    1000,
    10000,
    100000,
    1000000,
    10000000,
    100000000,
    1000000000,
    10000000000
];
Vector.down2d = new Vector(0, 1);
Vector.left2d = new Vector(-1, 0);
Vector.right2d = new Vector(1, 0);
Vector.up2d = new Vector(0, -1);
Vector.zero2d = new Vector(0, 0);
Vector.down3d = new Vector(0, 1, 0);
Vector.in3d = new Vector(0, 0, 1);
Vector.left3d = new Vector(-1, 0, 0);
Vector.out3d = new Vector(0, 0, -1);
Vector.right3d = new Vector(1, 0, 0);
Vector.up3d = new Vector(0, -1, 0);
Vector.zero3d = new Vector(0, 0, 0);
Vector.normalize = (vec) => vec.clone().normalize();
