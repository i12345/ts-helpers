export class PhysicsObject2D {
    constructor(
        public x: number,
        public y: number,
        public theta: number,
        public mass: number,
        public p_x: number,
        public p_y: number,
        public L: number
    ){}
}

export interface Shape {
    name?: string
}

export interface Rectangle<
        Name extends string = "rectangle",
        Length extends number = number,
        Width extends number = number
    > extends Shape {
    name: Name
    length: Length
    width: Width
}

export interface Square<
        Side extends number = number
    > extends Rectangle<"square", Side, Side> {
    side: Side
}