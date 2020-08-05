/**
 * A Vector. Can be 2D or 3D.
 * @class
 */
export default class Vector {
    private static precision = [
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

    /**
     * A 2D Vector with the y-axis set to 1 and the x-axis set to 0.
     */
    static readonly down2d = new Vector(0, 1);

    /**
     * A 2D Vector with the x-axis set to -1 and the y-axis set to 0.
     */
    static readonly left2d = new Vector(-1, 0);

    /**
     * A 2D Vector with the x-axis set to 1 and the y-axis set to 0.
     */
    static readonly right2d = new Vector(1, 0);

    /**
     * A 2D Vector with the y-axis set to -1 and the x-axis set to 0.
     */
    static readonly up2d = new Vector(0, -1);

    /**
     * A 2D Vector with both axes set to 0.
     */
    static readonly zero2d = new Vector(0, 0);

    /**
     * A 3D Vector with the y-axis set to 1 and the other axes set to 0.
     */
    static readonly down3d = new Vector(0, 1, 0);

    /**
     * A 3D Vector with the z-axis set to 1 and the other axes set to 0.
     */
    static readonly in3d = new Vector(0, 0, 1);

    /**
     * A 3D Vector with the x-axis set to -1 and the other axes set to 0.
     */
    static readonly left3d = new Vector(-1, 0, 0);

    /**
     * A 3D Vector with the z-axis set to -1 and the other axes set to 0.
     */
    static readonly out3d = new Vector(0, 0, -1);

    /**
     * A 3D Vector with the x-axis set to 1 and the other axes set to 0.
     */
    static readonly right3d = new Vector(1, 0, 0);

    /**
     * A 3D Vector with the y-axis set to -1 and the other axes set to 0.
     */
    static readonly up3d = new Vector(0, -1, 0);

    /**
     * A 3D Vector with both axes set to 0.
     */
    static readonly zero3d = new Vector(0, 0, 0);

    readonly dimension: number;

    /**
     * Constructs a new Vector instance. Can be 2D or 3D depending on whether a z axis is supplied.
     * @param {number} x The x component of this Vector.
     * @param {number} y The y component of this Vector.
     * @param {number} [z] The z component of this Vector.
     */
    constructor(public x: number, public y: number, public z?: number) {
        if (z === undefined) {
            this.dimension = 2;
        } else {
            this.dimension = 3;
        }
    }

    /**
     * Constructs a Vector from an array of axis values. Extra values in the array are ignored, but
     * if the array has fewer than 2 values the result will be undefined.
     * @param {number} x The x component of this Vector.
     * @param {number} y The y component of this Vector.
     * @param {number} [z] The z component of this Vector.
     */
    static fromArray(arr: number[]) {
        if (!arr || arr.length < 2) {
            return undefined;
        } else if (arr.length === 3) {
            return new Vector(arr[0], arr[1], arr[2]);
        } else {
            return new Vector(arr[0], arr[1]);
        }
    }

    /**
     * Converts this Vector to absolute values.
     * @returns {Vector}
     */
    abs = (): Vector => {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        if (this.dimension === 3) {
            this.z = Math.abs(this.z);
        }
        return this;
    }

    /**
     * Gets a copy of the given Vector converted to absolute values.
     * @param {Vector} vec The Vector to convert.
     * @returns {Vector}
     */
    static abs(vec: Vector): Vector { return vec.clone().abs(); }

    /**
     * Adds the given Vector to this one.
     * @param {Vector} vec The Vector to add to this Vector.
     * @returns {Vector}
     */
    add = (vec: Vector): Vector => {
        this.x += vec.x;
        this.y += vec.y;
        if (this.dimension === 3 && vec.dimension === 3) {
            this.z += vec.z;
        }
        return this;
    }

    /**
     * Gets the result of adding the two given Vectors.
     * @param {Vector} vec1 The first operand.
     * @param {Vector} vec2 The second operand.
     * @returns {Vector}
     */
    static add(vec1: Vector, vec2: Vector): Vector { return vec1.clone().add(vec2); }

    /**
     * Gets the angle (in radians) between this Vector and the given Vector.
     * @param {Vector} vec The Vector whose angle to this one will be computed.
     * @returns {number}
     */
    angle(vec: Vector): number {
        if (this.dimension === 3 && vec.dimension === 3) {
            return Math.atan2(this.cross(vec).magnitude(), this.dot(vec));
        } else {
            return Math.atan2(vec.y, vec.x) - Math.atan2(this.y, this.x);
        }
    }

    /**
     * Gets the angle (in radians) of this vector relative to 'up'.
     * @returns {number}
     */
    angleFromUp = (): number => {
        if (this.dimension === 3) {
            return Math.atan2(new Vector(this.z, 0, -this.x).magnitude(), -this.y);
        } else {
            return Math.PI - Math.atan2(this.y, this.x);
        }
    }

    /**
     * Get a deep copy of this Vector.
     * @returns {Vector}
     */
    clone = (): Vector => new Vector(this.x, this.y, this.z);

    /**
     * Gets the cross product of this Vector with the given Vector.
     * @param {Vector} vec The Vector used to obtain the cross product with this Vector. Note that for 2D vectors, the argument is ignored.
     * @returns {Vector}
     */
    cross = (vec: Vector): Vector => {
        if (this.dimension === 3 && vec.dimension === 3) {
            return new Vector((this.x * vec.z) - (this.z * vec.y),
                (this.z * vec.x) - (this.x * vec.z),
                (this.x * vec.y) - (this.y * vec.x));
        }
        return new Vector(this.y, -this.x);
    }

    /**
     * Gets the distance between this Vector and the given Vector.
     * @param {Vector} vec The Vector whose distance from this one will be calculated.
     * @returns {number}
     */
    distance = (vec: Vector): number => Math.sqrt(this.distanceSq(vec));

    /**
     * Gets the distance between this Vector and the given Vector, squared.
     * @param {Vector} vec The Vector whose distance from this one will be calculated.
     * @returns {number}
     */
    distanceSq = (vec: Vector): number => {
        let x = this.x - vec.x;
        let y = this.y - vec.y;
        let result = (x * x) + (y * y);

        if (this.dimension === 3 && vec.dimension === 3) {
            let z = this.z - vec.z;
            result += (z * z);
        }

        return result;
    }

    /**
     * Divides this Vector by the given number or Vector.
     * @param {(number|Vector)} obj The number or Vector by which to divide this Vector.
     * @returns {Vector}
     */
    divide = (obj: number | Vector): Vector => {
        if (obj instanceof Vector) {
            this.divideByVector(obj);
        } else {
            this.divideByScalar(obj);
        }
        return this;
    }

    /**
     * Gets the result of dividing the given Vector by the given dividend.
     * @param {Vector} vec The Vector to divide.
     * @param {(number|Vector)} obj The dividend.
     * @returns {Vector}
     */
    static divide(vec: Vector, obj: number | Vector): Vector { return vec.clone().divide(obj); }

    /**
     * Divides this Vector by the given number.
     * @param {Number} n The number by which to divide this Vector.
     * @returns {Vector}
     */
    divideByScalar = (n: number): Vector => {
        this.x /= n;
        this.y /= n;
        if (this.dimension === 3) {
            this.z /= n;
        }
        return this;
    }

    /**
     * Gets the result of dividing the given Vector by the given number.
     * @param {Vector} vec The Vector to divide.
     * @param {number} n The number by which to divide the Vector.
     * @returns {Vector}
     */
    static divideByScalar(vec: Vector, n: number): Vector { return vec.clone().divideByScalar(n); }

    /**
     * Divides this Vector by the given Vector.
     * @param {Vector} vec The Vector by which to divide this Vector.
     * @returns {Vector}
     */
    divideByVector = (vec: Vector): Vector => {
        this.x /= vec.x;
        this.y /= vec.y;
        if (this.dimension === 3 && vec.dimension === 3) {
            this.z /= vec.z;
        }
        return this;
    }

    /**
     * Gets the result of dividing the given Vector by the given number.
     * @param {Vector} vec1 The Vector to divide.
     * @param {Vector} vec2 The Vector dividend.
     * @returns {Vector}
     */
    static divideByVector(vec1: Vector, vec2: Vector): Vector { return vec1.clone().divideByVector(vec2); }

    /**
     * Gets the dot product of this Vector with the given Vector.
     * @param {Vector} vec The Vector used to obtain the dot product with this Vector.
     * @returns {number}
     */
    dot = (vec: Vector): number => {
        let result = (vec.x * this.x) + (vec.y * this.y);
        if (this.dimension === 3 && vec.dimension === 3) {
            result += vec.z * this.z;
        }
        return result;
    }

    /**
     * Determines whether the given object is equal to this Vector.
     * @param {any} obj
     * @return {boolean}
     */
    equals = (obj: any): boolean => {
        if (obj instanceof Vector) {
            return obj.x === this.x && obj.y === this.y && obj.z === this.z;
        } else {
            return false;
        }
    }

    /**
     * Determines whether this Vector has all its axes set to zero.
     */
    isZero = () => this.dimension === 3 ? this.equals(Vector.zero3d) : this.equals(Vector.zero2d);

    /**
     * Determines whether the given object is either undefined, null, or a Vector with all its axes set to zero.
     */
    static isZero(obj: any) {
        if (!obj) {
            return true;
        }
        if (obj instanceof Vector) {
            return (obj as Vector).isZero();
        } else {
            return false;
        }
    }

    /**
     * Gets the magnitude (length) of this Vector.
     * @returns {number}
     */
    length = (): number => this.magnitude();

    /**
     * Gets the magnitude (length) of this Vector, squared.
     * @returns {number}
     */
    lengthSq = (): number => this.magnitudeSq();

    /**
     * Gets the magnitude (length) of this Vector.
     * @returns {number}
     */
    magnitude = (): number => Math.sqrt(this.magnitudeSq());

    /**
     * Gets the magnitude (length) of this Vector, squared.
     * @returns {number}
     */
    magnitudeSq = (): number => {
        let result = (this.x * this.x) + (this.y * this.y)
        if (this.dimension === 3) {
            result += this.z * this.z;
        }
        return result;
    };

    /**
     * Multiplies this Vector by the given number or Vector
     * @param {(number|Vector)} obj The number or Vector by which to multiply this Vector.
     * @returns {Vector}
     */
    multiply = (obj: number | Vector): Vector => {
        if (obj instanceof Vector) {
            this.multiplyByVector(obj);
        } else {
            this.multiplyByScalar(obj);
        }
        return this;
    }

    /**
     * Gets the result of multiplying the given Vector by the given operand.
     * @param {Vector} vec The Vector to multiply.
     * @param {(number|Vector)} obj The number or vector by which to multiply the Vector.
     * @returns {Vector}
     */
    static multiply(vec: Vector, obj: number | Vector): Vector { return vec.clone().multiply(obj); }

    /**
     * Multiplies this Vector by the given number.
     * @param {number} n The number by which to multiply this Vector.
     * @returns {Vector}
     */
    multiplyByScalar = (n: number): Vector => {
        this.x *= n;
        this.y *= n;
        if (this.dimension === 3) {
            this.z *= n;
        }
        return this;
    }

    /**
     * Gets the result of multiplying the given Vector by the given number.
     * @param {Vector} vec The Vector to multiply.
     * @param {number} n The number by which to multiply the Vector.
     * @returns {Vector}
     */
    static multiplyByScalar(vec: Vector, n: number): Vector { return vec.clone().multiplyByScalar(n); }

    /**
     * Multiplies this Vector by the given Vector.
     * @param {Vector} vec The Vector by which to multiply this Vector.
     * @returns {Vector}
     */
    multiplyByVector = (vec: Vector): Vector => {
        this.x *= vec.x;
        this.y *= vec.y;
        if (this.dimension === 3 && vec.dimension === 3) {
            this.z *= vec.z;
        }
        return this;
    }

    /**
     * Gets the result of multiplying the given Vector by the given number.
     * @param {Vector} vec1 The Vector to multiply.
     * @param {Vector} vec2 The Vector by which to multiply the first Vector.
     * @returns {Vector}
     */
    static multiplyByVector(vec1: Vector, vec2: Vector): Vector { return vec1.clone().multiplyByVector(vec2); }

    /**
     * Normalizes this Vector.
     */
    normalize = () => this.divideByScalar(this.magnitude());

    /**
     * Gets a normalized clone of the given Vector.
     * @param {Vector} vec The Vector to normalize.
     * @returns {Vector}
     */
    static normalize = (vec: Vector): Vector => vec.clone().normalize();

    /**
     * Reverses this Vector.
     * @returns {Vector}
     */
    reverse = (): Vector => {
        this.x = -this.x;
        this.y = -this.y;
        if (this.dimension === 3) {
            this.z = -this.z;
        }
        return this;
    }

    /**
     * Gets a reversed clone of the given Vector.
     * @param {Vector} vec The Vector to normalize.
     * @returns {Vector}
     */
    static reverse(vec: Vector): Vector { return vec.clone().reverse(); }

    /**
     * Rotates this Vector by this given number of radians.
     * @param {number} rads A number of radians by which to rotate this Vector.
     * @param {string} axis The axis of rotation. Defaults to z; ignored for 2D rotation.
     * @return {Vector}
     */
    rotate = (rads: number, axis: "x" | "y" | "z" = "z"): Vector => {
        let cos = Math.cos(rads);
        let sin = Math.sin(rads);

        let x = this.x;
        let y = this.y;
        let z = this.z;

        if (this.dimension === 3 && axis === "x") {
            this.y = y * cos - z * sin;
            this.z = y * cos + z * cos;
        } else if (this.dimension === 3 && axis === "y") {
            this.z = z * cos - x * sin;
            this.x = z * sin + x * cos;
        } else {
            this.x = x * cos - y * sin;
            this.y = x * sin + y * cos;
        }

        return this;
    }

    /**
     * Gets a rotated clone of the given Vector.
     * @param {Vector} vec The Vector to normalize.
     * @param {number} rads A number of radians by which to rotate the given Vector.
     * @returns {Vector}
     */
    static rotate(vec: Vector, rads: number): Vector { return vec.clone().rotate(rads); }

    /**
     * Rounds each axis of this Vector to the given number of decimal places.
     * @param {number} n a number of decimal places to which the axes of this Vector will be rounded.
     * @return {Vector}
     */
    round = (n: number = 2): Vector => {
        var p = Vector.precision[n];

        this.x = ((0.5 + (this.x * p)) << 0) / p;
        this.y = ((0.5 + (this.y * p)) << 0) / p;
        if (this.dimension === 3) {
            this.z = ((0.5 + (this.z * p)) << 0) / p;
        }

        return this;
    }

    /**
     * Sets the components of this Vector.
     * @param {number} x The new x value.
     * @param {number} y The new y value.
     * @param {number} [z] The new z value.
     */
    setAxes = (x: number, y: number, z?: number) => {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Subtracts the given Vector from this one.
     * @param {Vector} vec The Vector to add to this Vector.
     * @returns {Vector}
     */
    subtract = (vec: Vector): Vector => {
        this.x -= vec.x;
        this.y -= vec.y;
        if (this.dimension === 3 && vec.dimension === 3) {
            this.z -= vec.z;
        }
        return this;
    }

    /**
     * Gets the result of subtracting the two given Vectors.
     * @param {Vector} vec1 The first operand.
     * @param {Vector} vec2 The second operand.
     * @returns {Vector}
     */
    static subtract(vec1: Vector, vec2: Vector): Vector { return vec1.clone().subtract(vec2); }

    /**
     * Gets the Vector as an array containing the axes.
     * @returns {number[]}
     */
    toArray = (): number[] => this.dimension === 3 ? [this.x, this.y, this.z] : [this.x, this.y];

    /**
     * Gets the Vector as a string in the format "(0, 4)"
     * @param {boolean} round Indicates whether or not to round the axes.
     * @returns {string}
     */
    toString = (round: boolean = false): string => {
        if (round) {
            if (this.dimension === 3) {
                return `(${Math.round(this.x)}, ${Math.round(this.y)}, ${Math.round(this.z)})`;
            } else {
                return `(${Math.round(this.x)}, ${Math.round(this.y)})`;
            }
        } else if (this.dimension === 3) {
            return `(${this.x}, ${this.y}, ${this.z})`;
        } else {
            return `(${this.x}, ${this.y})`;
        }
    }

    /**
     * Truncates this Vector to the given length.
     * @param {number} n The length to which to truncate this Vector.
     * @returns {Vector}
     */
    truncate = (n: number): Vector => {
        if (this.length() > n) {
            this.normalize();
            this.multiplyByScalar(n);
        }
        return this;
    }

    /**
     * Truncates the given Vector to the given length.
     * @param {Vector} vec The Vector to truncate.
     * @param {number} n The length to which to truncate this Vector.
     * @returns {Vector}
     */
    static truncate(vec: Vector, n: number): Vector { return vec.clone().truncate(n); }

    /**
     * Sets all components of this Vector to 0.
     * @returns {Vector}
     */
    zero = (): Vector => {
        this.x = this.y = 0;
        if (this.dimension === 3) {
            this.z = 0;
        }
        return this;
    }
}
