import { suite, test } from '@testdeck/mocha'
import { assert, expect } from 'chai'
import { GenericObjects, IncludeExcludeListOrNone } from '../src'
import { PhysicsObject2D, Rectangle, Shape, Square } from './sample-objects'

@suite
class GenericObjectsTests {
    @test
    filterFromObject_0() {
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

    getKeys_obj_abc =  {
        a: 123,
        b: 456,
        c: 789
    }

    @test
    getKeys_abc_0() {
        this.getKeys(
                this.getKeys_obj_abc,
                undefined,
                ['a', 'b', 'c']
            )
    }

    @test
    getKeys_abc_1() {
        this.getKeys(
                this.getKeys_obj_abc,
                {},
                []
            )
    }

    @test
    getKeys_abc_2() {
        this.getKeys(
                this.getKeys_obj_abc,
                { include: ['a', 'c'] },
                ['a', 'c']
            )
    }

    @test
    getKeys_abc_3() {
        this.getKeys(
                this.getKeys_obj_abc,
                { exclude: 'c' },
                ['a', 'b']
            )
    }

    getKeys_obj_shape_rect: Rectangle = {
        name: "rectangle",
        length: 10,
        width: 10
    }

    getKeys_obj_shape_square: Square = {
        name: "square",
        length: 10,
        width: 10,
        side: 10
    }

    getKeys_obj_shape_rect_partial: Rectangle = <Rectangle> <Partial<Rectangle>> {
        length: 20
    }

    @test
    getKeys_shape_0() {
        this.getKeys<Square>(
                this.getKeys_obj_shape_square,
                [ 'name' ],
                [ 'name' ]
            )
    }

    @test
    getKeys_shape_1() {
        this.getKeys<Rectangle<string>>(
                this.getKeys_obj_shape_square,
                [ 'length' ],
                [ 'length' ]
            )
    }

    @test
    getKeys_shape_2() {
        this.getKeys<Rectangle<string>>(
                this.getKeys_obj_shape_square,
                { include: ['length', 'width'] },
                [ 'length', 'width' ]
            )
    }

    @test
    getKeys_shape_3() {
        this.getKeys<Rectangle<string>>(
                this.getKeys_obj_shape_square,
                { exclude: [ 'name', 'length', 'width'] },
                <(keyof Rectangle<string>)[]><unknown>[ 'side' ]
            )
    }

    @test
    getKeys_shape_4() {
        this.getKeys<Rectangle<string>>(
                this.getKeys_obj_shape_rect,
                { exclude: [ 'name', 'length', 'width'] },
                [ ]
            )
    }

    @test
    getKeys_shape_5() {
        this.getKeys(
                this.getKeys_obj_shape_rect_partial,
                { exclude: [] },
                [ 'length' ]
            )
    }

    @test
    getKeys_shape_6() {
        this.getKeys(
                this.getKeys_obj_shape_rect_partial,
                { exclude: [ 'length' ] },
                [ ]
            )
    }

    getKeys<T extends object>(
            obj: T,
            filter: IncludeExcludeListOrNone<keyof T> | undefined,
            expectedKeys: (keyof T)[]
        ) {
        const keys = GenericObjects.getKeys(obj, filter)
        
        expect(keys).to.deep.equal(expectedKeys)
    }
}