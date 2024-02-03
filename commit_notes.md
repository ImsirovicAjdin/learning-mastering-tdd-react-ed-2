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

## Extracting methods

The call to `render` is the same in both tests. It’s also quite lengthy given that it’s wrapped in a call to `act`. It makes sense to extract this entire operation and give it a more meaningful name.

Rather than pull it out as is, we can create a new function that takes the `Appointment` component as its parameter. The explanation for why this is useful will come after, but now let’s perform the following steps:

Above the first test, write the following definition. Note that it still needs to be within the `describe` block because it uses the `container` variable:

const render = component =>

  act(() =>

    ReactDOM.createRoot(container).render(component)

  );

Now, replace the call to render in each test with the following line of code:
render(<Appointment customer={customer} />);

In the preceding step, we inlined the JSX, passing it directly into render. That means you can now delete the line starting with const component. For example, your first test should end up looking as follows:
it("renders the customer first name", () => {

  const customer = { firstName: "Ashley" };

  render(<Appointment customer={customer} />);

  expect(document.body.textContent).toContain(

    "Ashley"

  );

});

Rerun your tests and verify that they are still passing.

## HIGHLIGHTING DIFFERENCES WITHIN YOUR TESTS

**THE PARTS OF A TEST THAT YOU WANT TO HIGHLIGHT ARE THE PARTS THAT DIFFER BETWEEN TESTS.**

Usually, some code remains the same (such as container and the steps needed to render a component) and some code differs (customer in this example).

**DO YOUR BEST TO HIDE AWAY WHATEVER IS THE SAME AND HIGHLIGHT WHAT DIFFERS. THAT WAY, IT MAKES IT OBVIOUS WHAT AT TEST IS SPECIFICALLY TESTING.**

This section has covered a couple of simple ways of refactoring your code. As the book progresses, we’ll look at many different ways that both production source code and test code can be refactored.

## Writing great tests

Now that you’ve written a couple of tests, let’s step away from the keyboard and discuss what you’ve seen so far.

Your first test looks like the following example:


it("renders the customer first name", () => {
  const customer = { firstName: "Ashley" };
  render(<Appointment customer={customer} />);
  expect(document.body.textContent).toContain("Ashley");
});
This is concise and clearly readable.

A good test has the following three distinct sections:

Arrange: Sets up test dependencies
Act: Executes production code under test
Assert: Checks that expectations are met
This is so well understood that it is called the Arrange, Act, Assert (AAA) pattern, and all of the tests in this book follow this pattern.

A great test is not just good but is also the following:

Short
Descriptive
Independent of other tests
Has no side effects
In the remainder of this section, we’ll discuss the TDD cycle, which you’ve already used, and also how to set up your development environment for easy TDD.

## Red, green, refactor

TDD, at its heart, is the red, green, refactor cycle that we’ve just seen.

Figure 1.1 – The TDD cycle
Figure 1.1 – The TDD cycle

The steps of the TDD cycle are:

Write a failing test: Write a short test that describes some functionality you want. Execute your test and watch it fail. If it doesn’t fail, then it’s an unnecessary test; delete it and write another.
Make it pass: Make the test green by writing the simplest production code that will work. Don’t worry about finding a neat code structure; you can tidy it up later.
Refactor your code: Stop, slow down, and resist the urge to move on to the next feature. Work hard to make your code—both production and test code—as clean as it can be.
That’s all there is to it. You’ve already seen this cycle in action in the preceding two sections, and we’ll continue to use it throughout the rest of the book.

```
npm test -- --watch

npm test <path-to-test-file>

npm test <path-to-test-file> -- --watch
```

## Summary

Tests act like a safety harness in our learning; we can build little blocks of understanding, building on top of each other, up and up to ever-greater heights, without fear of falling.

In this chapter, you’ve learned a lot about the TDD experience.

To begin with, you set up a React project from scratch, pulling in only the dependencies you need to get things running. You’ve written two tests using Jest’s describe, it, and beforeEach functions. You discovered the act helper, which ensures all React rendering has been completed before your test expectations execute.

You’ve also seen plenty of testing ideas. Most importantly, you’ve practiced TDD’s red-green-refactor cycle. You’ve also used triangulation and you learned about the Arrange, Act, Assert pattern.

And we threw in a couple of design principles for good measure: DRY and YAGNI.

While this is a great start, the journey has only just begun. In the following chapter, we’ll test drive a more complex component.

Further reading
Take a look at the Babel web page to discover how to correctly configure the Babel env preset. This is important for real-world applications, but we skipped over it in this chapter. You can find it at the following link:

https://babeljs.io/docs/en/babel-preset-env.

React’s act function was introduced in React 17 and has seen updates in React 18. It is deceptively complex. See this blog post for some more discussion on how this function is used at the following link: https://reacttdd.com/understanding-act.

