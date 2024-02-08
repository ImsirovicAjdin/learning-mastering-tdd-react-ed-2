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

## CH 3: Refactoring the test suite

At this point, you’ve written a handful of tests. Although they may seem simple enough already, they can be simpler.

It’s extremely important to build a maintainable test suite: one that is quick and painless to build and adapt. One way to roughly gauge maintainability is to look at the number of lines of code in each test. To give some comparison to what you’ve seen so far, in the Ruby language, a test with more than three lines is considered a long test!

This chapter will take a look at some of the ways you can make your test suite more concise. We’ll do that by extracting common code into a module that can be reused across all your test suites. We’ll also create a custom Jest matcher.

WHEN IS THE RIGHT TIME TO PULL OUT REUSABLE CODE?

So far, you’ve written one module with two test suites within it. It’s arguably too early to be looking for opportunities to extract duplicated code. Outside of an educational setting, you may wish to wait until the third or fourth test suite before you pounce on any duplication.

The following topics will be covered in this chapter:

Pulling out reusable rendering logic
Creating a Jest matcher using TDD
Extracting DOM helpers
By the end of the chapter, you’ll have learned how to approach your test suite with a critical eye for maintainability.

Technical requirements
The code files for this chapter can be found here: https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter03.

Pulling out reusable rendering logic
In this section, we will extract a module that initializes a unique DOM container element for each test. Then, we’ll build a render function that uses this container element.

The two test suites we’ve built both have the same beforeEach block that runs before each test:


let container;
beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
});

**Wouldn’t it be great if we could somehow tell Jest that any test suite that is testing a React component should always use this beforeEach block and make the container variable available to our tests?**

Here, we will extract a new module that exports two things: the container variable and the initializeReactContainer function. This won’t save us any typing, but it will hide the pesky let declaration and give a descriptive name to the call to createElement.

THE IMPORTANCE OF SMALL FUNCTIONS WITH DESCRIPTIVE NAMES

Often, it’s helpful to pull out functions that contain just a single line of code. The benefit is that you can then give it a descriptive name that serves as a comment as to what that line of code does. This is preferable to using an actual comment because the name travels with you wherever you use the code.

**In this case, the call to document.createElement could be confusing to a future maintainer of your software. Imagine that it is someone who has never done any unit testing of React code. They would be asking, “Why do the tests create a new DOM element for each and every test?” You can go some way to answer that by giving it a name, such as initializeReactContainer.**

It doesn’t offer a complete answer as to why it’s necessary, but it does allude to some notion of “initialization.”

Let’s go ahead and pull out this code:

1.
Create a new file called test/reactTestExtensions.js. This file will ultimately contain a whole bunch of helper methods that we’ll use in our React component tests.

2.
Add the following content to the file. The function is implicitly updating the container variable within the module. That variable is then exported – our test suites can access this variable as if it were a “read-only” constant:
export let container;

export const initializeReactContainer = () => {

  container = document.createElement("div");

  document.body.replaceChildren(container);

}

3.
Move to test/AppointmentsDayView.test.js. Add the following import just below the existing imports:
import {

  initializeReactContainer,

  container,

} from "./reactTestExtensions";

4.
Now, replace the two beforeEach blocks – remember that there is one in each describe block – with the following code:
beforeEach(() => {

  initializeReactContainer();

});

5.
Delete the let container definition from the top of both describe blocks.

