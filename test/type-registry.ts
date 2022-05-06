import { suite, test } from '@testdeck/mocha'
import { assert } from 'chai'
import { TypeofType, TypeRegistry } from '../src'

@suite
class TypeRegistryTests {
    @test
    insertAndFind_literal_1() {
        this.insertAndFind(
                [
                    ['boolean', 'this is for booleans'],
                    ['number', 'this is for numbers'],
                    ['string', 'this is for strings'],
                    ['bigint', 'this is for bigints'],
                    ['symbol', 'this is for symbols'],
                    ['undefined', 'this is for undefined'],
                    ['object', 'this is for objects'],
                    ['function', 'this is for functions'],
                ],
                ['hello', 'this is for strings'],
                [534, 'this is for numbers'],
                [-234, 'this is for numbers'],
                [0.03, 'this is for numbers'],
                [true, 'this is for booleans'],
                [false, 'this is for booleans'],
                ['goodbye', 'this is for strings'],
                [BigInt(23), 'this is for bigints'],
                [BigInt(-100), 'this is for bigints'],
                [Symbol(), 'this is for symbols'],
                [Symbol.toStringTag, 'this is for symbols'],
                [undefined, 'this is for undefined'],
                [console, 'this is for objects'],
                [{ a: 10, b: 20 }, 'this is for objects'],
                [this.insertAndFind, 'this is for functions']
            )
    }

    @test
    insertAndFind_classes_1() {
        class Animal {}
        class Fish extends Animal {}
        class Shark extends Fish {}
        class Reptile extends Animal {}
        class Lizard extends Reptile {}
        class Snake extends Reptile {}
        class Turtle extends Reptile {}
        class Tuatara extends Reptile {}
        class Amphibian extends Animal {}
        class Salamander extends Amphibian {}
        class Frog extends Amphibian {}

        const cages = {
            plains: Symbol(),
            pond: Symbol(),
            desert: Symbol(),
            other: Symbol()
        }

        this.insertAndFind(
                [
                    ['string', cages.other],
                    [Fish, cages.pond],
                    [Amphibian, cages.pond],
                    [Frog, cages.plains],
                    [Lizard, cages.plains],
                    [Reptile, cages.other],
                    [Snake, cages.plains],
                    [Turtle, cages.pond],
                    [Animal, cages.plains]
                ],
                [new Fish(), cages.pond],
                [new Shark(), cages.pond],
                [new Lizard(), cages.plains],
                [new Snake(), cages.plains],
                [new Turtle(), cages.pond],
                [new Tuatara(), cages.other],
                [new Frog(), cages.plains],
                [new Salamander(), cages.pond],
                ['crocodile', cages.other]
            )
    }

    @test
    insertAndFind_classes_and_literal_1() {
        class A{}
        class B extends A {}
        class C extends A {}
        class D {}

        const mappings = {
            A: 'A maps here',
            B: 'B maps here',
            otherObjects: 'other objects map here',
            functions: 'all functions map here',
            undefined: 'undefined maps here'
        }

        this.insertAndFind(
                [
                    [A, mappings.A],
                    [B, mappings.B],
                    ['object', mappings.otherObjects],
                    ['function', mappings.functions],
                    ['undefined', mappings.undefined],
                ],
                [new A(), mappings.A],
                [new B(), mappings.B],
                [new C(), mappings.A],
                [new D(), mappings.otherObjects],
                [console, mappings.otherObjects],
                [() => 123, mappings.functions],
                [A, mappings.functions],
                [B, mappings.functions],
                [C, mappings.functions],
                [D, mappings.functions],
                [undefined, mappings.undefined],
            )
    }

    insertAndFind<T>(
            toRegister: [Function | TypeofType, T][],
            ...toFind: [any, T][]
        ): void {
        let registry = new TypeRegistry()
        for(const [type, item] of toRegister) {
            registry.register(type, item)
        }

        for(const [key, expectedValue] of toFind) {
            const actualValue = registry.get(key)
            assert.deepEqual(actualValue, expectedValue)
        }
    }
}