This book doesn’t make much use of Jest’s watch functionality. In recent versions of Jest, this has seen some interesting updates, such as the ability to choose which files to watch. If you find rerunning tests a struggle, you might want to try it out. You can find more information at the following link: https://jestjs.io/docs/en/cli#watch.

## Rendering Lists and Detail Views
The previous chapter introduced the core TDD cycle: red, green, refactor. You had the chance to try it out with two simple tests. Now, it’s time to apply that to a bigger React component.

At the moment, your application displays just a single item of data: the customer’s name. In this chapter, you’ll extend it so that you have a view of all appointments for the current day. You’ll be able to choose a time slot and see the details for the appointment at that time. We will start this chapter by sketching a mock-up to help us plan how we’ll build out the component. Then, we’ll begin implementing a list view and showing appointment details.

Once we’ve got the component in good shape, we’ll build the entry point with webpack and then run the application in order to do some manual testing.

The following topics will be covered in this chapter:

Sketching a mock-up
Creating the new component
Specifying list item content
Selecting data to view
Manually testing our changes
By the end of this chapter, you’ll have written a decent-sized React component using the TDD process you’ve already learned. You’ll also have seen the app running for the first time.

Technical requirements
The code files for this chapter can be found at https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter02.

Sketching a mock-up
Let’s start with a little more up-front design. We’ve got an Appointment component that takes an appointment and displays it. We will build an AppointmentsDayView component around it that takes an array of appointment objects and displays them as a list. It will also display a single Appointment: the appointment that is currently selected. To select an appointment, the user simply clicks on the time of day that they’re interested in.

Figure 2.1 – A mock-up of our appointment system UI
Figure 2.1 – A mock-up of our appointment system UI

UP-FRONT DESIGN

When you’re using TDD to build new features, it’s important to do a little up-front design so that you have a general idea of the direction your implementation needs to take.

That’s all the design we need for now; let’s jump right in and build the new AppointmentsDayView component.

Creating the new component
In this section, we’ll create the basic form of AppointmentsDayView: a list of appointment times for the day. We won’t build any interactive behavior for it just yet.

We’ll add our new component into the same file we’ve been using already because so far there’s not much code in there. Perform the following steps:

PLACING COMPONENTS

We don’t always need a new file for each component, particularly when the components are short functional components, such as our Appointment component (a one-line function). It can help to group related components or small sub-trees of components in one place.

In test/Appointment.test.js, create a new describe block under the first one, with a single test. This test checks that we render a div with a particular ID. That’s important in this case because we load a CSS file that looks for this element. The expectations in this test use the DOM method, querySelector. This searches the DOM tree for a single element with the tag provided:
describe("AppointmentsDayView", () => {

  let container;

  beforeEach(() => {

    container = document.createElement("div");

    document.body.replaceChildren(container);

  });

  const render = (component) =>

    act(() =>

      ReactDOM.createRoot(container).render(component)

    );

  it("renders a div with the right id", () => {

    render(<AppointmentsDayView appointments={[]} />);

    expect(

      document.querySelector(

        "div#appointmentsDayView"

      )

    ).not.toBeNull();

  });

});

### NOTE

It isn’t usually necessary to wrap your component in a `div` with an ID or a class. We tend to do it when we have CSS that we want to attach to the entire group of HTML elements that will be rendered by the component, which, as you’ll see later, is the case for `AppointmentsDayView`.

This test uses the exact same `render` function from the first `describe` block as well as the same `let container` declaration and `beforeEach` block. In other words, we’ve introduced duplicated code. By duplicating code from our first test suite, we’re making a mess straight after cleaning up our code! Well, we’re allowed to do it when we’re in the first stage of the TDD cycle. Once we’ve got the test passing, we can think about the right structure for the code.

Run `npm test` and look at the output:
FAIL test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (18ms)

    ✓ renders another customer first name (2ms)

  AppointmentsDayView

    ✕ renders a div with the right id (7ms)

  ● AppointmentsDayView › renders a div with the right id

    ReferenceError: AppointmentsDayView is not defined

Let’s work on getting this test to pass by performing the following steps:

To fix this, change the last `import` statement in your test file to read as follows:
import {

  Appointment,

  AppointmentsDayView,

} from "../src/Appointment";

In `src/Appointment.js`, add this functional component below Appointment as shown:
```
export const AppointmentsDayView = () => {};
```

Run your tests again. You'll see output like this:
● AppointmentsDayView › renders a div with the right id

expect(received).not.toBeNull()

Finally, a test failure! Let’s get that div in place as follows:
export const AppointmentsDayView = () => (

  <div id="appointmentsDayView"></div>

);

""Your test should now be passing.""

