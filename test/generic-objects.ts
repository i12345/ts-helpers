import { suite, test } from '@testdeck/mocha'
import { assert, expect } from 'chai'
import { GenericObjects } from '../src'

@suite
class GenericObjectsTests {
    @test
    filterFromObject_0() {
        class PhysicsObject2D {
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

        const obj = new PhysicsObject2D(
                23,
                34,
                0.1,
                10,
                0.2,
                -0.3,
                0.02
            )

        let lastPrintedLocation = ""
        const printLocation = (args: {x: number, y: number}) => {
            lastPrintedLocation = `(${args.x}, ${args.y})`
        }

        printLocation(obj)
        expect(lastPrintedLocation).to.equal("(23, 34)")

        obj.x = 10
        obj.y = 20
        
        const justLocation = GenericObjects.filterFromObject(obj, ['x', 'y'])
        printLocation(justLocation)
        expect(lastPrintedLocation).to.equal("(10, 20)")
    }
}