6.
Run npm test and verify that your tests are still passing.

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
  Appointment
    ✓ renders the customer first name (20 ms)
    ✓ renders another customer first name (5 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (3 ms)
    ✓ renders an li for each appointment (6 ms)
    ✓ renders the time of each appointment (8 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (3 ms)
    ✓ has a button element in each li (5 ms)
    ✓ renders another appointment when selected (11 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.133 s
Ran all test suites.
```

## Now, how about continuing with the render function?

Let’s move that into our new module. This time, it’s a straight lift and replace job:

1.
Copy the definition of render from one of the describe blocks.

2.
Paste it into reactTestExtensions.js. For reference, here it is again:
```js
export const render = (component) =>

  act(() =>

    ReactDOM.createRoot(container).render(component)

  );
```

3.
You’ll also need to add these imports at the top of the file:

import ReactDOM from "react-dom/client";


import { act } from "react-dom/test-utils";

4.
Back in your test file, you can now change the test extensions import so that it includes the new render function, and then remove the container import:

import {

  initializeReactContainer,

  render,

} from "./reactTestExtensions";

5.
Delete the two render definitions from the two test suites.

6.
Run npm test and verify that your tests are still passing.

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/AppointmentsDayView.test.js
  Appointment
    ✕ renders the customer first name (3 ms)
    ✕ renders another customer first name (2 ms)
  AppointmentsDayView
    ✕ renders a div with the right id (1 ms)
    ✕ renders an ol element to display appointments
    ✕ renders an li for each appointment (1 ms)
    ✕ renders the time of each appointment (1 ms)
    ✕ initially shows a message saying there are no appointments today (1 ms)
    ✕ selects the first appointment by default (1 ms)
    ✕ has a button element in each li (1 ms)
    ✕ renders another appointment when selected (1 ms)

  ● Appointment › renders the customer first name

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:20:15)

  ● Appointment › renders another customer first name

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:26:15)

  ● AppointmentsDayView › renders a div with the right id

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:44:15)

  ● AppointmentsDayView › renders an ol element to display appointments

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:52:15)

  ● AppointmentsDayView › renders an li for each appointment

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:57:15)

  ● AppointmentsDayView › renders the time of each appointment

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:66:15)

  ● AppointmentsDayView › initially shows a message saying there are no appointments today

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:80:15)

  ● AppointmentsDayView › selects the first appointment by default

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:86:15)

  ● AppointmentsDayView › has a button element in each li

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:96:15)

  ● AppointmentsDayView › renders another appointment when selected

    TypeError: Cannot read properties of undefined (reading 'createRoot')

       9 |
      10 | export const render = component => act(() =>
    > 11 |     ReactDOM.createRoot(container).render(component)
         |              ^
      12 | );
      13 |

      at createRoot (test/reactTestExtensions.js:11:14)
      at act (node_modules/react/cjs/react.development.js:2512:16)
      at render (test/reactTestExtensions.js:10:39)
      at Object.<anonymous> (test/AppointmentsDayView.test.js:106:15)

Test Suites: 1 failed, 1 total
Tests:       10 failed, 10 total
Snapshots:   0 total
Time:        0.873 s, estimated 1 s
Ran all test suites.
```

THE SOLUTION?

Instead of this (in reactTestExtensions.js):
```
import { ReactDOM } from "react-dom/client";
```

Do this:
```
import ReactDOM from "react-dom/client";
```

Here's my `npm test` result after the above:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
  Appointment
    ✓ renders the customer first name (18 ms)
    ✓ renders another customer first name (4 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (8 ms)
    ✓ renders an ol element to display appointments (4 ms)
    ✓ renders an li for each appointment (6 ms)
    ✓ renders the time of each appointment (6 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (3 ms)
    ✓ has a button element in each li (4 ms)
    ✓ renders another appointment when selected (10 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.026 s
Ran all test suites.
```

## So far, we've extracted two functions. We have one more to do: the click function. However, we have one more “action” function that we can create: click. Let’s do that now:

1.
Create the click function in your test extensions file, as shown here:
export const click = (element) =>

  act(() => element.click());

2.
Back in your test file, adjust your import:
import {

  initializeReactContainer,

  container,

  render,

  click,

} from "./reactTestExtensions";

3.
In your test suite, replace each invocation of the click function with the following line:
click(button);

4.
The act import is no longer needed in your test suite. Go ahead and delete that import from your test file.

5.
Run npm test and verify that your tests are still passing.

AVOIDING THE ACT FUNCTION IN YOUR TEST CODE

The act function causes a fair amount of clutter in tests, which doesn’t help in our quest for conciseness. Thankfully, we can push it out into our extensions module and be done with it.

Remember the Arrange-Act-Assert pattern that our tests should always follow? Well, we’ve now extracted everything we can from the Arrange and Act sections.

**The approach we’ve taken here, of using an exported container variable, isn’t the only approach worth exploring. You could, for example, build a wrapper function for describe that automatically includes a beforeEach block and builds a container variable that’s accessible within the scope of that describe block. You could name it something like describeReactComponent.**

Above: @TODO ChatGPT

An advantage of this approach is that it involves a lot less code – you won’t be dealing with all those imports, and you could get rid of your beforeEach block in the test suites. The downside is that it’s very clever, which is not always a good thing when it comes to maintainability. There’s something a bit magical about it that requires a certain level of prior knowledge.

That being said, if this approach appeals to you, I encourage you to try it out.

In the next section, we’ll start to tackle the Assert section of our tests.

**Result of my `npm test` run:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
  Appointment
    ✓ renders the customer first name (18 ms)
    ✓ renders another customer first name (4 ms)
  AppointmentsDayView
    ✓ renders a div with the right id (12 ms)
    ✓ renders an ol element to display appointments (5 ms)
    ✓ renders an li for each appointment (7 ms)
    ✓ renders the time of each appointment (6 ms)
    ✓ initially shows a message saying there are no appointments today (2 ms)
    ✓ selects the first appointment by default (3 ms)
    ✓ has a button element in each li (5 ms)
    ✓ renders another appointment when selected (10 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.004 s
Ran all test suites.
```

## Creating a Jest matcher using TDD

In our tests so far, we’ve used a variety of matchers. These functions tack on to the end of the expect function call:

expect(appointmentTable()).not.toBeNull();

In this section, you’ll build a matcher using a test-driven approach to make sure it’s doing the right thing. You’ll learn about the Jest matcher API as you build your test suite.

You’ve seen quite a few matchers so far: toBeNull, toContain, toEqual, and toHaveLength. You’ve also seen how they can be negated with not.

**Matchers are a powerful way of building expressive yet concise tests. You should take some time to learn all the matchers that Jest has to offer.**

JEST MATCHER LIBRARIES

There are a lot of different matcher libraries available as npm packages. Although we won’t use them in this book (since we’re building everything up from first principles), you should make use of these libraries. See the Further reading section at the end of this chapter for a list of libraries that will be useful to you when testing React components.

Often, you’ll want to build matchers. There are at least a couple of occasions that will prompt you to do this:

An expectation you’re writing is quite wordy, lengthy, or just doesn’t read well in plain language.
Some of the tests are repeating the same group of expectations again and again. This is a sign that you have a business concept that you can encode in a single matcher that will be specific to your project.
The second point is an interesting one. If you’re writing the same expectations multiple times across multiple tests, you should treat it just like you would if it was repeated code in your production source code. You’d pull that out into a function. Here, the matcher serves the same purpose, except using a matcher instead of a function helps remind you that this line of code is a special statement of fact about your software: a specification.

ONE EXPECTATION PER TEST

You should generally aim for just one expectation per test. "Future you" will thank you for keeping things simple! (In Chapter 5, Adding Complex Form Interactions, we’ll look at a situation where multiple expectations are beneficial.)

You might hear this guideline and be instantly horrified. You might be imagining an explosion of tiny tests. But if you’re ready to write matchers, you can aim for one expectation per test and still keep the number of tests down.

The matcher we’re going to build in this section is called `toContainText`. It will replace the following expectation:


expect(appointmentTable().textContent).toContain("Ashley");

It will replace it with the following form, which is slightly more readable:

expect(appointmentTable()).toContainText("Ashley");

Here’s what the output looks like on the terminal:

Figure 3.1 – The output of the toContainText matcher when it fails
Figure 3.1 – The output of the toContainText matcher when it fails

Let’s get started:

1.
Create a new directory named test/matchers. This is where both the source code and tests for the matchers will live.

2.
Create the new test/matchers/toContainText.test.js file.

3.
Write the first test, as shown here. This test introduces a couple of new ideas.

First, it shows that matcher is a function that takes two parameters: the actual element and the data to match on. Second, it shows that the function returns an object with a pass property. This property is true if the matcher successfully “matched” – in other words, it passed:
import { toContainText } from "./toContainText";

describe("toContainText matcher", () => {

  it("returns pass is true when text is found in the given DOM element", () => {

    const domElement = {

      textContent: "text to find"

    };

    const result = toContainText(

      domElement,

      "text to find"

    );

    expect(result.pass).toBe(true);

  });

});

**My `npm test` results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/matchers/toContainText.test.js
  ● Test suite failed to run

    Cannot find module './toContainText' from 'test/matchers/toContainText.test.js'

    However, Jest was able to find:
        './toContainText.test.js'

    You might want to include a file extension in your import, or update your 'moduleFileExtensions', which is currently ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'].

    See https://jestjs.io/docs/configuration#modulefileextensions-arraystring

    > 1 | import { toContainText } from "./toContainText";
        | ^
      2 |
      3 | describe("toContainText matcher", () => {
      4 |     it("returns pass is true when text is found in the given DOM element", () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (test/matchers/toContainText.test.js:1:1)

 PASS  test/AppointmentsDayView.test.js

Test Suites: 1 failed, 1 passed, 2 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.057 s
Ran all test suites.
```

## Create another new file called test/matchers/toContainText.js. This first test is trivial to make pass:
export const toContainText = (

  received,

  expectedText

) => ({

  pass: true

});

My `npm test` result:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        1.081 s
Ran all test suites.
```

## We need to triangulate to get to the real implementation. Write the next test, as shown here:
it("return pass is false when the text is not found in the given DOM element", () => {

  const domElement = { textContent: "" };

  const result = toContainText(

    domElement,

    "text to find"

  );

  expect(result.pass).toBe(false);

});

6.
Now, continue the implementation for our matcher, as shown here. At this stage, you have a functioning matcher – it just needs to be plugged into Jest:
export const toContainText = (

  received,

  expectedText

) => ({

  pass: received.textContent.includes(expectedText)

});


**My `npm test` result:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        1.031 s
Ran all test suites.
```

7.
Before we make use of this, it’s good practice to fill in an expected second property of your return value: message. So, go ahead and do that. The following test shows that we expect the message to contain the matcher text itself, as a useful reminder to the programmer:
it("returns a message that contains the source line if no match", () => {

  const domElement = { textContent: "" };

  const result = toContainText(

    domElement,

    "text to find"

  );

  expect(

    stripTerminalColor(result.message())

  ).toContain(

    `expect(element).toContainText("text to find")`

  );

});

UNDERSTANDING THE MESSAGE FUNCTION

The requirements for the message function are complex. At a basic level, it is a helpful string that is displayed when the expectation fails. However, it’s not just a string – it’s a function that returns a string. This is a performance feature: the value of message does not need to be evaluated unless there is a failure. But even more complicated is the fact that the message should change, depending on whether the expectation was negated or not. If pass is false, then the message function should assume that the matcher was called in the “positive” sense – in other words, without a .not qualifier. But if pass is true, and the message function ends up being invoked, then it’s safe to assume that it was negated. We’ll need another test for this negated case, which comes a little later.

This function uses a stripTerminalColor function that we should now define, above the test suite. Its purpose is to remove any ASCII escape codes that add colors:
const stripTerminalColor = (text) =>

    text.replace(/\x1B\[\d+m/g, "");

TESTING ASCII ESCAPE CODES

As you’ve seen already, when Jest prints out test failures, you’ll see a bunch of red and green colorful text. That’s achieved by printing ASCII escape codes within the text string.

This is a tricky thing to test. Because of that, we’re making a pragmatic choice to not bother testing colors. Instead, the stripTerminalColor function strips out these escape codes from the string so that you can test the text output as if it was plain text.

Make that test pass by making use of Jest’s matcherHint and printExpected functions, as shown here. It isn’t particularly clear how the matcherHint function works but, hopefully, you can convince yourself that it does what we expect by running tests and seeing the last one pass! The printExpected functions add quotes to our value and colors it green:
import {

  matcherHint,

  printExpected,

} from "jest-matcher-utils";

export const toContainText = (

  received,

  expectedText

) => {

  const pass =

    received.textContent.includes(expectedText);

  const message = () =>

    matcherHint(

      "toContainText",

      "element",

      printExpected(expectedText),

      { }

    );

  return { pass, message };

};

LEARNING ABOUT JEST’S MATCHER UTILITIES

At the time of writing, I’ve found the best way to learn what the Jest matcher utility functions do is to read their source. You could also avoid them entirely if you like – there’s no obligation to use them.

Now comes the complicated part. Add the following test, which specifies the scenario of a failed expectation when using the negated matcher. The message should reflect that the matcher was negated, as shown here:
it("returns a message that contains the source line if negated match", () => {

  const domElement = { textContent: "text to find" };

  const result = toContainText(

    domElement,

    "text to find"

  );

  expect(

    stripTerminalColor(result.message())

  ).toContain(

    `expect(container).not.toContainText("text to find")`

  );

});

To make that pass, pass a new option to matcherHint:
...

matcherHint(

  "toContainText",

  "element",

  printExpected(expectedText),

  { isNot: pass }

);

There’s one final test to add. We can print out the actual textContent property value of the element, which will help debug test failures when they occur. Add the following test:
it("returns a message that contains the actual text", () => {

  const domElement = { textContent: "text to find" };

  const result = toContainText(

    domElement,

    "text to find"

  );

  expect(

    stripTerminalColor(result.message())

  ).toContain(`Actual text: "text to find"`);

});

Make it pass by adjusting your matcher code, as shown here. Note the use of the new printReceived function, which is the same as printExpected except it colors the text red instead of green:
import {

  matcherHint,

  printExpected,

  printReceived,

} from "jest-matcher-utils";

export const toContainText = (

  received,

  expectedText

) => {

  const pass =

    received.textContent.includes(expectedText);

  const sourceHint = () =>

    matcherHint(

      "toContainText",

      "element",

      printExpected(expectedText),

      { isNot: pass }

    );

  const actualTextHint = () =>

    "Actual text: " +

    printReceived(received.textContent);

  const message = () =>

    [sourceHint(), actualTextHint()].join("\n\n");

  return { pass, message };

};

It’s time to plug the test into Jest. To do that, create a new file called test/domMatchers.js with the following content:
import {

  toContainText

} from "./matchers/toContainText";

expect.extend({

  toContainText,

});

Open package.json and update your Jest configuration so that it loads this file before your tests run:
"jest": {

  ...,

  "setupFilesAfterEnv": ["./test/domMatchers.js"]

}

Your new matcher is ready to use. Open test/AppointmentsDayView.test.js and change all your tests that use the expect(<element>.textContent).toEqual(<text>)and expect(<element>.textContent).toContain(<text>) forms. They should be replaced with expect(<element>).toContainText(<text>).
Run your tests; you should see them all still passing. Take a moment to play around and see how your matcher works. First, change one of the expected text values to something incorrect, and watch the matcher fail. See how the output messages look. Then, change the expected value back to the correct one, but negate the matcher by changing it to .not.toContainText. Finally, revert your code to the all-green state.
WHY DO WE TEST-DRIVE MATCHERS?

You should write tests for any code that isn’t just simply calling other functions or setting variables. At the start of this chapter, you extracted functions such as render and click. These functions didn’t need tests because you were just transplanting the same line of code from one file to another. But this matcher does something much more complex – it must return an object that conforms to the pattern that Jest requires. It also makes use of Jest’s utility functions to build up a helpful message. That complexity warrants tests.

If you are building matchers for a library, you should be more careful with your matcher’s implementation. For example, we didn’t bother to check that the received value is an HTML element. That’s fine because this matcher exists in our code base only, and we control how it’s used. When you package matchers for use in other projects, you should also verify that the function inputs are values you’re expecting to see.

You’ve now successfully test-driven your first matcher. There will be more opportunities for you to practice this skill as this book progresses. For now, we’ll move on to the final part of our cleanup: creating some fluent DOM helpers.

Extracting DOM helpers
In this section, we’ll pull out a bunch of little functions that will help our tests become more readable. This will be straightforward compared to the matcher we’ve just built.

The reactTestExtensions.js module already contains three functions that you’ve used: initializeReactContainer, render, and click.

Now, we’ll add four more: element, elements, typesOf, and textOf. These functions are designed to help your tests read much more like plain English. Let’s take a look at an example. Here are the expectations for one of our tests:


const listChildren = document.querySelectorAll("li");
expect(listChildren[0].textContent).toEqual("12:00");
expect(listChildren[1].textContent).toEqual("13:00");
We can introduce a function, elements, that is a shorter version of document.querySelectorAll. The shorter name means we can get rid of the extra variable:


expect(elements("li")[0].textContent).toEqual("12:00");
expect(elements("li")[1].textContent).toEqual("13:00");
This code is now calling querySelectorAll twice – so it’s doing more work than before – but it’s also shorter and more readable. And we can go even further. We can boil this down to one expect call by matching on the elements array itself. Since we need textContent, we will simply build a mapping function called textOf that takes that input array and returns the textContent property of each element within it:


expect(textOf(elements("li"))).toEqual(["12:00", "13:00"]);
The toEqual matcher, when applied to arrays, will check that each array has the same number of elements and that each element appears in the same place.

We’ve reduced our original three lines of code to just one!

Let’s go ahead and build these new helpers:

Open test/reactTestExtensions.js and add the following definitions at the bottom of the file. You’ll notice that the elements are using Array.from. This is so that the resulting array can be mapped over by both typesOf and textOf:
export const element = (selector) =>

  document.querySelector(selector);

export const elements = (selector) =>

  Array.from(document.querySelectorAll(selector));

export const typesOf = (elements) =>

  elements.map((element) => element.type);

export const textOf = (elements) =>

  elements.map((element) => element.textContent);

Open test/AppointmentsDayView.test.js and change the extensions import to include all these new functions:
import {

  initializeReactContainer,

  render,

  click,

  element,

  elements,

  textOf,

  typesOf,

} from "./reactTestExtensions";

Now, do a search and replace for document.querySelectorAll, replacing each occurrence with elements. Run npm test and verify that your tests still pass.
Search for and replace document.querySelector, replacing each occurrence with element. Again, run your tests and check that everything is fine.
You will see that the test renders at the time of the appointment. Replace the existing expectations with this one:
expect(textOf(elements("li"))).toEqual([

  "12:00", "13:00"

]);

Find the "has a button element in each li" test and replace the existing expectations with the following single expectation. Observe that the expectation on the length of the array is no longer necessary if your expectation tests the entire array:
expect(typesOf(elements("li > *"))).toEqual([

  "button",

  "button",

]);

The final three tests pull out the second button on the screen using elements("button")[1]. Push this definition up, just below the beforeEach block, and give it a more descriptive name:
const secondButton = () => elements("button")[1];

Now, you can use this in the three tests. Go ahead and update them now. For example, the middle test can be updated as follows:
click(secondButton());

expect(secondButton().className).toContain("toggled");

As a final touch, inline the listChild and listElement variables that appear in some of the tests – in other words, remove the use of variables and call the function directly within the expectation. As an example, the "renders an ol element to display appointments" test can have its expectation rewritten, as follows:
expect(element("ol")).not.toBeNull();

Run npm test one final time and verify that everything is still green.
NOT ALL HELPERS NEED TO BE EXTRACTED

You’ll notice that the helpers you have extracted are all very generic – they make no mention of the specific components under test. It’s good to keep helpers as generic as possible. On the other hand, sometimes it helps to have very localized helper functions. In your test suite, you already have one called appointmentsTable and another called secondButton. These should remain in the test suite because they are local to the test suite.

In this section, you’ve seen our final technique for simplifying your test suites, which is to pull out fluent helper functions that help keep your expectations short and help them read like plain English.

You've also seen the trick of running expectations on an array of items rather than having an expectation for individual items. This isn’t always the appropriate course of action. You’ll see an example of this in Chapter 5, Adding Complex Form Interactions.

Summary
This chapter focused on improving our test suites. Readability is crucially important. Your tests act as specifications for your software. Each component test must clearly state what the expectation of the component is. And when a test fails, you want to be able to understand why it’s failed as quickly as possible.

You’ve seen that these priorities are often in tension with our usual idea of what good code is. For example, in our tests, we are willing to sacrifice performance if it makes the tests more readable.

If you’ve worked with React tests in the past, think about how long an average test was.In this chapter, you've seen a couple of mechanisms for keeping your test short: building domain-specific matchers and extracting little functions for querying the DOM.

You’ve also learned how to pull out React initialization code to avoid clutter in our test suites.

In the next chapter, we’ll move back to building new functionality into our app: data entry with forms.

Exercises
Using the techniques you’ve just learned, create a new matcher named toHaveClass that replaces the following expectation:


expect(secondButton().className).toContain("toggled");
With your new matcher in place, it should read as follows:


expect(secondButton()).toHaveClass("toggled");
There is also the negated form of this matcher:


expect(secondButton().className).not.toContain("toggled");
Your matcher should work for this form and display an appropriate failure message.

Further reading
To learn more about the topics that were covered in this chapter, take a look at the following resources:

The following GitHub repository contains useful matchers for testing React components: https://github.com/jest-community/jest-extended
The following link provides the source of Jest’s matcher utilities, which I find useful for figuring out how to write simple matchers: https://github.com/facebook/jest/tree/main/packages/jest-matcher-utils

## My `npm test` results after the above:
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 3 passed, 3 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        1.128 s
Ran all test suites.
```

## Chapter 4: Test-driving data input

In this chapter, you’ll explore React forms and controlled components.

Forms are an essential part of building web applications, being the primary way that users enter data. If we want to ensure our application works, then invariably, that’ll mean we need to write automated tests for our forms. What’s more, there’s a lot of plumbing required to get forms working in React, making it even more important that they’re well-tested.

Automated tests for forms are all about the user’s behavior: entering text, clicking buttons, and submitting the form when complete.

We will build out a new component, CustomerForm, which we will use when adding or modifying customers. It will have three text fields: first name, last name, and phone number.

In the process of building this form, you’ll dig deeper into testing complex DOM element trees. You’ll learn how to use parameterized tests to repeat a group of tests without duplicating code.

The following topics will be covered in this chapter:

Adding a form element
Accepting text input
Submitting a form
Duplicating tests for multiple form fields
By the end of this chapter, you’ll have a decent understanding of test-driving HTML forms with React.

Technical requirements
The code files for this chapter can be found here: https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter04.

Adding a form element
An HTML form is a bunch of fields wrapped in a form element. Even though we’re mostly interested in the fields, we need to start with the form element itself. That’s what we’ll build in this section.

Let’s create our first form by following these steps:

Create a new file called test/CustomerForm.test.js and add the following scaffold. It contains all the usual imports and component test initialization that you’ve seen in the previous chapters:
import React from "react";

import {

  initializeReactContainer,

  render,

  element,

} from "./reactTestExtensions";

import { CustomerForm } from "../src/CustomerForm";

describe("CustomerForm", () => {

  beforeEach(() => {

    initializeReactContainer();

  });

});

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● Test suite failed to run

    Cannot find module '../src/CustomerForm' from 'test/CustomerForm.test.js'

       7 | } from "./reactTestExtensions";
       8 |
    >  9 | import { CustomerForm } from "../src/CustomerForm";
         | ^
      10 |
      11 | describe("CustomerForm", () => {
      12 |     beforeEach(() => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (test/CustomerForm.test.js:9:1)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        1.455 s
Ran all test suites.
```

## Now you’re ready to create your first test. Add the following test to the describe block:
it("renders a form", () => {

  render(<CustomerForm />);

  expect(element("form")).not.toBeNull();

});

We have a complete test, so let’s run it and see what happens:
FAIL test/CustomerForm.test.js

  ● Test suite failed to run

    Cannot find module '../src/CustomerForm' from 'CustomerForm.test.js'

The failure tells us that it can’t find the module. That’s because we haven’t created it yet.

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js
 FAIL  test/CustomerForm.test.js
  ● Test suite failed to run

    Cannot find module '../src/CustomerForm' from 'test/CustomerForm.test.js'

       7 | } from "./reactTestExtensions";
       8 |
    >  9 | import { CustomerForm } from "../src/CustomerForm";
         | ^
      10 |
      11 | describe("CustomerForm", () => {
      12 |     beforeEach(() => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.require (test/CustomerForm.test.js:9:1)

Test Suites: 1 failed, 3 passed, 4 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        1.404 s
Ran all test suites.
```

## So, create a blank file named src/CustomerForm.js. Running your test again should give you the following output:
FAIL test/CustomerForm.test.js

● CustomerForm › renders a form

   Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

       8 |

       9 | export const render = (component) =>

    > 10 |   act(() =>

      11 |     ReactDOM.createRoot(...).render(...)

         |     ^

      12 |   );

      11 |

      12 | export const click = (element) =>

      13 |   act(() => element.click());

** My `npm test` result after the above:**
```
Same as above...
```

## STACK TRACES FROM TEST HELPER CODE

Jest’s stack trace points to a failure within our extensions code, not the test itself. If our code was in an npm module, Jest would have skipped those test lines from its output. Thankfully, the error message is helpful enough.

To fix this issue, we need to add an export that matches the import we wrote at the top of our test file. Add the following line to src/CustomerForm.js:
export const CustomerForm = () => null;

Running some tests gives the actual expectation failure:
● CustomerForm › renders a form

  expect(received).not.toBeNull()

  Received: null

**My `npm test` result after the above:**
```
The same as above...
```

## This can be fixed by making the component return something:

import React from "react";

export const CustomerForm = () => <form />;

Before moving on, let’s pull out a helper for finding the form element. As in the previous chapter, this is arguably premature as we have only one test using this code right now. However, we’ll appreciate having the helper when we come to write our form submission tests later.

Open test/reactTestExtensions.js and add the following function:
export const form = (id) => element("form");

Modify your test file by adding the following import. You can leave the element import in place because we’ll use it later in the next section:
import {

  initializeReactContainer,

  render,

  element,

  form,

} from "./reactTestExtensions";

Finally, update your test to use the helper, as shown here. After this, your test should still be passing:
it("renders a form", () => {

  render(<CustomerForm />);

  expect(form()).not.toBeNull();

});

That’s all there is to creating the basic form element. With that wrapper in place, we’re now ready to add our first field element: a text box.

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 4 passed, 4 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        1.335 s
Ran all test suites.
```

## Accepting text input
In this section, we’ll add a text box to allow the customer’s first name to be added or edited.

Adding a text field is more complicated than adding the form element. First, there’s the element itself, which has a type attribute that needs to be tested. Then, we need to prime the element with the initial value. Finally, we’ll need to add a label so that it’s obvious what the field represents.

Let’s start by rendering an HTML text input field onto the page:

Add the following test to test/CustomerForm.test.js. It contains three expectations (there’s an exercise at the end of this chapter that you can follow to pull these out as a single matcher):
it("renders the first name field as a text box", () => {

  render(<CustomerForm />);

  const field = form().elements.firstName;

  expect(field).not.toBeNull();

  expect(field.tagName).toEqual("INPUT");

  expect(field.type).toEqual("text");

});

RELYING ON THE DOM’S FORM API

This test makes use of the Form API: any form element allows you to access all of its input elements using the elements indexer. You give it the element’s name attribute (in this case, firstName) and that element is returned.

This means we must check the returned element’s tag. We want to make sure it is an <input> element. If we hadn’t used the Form API, one alternative would have been to use elements("input")[0], which returns the first input element on the page. This would make the expectation on the element’s tagName property unnecessary.

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › renders the first name field as a text box

    TypeError: Cannot read properties of undefined (reading 'tagName')

      22 |         const field = form().elements.firstName;
      23 |         expect(field).not.toBeNull();
    > 24 |         expect(field.tagName).toEqual("INPUT");
         |                      ^
      25 |         expect(field.type).toEqual("text");
      26 |     });
      27 | });

      at Object.tagName (test/CustomerForm.test.js:24:22)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 37 passed, 38 total
Snapshots:   0 total
Time:        1.398 s
Ran all test suites.
```

## Let’s move a bit faster. We’ll make all the expectations pass at once. Update CustomerForm so that it includes a single input field, as shown here:
export const CustomerForm = () => (

  <form

    <input type="text" name="firstName" />

  </form>

);

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 4 passed, 4 total
Tests:       38 passed, 38 total
Snapshots:   0 total
Time:        1.371 s
Ran all test suites.
```

## Since this form will be used when modifying existing customers as well as adding new ones, we need to design a way to get the existing customer data into the component. We’ll do that by setting an original prop that contains the form data. Add the following test:
it("includes the existing value for the first name", () => {

  const customer = { firstName: "Ashley" };

  render(<CustomerForm original={customer} />);

  const field = form().elements.firstName;

  expect(field.value).toEqual("Ashley");

});

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › includes the existing value for the first name

    expect(received).toEqual(expected) // deep equality

    Expected: "Ashley"
    Received: ""

      29 |         render(<CustomerForm original={customer} />);
      30 |         const field = form().elements.firstName;
    > 31 |         expect(field.value).toEqual("Ashley");
         |                             ^
      32 |     });
      33 | });
      34 |

      at Object.toEqual (test/CustomerForm.test.js:31:29)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 38 passed, 39 total
Snapshots:   0 total
Time:        1.355 s
Ran all test suites.
```

## To make this test pass, change the component definition to the following. We will use a prop to pass in the previous firstName value:
export const CustomerForm = ({ original }) => (

  <form

    <input

      type="text"

      name="firstName"

      value={original.firstName} />

  </form>

);

**My `npm test` result after the above:**
```
...
    console.error
      Warning: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
          at input
          at form
          at original (/home/pc/Desktop/temp-tdd-whatever/mastering-react-tdd/my-mastering-tdd/src/CustomerForm.js:2:32)

      10 |
      11 | export const render = (component) =>
    > 12 |   act(() =>
         |      ^
      13 |     ReactDOM.createRoot(container).render(component)
      14 |   );
      15 |
...

  ● CustomerForm › renders the first name field as a text box

    TypeError: Cannot read properties of undefined (reading 'firstName')

       5 |             type="text"
       6 |             name="firstName"
    >  7 |             value={original.firstName}
         |                             ^
       8 |         />
       9 |     </form>
      10 | );
...
```

## ChatGPT

The error you are encountering is due to trying to access the 'firstName' property of 'original' when 'original' is undefined. To fix this issue, you should provide a default value for 'original' or check if it exists before accessing its properties.

You can modify your `CustomerForm` component to handle the case where 'original' is undefined. Here's an example:

```jsx
import React from "react";

export const CustomerForm = ({ original }) => (
    <form>
        <input
            type="text"
            name="firstName"
            value={original ? original.firstName : ""}
        />
    </form>
);
```

In this modification, I added a check for the existence of 'original' before trying to access its 'firstName' property. If 'original' is undefined, an empty string is used as the default value for the input field. This should prevent the TypeError you were encountering.

**My `npm test` result after the above:**
```
...

    console.error
      Warning: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
          at input
          at form
          at original (/home/pc/Desktop/temp-tdd-whatever/mastering-react-tdd/my-mastering-tdd/src/CustomerForm.js:2:32)

      10 |
      11 | export const render = (component) =>
    > 12 |   act(() =>
         |      ^
      13 |     ReactDOM.createRoot(container).render(component)
      14 |   );
      15 |

      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at checkControlledValueProps (node_modules/react-dom/cjs/react-dom.development.js:1592:7)
      at initWrapperState (node_modules/react-dom/cjs/react-dom.development.js:1775:5)
      at setInitialProperties (node_modules/react-dom/cjs/react-dom.development.js:9888:7)
      at finalizeInitialChildren (node_modules/react-dom/cjs/react-dom.development.js:10950:3)
      at completeWork (node_modules/react-dom/cjs/react-dom.development.js:22193:17)
      at completeUnitOfWork (node_modules/react-dom/cjs/react-dom.development.js:26593:16)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom.development.js:26568:5)
      at workLoopSync (node_modules/react-dom/cjs/react-dom.development.js:26466:5)
      at renderRootSync (node_modules/react-dom/cjs/react-dom.development.js:26434:7)
      at performConcurrentWorkOnRoot (node_modules/react-dom/cjs/react-dom.development.js:25738:74)
      at flushActQueue (node_modules/react/cjs/react.development.js:2667:24)
      at act (node_modules/react/cjs/react.development.js:2582:11)
      at render (test/reactTestExtensions.js:12:6)
      at Object.<anonymous> (test/CustomerForm.test.js:29:15)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 4 passed, 4 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        1.326 s
Ran all test suites.
```

There is more above...

So, instead, following the book...

Upon running the tests again, you’ll see that although this test now passes, the first two tests fail because they don’t specify the original prop. What’s more, we have a warning:
Warning: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.

To fix the initial tests, create a new constant, blankCustomer, that will act as our “base” customer. It’ll do just fine for tests that don’t care about specific field values, such as our first two tests. Add this definition just above the beforeEach block:
const blankCustomer = {

  firstName: "",

};

WHAT ABOUT SPECIFYING AN EMPTY OBJECT FOR THE ORIGINAL PROP?

In this object definition, we set the firstName value to an empty string. You may think that either undefined or null would be good candidates for the value. That way, we could sidestep having to define an object like this and just pass an empty object, {}. Unfortunately, React will warn you when you attempt to set a controlled component’s initial value to undefined, which we want to avoid. It’s no big deal, and besides that, an empty string is a more realistic default for a text box.

Update the first two tests so that they render with the original prop set, as shown here. With this change in place, you should have three passing tests, but the warning remains:
it("renders a form", () => {

  render(<CustomerForm original={blankCustomer} />);

  expect(form()).not.toBeNull();

});

it("renders the first name field as a text box", () => {

  render(<CustomerForm original={blankCustomer} />);

  const field = form().elements.firstName;

  expect(field).not.toBeNull();

  expect(field.tagName).toEqual("INPUT");

  expect(field.type).toEqual("text");

});

**My `npm test` result after the above:**

It all works, except for:
```
    console.error
      Warning: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
          at input
          at form
          at original (/home/pc/Desktop/temp-tdd-whatever/mastering-react-tdd/my-mastering-tdd/src/CustomerForm.js:2:32)

      10 |
      11 | export const render = (component) =>
    > 12 |   act(() =>
         |      ^
      13 |     ReactDOM.createRoot(container).render(component)
      14 |   );
      15 |
```

## To get rid of the warning, add the word readOnly to the input tag. You might be thinking: surely, we don’t want a read-only field? You’re right, but we need a further test, for modifying the input value, before we can avoid using the readOnly keyword. We’ll add that test a little further on:
<input

  type="text"

  name="firstName"

  value={original.firstName}

  readOnly

/>

TIP

Always consider React warnings to be a test failure. Don’t proceed without first fixing any warnings.

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 4 passed, 4 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        1.34 s
Ran all test suites.
```

## The last two tests include the following line, which reaches inside the form to pull out the firstName field:
```
const field = form().elements.firstName;
```

Let’s promote this to be a function in test/reactTestExtensions.js. Open that file and add the following definition after the definition for form:
```
export const field = (fieldName) =>

  form().elements[fieldName];
```

Then, import it into test/CustomerForm.test.js:
```
import {

  initializeReactContainer,

  render,

  element,

  form,

  field,

} from "./reactTestExtensions";
```

Change the last test you wrote so that it uses the new helper:
```
it("includes the existing value for the first name", () => {

  const customer = { firstName: "Ashley" };

  render(<CustomerForm original={customer} />);

  expect(field("firstName").value).toEqual("Ashley");

});
```

Update the first test in the same way:
```
it("renders the first name field as a text box", () => {

  render(<CustomerForm original={blankCustomer} />);

  expect(field("firstName")).not.toBeNull();

  expect(field("firstName")).toEqual("INPUT");

  expect(field("firstName")).toEqual("text");

});
```

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › renders the first name field as a text box

    expect(received).toEqual(expected) // deep equality

    Expected: "INPUT"
    Received: <input name="firstName" readonly="" type="text" value="" />

      25 |         render(<CustomerForm original={blankCustomer} />);
      26 |         expect(field("firstName")).not.toBeNull();
    > 27 |         expect(field("firstName")).toEqual("INPUT");
         |                                    ^
      28 |         expect(field("firstName")).toEqual("text");
      29 |     });
      30 |     it("includes the existing value for the first name", () => {

      at Object.toEqual (test/CustomerForm.test.js:27:36)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 38 passed, 39 total
Snapshots:   0 total
Time:        1.442 s
Ran all test suites.
pc@pclaptop:~/Desktop/temp-tdd-whatever/mastering-react-tdd/my-mastering-tdd$ npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 4 passed, 4 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        1.348 s
Ran all test suites.
```

Explanation from GPT:

The test failure you're seeing in the "CustomerForm › renders the first name field as a text box" test case is due to incorrect expectations set in your assertions. Specifically, the line `expect(field("firstName")).toEqual("INPUT");` and `expect(field("firstName")).toEqual("text");` are not correctly validating the input element and its type. The `field` function seems to return a DOM element, and you're trying to compare this element directly to string values, which will not work as expected.

Here's how you can correct the test:

1. **Check if the field is an input element:** You need to check if the returned element is an input element. Instead of comparing it to `"INPUT"`, you should check the element's tag name.

2. **Check the type of the input:** To check if the input type is "text", you need to access the `type` property of the input element returned by `field("firstName")`.

Here is an updated version of the test that addresses these issues:

```javascript
it("renders the first name field as a text box", () => {
    render(<CustomerForm original={blankCustomer} />);
    const firstNameField = field("firstName");
    expect(firstNameField).not.toBeNull();
    expect(firstNameField.tagName).toEqual("INPUT"); // Check if the element is an input
    expect(firstNameField.type).toEqual("text"); // Check if the input type is "text"
});
```

This change adjusts the test to properly check the attributes of the `firstName` field. Make sure that your `field` function is correctly implemented to return the actual DOM element for the input field so that you can access its `tagName` and `type` properties. If `field` does not return a DOM element but some form of object representation, you would need to adjust your approach to access these properties correctly.

## Next up, we’ll add a label to the field. Add the following test, which uses the element helper:
it("renders a label for the first name field", () => {

  render(<CustomerForm original={blankCustomer} />);

  const label = element("label[for=firstName]");

  expect(label).not.toBeNull();

});

## THE HTMLFOR ATTRIBUTE

The JSX htmlFor attribute sets the HTML for attribute. for couldn’t be used in JSX because it is a reserved JavaScript keyword. The attribute is used to signify that the label matches a form element with the given ID – in this case, firstName.

Let’s add some text content to that label:
it("renders 'First name' as the first name label content", () => {

  render(<CustomerForm original={blankCustomer} />);

  const label = element("label[for=firstName]");

  expect(label).toContainText("First name");

});

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › renders 'First name' as the first name label content

    expect(element).toContainText("First name")

    Actual text: ""

      42 |         render(<CustomerForm original={blankCustomer} />);
      43 |         const label = element("label[for=firstName]");
    > 44 |         expect(label).toContainText("First name");
         |                       ^
      45 |     });
      46 | });
      47 |

      at Object.toContainText (test/CustomerForm.test.js:44:23)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 40 passed, 41 total
Snapshots:   0 total
Time:        1.278 s
Ran all test suites.
```

## Update the label element to make the test pass:
<form

  <label htmlFor="firstName">First name</label>

  ...

</form>

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 4 passed, 4 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        1.253 s
Ran all test suites.
```

## Finally, we need to ensure that our input has an ID that matches it with the label’s htmlFor value so that they match up. Add the following test:
it("assigns an id that matches the label id to the first name field", () => {

  render(<CustomerForm original={blankCustomer} />);

  expect(field("firstName").id).toEqual("firstName");

});

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › assigns an id that matches the label id to the first name field

    expect(received).toEqual(expected) // deep equality

    Expected: "firstName"
    Received: ""

      46 |     it("assigns an id that matches the label id to the first name field", () => {
      47 |         render(<CustomerForm original={blankCustomer} />);
    > 48 |         expect(field("firstName").id).toEqual("firstName");
         |                                       ^
      49 |     })
      50 | });
      51 |

      at Object.toEqual (test/CustomerForm.test.js:48:39)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 41 passed, 42 total
Snapshots:   0 total
Time:        1.502 s
Ran all test suites.
```

## Making that pass is as simple as adding the new attribute:
<form>

  <label htmlFor="firstName">First name</label>

  <input

    type="text"

    name="firstName"

    id="firstName"

    value={firstName}

    readOnly

  />

</form>

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 4 passed, 4 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        1.311 s
Ran all test suites.
```

## INTERMISSION

lain this:
npm test -- --coverage

> my-mastering-tdd@1.0.0 test
> jest --coverage

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |     100 |     87.5 |     100 |     100 | 
 src                     |     100 |    83.33 |     100 |     100 | 
  AppointmentsDayView.js |     100 |      100 |     100 |     100 | 
  CustomerForm.js        |     100 |       50 |     100 |     100 | 9 
 test                    |     100 |      100 |     100 |     100 | 
  reactTestExtensions.js |     100 |      100 |     100 |     100 | 
 test/matchers           |     100 |      100 |     100 |     100 | 
  toContainText.js       |     100 |      100 |     100 |     100 | 
  toHaveClass.js         |     100 |      100 |     100 |     100 | 
-------------------------|---------|----------|---------|---------|-------------------

Test Suites: 4 passed, 4 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        1.645 s
Ran all test suites.

The command `npm test -- --coverage` is a way to pass arguments directly to the underlying test script defined in your `package.json` file when using `npm`. Here, `--coverage` is the argument being passed to the Jest command that is presumably defined under the `test` script in your `package.json`.

When you run `npm test -- --coverage`, it essentially instructs Jest to run your tests and also collect coverage information across your project. This is what the output represents:

1. **`> my-mastering-tdd@1.0.0 test`**: This line indicates the beginning of the test script execution for your project named `my-mastering-tdd` with version `1.0.0`. The script being executed is `jest --coverage`.

2. **The `PASS` lines**: These lines list each test file that was run and indicate that all tests within those files passed successfully.

3. **Coverage Summary**:
   - **File**: Lists the files for which coverage was collected.
   - **% Stmts**: Shows the percentage of statements in your code that were executed while running the tests. This indicates how much of your codebase is covered by tests.
   - **% Branch**: Shows the percentage of branches (e.g., `if` statements) that were executed. This is important for conditional logic in your code.
   - **% Funcs**: Indicates the percentage of functions or methods that were called during the test execution.
   - **% Lines**: Represents the percentage of lines of code that were executed, which is similar to % Stmts but focuses on lines.
   - **Uncovered Line #s**: Lists line numbers in your code that were not executed during testing, pointing out parts of your code that lack test coverage.

The report shows that while most of your project has 100% test coverage across statements, functions, and lines of code, the `CustomerForm.js` file has only 50% branch coverage. This suggests that half of the conditional logic (branches) in `CustomerForm.js` was not executed during tests, specifically around line 9. This might indicate missing test cases for certain conditions within that file.

The summary provides a clear picture of the test coverage and highlights areas that might need additional tests to ensure your code behaves as expected under various conditions. The goal of such coverage metrics is to help maintain high-quality, reliable code by identifying untested paths and ensuring that changes do not inadvertently break existing functionality.

## We’ve now created almost everything we need for this field: the input field itself, its initial value, and its label. But we don’t have any behavior for handling changes to the value – that’s why we have the readOnly flag.

Change behavior only makes sense in the context of submitting the form with updated data: if you can’t submit the form, there’s no point in changing the field value. That’s what we’ll cover in the next section.

Submitting a form
For this chapter, we will define “submit the form” to mean “call the onSubmit callback function with the current customer object.” The onSubmit callback function is a prop we’ll be passing.

This section will introduce one way of testing form submission. In Chapter 6, Exploring Test Doubles, we will update this to a call to global.fetch that sends our customer data to our application’s backend API.

We’ll need a few different tests to specify this behavior, each test building up the functionality we need in a step-by-step fashion. First, we’ll have a test that ensures the form has a submit button. Then, we’ll write a test that clicks that button without making any changes to the form. We’ll need another test to check that submitting the form does not cause page navigation to occur. Finally, we’ll end with a test submission after the value of the text box has been updated.

Submitting without any changes
Let’s start by creating a button in the form. Clicking it will cause the form to submit:

Start by adding a test to check whether a submit button exists on the page:
it("renders a submit button", () => {

  render(<CustomerForm original={blankCustomer} />);

  const button = element("input[type=submit]");

  expect(button).not.toBeNull();

});

**My `npm test` result after the above:**
```
pm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › renders a submit button

    expect(received).not.toBeNull()

    Received: null

      51 |         render(<CustomerForm original={blankCustomer} />);
      52 |         const button = element("input[type=submit]");
    > 53 |         expect(button).not.toBeNull();
         |                            ^
      54 |     });
      55 | });
      56 |

      at Object.toBeNull (test/CustomerForm.test.js:53:28)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 42 passed, 43 total
Snapshots:   0 total
Time:        1.604 s
Ran all test suites.
```

## To make that pass, add the following single line at the bottom of the form’s JSX:
<form>

  ...

  <input type="submit" value="Add" />

</form>

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 4 passed, 4 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        1.306 s
Ran all test suites.
```

## The following test introduces a new concept, so we’ll break it down into its component parts. To start, create a new test, starting, as follows:
it("saves existing first name when submitted", () => {

  expect.hasAssertions();

});

The hasAssertions expectation tells Jest that it should expect at least one assertion to occur. It tells Jest that at least one assertion must run within the scope of the test; otherwise, the test has failed. You’ll see why this is important in the next step.

Add the following part of the test into the outline, below the hasAssertions call:
const customer = { firstName: "Ashley" };

render(

  <CustomerForm

    original={customer}

    onSubmit={({ firstName }) =>

      expect(firstName).toEqual("Ashley")

    }

  />

);

This function call is a mix of the Arrange and Assert phases in one. The Arrange phase is the render call itself, and the Assert phase is the onSubmit handler. This is the handler that we want React to call on form submission.

Finish off the test by adding the following line just below the call to render. This is the Act phase of our test, which in this test is the last phase of the test:
const button = element("input[type=submit]");

click(button);

**My `npm test` result after the above:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/CustomerForm.test.js
  ● CustomerForm › saves existing first name when submitted

    ReferenceError: click is not defined

      65 |         );
      66 |         const button = element("input[type=submit]");
    > 67 |         click(button);
         |         ^
      68 |     });
      69 | });
      70 |

      at Object.click (test/CustomerForm.test.js:67:9)

  ● CustomerForm › saves existing first name when submitted

    expect.hasAssertions()

    Expected at least one assertion to be called but received none.

      54 |     });
      55 |     it("saves existing first name when submitted", () => {
    > 56 |         expect.hasAssertions();
         |                ^
      57 |         const customer = { firstName: "Ashley" };
      58 |         render(
      59 |             <CustomerForm

      at Object.hasAssertions (test/CustomerForm.test.js:56:16)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 43 passed, 44 total
Snapshots:   0 total
Time:        1.429 s
Ran all test suites.
```

### // CGPT PROMPT START

The error you're encountering in your Jest test suite, specifically in the "CustomerForm › saves existing first name when submitted" test, is due to the click function not being defined. In the context of your testing setup, it looks like you're trying to simulate a user clicking the submit button, but the click method you're attempting to use is not recognized by Jest or your custom testing utilities (reactTestExtensions).

To resolve this issue, you'll need to properly simulate the click event on the submit button. Assuming you're using a library like @testing-library/react or similar for your render, element, and other utilities, you can use the fireEvent utility to simulate user actions.

However, based on the custom testing extensions you've mentioned (reactTestExtensions), if you don't already have a function to simulate events, you'll need to create one or use an existing utility from a library like @testing-library/react.

Here's how you might approach it with @testing-library/react:

Ensure @testing-library/react is installed in your project. If it's not, you can add it by running:

sh
Copy code
npm install --save-dev @testing-library/react
Update your test to use fireEvent to simulate the click event:

jsx
Copy code
import { fireEvent } from '@testing-library/react';

it("saves existing first name when submitted", () => {
    expect.hasAssertions();
    const customer = { firstName: "Ashley" };
    const { getByText } = render(<CustomerForm original={customer} onSubmit={({ firstName }) => expect(firstName).toEqual("Ashley")} />);
    const submitButton = getByText('Add'); // Assuming 'Add' is

User
I don't want to use RTL. I want to use vanilla Jest.
ChatGPT
If you're looking to simulate a click event in your test environment using vanilla Jest without any additional libraries like React Testing Library, you'll need to directly manipulate the DOM elements in your tests and dispatch events on them. However, Jest by itself does not provide a direct method for simulating DOM events, as it's primarily focused on JavaScript testing. You would typically use Jest in combination with a DOM manipulation library (such as jQuery in a non-React scenario) or the native DOM API for React components.

Given your setup, you'll have to create a mock function for your click event or use the native DOM API to dispatch a click event. Here's how you can do it using the native DOM API:

Simulating a Click Event
javascript
Copy code
it("saves existing first name when submitted", () => {
    expect.hasAssertions();
    const customer = { firstName: "Ashley" };
    render(<CustomerForm original={customer} onSubmit={({ firstName }) => expect(firstName).toEqual("Ashley")} />);

    const button = document.querySelector('input[type="submit"]');

    // Dispatch a click event on the button
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Your assertion here
});
This approach uses the dispatchEvent method to simulate a click event on the submit button. The MouseEvent constructor creates a click event that can be dispatched on any DOM element. The { bubbles: true } option ensures that the event bubbles up through the DOM as it would in a real user interaction, which is important for event handlers attached on parent elements.

Note
While this approach works for simulating events, it has limitations compared to using a library like React Testing Library, which provides more comprehensive utilities for testing React components in a way that more closely mirrors user interactions. React Testing Library also abstracts away some of the complexities of dealing with the DOM directly.

Without using such a library, you'll need to manually manage event simulation and potentially deal with more verbose and less intuitive code, especially as your application and its tests become more complex. However, for simple interactions like a button click, the native DOM API method shown above should suffice.

### // CGPT PROMPT END

## USING HASASSERTIONS TO AVOID FALSE POSITIVES

You can now see why we need `hasAssertions`. The test is written out of order, with the assertions defined within the `onSubmit` handler. If we did not use `hasAssertions`, this test would pass right now because we never call `onSubmit`.

I don’t recommend writing tests like this. In Chapter 6, *Exploring Test Doubles*, we’ll discover test doubles, which allow us to restore the usual **Arrange-Act-Assert** order to help us avoid the need for `hasAssertions`. The method we’re using here is a perfectly valid TDD practice; it’s just a little messy, so you will want to refactor it eventually.

Now, you need to import click:
import {

  initializeReactContainer,

  render,

  element,

  form,

  field,

  click,

} from "./reactTestExtensions";

**My `npm test` result after the above:**
```
...
  ● CustomerForm › saves existing first name when submitted

    expect.hasAssertions()

    Expected at least one assertion to be called but received none.

      55 |     });
      56 |     it("saves existing first name when submitted", () => {
    > 57 |         expect.hasAssertions();
         |                ^
      58 |         const customer = { firstName: "Ashley" };
      59 |         render(
      60 |             <CustomerForm

      at Object.hasAssertions (test/CustomerForm.test.js:57:16)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 43 passed, 44 total
Snapshots:   0 total
Time:        1.432 s
Ran all test suites.
```

## Making this test pass is straightforward, despite the complicated test setup. Change the component definition so that it reads as follows:
export const CustomerForm = ({

  original,

  onSubmit

}) => (

  <form onSubmit={() => onSubmit(original)}>

    ...

  </form>

);

Now, run the test with npm test. You’ll discover that the test passed but we have a new warning, as shown here:
console.error

Error: Not implemented: HTMLFormElement.prototype.submit

    at module.exports (.../node_modules/jsdom/lib/jsdom/browser/not-implemented.js:9:17)

Something is not quite right. This warning is highlighting something very important that we need to take care of. Let’s stop here and look at it in detail.

## Preventing the default submit action

This Not implemented console error is coming from the JSDOM package. HTML forms have a default action when submitted: they navigate to another page, which is specified by the form element’s action attribute. JSDOM does not implement page navigation, which is why we get a Not implemented error.

In a typical React application like the one we’re building, we don’t want the browser to navigate. We want to stay on the same page and allow React to update the page with the result of the submit operation.

The way to do that is to grab the event argument from the onSubmit prop and call preventDefault on it:


event.preventDefault();
Since that’s production code, we need a test that verifies this behavior. We can do this by checking the event’s defaultPrevented property:


expect(event.defaultPrevented).toBe(true);
So, now the question becomes, how do we get access to this Event in our tests?

We need to create the event object ourselves and dispatch it directly using the dispatchEvent DOM function on the form element. This event needs to be marked as cancelable, which will allow us to call preventDefault on it.

WHY CLICKING THE SUBMIT BUTTON WON’T WORK

In the last couple of tests, we purposely built a submit button that we could click to submit the form. While that will work for all our other tests, for this specific test, it does not work. That’s because JSDOM will take a click event and internally convert it into a submit event. There is no way we can get access to that submit event object if JSDOM creates it. Therefore, we need to directly fire the submit event.

This isn’t a problem. Remember that, in our test suite, we strive to act as a real browser would – by clicking a submit button to submit the form – but having one test work differently isn’t the end of the world.

Let’s put all of this together and fix the warning:

Open test/reactTestExtensions.js and add the following, just below the click definition. We’ll use this in the next test:
export const submit = (formElement) => {

  const event = new Event("submit", {

    bubbles: true,

    cancelable: true,

  });

  act(() => formElement.dispatchEvent(event));

  return event;

};

WHY DO WE NEED THE BUBBLES PROPERTY?

If all of this wasn’t complicated enough, we also need to make sure the event bubbles; otherwise, it won’t make it to our event handler.

When JSDOM (or the browser) dispatches an event, it traverses the element hierarchy looking for an event handler to handle the event, starting from the element the event was dispatched on, working upwards via parent links to the root node. This is known as bubbling.

Why do we need to ensure this event bubbles? Because React has its own event handling system that is triggered by events reaching the React root element. The submit event must bubble up to our container element before React will process it.

Import the new helper into test/CustomerForm.test.js:
import {

  ...,

  submit,

} from "./reactTestExtensions";

Add the following test to the bottom of the CustomerForm test suite. It specifies that preventDefault should be called when the form is submitted:
it("prevents the default action when submitting the form", () => {

  render(

    <CustomerForm

      original={blankCustomer}

      onSubmit={() => {}}

    />

  );

  const event = submit(form());

  expect(event.defaultPrevented).toBe(true);

});

**My `npm test` result after the above:**
```
...

  ● CustomerForm › saves existing first name when submitted

    expect.hasAssertions()

    Expected at least one assertion to be called but received none.

      56 |     });
      57 |     it("saves existing first name when submitted", () => {
    > 58 |         expect.hasAssertions();
         |                ^
      59 |         const customer = { firstName: "Ashley" };
      60 |         render(
      61 |             <CustomerForm

      at Object.hasAssertions (test/CustomerForm.test.js:58:16)

  ● CustomerForm › prevents the default action when submitting the form

    ReferenceError: blankCustomr is not defined

      72 |         render(
      73 |             <CustomerForm
    > 74 |                 original={blankCustomr}
         |                           ^
      75 |                 onSubmit={() => {}}
      76 |             />
      77 |         );

      at Object.blankCustomr (test/CustomerForm.test.js:74:27)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 3 passed, 4 total
Tests:       2 failed, 43 passed, 45 total
Snapshots:   0 total
Time:        1.538 s
Ran all test suites.
```