Indeed, here's my result of `npm test`:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.757 s, estimated 1 s
Ran all test suites.
```

## Your test should now be passing.

Let’s move on to the next test. Add the following text, just below the last test in test/Appointment.test.js, still inside the AppointmentsDayView describe block:
it("renders an ol element to display appointments", () => {

  render(<AppointmentsDayView appointments={[]} />);

  const listElement = document.querySelector("ol");

  expect(listElement).not.toBeNull();

});

Run your tests again and you'll see output matching the text shown below:
● AppointmentsDayView › renders an ol element to display appointments

expect(received).not.toBeNull()

""Received: null""

Indeed, here's my `npm test`:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (14 ms)
    ✓ renders another customer first name (2 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✕ renders an ol element to display appointments (4 ms)

  ● AppointmentsDayView ›

    expect(received).not.toBeNull()

    Received: null

      54 |         render(<AppointmentsDayView appointments={[]} />);
      55 |         const listElement = document.querySelector("ol");
    > 56 |         expect(listElement).not.toBeNull();
         |                                 ^
      57 |     });
      58 | })
      59 |

      at Object.toBeNull (test/Appointment.test.js:56:33)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        0.922 s, estimated 1 s
Ran all test suites.
```

## To make that pass, add the ol element as follows:
```jsx
export const AppointmentsDayView = () => (
  <div id="appointmentsDayView">
    <ol />
  </div>
);
```

My results of `npm test`:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (6 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.854 s, estimated 1 s
Ran all test suites.
```

## Alright, now let’s fill that ol with an item for each appointment.

For that, we’ll need (at least) two appointments to be passed as the value of the appointments prop, as. Add the next test, as shown:
it("renders an li for each appointment", () => {

  const today = new Date();

  const twoAppointments = [

    { startsAt: today.setHours(12, 0) },

    { startsAt: today.setHours(13, 0) },

  ];

  render(

    <AppointmentsDayView

      appointments={twoAppointments}

    />

  );

  const listChildren =

    document.querySelectorAll("ol > li");

  expect(listChildren).toHaveLength(2);

});

TESTING DATES AND TIMES

In the test, the today constant is defined to be new Date(). Each of the two records then uses this as a base date.

**Whenever we’re dealing with dates, it’s important that we base all events on the same moment in time, rather than asking the system for the current time more than once. Doing that is a subtle bug waiting to happen.**

Run npm test again and you'll see this output:
● AppointmentsDayView › renders an li for each appointment

expect(received).toHaveLength(expected)

Expected length: 2

Received length: 0

Received object: []

My result `npm test`:
```
npm test
 
> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (4 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✓ renders an ol element to display appointments (3 ms)
    ✕ renders an li for each appointment (4 ms)

  ● AppointmentsDayView › renders an li for each appointment

    expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 0
    Received object: []

      68 |         );
      69 |         const listChildren = document.querySelectorAll("ol > li");
    > 70 |         expect(listChildren).toHaveLength(2);
         |                              ^
      71 |     });
      72 | });
      73 |

      at Object.toHaveLength (test/Appointment.test.js:70:30)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Snapshots:   0 total
Time:        0.913 s, estimated 1 s
Ran all test suites.
```

## To fix this...

...we map over the provided appointments prop and render an empty li element:
export const AppointmentsDayView = (

  { appointments }

) => (

  <div id="appointmentsDayView">

    <ol>

      {appointments.map(() => (

        <li />

      ))}

    </ol>

  </div>

);

My result of `npm test`:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

  console.error
    Warning: Each child in a list should have a unique "key" prop.

    Check the render method of `AppointmentsDayView`. See https://reactjs.org/link/warning-keys for more information.
        at li
        at appointments (/home/pc/Desktop/temp-tdd-whatever/mastering-react-tdd/my-mastering-tdd/src/Appointment.js:12:39)

      12 | export const AppointmentsDayView = ({ appointments }) => (
      13 |     <div id="appointmentsDayView">
    > 14 |         <ol>
         |         ^
      15 |             {appointments.map(() => (
      16 |                 <li />
      17 |             ))}

      at printWarning (node_modules/react/cjs/react.development.js:209:30)
      at error (node_modules/react/cjs/react.development.js:183:7)
      at validateExplicitKey (node_modules/react/cjs/react.development.js:2191:5)
      at validateChildKeys (node_modules/react/cjs/react.development.js:2217:9)
      at Object.createElementWithValidation [as createElement] (node_modules/react/cjs/react.development.js:2372:7)
      at createElement (src/Appointment.js:14:9)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16305:18)
      at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:20074:13)
      at beginWork (node_modules/react-dom/cjs/react-dom.development.js:21587:16)
      at beginWork$1 (node_modules/react-dom/cjs/react-dom.development.js:27426:14)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom.development.js:26560:12)
      at workLoopSync (node_modules/react-dom/cjs/react-dom.development.js:26466:5)
      at renderRootSync (node_modules/react-dom/cjs/react-dom.development.js:26434:7)
      at performConcurrentWorkOnRoot (node_modules/react-dom/cjs/react-dom.development.js:25738:74)
      at flushActQueue (node_modules/react/cjs/react.development.js:2667:24)
      at act (node_modules/react/cjs/react.development.js:2582:11)
      at render (test/Appointment.test.js:43:12)
      at Object.render (test/Appointment.test.js:64:9)

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (2 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (44 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.943 s, estimated 1 s
Ran all test suites.
```

