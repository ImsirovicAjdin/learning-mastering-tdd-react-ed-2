## Running `npm test` after commit 05bf4d9 Enable jest to be run when issuing the npm test command

npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/@jest/core/build/TestScheduler.js:133:18)
      at node_modules/@jest/core/build/TestScheduler.js:254:19
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.601 s
Ran all test suites.

## Running `npm test` after commit `0c47312 Green (previous was red)`

npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.481 s
Ran all test suites.

## After `e4674f3 npm i --save-dev jest-environment-jsdom``

What is a test environment?

A test environment is a piece of code that runs before and after your test suite to perform setup and teardown. For the jsdom test environment, it instantiates a new JSDOM object and sets global and document objects, turning Node.js into a browser-like environment.

jsdom is a package that contains a headless implementation of the Document Object Model (DOM) that runs on Node.js. In effect, it turns Node.js into a browser-like environment that responds to the usual DOM APIs, such as the document API we're trying to access in this test.

Jest provides a pre-packaged jsdom test environment that will ensure our tests run with these DOM APIs ready to go. We just need to install it and instruct Jest to use it.

## After `9e0136c Setup: instruct jest to use jsdom test environment`

After this commit, when running `npm test`:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✕ renders the customer first name (3 ms)

  ● Appointment › renders the customer first name

    expect(received).toContain(expected) // indexOf

    Expected substring: "Ashley"
    Received string:    ""

      1 | describe("Appointment", () => {
      2 |     it("renders the customer first name", () => {
    > 3 |         expect(document.body.textContent).toContain("Ashley");
        |                                           ^
      4 |     });
      5 | })

      at Object.toContain (test/Appointment.test.js:3:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        0.761 s, estimated 1 s
Ran all test suites.
```

There are four parts to the test output that are relevant to us:
* The name of the failing test
    * ✕ renders the customer first name (3 ms)
* The expected answer
    * Expected substring: "Ashley"
* The actual answer
    * Received string:    ""
* The location in the source where the error occurred
    *     > 3 |         ...toContain("Ashley");
                          ^

All of these help us to pinpoint why our tests failed: document.body.textContent is empty. That’s not surprising given we haven’t written any React code yet.
