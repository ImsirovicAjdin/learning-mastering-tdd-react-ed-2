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

## After `34a3be0`:

I've updated the Appointment.test.js and Appointment.js in order to make the test pass, but it's still not passing.

""This is a bit of a headscratcher."":
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

  console.error
    Warning: React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

       5 | it("renders the customer first name", () => {
       6 |     const customer = { firstName: "Ashley" };
    >  7 |     const component = <Appointment customer={customer} />;
         |                       ^
       8 |     const container = document.createElement("div");
       9 |     document.body.appendChild(container);
      10 |     ReactDOM.createRoot(container).render(component);

      at printWarning (node_modules/react/cjs/react.development.js:209:30)
      at error (node_modules/react/cjs/react.development.js:183:7)
      at Object.createElementWithValidation [as createElement] (node_modules/react/cjs/react.development.js:2354:7)
      at Object.createElement (test/Appointment.test.js:7:23)

 FAIL  test/Appointment.test.js
  ✕ renders the customer first name (27 ms)

  ● renders the customer first name

    expect(received).toContain(expected) // indexOf

    Expected substring: "Ashley"
    Received string:    ""

       9 |     document.body.appendChild(container);
      10 |     ReactDOM.createRoot(container).render(component);
    > 11 |     expect(document.body.textContent).toContain("Ashley");
         |                                       ^
      12 |     expect(document.body.innerHTML).toContain(
      13 |         "Ashley"
      14 |     );

      at Object.toContain (test/Appointment.test.js:11:39)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        0.78 s, estimated 1 s
Ran all test suites.
```

## The above does not pass

This is a bit of a headscratcher. We *did* define a valid React component. And we did tell React to render it in our container. What's going on?

Making use of the act test helper:
In a React testing situation like this, often the answer has something to do with the async nature of the runtime environment. Starting in React 18, the render function is asynchronous: the function call will return before React has modified the DOM. Therefore, the expectation will run **before** the DOM is modified.

**REACT PROVIDES A HELPER FUNCTION FOR OUR TESTS THAT PAUSES UNTIL ASYNCHRONOUS RENDERING HAS COMPLETED. IT'S CALLED `act()` AND YOU SIMPLY NEED TO WRAP IT AROUND ANY REACT API CALLS. TO USE `act()` PERFORM THE FOLLOWING STEPS:**
```jsx
import { act } from "react-dom/test-utils";
```

```jsx
act(() =>
    ReactDOM.createRoot(container).render(component)
);
```

Now if you re-run your test, it will be passing but with a weird warning: 
```
console.error
Warning: The current testing environment is not configured to support act(...)
```

React would like us to be explicit in our use of `act()`. That's because there are use cases where `act()` does not make sense - but for unit testing, we almost certainly want to use it.

UNDERSTANDING THE ACT FUNCTION:
```package.json
{
    ...
    "jest": {
        "testEnvironment": "jsdom",
        "globals": {
            "IS_REACT_ACT_ENVIRONMENT": true
        }
    }
}
```

""Now run your test again and it passes.""

After I ran `npm test` I indeed got a successful this:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  ✓ renders the customer first name (13 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.854 s, estimated 1 s
Ran all test suites.
```

## Triangulating to remove hardcoding

We did the implementations so far because we want to stick to our rule of only doing the simplest thing that will make a test pass.

To get to the real implementation, we need to add more tests, which is a process known as **TRIANGULATION**.

We add more tests to build more of a real impelemtnation. **The more specific our tests get, the more general our production code needs to get**.

Let's triangulate by performing the following steps.

Make a copy of your first test, pasting it just under the first test, and change the test description and the name of Ashley to Jordan, as follows:
it("renders another customer first name", () => {

  const customer = { firstName: "Jordan" };

  const component = (

    <Appointment customer={customer} />

  );

  const container = document.createElement("div");

  document.body.appendChild(container);

  act(() =>

    ReactDOM.createRoot(container).render(component)

  );

  expect(document.body.textContent).toContain(

    "Jordan"

  );

});

Run tests with npm test. We expect this test to fail, and it does. But examine the code carefully. Is this what you expected to see? Take a look at the value of Received string in the following code:
FAIL test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (18ms)

    ✕ renders another customer first name (8ms)

  ● Appointment › renders another customer first name

    expect(received).toContain(expected)

    Expected substring: "Jordan"

    Received string:    "AshleyAshley"

The document body has the text `AshleyAshley`. **THIS KIND OF REPEATED TEXT IS AN INDICATOR THAT OUR TESTS ARE NOT INDEPENDENT OF ONE ANOTHER.**

**The component has been rendered twice, once for each test. That’s correct, but the document isn’t being cleared between each test run**.

This is a problem.

**WHEN IT COMES TO UNIT TESTING, WE WANT ALL TESTS TO BE INDEPENDENT OF ONE ANOTHER.**

**THE SIMPLEST WAY TO ACHIEVE THIS IS TO NOT HAVE ANY SHARED STATE BETWEEN TESTS.**

**EACH TEST SHOULD ONLY USE VARIABLES THAT IT HAS CREATED ITSELF.**

acktracking on ourselves
We know that the shared state is the problem. Shared state is a fancy way of saying “shared variables.” In this case, it’s document. This is the single global document object that is given to us by the jsdom environment, which is consistent with how a normal web browser operates: there’s a single document object. But unfortunately, our two tests use appendChild to add into that single document that’s shared between them. They don’t each get their own separate instance.

A simple solution is to replace appendChild with replaceChildren, like this:


document.body.replaceChildren(container);
This will clear out everything from document.body before doing the append.

But there’s a problem. We’re in the middle of a red test. We should never refactor, rework, or otherwise change course while we’re red.

Admittedly, this is all highly contrived—we could have used replaceChildren right from the start. But not only are we proving the need for replaceChildren, we are also about to discover an important technique for dealing with just this kind of scenario.

What we’ll have to do is skip this test we’re working on, fix the previous test, then re-enable the skipped test. Let’s do that now by performing the following steps:

In the first test you’ve just written, change it to it.skip. Do that now for the second test as follows:
it.skip("renders another customer first name", () => {

  ...

});

Run tests. You’ll see that Jest ignores the second test and the first one still passes, as follows:
PASS test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (19ms)

    ○ skipped 1 test

Test Suites: 1 passed, 1 total

Tests: 1 skipped, 1 passed, 2 total

In the first test, change appendChild to replaceChildren as follows:
it("renders the customer first name", () => {

  const customer = { firstName: "Ashley" };

  const component = (

    <Appointment customer={customer} />

  );

  const container = document.createElement("div");

  document.body.replaceChildren(container);

  ReactDOM.createRoot(container).render(component);

  expect(document.body.textContent).toContain(

    "Ashley"

  );

});

Rerun the tests with npm test. It should still be passing.

## Update the second test as the first, with replaceChildren

Running tests now should give us the error that we were originally expecting. No more repeated text content, as you can see:
FAIL test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (18ms)

    ✕ renders another customer first name (8ms)

  ● Appointment › renders another customer first name

    expect(received).toContain(expected)

    Expected substring: "Jordan"

    Received string:    "Ashley"

To make the test pass, we need to introduce the prop and use it within our component. Change the definition of Appointment to look as follows, destructuring the function arguments to pull out the customer prop:
export const Appointment = ({ customer }) => (

  <div>{customer.firstName}</div>

);

Run tests. We expect this test to now pass:
PASS test/Appointment.test.js

Appointment

✓ renders the customer first name (21ms)

✓ renders another customer first name (2ms)

Great work! We’re done with our passing test, and we’ve successfully triangulated to remove hardcoding.

In this section, you’ve written two tests and, in the process of doing so, you’ve discovered and overcome some of the challenges we face when writing automated tests for React components.

Now that we’ve got our tests working, we can take a closer look at the code we’ve written.

Refactoring your work
Now that you’ve got a green test, it’s time to refactor your work. Refactoring is the process of adjusting your code’s structure without changing its functionality. It’s crucial for keeping a code base in a fit, maintainable state.

Sadly, the refactoring step is the step that always gets forgotten. The impulse is to rush straight into the next feature. We can’t stress how important it is to take time to simply stop and stare at your code and think about ways to improve it. Practicing your refactoring skills is a sure-fire way to level up as a developer.

The adage “more haste; less speed” applies to coding just as it does in life. If you make a habit of skipping the refactoring phase, your code quality will likely deteriorate over time, making it harder to work with and therefore slower to build new features.

The TDD cycle helps you build good personal discipline and habits, such as consistently refactoring. It might take more effort upfront, but you will reap the rewards of a code base that remains maintainable as it ages.

DON’T REPEAT YOURSELF

Test code needs as much care and attention as production code. The number one principle you’ll be relying on when refactoring your tests is Don’t Repeat Yourself (DRY). Drying up tests is a phrase all TDDers repeat often.

The key point is that you want your tests to be as concise as possible. When you see repeated code that exists in multiple tests, it’s a great indication that you can pull that repeated code out. There are a few different ways to do that, and we’ll cover just a couple in this chapter.

You will see further techniques for drying up tests in Chapter 3, Refactoring the Test Suite.

## Sharing setup code between tests

When tests contain identical setup instructions, we can promote those instructions into a shared `beforeEach` block. The code in this block is executed before each test.

Both of our tests use the same two variables: `container` and `customer`. The first one of these, `container`, is initialized identically in each test. That makes it a good candidate for a `beforeEach` block.

Perform the following steps to introduce your first `beforeEach` block:

Since `container` needs to be accessed in the `beforeEach` block and each of the tests, we must declare it in the outer `describe` scope. And since we’ll be setting its value in the before`Each block, that also means we’ll need to use `let` instead of `const`. Just above the first test, add the following line of code:

let container;

Below that declaration, add the following code:

beforeEach(() => {

  container = document.createElement("div");

  document.body.replaceChildren(container);

});

Delete the corresponding two lines from each of your two tests. Note that since we defined `container` in the scope of the `describe` block, the value set in the `beforeEach` block will be available to your test when it executes.

## USE OF LET INSTEAD OF CONST

**BE CAREFUL WHEN YOU USE `let` DEFINITIONS WITHIN THE `describe` SCOPE.**

These variables are not cleared by default between each test execution, and that shared state will affect the outcome of each test. A good rule of thumb is that any variable you declare in the `describe` scope should be assigned to a new value in a corresponding `beforeEach` block, or in the first part of each test, just as we’ve done here.

For a more detailed look at the use of let in test suites, head to https://reacttdd.com/use-of-let.

In Chapter 3, Refactoring the Test Suite, we’ll look at a method for sharing this setup code between multiple test suites.