## IGNORING UNUSED FUNCTION ARGUMENTS

The `map` function will provide an `appointment` argument to the function passed to it. Since we don’t use the argument (yet), we don’t need to mention it in the function signature—we can just pretend that our function has no arguments instead, hence the empty brackets. Don’t worry, we’ll need the argument for a subsequent test, and we’ll add it in then.

Great, let’s see what Jest thinks. Run `npm test` again:
  console.error

    Warning: Each child in a list should have a unique "key" prop.

    Check the render method of AppointmentsDayView.

    ...

PASS test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (19ms)

    ✓ renders another customer first name (2ms)

  AppointmentsDayView

    ✓ renders a div with the right id (7ms)

    ✓ renders an ol element to display appointments (16ms)

    ✓ renders an li for each appointment (16ms)

Our test passed, but we got a warning from React. It’s telling us to set a key value on each child element. We can use `startsAt` as a key, like this:
<ol>

  {appointments.map(appointment => (

    <li key={appointment.startsAt} />

  ))}

</ol>

TESTING KEYS

There’s no easy way for us to test key values in React. To do it, we’d need to rely on internal React properties, which would introduce a risk of tests breaking if the React team were to ever change those properties.

The best we can do is set a key to get rid of this warning message. In an ideal world, we’d have a test that uses the `startsAt` timestamp for each li key. Let’s just imagine that we have that test in place.

This section has covered how to render the basic structure of a list and its list items. Next, it’s time to fill in those items.

