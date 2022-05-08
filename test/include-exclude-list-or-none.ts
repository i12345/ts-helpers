import { suite, test } from '@testdeck/mocha'
import { assert } from 'chai'
import { IncludeExcludeListOrNone, filterItems_IncludeExcludeListOrNone } from '../src'

@suite
class IncludeExcludeListOrNoneTest {
    @test
    include_0() {
        this.runTest(
                'abc',
                {
                    include: []
                },
                []
            )
    }

    @test
    include_1() {
        this.runTest(
                'abc',
                {
                    include: ['a', 'b']
                },
                ['a', 'b']
            )
    }

    @test
    include_2() {
        this.runTest(
                'abc',
                {
                    include: ['a', 'b', 'c']
                },
                ['a', 'b', 'c']
            )
    }

    @test
    include_3() {
        this.runTest(
                'abc',
                {
                    include: ['a', 'b', 'e', 'z']
                },
                ['a', 'b']
            )
    }

    @test
    exclude_0() {
        this.runTest(
                'abc',
                {
                    exclude: []
                },
                ['a', 'b', 'c']
            )
    }

    @test
    exclude_1() {
        this.runTest(
                'abc',
                {
                    exclude: ['b']
                },
                ['a', 'c']
            )
    }

    @test
    exclude_2() {
        this.runTest(
                'abc',
                {
                    exclude: ['a', 'b', 'c']
                },
                []
            )
    }

    @test
    exclude_3() {
        this.runTest(
                'abc',
                {
                    exclude: ['a', 'z']
                },
                ['b', 'c']
            )
    }

    @test
    list_0() {
        this.runTest(
                'abc',
                ['x', 'y', 'z'],
                ['x', 'y', 'z']
            )
    }

    @test
    list_1() {
        this.runTest(
                'abc',
                [],
                []
            )
    }

    @test
    list_2() {
        this.runTest(
                'abc',
                ['a', 'y', 'z'],
                ['a', 'y', 'z']
            )
    }

    @test
    none_0() {
        this.runTest(
                'abc',
                {},
                []
            )
    }

    runTest<T>(
            source: Iterable<T>,
            filter: IncludeExcludeListOrNone<T>,
            expected: T[]
        ) {
        const filtered = filterItems_IncludeExcludeListOrNone(source, filter)
        assert.deepEqual(filtered, expected)
    }
}