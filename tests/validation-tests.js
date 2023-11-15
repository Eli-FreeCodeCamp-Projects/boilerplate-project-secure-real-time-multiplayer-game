
import Joi from "joi";
import { assert } from 'chai';
import { playerSchema, collectibleSchema, sizeSchema } from '../public/js/gameSchema.mjs';
const uuid = require("uuid");

suite('Game Schema Validation Unit Tests', () => {
    suite('Player Schema Validation Tests', () => {
        test('Test valid objects.', done => {
            let testItem = { x: 100, y: 100, id: uuid.v4() };
            let res = playerSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);
            
            //-> Test with all data
            testItem = { 
                x: 100, y: 100, score: 0, name: 'Player1',
                speed: 1, main: false, id: uuid.v4() 
            };
            res = playerSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);

            //-> Test with number id using Date.now()
            testItem = { 
                x: 100, y: 100, score: 0, name: 'Player1',
                speed: 1, main: false, id: Date.now() 
            };
            res = playerSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);

            //-> Test with number id = 1
            testItem = { 
                x: 100, y: 100, score: 0, name: 'Player1',
                speed: 1, main: false, id: 1
            };
            res = playerSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);
            done();
        });

        test('Test required values error.', done => {
            let testItem = { };
            let res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" is required. "x" is required. "y" is required'
            );
            
            testItem = { x: 100};
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" is required. "y" is required'
            );
            
            testItem = { y: 100 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" is required. "x" is required'
            );

            testItem = { id: 100 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "x" is required. "y" is required'
            );
            done();
        });

        test('Test invalid id value.', done => {
            let testItem = { x: 100, y: 100, id: '<script>alert(xss)</script>'};
            let res = playerSchema.validate(testItem);
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" must be a valid GUID'
            );
            
            testItem = { y: 100, x: 100, id: 0 };
            res = playerSchema.validate(testItem);
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" must be greater than or equal to 1'
            );

            testItem = { y: 100, x: 100, id: 'alert(Xss)' };
            res = playerSchema.validate(testItem);
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" must be a valid GUID'
            );
            done();
        });

        test('Test invalid x, y and score values.', done => {
            let testItem = { x: -1, y: -1, score: -1, id: 1};
            let res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "x" must be greater than or equal to 0. "y" must be greater than or equal to 0. "score" must be greater than or equal to 0'
            );
            
            testItem = { 
                x: 9999999999999999, y: 9999999999999999,
                score: 9999999999999999, id: 1 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "x" must be a safe number. "y" must be a safe number. "score" must be a safe number'
            );

            testItem = { x: 'a', y: [0, 1], score: {1: 1}, id: 1 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "x" must be a number. "y" must be a number. "score" must be a number'
            );

            testItem = { x: 0.1, y: 0.1, score: 0.1, id: 1 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "x" must be an integer. "y" must be an integer. "score" must be an integer'
            );
            done();
        });

        test('Test invalid speed and main values.', done => {
            let testItem = { x: 1, y: 11, id: 1, speed: -1, main: -1};
            let res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "speed" must be greater than or equal to 1. "main" must be a boolean'
            );
            
            testItem = { 
                x: 1, y: 11, id: 1, speed: 9999999999999999, main: 1 
            };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "speed" must be a safe number. "main" must be a boolean'
            );

            testItem = { x: 1, y: 11, id: 1, speed: 'a', main: 0};
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "speed" must be a number. "main" must be a boolean'
            );

            testItem = { x: 1, y: 11, id: 1, speed: 1.1, main: 0.1 };
            res = playerSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "speed" must be an integer. "main" must be a boolean'
            );
            done();
        });
    });

    suite('Collectible Schema Validation Tests', () => {
        test('Test valid object.', done => {
            let testItem = { x: 100, y: 100, id: uuid.v4() };
            let res = collectibleSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);
            
            //-> Test with all data
            testItem = { 
                x: 100, y: 100, value: 1, key: 'Player1',
                id: uuid.v4() 
            };
            res = collectibleSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);

            //-> Test with number id using Date.now()
            testItem = { 
                x: 100, y: 100, value: 1, key: 'Player_1',
                id: Date.now() 
            };
            res = collectibleSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);

            //-> Test with number id = 1
            testItem = { 
                x: 100, y: 100, value: 1, key: 'PlaYer_1',
                id: 1
            };
            res = collectibleSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);
            done();
        });

        test('Test invalid values.', done => {
            let testItem = { x: -1, y: -1, id: -1, value: -1, key: -1};
            let res = collectibleSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" must be greater than or equal to 1. "x" must be greater than or equal to 0. "y" must be greater than or equal to 0. "value" must be greater than or equal to 1. "key" must be a string'
            );
            
            testItem = { 
                x: 9999999999999999, y: 9999999999999999, id: 9999999999999999, value: 9999999999999999, key: 'Hello World'
            };
            res = collectibleSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" must be a safe number. "x" must be a safe number. "y" must be a safe number. "value" must be a safe number. "key" with value "Hello World" fails to match the required pattern: /(?=\\w{1,30}$)^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)$/'
            );

            testItem = { x: 'a', y: 'a', id: 'a', value: 'a', key: 'alert("XSS")'};
            res = collectibleSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "id" does not match any of the allowed types. "x" must be a number. "y" must be a number. "value" must be a number. "key" with value "alert("XSS")" fails to match the required pattern: /(?=\\w{1,30}$)^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)$/'
            );
            done();
        });
    });

    suite('SizeHelper Schema Validation Tests', () => {
        test('Test valid object.', done => {
            let testItem = { 
                headerWidth: 100, headerHeigth: 100,
                bodyWidth: 100, bodyHeight: 100,
                playerSize: 100, coinSize: 100,
                playBorder: 100
            };
            let res = sizeSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);

            testItem = { };
            res = sizeSchema.validate(testItem);
            assert.isUndefined(res.error??undefined);
            assert.isObject(res.value);
            done();
        });

        test('Test invalid values.', done => {
            let testItem = { headerWidth: -1, headerHeigth: -1};
            let res = sizeSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "headerWidth" must be greater than or equal to 1. "headerHeigth" must be greater than or equal to 1'
            );
            
            testItem = { 
                headerWidth: 9999999999999999, headerHeigth: 9999999999999999
            };
            res = sizeSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "headerWidth" must be a safe number. "headerHeigth" must be a safe number'
            );

            testItem = { headerWidth: 'a', headerHeigth: 'a'};
            res = sizeSchema.validate(testItem, { abortEarly: false });
            assert.strictEqual(
                res.error.toString(),
                'ValidationError: "headerWidth" must be a number. "headerHeigth" must be a number'
            );
            done();
        });
    });
});