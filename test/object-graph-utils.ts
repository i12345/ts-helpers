import { suite, test } from '@testdeck/mocha';
import assert from 'assert';
import { ObjectGraphUtils } from '../src'
import v8 from 'v8'
import _ from 'underscore';

@suite
class ObjectGraphUtilsTest {
    @test
    test_simple_number_1() {
        this.testSaveAndLoad({a: 123})
    }

    @test
    test_simple_string_1() {
        this.testSaveAndLoad({a: 'abc'})
    }

    @test
    test_simple_string_2() {
        this.testSaveAndLoad({a: 'uvw'})
    }

    @test
    test_escaped_string_1() {
        this.testSaveAndLoad({a: '#12'})
    }

    @test
    test_escaped_string_2() {
        this.testSaveAndLoad({a: '#mn'})
    }

    @test
    test_escaped_string_3() {
        this.testSaveAndLoad({a: '#str:12'})
    }

    @test
    test_escaped_string_4() {
        this.testSaveAndLoad({a: '#str:mn'})
    }

    @test
    test_simple_date_1() {
        this.testSaveAndLoad({a: new Date(2022, 5, 1, 19, 29, 8, 0)})
    }

    @test
    test_simple_date_2() {
        this.testSaveAndLoad({a: new Date()})
    }

    @test
    test_object_nested_1() {
        this.testSaveAndLoad({a: {b:123, c: 456}, d: 'abc'})
    }

    @test
    test_object_nested_2() {
        this.testSaveAndLoad({a: {b: {m: 0.1, n: 0.2, o: 0.4}, c: 456}, d: 'abc'})
    }

    @test
    test_object_circular_1() {
        let o = {a: 123, b: {}}
        o.b = o
        this.testSaveAndLoad(o)
    }

    @test
    test_object_circular_2() {
        let o = {a: 123, b: { c: 35, d: {}, e: 'abc' } }
        o.b.d = o
        this.testSaveAndLoad(o)
    }

    @test
    test_array_simple_1() {
        this.testSaveAndLoad(['a', 'b', 'c'])
    }

    @test
    test_array_simple_2() {
        this.testSaveAndLoad(['a', 456, 'c', 789])
    }

    @test
    test_array_objects_1() {
        this.testSaveAndLoad([{a: 123, b: 456}, {a: 101, b: 202}, {c:135}])
    }

    @test
    test_mesh_1() {
        let airports = [
            {
                code: 'DFW',
                name: 'Dallas Fort Worth'
            },
            {
                code: 'LGA',
                name: 'LaGuardia Airport'
            },
            {
                code: 'ITO',
                name: 'Hilo International Airport'
            }
        ]

        let flights = [
            {
                from: airports[0],
                to: airports[1],
                date: new Date('10/20/2018')
            },
            {
                from: airports[0],
                to: airports[2],
                date: new Date('5/4/2019')
            }
        ]

        assert(Object.is(flights[0].from, flights[1].from))

        let db = {
                airports,
                flights
            }

        this.testSaveAndLoad(db)

        assert(Object.is(db.airports[0], db.flights[0].from))
        assert(Object.is(db.airports[0], db.flights[1].from))
    }

    testSaveAndLoad(obj: object) {
        let clonedObj = v8.deserialize(v8.serialize(obj))
        assert(clonedObj !== obj)
        
        let json = ObjectGraphUtils.jsonify(obj)
        let restoredObj = ObjectGraphUtils.graphify(json)

        _.isEqual(clonedObj, restoredObj)
    }
}