My `npm test` result:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (5 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (4 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.878 s, estimated 1 s
Ran all test suites.
```

## Specifying list item content
In this section, you’ll add a test that uses an array of example appointments to specify that the list items should show the time of each appointment, and then you’ll use that test to support the implementation.

Let’s start with the test:

Create a fourth test in the new `describe` block as shown:
it("renders the time of each appointment", () => {

  const today = new Date();

  const twoAppointments = [

    { startsAt: today.setHours(12, 0) },

    { startsAt: today.setHours(13, 0) },

  ];

  render(

    <AppointmentsDayView

      appointments={twoAppointments}

    />

  );

  const listChildren =

    document.querySelectorAll("li");

  expect(listChildren[0].textContent).toEqual(

    "12:00"

  );

  expect(listChildren[1].textContent).toEqual(

    "13:00"

  );

});

Jest will show the following error:

● AppointmentsDayView › renders the time of each appointment

expect(received).toEqual(expected) // deep equality

Expected: "12:00"

Received: ""

**My `npm test` result:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (3 ms)
    ✓ renders an li for each appointment (4 ms)
    ✕ renders the time of each appointment (6 ms)

  ● AppointmentsDayView › renders the time of each appointment

    expect(received).toEqual(expected) // deep equality

    Expected: "12:00"
    Received: ""

      82 |         );
      83 |         const listChildren = document.querySelectorAll("li");
    > 84 |         expect(listChildren[0].textContent).toEqual(
         |                                             ^
      85 |             "12:00"
      86 |         );
      87 |         expect(listChildren[1].textContent).toEqual(

      at Object.toEqual (test/Appointment.test.js:84:45)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 5 passed, 6 total
Snapshots:   0 total
Time:        0.947 s, estimated 1 s
Ran all test suites.
```




## THE TOEQUAL MATCHER

This matcher is a stricter version of `toContain`. The expectation only passes if the text content is an exact match. In this case, we think it makes sense to use `toEqual`. However, it’s often best to be as loose as possible with your expectations. Tight expectations have a habit of breaking any time you make the slightest change to your code base.

Add the following function to `src/Appointment.js`, which converts a Unix timestamp (which we get from the return value from `setHours`) into a time of day. It doesn’t matter where in the file you put it; we usually like to define constants before we use them, so this would go at the top of the file:
const appointmentTimeOfDay = (startsAt) => {

  const [h, m] = new Date(startsAt)

    .toTimeString()

    .split(":");

  return `${h}:${m}`;

}

UNDERSTANDING SYNTAX

This function uses *destructuring assignment* and *template literals*, which are language features that you can use to keep your functions concise.

**Having good unit tests can help teach advanced language syntax. If we’re ever unsure about what a function does, we can look up the tests that will help us figure it out.**

Use the preceding function to update `AppointmentsDayView` as follows:
<ol>

  {appointments.map(appointment => (

    <li key={appointment.startsAt}>

      {appointmentTimeOfDay(appointment.startsAt)}

    </li>

  ))}

</ol>

Running tests should show everything as green:
PASS test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (19ms)

    ✓ renders another customer first name (2ms)

  AppointmentsDayView

    ✓ renders a div with the right id (7ms)

    ✓ renders an ol element to display appointments (16ms)

    ✓ renders an li for each appointment (6ms)

    ✓ renders the time of each appointment (3ms)

## This is a great chance to refactor.

The last two `AppointmentsDayView` tests use the same `twoAppointments` prop value. This definition, and the `today` constant, can be lifted out into the `describe` scope, the same way we did with `customer` in the `Appointment` tests. This time, however, it can remain as `const` declarations as they never change.

To do that, move the `today` and `twoAppointments` definitions from one of the tests to the top of the `describe` block, above `beforeEach`. Then, delete the definitions from both tests.

That’s it for this test. Next, it’s time to focus on adding click behavior.

My `npm test` result after refactor:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (2 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (4 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.762 s, estimated 1 s
Ran all test suites
```

## Selecting data to view

Let’s add in some dynamic behavior to our page. We’ll make each of the list items a link that the user can click on to view that appointment.

Thinking through our design a little, there are a few pieces we’ll need:

A `button` element within our `li`
An `onClick` handler that is attached to that `button` element
Component state to record which appointment is currently being viewed

When we test React actions, we do it by observing the consequences of those actions. In this case, we can click on a button and then check that its corresponding appointment is now rendered on the screen.

We’ll break this section into two parts: first, we’ll specify how the component should initially appear, and second, we’ll handle a click event for changing the content.

Initial selection of data

Let’s start by asserting that each `li` element has a `button` element:

We want to display a message to the user if there are no appointments scheduled for today. In the `AppointmentsDayView` `describe` block, add the following test:
it("initially shows a message saying there are no appointments today", () => {

  render(<AppointmentsDayView appointments={[]} />);

  expect(document.body.textContent).toContain(

    "There are no appointments scheduled for today."

  );

});

My `npm test` result:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (3 ms)
    ✕ initially shows a message saying there are no appointments today (3 ms)

  ● AppointmentsDayView › initially shows a message saying there are no appointments today

    expect(received).toContain(expected) // indexOf

    Expected substring: "There are no appointments scheduled for today."
    Received string:    ""

      86 |     it("initially shows a message saying there are no appointments today", () => {
      87 |         render(<AppointmentsDayView appointments={[]} />);
    > 88 |         expect(document.body.textContent).toContain(
         |                                           ^
      89 |             "There are no appointments scheduled for today."
      90 |         );
      91 |     });

      at Object.toContain (test/Appointment.test.js:88:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 6 passed, 7 total
Snapshots:   0 total
Time:        0.909 s, estimated 1 s
Ran all test suites.
```

## Make the test pass by adding in a message at the bottom of the rendered output. We don’t need a check for an empty appointments array just yet; we’ll need another test to triangulate to that. The message is as follows:

return (

  <div id="appointmentsDayView">

    ...

    <p>There are no appointments scheduled for today.</p>

  </div>

);

My `npm test` result:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (2 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (9 ms)
    ✓ renders an ol element to display appointments (3 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (4 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.938 s, estimated 1 s
Ran all test suites.
```

## When the component first loads, we should show the first appointment of the day. A straightforward way to check that happens is to look for the customer's first name is shown on the page. Add the next test which does just that, shown below:
it("selects the first appointment by default", () => {

  render(

    <AppointmentsDayView

      appointments={twoAppointments}

    />

  );

  expect(document.body.textContent).toContain(

    "Ashley"

  );

});


My `npm test` results:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (10 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (6 ms)
    ✓ renders the time of each appointment (4 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✕ selects the first appointment by default (3 ms)

  ● AppointmentsDayView › selects the first appointment by default

    expect(received).toContain(expected) // indexOf

    Expected substring: "Ashley"
    Received string:    "12:0013:00There are no appointments scheduled for today."

       96 |             />
       97 |         );
    >  98 |         expect(document.body.textContent).toContain(
          |                                           ^
       99 |             "Ashley"
      100 |         );
      101 |     });

      at Object.toContain (test/Appointment.test.js:98:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 7 passed, 8 total
Snapshots:   0 total
Time:        1.311 s
Ran all test suites.
```

## Since we’re looking for the customer’s name, we’ll need to make sure that’s available in the `twoAppointments` array. Update it now to include the customer’s first name as follows:
const twoAppointments = [

  {

    startsAt: today.setHours(12, 0),

    customer: { firstName: "Ashley" },

  },

  {

    startsAt: today.setHours(13, 0),

    customer: { firstName: "Jordan" },

  },

];

Make the test pass by modifying the `Appointment` component. Change the last line of the `div` component to read as follows:
<div id="appointmentsDayView">

  ...

  {appointments.length === 0 ? (

    <p>There are no appointments scheduled for today.</p>

  ) : (

    <Appointment {...appointments[0]} />

  )}

</div>

Now we’re ready to let the user make a selection.

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (16 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (10 ms)
    ✓ renders an ol element to display appointments (6 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (4 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (2 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        1.02 s
Ran all test suites.
```

## Adding events to a functional component

We’re about to add `state` to our component. The component will show a button for each appointment. When the button is clicked, the component stores the array index of the appointment that it refers to. To do that, we’ll use the `useState` hook.

WHAT ARE HOOKS?

**Hooks are a feature of React that manages various non-rendering related operations.**

**The `useState` hook stores data across multiple renders of your function.**

The call to `useState` returns both the current value in storage and a setter function that allows it to be set.

If you’re new to hooks, check out the Further reading section at the end of this chapter. Alternatively, you could just follow along and see how much you can pick up just by reading the tests!

We’ll start by asserting that each `li` element has a `button` element:

Add the following test below the last one you added. The second expectation is peculiar in that it is checking the `type` attribute of the `button` element to be `button`. If you haven’t seen this before, it’s idiomatic when using button elements to define its role by setting the type attribute as shown in this test:
it("has a button element in each li", () => {

  render(

    <AppointmentsDayView

      appointments={twoAppointments}

    />

  );

  const buttons =

   document.querySelectorAll("li > button");

  expect(buttons).toHaveLength(2);

  expect(buttons[0].type).toEqual("button");

});

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (2 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (10 ms)
    ✓ renders an ol element to display appointments (5 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (4 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (2 ms)
    ✕ has a button element in each li (4 ms)

  ● AppointmentsDayView › has a button element in each li

    expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 0
    Received object: []

      108 |         );
      109 |         const buttons = document.querySelectorAll("li > button");
    > 110 |         expect(buttons).toHaveLength(2);
          |                         ^
      111 |         expect(buttons[0].type).toEqual("button");
      112 |     });
      113 | });

      at Object.toHaveLength (test/Appointment.test.js:110:25)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 8 passed, 9 total
Snapshots:   0 total
Time:        0.98 s, estimated 1 s
Ran all test suites.
```

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (10 ms)
    ✓ renders an ol element to display appointments (5 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (4 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (2 ms)
    ✓ has a button element in each li (4 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.934 s, estimated 1 s
Ran all test suites.
```

## We can now test what happens when the button is clicked. Back in test/Appointment.test.js, add the following as the next test. This uses the click function on the DOM element to raise a DOM click event:
it("renders another appointment when selected", () => {

  render(

    <AppointmentsDayView

      appointments={twoAppointments}

    />

  );

  const button =

    document.querySelectorAll("button")[1];

  act(() => button.click());

  expect(document.body.textContent).toContain(

    "Jordan"

  );

});

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (12 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (12 ms)
    ✓ renders an ol element to display appointments (5 ms)
    ✓ renders an li for each appointment (7 ms)
    ✓ renders the time of each appointment (6 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (3 ms)
    ✓ has a button element in each li (4 ms)
    ✕  (6 ms)

  ● AppointmentsDayView › 

    expect(received).toContain(expected) // indexOf

    Expected substring: "Jordan"
    Received string:    "12:0013:00Ashley"

      119 |         const button = document.querySelectorAll("button")[1];
      120 |         act(() => button.click());
    > 121 |         expect(document.body.textContent).toContain(
          |                                           ^
      122 |             "Jordan"
      123 |         );
      124 |     });

      at Object.toContain (test/Appointment.test.js:121:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 9 passed, 10 total
Snapshots:   0 total
Time:        1.03 s
Ran all test suites.
```

### SYNTHETIC EVENTS AND SIMULATE

An alternative to using the click function is to use the Simulate namespace from React’s test utilities to raise a synthetic event. While the interface for using Simulate is somewhat simpler than the DOM API for raising events, it’s also unnecessary for testing. There’s no need to use extra APIs when the DOM API will suffice. Perhaps more importantly, we also want our tests to reflect the real browser environment as much as possible.

Go ahead and run the test. The output will look like this:
  ● AppointmentsDayView › renders appointment when selected

    expect(received).toContain(expected)

    Expected substring: "Jordan"

    Received string:    "12:0013:00Ashley"

Notice the full text in the received string. We’re getting the text content of the list too because we’ve used document.body.textContent in our expectation rather than something more specific.

SPECIFICITY OF EXPECTATIONS

Don’t be too bothered about where the customer’s name appears on the screen. Testing document.body.textContent is like saying “I want this text to appear somewhere, but I don’t care where.” Often, this is enough for a test. Later on, we’ll see techniques for expecting text in specific places.

There’s a lot we now need to get in place in order to make the test pass. We need to introduce state and we need to add the handler. Perform the following steps:

Update the import at the top of the file to pull in the useState function as follows:
import React, { useState } from "react";

Wrap the constant definition in curly braces, and then return the existing value as follows:
export const AppointmentsDayView = (

  { appointments }

) => {

  return (

    <div id="appointmentsDayView">

      ...

    </div>

  );

Add the following line of code above the return statement:
const [selectedAppointment, setSelectedAppointment] =

  useState(0);

We can now use `selectedAppointment` rather than hardcoding an index selecting the right appointment. Change the return value to use this new state value when selecting an appointment, like this:
<div id="appointmentsDayView">

  ...

  <Appointment

    {...appointments[selectedAppointment]}

  />

</div>

Change the `map` call to include an index in its arguments. Let’s just name that i as shown here:
{appointments.map((appointment, i) => (

  <li key={appointment.startsAt}>

    <button type="button">

      {appointmentTimeOfDay(appointment.startsAt)}

    </button>

  </li>

))}

Now call setSelectedAppointment from within the onClick handler on the button element as follows:
<button

  type="button"

  onClick={() => setSelectedAppointment(i)}

>

Run your tests, and you should find they’re all green:
PASS test/Appointment.test.js

  Appointment

    ✓ renders the customer first name (18ms)

    ✓ renders another customer first name (2ms)

  AppointmentsDayView

    ✓ renders a div with the right id (7ms)

    ✓ renders multiple appointments in an ol element (16ms)

    ✓ renders each appointment in an li (4ms)

    ✓ initially shows a message saying there are no appointments today (6ms)

    ✓ selects the first element by default (2ms)

    ✓ has a button element in each li (2ms)

    ✓ renders another appointment when selected (3ms)

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
    ✓ renders another customer first name (3 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (12 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (5 ms)
    ✓ renders the time of each appointment (6 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (3 ms)
    ✓ has a button element in each li (3 ms)
    ✓ renders another appointment when selected (10 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.015 s
Ran all test suites.
```

We’ve covered a lot of detail in this section, starting with specifying the initial state of the view through to adding a button element and handling its onClick event.

We now have enough functionality that it makes sense to try it out and see where we’re at.

## Manually testing our changes

The words manual testing should strike fear into the heart of every TDDer because it takes up so much time. Avoid it when you can. Of course, we can’t avoid it entirely – when we’re done with a complete feature, we need to give it a once-over to check we’ve done the right thing.

As it stands, we can’t yet run our app. To do that, we’ll need to add an entry point and then use webpack to bundle our code.

Adding an entry point
React applications are composed of a hierarchy of components that are rendered at the root. Our application entry point should render this root component.

We tend to not test-drive entry points because any test that loads our entire application can become quite brittle as we add more and more dependencies into it. In Part 4, Behavior-Driven Development with Cucumber, we’ll look at using Cucumber tests to write some tests that will cover the entry point.

Since we aren’t test-driving it, we follow a couple of general rules:

Keep it as brief as possible
Only use it to instantiate dependencies for your root component and to call render
Before we run our app, we’ll need some sample data. Create a file named src/sampleData.js and fill it with the following code:


const today = new Date();
const at = (hours) => today.setHours(hours, 0);
export const sampleAppointments = [
  { startsAt: at(9), customer: { firstName: "Charlie" } },
  { startsAt: at(10), customer: { firstName: "Frankie" } },
  { startsAt: at(11), customer: { firstName: "Casey" } },
  { startsAt: at(12), customer: { firstName: "Ashley" } },
  { startsAt: at(13), customer: { firstName: "Jordan" } },
  { startsAt: at(14), customer: { firstName: "Jay" } },
  { startsAt: at(15), customer: { firstName: "Alex" } },
  { startsAt: at(16), customer: { firstName: "Jules" } },
  { startsAt: at(17), customer: { firstName: "Stevie" } },
];
IMPORTANT NOTE

The Chapter02/Complete directory in the GitHub repository contains a more complete set of sample data.

This list also doesn’t need to be test-driven for the following couple of reasons:

It’s a list of static data with no behavior. Tests are all about specifying behavior, and there’s none here.
This module will be removed once we begin using our backend API to pull data.
TIP

TDD is often a pragmatic choice. Sometimes, not test-driving is the right thing to do.

Create a new file, src/index.js, and enter the following code:


import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./Appointment";
import { sampleAppointments } from "./sampleData";
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <AppointmentsDayView appointments={sampleAppointments} />
);
That’s all you’ll need.

Putting it all together with webpack
Jest uses Babel to transpile all our code when it’s run in the test environment. But what about when we’re serving our code via our website? Jest won’t be able to help us there.

That’s where webpack comes in, and we can introduce it now to help us do a quick manual test as follows:

Install webpack using the following command:
npm install --save-dev webpack webpack-cli babel-loader

Add the following code to the scripts section of your package.json file:
"build": "webpack",

You’ll also need to set some configuration for webpack. Create the webpack.config.js file in your project root directory with the following content:
const path = require("path");

const webpack = require("webpack");

module.exports = {

  mode: "development",

  module: {

    rules: [

      {

        test: /\.(js|jsx)$/,

        exclude: /node_modules/,

        loader: "babel-loader",

      },

    ],

  },

};

This configuration works for webpack in development mode. Consult the webpack documentation for information on setting up production builds.

In your source directory, run the following commands:
mkdir dist

touch dist/index.html

Add the following content to the file you just created:
<!DOCTYPE html>

<html>

  <head>

    <title>Appointments</title>

  </head>

  <body>

    <div id="root"></div>

    <script src="main.js"></script>

  </body>

</html>

You’re now ready to run the build using the following command:
npm run build

You should see output such as the following:

modules by path ./src/*.js 2.56 KiB

  ./src/index.js 321 bytes [built] [code generated]

  ./src/Appointment.js 1.54 KiB [built] [code generated]

  ./src/sampleData.js 724 bytes [built] [code generated]

webpack 5.65.0 compiled successfully in 1045 ms

Open dist/index.html in your browser and behold your creation!
The following screenshot shows the application once the Exercises are completed, with added CSS and extended sample data. To include the CSS, you’ll need to pull dist/index.html and dist/styles.css from the Chapter02/Complete directory.

Figure 2.2 – The application so far
Figure 2.2 – The application so far

BEFORE YOU COMMIT YOUR CODE INTO GIT...

Make sure to add dist/main.js to your .gitignore file as follows:

echo "dist/main.js" >> .gitignore

The main.js file is generated by webpack, and as with most generated files, you shouldn’t check it in.

You may also want to add README.md at this point to remind yourself how to run tests and how to build the application.

You’ve now seen how to put TDD aside while you created an entry point: since the entry point is small and unlikely to change frequently, we’ve opted not to test-drive it.

Summary
In this chapter, you’ve been able to practice the TDD cycle a few times and get a feel for how a feature can be built out using tests as a guide.

We started by designing a quick mock-up that helped us decide our course of action. We have built a container component (AppointmentsDayView) that displayed a list of appointment times, with the ability to display a single Appointment component depending on which appointment time was clicked.

We then proceeded to get a basic list structure in place, then extended it to show the initial Appointment component, and then finally added the onClick behavior.

This testing strategy, of starting with the basic structure, followed by the initial view, and finishing with the event behavior, is a typical strategy for testing components.

We’ve only got a little part of the way to fully building our application. The first few tests of any application are always the hardest and take the longest to write. We are now over that hurdle, so we’ll move quicker from here onward.

My `npm run build` output:
```
npm run build

> my-mastering-tdd@1.0.0 build
> webpack

asset main.js 1.13 MiB [emitted] (name: main)
runtime modules 1.04 KiB 5 modules
modules by path ./node_modules/ 1.08 MiB
  modules by path ./node_modules/@babel/runtime/helpers/esm/*.js 2.04 KiB 6 modules
  modules by path ./node_modules/react-dom/ 1000 KiB 3 modules
  modules by path ./node_modules/react/ 85.7 KiB
    ./node_modules/react/index.js 190 bytes [built] [code generated]
    ./node_modules/react/cjs/react.development.js 85.5 KiB [built] [code generated]
  modules by path ./node_modules/scheduler/ 17.3 KiB
    ./node_modules/scheduler/index.js 198 bytes [built] [code generated]
    ./node_modules/scheduler/cjs/scheduler.development.js 17.1 KiB [built] [code generated]
modules by path ./src/*.js 2.61 KiB
  ./src/index.js 328 bytes [built] [code generated]
  ./src/Appointment.js 1.58 KiB [built] [code generated]
  ./src/sampleData.js 722 bytes [built] [code generated]
webpack 5.90.1 compiled successfully in 964 ms
```

Exercises
1.
Rename Appointment.js and Appointment.test.js to AppointmentsDayView.js and AppointmentsDayView.test.js. While it’s fine to include multiple components in one file if they form a hierarchy, you should always name the file after the root component for that hierarchy.


2.
Complete the Appointment component by displaying the following fields on the page. You should use a table HTML element to give the data some visual structure. This shouldn’t affect how you write your tests. The fields that should be displayed are the following:
    1. Customer last name, using the lastName field
    2. Customer telephone number, using the phoneNumber field
    3. Stylist name, using the stylist field
    4. Salon service, using the service field
    5. Appointment notes, using the notes field

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
  Appointment
    ✓ renders the customer first name (22 ms)
    ✓ renders another customer first name (4 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (3 ms)
    ✓ renders an li for each appointment (6 ms)
    ✓ renders the time of each appointment (6 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (2 ms)
    ✓ has a button element in each li (4 ms)
    ✓ renders another appointment when selected (10 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.032 s
Ran all test suites.
```

3.
Add a heading to Appointment to make it clear which appointment time is being viewed.

4.
There is some repeated sample data. We’ve used sample data in our tests, and we also have sampleAppointments in src/sampleData.js, which we used to manually test our application. Do you think it is worth drying this up? If so, why? If not, why not?

Further reading

Hooks are a relatively recent addition to React. Traditionally, React used classes for building components with state. For an overview of how hooks work, take a look at React’s own comprehensive documentation at the following link:

https://reactjs.org/docs/hooks-overview.html.


