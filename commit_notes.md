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

### Rendering React components from within a test

In order to make this test pass, we’ll have to write some code above the expectation that will call into our production code.

Let’s work backward from that expectation. We know we want to build a React component to render this text (that’s the **Appointment** component we specified earlier). If we imagine we already have that component defined, how would we get React to render it from within our test?

We simply do the same thing we’d do at the entry point of our own app. We render our root component like this:
```
ReactDOM.createRoot(container).render(component);
```

The preceding function replaces the DOM **container** element with a new element that is constructed by React by rendering our React **component**, which in our case will be called **Appointment**.

#### The createRoot function

The **createRoot** function is new in React 18. Chaining it with the call to render will suffice for most of our tests, but in Chapter 7, _Testing useEffect and Mocking Components_, you’ll adjust this a little to support re-rendering in a single test.

In order to call this in our test, we’ll need to define both **component** and **container**. The test will then have the following shape:

```js
it("renders the customer first name", () => {
  const component = ???
  const container = ???
  ReactDOM.createRoot(container).render(component);
  expect(document.body.textContent).toContain("Ashley");
});
```

The value of **component** is easy; it will be an instance of **Appointment**, the component under test. We specified that as taking a customer as a prop, so let’s write out what that might look like now. Here’s a JSX fragment that takes **customer** as a prop:

```js
 const customer = { firstName: "Ashley" };
 const component = <Appointment customer={customer} />;
```

If you’ve never done any TDD before, this might seem a little strange. Why are we writing test code for a component we haven’t yet built? Well, that’s partly the point of TDD – we let the test drive our design. At the beginning of this section, we formulated a verbal specification of what our **Appointment** component was going to do. Now, we have a concrete, written specification that can be automatically verified by running the test.

#### Simplifying test data

Back when we were considering our design, we came up with a whole object format for our appointments. You might think the definition of a customer here is very sparse, as it only contains a first name, but we don’t need anything else for a test about customer names.

We’ve figured out **component**. Now, what about **container**? We can use the DOM to create a **container** element, like this:
```js
const container = document.createElement("div");
```

The call to **document.createElement** gives us a new HTML element that we’ll use as our rendering root. However, we also need to attach it to the current document body. That’s because certain DOM events will only register if our elements are part of the document tree. So, we also need to use the following line of code:
```js
document.body.appendChild(container);
```

Now our expectation should pick up whatever we render because it’s rendered as part of **document.body**.

#### WARNING ABOUT appendChild

We won’t be using **appendChild** for long; later in the chapter, we’ll be switching it out for something more appropriate. We would not recommend using **appendChild** in your own test suites for reasons that will become clear!

Let’s put it all together:

**Step 1.** Change your test in **test/Appointments.test.js** as follows:
```js

it("renders the customer first name", () => {
  const customer = { firstName: "Ashley" };         // +
  const component = (                               // +
    <Appointment customer={customer} />             // +
  );
  const container = document.createElement("div");  // +
  document.body.appendChild(container);             // +
  ReactDOM.createRoot(container).render(component); // +
  expect(document.body.textContent).toContain(
    "Ashley"
  );
});
```

As we’re using both the **ReactDOM** namespace and JSX, we’ll need to include the two standard React imports at the top of our test file for this to work, as shown below:
```js
import React from "react";
import ReactDOM from "react-dom/client";
```

Go ahead and run the test; it’ll fail. Within the output, you’ll see the following code:
```bash
npm run test

> appointments@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  ● Test suite failed to run

    Cannot find module '../src/Appointment' from 'test/Appointment.test.js'

      1 | import React from "react";
      2 | import ReactDOM from "react-dom/client";
    > 3 | import { Appointment } from "../src/Appointment";
        | ^
      4 |
      5 | describe("Appointment", () => {
      6 |     it("renders the customer first name", () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (test/Appointment.test.js:3:1)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.874 s, estimated 1 s
Ran all test suites.
```

This is subtly different from the test failure we saw earlier. This is a runtime exception, not an expectation failure. Thankfully, though, the exception is telling us exactly what we need to do, just as a test expectation would. It’s finally time to build **Appointment**.

**MY ACTUAL OUTPUT IS:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  ● Test suite failed to run

    Cannot find module '../src/Appointment' from 'test/Appointment.test.js'

      1 | import React from "react";
      2 | import ReactDOM from "react-dom/client";
    > 3 | import { Appointment } from "../src/Appointment";
        | ^
      4 |
      5 | it("renders the customer first name with a specific class", () => {
      6 |     const customer = { firstName: "Ashley" };

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (test/Appointment.test.js:3:1)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.839 s, estimated 1 s
Ran all test suites.
```

```
git add --all; git commit -m "Red: Write a failing test"
```
