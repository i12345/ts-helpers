import { suite, test } from '@testdeck/mocha'
import { assert } from 'chai'
import { TypeRegistry } from '../src'

@suite
class TypeRegistryTests {
    @test
    insertAndFind_literal_1() {
        this.insertAndFind(
                [
                    [typeof true, 'this is for booleans'],
                    [typeof 123, 'this is for numbers'],
                    [typeof 'abc', 'this is for strings'],
                ],
                ['hello', 'this is for strings'],
                [534, 'this is for numbers'],
                [-234, 'this is for numbers'],
                [0.03, 'this is for numbers'],
                [true, 'this is for booleans'],
                [false, 'this is for booleans'],
                ['goodbye', 'this is for strings'],
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
                    [typeof 'strngs', cages.other],
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

    insertAndFind<T>(
            toRegister: [Function | string, T][],
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