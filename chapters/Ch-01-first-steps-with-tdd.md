# Part 1 - Exploring the TDD Workflow (Chapters 1 - 8)

# Chapter 1: First Steps with Test-Driven Development

## Technical requirements

Later in this chapter, you’ll be required to install Node Package Manager (npm) together with a whole host of packages. You’ll want to ensure you have a machine capable of running the Node.js environment.

You’ll also need access to a terminal.

In addition, you should choose a good editor or Integrated Development Environment (IDE) to work with your code.

The code files for this chapter can be found at the following link: [https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter01](https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter01).

Creating a new React project from scratch
In this section, we’ll assemble all of the necessary pieces that you’ll need to write a React application with TDD.

You may have come across the create-react-app package, which many people use to create an initial React project, but we won’t be using that. The very first TDD principle you’re going to learn is You Ain’t Gonna Need It (YAGNI). The create-react-app package adds a whole bunch of boilerplate that isn’t relevant to what we’re doing here—things such as a favicon.ico file, a sample logo, and CSS files. While these are undoubtedly useful, the basic idea behind YAGNI is that if it doesn’t meet a needed specification, then it doesn’t go in.

The thinking behind YAGNI is that anything unnecessary is simply technical debt – it’s stuff that’s just sitting there, unused, getting in your way.

Once you see how easy it is to start a React project from scratch, you won’t ever use create-react-app again!

In the following subsections, we’ll install NPM, Jest, React, and Babel.

Installing npm
Following the TDD process means running tests frequently—very frequently. Tests are run on the command line using the npm test command. So, let’s start by getting npm installed.

You can find out if you already have it installed on your machine by opening a terminal window (or Command Prompt if you’re on Windows) and typing the following command:

npm -v

If the command isn’t found, head on over to the Node.js website at https://nodejs.org for installation instructions.

If you’ve already got npm installed, we recommend you ensure you’re on the latest version. You can do this on the command line by typing the following command:

npm install npm@latest -g

Now you’re all set. You can use the npm command to create your project.




## Build `package.json`:
```
npm init -y
```

## Alter `package.json` by hand:
```
{
  "name": "appointments",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Install Jest

```
npm i -D jest
```

## Commit early and often

The TDD process offers natural stopping points to commit - each time you see a new test pass, you can commit.

Committing early and often simplifies commit messages. If you have just one test in a commit, then you can use the test description as your commit message.

```
git init

echo "node_modules" > .gitignore

git add .

git commit -m "Blank project with Jest dependency"
```

## Bring in React and Babel

Install React:
```
npm i --save react react-dom
```

Now, Jest already includes Babel—for the aforementioned module mocks—so we just need to install presets and plugins as follows:
```
npm install --save-dev @babel/preset-env @babel/preset-react

npm install --save-dev @babel/plugin-transform-runtime

npm install --save @babel/runtime
```

A Babel preset is a set of plugins. Each plugin enables a specific feature of the ECMAScript standards or a preprocessor such as JSX.

Configuring Babel:
* We need to enable the packages we've just installed. Create a new file, .babelrc, and add the following code:
```
{
    "presets": ["@babel/env", "@babel/react"],
    "plugins": ["@babel/transform-runtime"]
}
```

```
git add --all; git commit -m "Bring in React and Babel"
```

## Write a failing test

The **describe** function defines a _test suite_, which is simply a set of tests with a given name.

The first argument is the name of the unit you are testing.

It could be:
* a React component,
* a function, or
* a module

The second argument is a function inside of which you define your tests.

The purpose of the describe function is to describe how this named “thing” works—whatever the thing is.


### Global Jest functions

All of the Jest functions (such as describe) are already required and available in the global namespace when you run the npm test command.

You don’t need to import anything.

For React components, it’s good practice to give describe blocks the same name as the component itself.

If you do try out the create-react-app template, you’ll notice that it contains a single unit test file, App.test.js,
which exists in the same directory as the source file, App.js.

We prefer to keep our test files separate from our application source files. Test files go in a directory named test
and source files go in a directory named src. There is no real objective advantage to either approach.

Let’s go ahead and run this with Jest. You might think that running tests now is pointless, since we haven’t even written a test yet,
but doing so gives us valuable information about what to do next.

**With TDD, it’s normal to run your test runner at every opportunity.**

```
npm run test

> appointments@1.0.0 test
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
Time:        0.633 s
Ran all test suites.
```

```
git add --all; git commit -m "Write a failing test"
```

## Write the first expectation

Change your `describe()` call as follows:
```
describe("Appointment", () => {
  it("renders the customer first name", () => {
  });
});
```
The **it** function defines a single test. The first argument is the description of the test and always starts with a present-tense verb so that it reads in plain English. The **it** in the function name refers to the noun you used to name your test suite (in this case, **Appointment**). In fact, if you run tests now, with **npm test**, the ouput (as shown below) will make good sense:

```
npm run test
> appointments@1.0.0 test
> jest

 PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.485 s
Ran all test suites.
```

You can read the describe and it descriptions together as one sentence: Appointment renders the customer first name.

You should aim for all of your tests to be readable in this way.

As we add more tests, Jest will show us a little checklist of passing tests.
```
git add --all; git commit -m "Write the first expectation"
```

### Jest's test function

You may have used the **test** function for Jest, which is equivalent to **it**.

We prefer **it** because it reads better and serves as a helpful guide for how to succinctly describe our test.

You may have also seen people start their test descriptions with _“should…”_. I don’t really see the point in this,
it’s just an additional word we have to type. Better to just use a well-chosen verb to follow the “it.”

Empty tests, such as the one we just wrote, always pass. Let’s change that now. Add an _expectation_ to our test as follows:

```
it("renders the customer first name", () => {
  expect(document.body.textContent).toContain("Ashley");
});
```

This **expect** call is an example of a fluent API. Like the test description, it reads like plain English. You can read it like this:

_I expect_ **document.body.textContent toContain** _the string_ **Ashley**.

Each expectation has an **expected value** that is compared against a **received value**.

In this example, the expected value is **Ashley** and the received value is whatever is stored in **document.body.textContent**. In other words, the expectation passes if **document.body.textContent** has the word **Ashley** anywhere within it.

The **toContain** function is called a **matcher** and there are a whole lot of different matchers that work in different ways. You can (and should) write your own matchers.

Before we run this test, spend a minute thinking about the code. You might have guessed that the test will fail. The question is, how will it fail?

Run the **npm test** command and find out:
```

FAIL  test/Appointment.test.js

  Appointment

    ✕ renders the customer first name (1 ms)

  ● Appointment › renders the customer first name

    The error below may be caused by using the wrong test environment, see https://jestjs.io/docs/configuration#testenvironment-string.

    Consider using the "jsdom" test environment.

    ReferenceError: document is not defined

      1 | describe("Appointment", () => {

      2 |   it("renders the customer first name", () => {

    > 3 |     expect(document.body.textContent).toContain("Ashley");

        |            ^

      4 |   });

      5 | })

      6 |

      at Object.<anonymous> (test/Appointment.test.js:3:12)
```

We have our first failure!

It’s probably not the failure you were expecting. Turns out, we still have some setup to take care of. Jest helpfully tells us what it thinks we need, and it’s correct; we need to specify a test environment of **jsdom**.

A **test environment** is a piece of code that runs before and after your test suite to perform setup and teardown. For the **jsdom** test environment, it instantiates a new **JSDOM** object and sets global and document objects, turning Node.js into a browser-like environment.

**jsdom** is a package that contains a headless implementation of the **Document Object Model (DOM)** that runs on Node.js. In effect, it turns Node.js into a browser-like environment that responds to the usual DOM APIs, such as the document API we’re trying to access in this test.

Jest provides a pre-packaged **jsdom** test environment that will ensure our tests run with these DOM APIs ready to go. We just need to install it and instruct Jest to use it.

Run the following command at your command prompt:
```
npm install --save-dev jest-environment-jsdom
```

Now we need to open **package.json** and add the following section at the bottom:

```
{
  ...,
  "jest": {
    "testEnvironment": "jsdom"
  }
}
```

Then we run **npm test** again, giving the following output:
```
FAIL test/Appointment.test.js

  Appointment

    ✕ renders the customer first name (10ms)

  ● Appointment › renders the customer first name

    expect(received).toContain(expected)

    Expected substring: "Ashley"

    Received string:    ""

      1 | describe("Appointment", () => {

      2 |   it("renders the customer first name", () => {

    > 3 |     expect(document.body.textContent).toContain("Ashley");

        |                                       ^

      4 |   });

      5 | });

      6 |

      at Object.toContain (test/Appointment.test.js:3:39)
```

There are four parts to the test output that are relevant to us:

* The name of the failing test
* The expected answer
* The actual answer
* The location in the source where the error occurred

All of these help us to pinpoint why our tests failed: **document.body.textContent** is empty. That’s not surprising given we haven’t written any React code yet.

```
git add --all; git commit -m "Write the first expectation, pt2"
```

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

```
git add --all; git commit -m "Write the first expectation, pt3"
```

## Make it pass

We’re now ready to make the failing test pass. Perform the following steps:

**Step 1.** Add a new import statement to **test/Appointment.test.js**, below the two React imports, as follows:
```js
import { Appointment } from "../src/Appointment";
```

Run tests with **npm test**. You’ll get a different error this time, with the key message being this:
```text
Cannot find module '../src/Appointment' from 'Appointment.test.js'
```

#### Default Exports

Although **Appointment** was defined as an export, it wasn’t defined as a _default_ export. That means we have to import it using the curly brace form of import (**import { ... }**). We tend to avoid using default exports as doing so keeps the name of our component and its usage in sync. If we change the name of a component, then every place where it’s imported will break until we change those, too. This isn’t the case with default exports. Once your names are out of sync, it’s harder to track where components are used—you can’t simply use text search to find them.

Let’s create that module. Type the following code in your command prompt:
```bash
mkdir src
touch src/Appointment.js
```

In your editor, add the following content to **src/Appointment.js**:
```js
export const Appointment = () => {};
```

Why have we created a shell of **Appointment** without actually creating an implementation? This might seem pointless, but another **core principle of TDD is always do the simplest thing to pass the test**. We could rephrase this as **always do the simplest thing to fix the error you’re working on**.

Remember when we mentioned that we listen carefully to what the test runner tells us? In this case, the test runner said **Cannot find module Appointment**, so what was needed was to create that module, which we’ve done, and then immediately stopped. Before we do anything else, we need to run our tests to learn what’s the next thing to do.

Running **npm test** again, you should get this test failure:
```
npm run test

> appointments@1.0.0 test
> jest

 FAIL  test/Appointment.test.js
  Appointment
    ✕ renders the customer first name (8 ms)

  ● Appointment › renders the customer first name

    expect(received).toContain(expected) // indexOf

    Expected substring: "Ashley"
    Received string:    ""

      12 |         document.body.appendChild(container);
      13 |         ReactDOM.createRoot(container).render(component);
    > 14 |         expect(document.body.textContent).toContain(
         |                                           ^
      15 |             "Ashley"
      16 |         );
      17 |     });

      at Object.toContain (test/Appointment.test.js:14:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        0.906 s
Ran all test suites.
```

To fix the test, let’s change the **Appointment** definition as follows:
```js
export const Appointment = () => "Ashley";
```

You might be thinking, “That’s not a component! There’s no JSX.” Correct. “And it doesn’t even use the customer prop!” Also correct. But React will render it anyway, and theoretically, it should make the test pass; so, in practice, it’s a good enough implementation, at least for now.

**We always write the minimum amount of code that makes a test pass.**

But does it pass? Run **npm test** again and take a look at the output:
```
● Appointment › renders the customer first name

    expect(received).toContain(expected)

    Expected substring: "Ashley"

    Received string:    ""

      12 |     ReactDOM.createRoot(...).render(component);

      13 |

    > 14 |     expect(document.body.textContent).toContain(

      15 |                                       ^

      16 |       "Ashley"

      17 |     );

         |   });
```

No, it does not pass. This is a bit of a headscratcher. We _did_ define a valid React component. And we did tell React to render it in our container. What’s going on?

#### Making use of the act test helper

In a React testing situation like this, often the answer has something to do with the async nature of the runtime environment. Starting in React 18, the render function is **asynchronous**: the function call will return before React has modified the DOM. Therefore, the expectation will run _before_ the DOM is modified.

React provides a helper function for our tests that pauses until asynchronous rendering has completed. It’s called **act** and you simply need to wrap it around any React API calls. To use **act**, perform the following steps:

**Step 1.** Go to the top of **test/Appointment.test.js** and add the following line of code:
```js
import { act } from "react-dom/test-utils";
```

**Step 2.** Then, change the line with the **render** call to read as follows:
```js
act(() =>
  ReactDOM.createRoot(container).render(component)
);
```

**Step 3.** Now rerun your test and you should see a passing test, but with an odd warning printed above it, like this:
```
> jest

  console.error

    Warning: The current testing environment is not configured to support act(...)

      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
```

React would like us to be explicit in our use of **act**. That’s because there are use cases where **act** does not make sense — but for unit testing, we almost certainly want to use it.

#### Understanding the act function

Although we’re using it here, the **act** function is not required for testing React. For a detailed discussion on this function and how it can be used, head to [https://reacttdd.com/understanding-act](https://reacttdd.com/understanding-act).

**Step 4.** Let’s go ahead and enable the **act** function. Open **package.json** and modify your jest property to read as follows:
```
{
  ...,
  "jest": {
    "testEnvironment": "jsdom",
    "globals": {
      "IS_REACT_ACT_ENVIRONMENT": true
    }
  }
}
```

Now run your test again with **npm test**, giving the output shown:
```
> jest
PASS  test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (13 ms)
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.355 s
Ran all test suites.
```

_Finally_, you have a passing test, with no warnings!

In the following section, you will discover how to remove the hardcoded string value that you’ve introduced by adding a second test.

[https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter01](https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter01)

```
git add --all; git commit -m "Write the first implementation"
```

## Triangulating to remove hardcoding

Now that we’ve got past that little hurdle, let’s think again about the problems with our test. We did a bunch of strange acrobatics just to get this test passing. One odd thing was the use of a hardcoded value of **Ashley** in the React component, even though we’d gone to the trouble of defining a customer prop in our test and passing it in.

**We did that because we want to stick to our rule of only doing the simplest thing that will make a test pass.** In order **to get to the real implementation, we need to add more tests**.

This process is called **triangulation**. We add more tests to build more of a _real_ implementation. The more specific our tests get, the more general our production code needs to get.

### Ping pong programming

This is one reason why pair programming using TDD can be so enjoyable. Pairs can play _ping pong_. Sometimes, your pair will write a test that you can solve trivially, perhaps by hardcoding, and then you force them to do the hard work of both tests by triangulating. **They need to remove the hardcoding and add the generalization**.

Let’s triangulate by performing the following steps:

**Step 1.** Make a copy of your first test, pasting it just under the first test, and change the test description and the name of **Ashley** to **Jordan**, as follows:
```
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
```

**Step 2.** Run tests with **npm test**. We expect this test to fail, and it does. But examine the code carefully. Is this what you expected to see? Take a look at the value of **Received string** in the following code:
```
FAIL test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (18ms)
    ✕ renders another customer first name (8ms)
  ● Appointment › renders another customer first name
    expect(received).toContain(expected)
    Expected substring: "Jordan"
    Received string:    "AshleyAshley"
```

The document body has the text **AshleyAshley**. This kind of repeated text is an indicator that our tests are not *independent* of one another. The component has been rendered twice, once for each test. That’s correct, but the document isn’t being cleared between each test run.

This is a problem. When it comes to unit testing, we want all tests to be independent of one other. If they aren’t, the output of one test could affect the functionality of a subsequent test. A test might pass because of the actions of a previous rest, resulting in a false positive. And even if the test did fail, having an unknown initial state means you’ll spend time figuring out if it was the initial state of the test that caused the issue, rather than the test scenario itself.

We need to change course and fix this before we get ourselves into trouble.

#### Test independence

**Unit tests should be independent of one another.**

The simplest way to achieve this is to not have any shared state between tests.

Each test should only use variables that it has created itself.

## Backtracking on ourselves

We know that the **shared state** is the problem. Shared state is a fancy way of saying “shared variables.” In this case, it’s **document**. This is the single global **document** object that is given to us by the **jsdom** environment, which is consistent with how a normal web browser operates: there’s a single **document** object. But unfortunately, our two tests use **appendChild** to add into that single document that’s shared between them. They don’t each get their own separate instance.

A simple solution is to replace **appendChild** with **replaceChildren**, like this:
```js
document.body.replaceChildren(container);
```

This will clear out everything from **document.body** before doing the append.

But there’s a problem. We’re in the middle of a *red* test. **We should never refactor, rework, or otherwise change course while we’re red.**

Admittedly, this is all highly contrived — we could have used **replaceChildren** right from the start. But not only are we proving the need for **replaceChildren**, we are also about to discover an important technique for dealing with just this kind of scenario.

What we’ll have to do is *skip* this test we’re working on, fix the previous test, then re-enable the skipped test. Let’s do that now by performing the following steps:

**Step 1.** In the first test you’ve just written, change **it** to **it.skip**. Do that now for the second test as follows:
```js
it.skip("renders another customer first name", () => {

  ...

});
```

**Step 2.** Run tests. You’ll see that Jest ignores the second test and the first one still passes, as follows:
```
PASS test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (19ms)
    ○ skipped 1 test

Test Suites: 1 passed, 1 total
Tests: 1 skipped, 1 passed, 2 total
```

```
git add --all; git commit -m "Triangulating, ping pong, test independence, it.skip"
```

**Step 3.** In the first test, change **appendChild** to **replaceChildren** as follows:
```js
it("renders the customer first name", () => {
  const customer = { firstName: "Ashley" };
  const component = (
    <Appointment customer={customer} />
  );
  const container = document.createElement("div");
  document.body.replaceChildren(container);         // +-
  ReactDOM.createRoot(container).render(component);
  expect(document.body.textContent).toContain(
    "Ashley"
  );
});
```

**Step 4.** Rerun the tests with **npm test**. It should still be passing.

It’s time to bring the skipped test back in by removing **.skip** from the function name.

**Step 5.** Perform the same update in this test as in the first: change **appendChild** to **replaceChildren**, like this:
```js
it("renders another customer first name", () => {
  const customer = { firstName: "Jordan" };
  const component = (
    <Appointment customer={customer} />
  );
  const container = document.createElement("div");
  document.body.replaceChildren(container);             // +-
  act(() =>
    ReactDOM.createRoot(container).render(component)
  );
  expect(document.body.textContent).toContain(
    "Jordan"
  );
});
```

**Step 6.** Running tests now should give us the error that we were originally expecting. No more repeated text content, as you can see:
```
FAIL test/Appointment.test.js
  Appointment
    ✓ renders the customer first name (18ms)
    ✕ renders another customer first name (8ms)
  ● Appointment › renders another customer first name
    expect(received).toContain(expected)
    Expected substring: "Jordan"
    Received string:    "Ashley"
```

```
git add --all; git commit -m "Use replaceChildren instead of appendChild so that the test properly fails"
```

**Step 7.** To make the test pass, we need to introduce the prop and use it within our component. Change the definition of **Appointment** to look as follows, destructuring the function arguments to pull out the customer prop:
```
export const Appointment = ({ customer }) => (

  <div>{customer.firstName}</div>

);
```

**Step 8.** Run tests. We expect this test to now pass:
```
PASS test/Appointment.test.js

Appointment
✓ renders the customer first name (21ms)
✓ renders another customer first name (2ms)
```

Great work! We’re done with our passing test, and we’ve successfully triangulated to remove hardcoding.

In this section, you’ve written two tests and, in the process of doing so, you’ve discovered and overcome some of the challenges we face when writing automated tests for React components.

Now that we’ve got our tests working, we can take a closer look at the code we’ve written.

```
git add --all; git commit -m "Update implementation of Appointment to make the second test pass"
```

## Refactoring your work

Now that you’ve got a green test, it’s time to refactor your work. Refactoring is the process of adjusting your code’s structure without changing its functionality. It’s crucial for keeping a code base in a fit, maintainable state.

Sadly, the refactoring step is the step that always gets forgotten. The impulse is to rush straight into the next feature. We can’t stress how important it is to take time to simply stop and stare at your code and think about ways to improve it. Practicing your refactoring skills is a sure-fire way to level up as a developer.

The adage “more haste; less speed” applies to coding just as it does in life. If you make a habit of skipping the refactoring phase, your code quality will likely deteriorate over time, making it harder to work with and therefore slower to build new features.

The TDD cycle helps you build good personal discipline and habits, such as consistently refactoring. It might take more effort upfront, but you will reap the rewards of a code base that remains maintainable as it ages.

### Don't repeat yourself

Test code needs as much care and attention as production code. The number one principle you’ll be relying on when refactoring your tests is **Don’t Repeat Yourself (DRY)**. Drying up tests is a phrase all TDDers repeat often.

The key point is that you want your tests to be as concise as possible. When you see repeated code that exists in multiple tests, it’s a great indication that you can pull that repeated code out. There are a few different ways to do that, and we’ll cover just a couple in this chapter.

You will see further techniques for drying up tests in *Chapter 3, Refactoring the Test Suite*.

## Sharing setup code between tests

When tests contain identical setup instructions, we can promote those instructions into a shared **beforeEach** block. The code in this block is executed before each test.

Both of our tests use the same two variables: **container** and **customer**. The first one of these, **container**, is initialized identically in each test. That makes it a good candidate for a **beforeEach** block.

Perform the following steps to introduce your first **beforeEach** block:

**Step 1.** Since **container** needs to be accessed in the **beforeEach** block and each of the tests, we must declare it in the outer **describe** scope. And since we’ll be setting its value in the **beforeEach** block, that also means we’ll need to use **let** instead of **const**. Just above the first test, add the following line of code:
```js
let container;
```

**Step 2.** Below that declaration, add the following code:
```js
beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
});
```

**Step 3.** Delete the corresponding two lines from each of your two tests. Note that since we defined **container** in the scope of the **describe** block, the value set in the **beforeEach** block will be available to your test when it executes.

```
git add --all; git commit -m "Refactor: Promote the container variable from both tests into a shared beforeEach block"
```

#### Use of let instead of const

**Be careful when you use let definitions within the describe scope.**

These variables are not cleared by default between each test execution, and that shared state will affect the outcome of each test. A good rule of thumb is that any variable you declare in the **describe** scope should be assigned to a new value in a corresponding **beforeEach** block, or in the first part of each test, just as we’ve done here.

For a more detailed look at the use of **let** in test suites, head to [https://reacttdd.com/use-of-let](https://reacttdd.com/use-of-let).

In *Chapter 3, Refactoring the Test Suite*, we’ll look at a method for sharing this setup code between multiple test suites.

```
git add --all; git commit -m "Note: use of let instead of const"
```

## Extracting methods

The call to **render** is the same in both tests. It's also quite lengthy given that it's wrapped in a call to **act**. It makes sense to extract this entire operation and give it a more meaningful name.

Rather than pull it out as is, we can create a new function that takes the **Appointment** component as its parameter. The explanation for why this is useful will come after, but now let’s perform the following steps:

**Step 1.** Above the first test, write the following definition. Note that it still needs to be within the **describe** block because it uses the **container** variable:
```js
const render = component =>
  act(() =>
    ReactDOM.createRoot(container).render(component)
  );
```

**Step 2.** Now, replace the call to **render** in each test with the following line of code:
```js
render(<Appointment customer={customer} />);
```

**Step 3.** In the preceding step, we inlined the JSX, passing it directly into render. That means you can now delete the line starting with const component. For example, your first test should end up looking as follows:
```js
it("renders the customer first name", () => {

  const customer = { firstName: "Ashley" };

  render(<Appointment customer={customer} />);

  expect(document.body.textContent).toContain(

    "Ashley"

  );

});
```

**Step 4.** Rerun your tests and verify that they are still passing.

```
git add --all; git commit -m "Refactor: extract the act method from both tests"
```

#### Highlighting differences within your tests

The parts of a test that you want to highlight are the parts that differ between tests. Usually, some code remains the same (such as **container** and the steps needed to render a component) and some code differs (**customer** in this example). Do your best to hide away whatever is the same and highlight what differs. That way, it makes it obvious what a test is specifically testing.

This section has covered a couple of simple ways of refactoring your code. As the book progresses, we’ll look at many different ways that both production source code and test code can be refactored.

### Writing great tests

Now that you’ve written a couple of tests, let’s step away from the keyboard and discuss what you’ve seen so far.

Your first test looks like the following example:
```js
it("renders the customer first name", () => {
  const customer = { firstName: "Ashley" };
  render(<Appointment customer={customer} />);
  expect(document.body.textContent).toContain("Ashley");
});
```

This is concise and clearly readable.

A *good* test has the following three distinct sections:
* **Arrange**: Sets up test dependencies
* **Act**: Executes production code under test
* **Assert**: Checks that expectations are met

**This is so well understood that it is called the *Arrange, Act, Assert (AAA) pattern, and all of the tests in this book follow this pattern.**

A *great* test is not just good but is also the following:
* Short
* Descriptive
* Independent of other tests
* Has no side effects

In the remainder of this section, we’ll discuss the TDD cycle, which you’ve already used, and also how to set up your development environment for easy TDD.

## Red, green, refactor

TDD, at its heart, is the red, green, refactor cycle that we’ve just seen.

Figure 1.1 – The TDD cycle

The steps of the TDD cycle are:

1. **Write a failing test**: Write a short test that describes some functionality you want. Execute your test and watch it fail. If it doesn’t fail, then it’s an unnecessary test; delete it and write another.

2. **Make it pass**: Make the test green by writing the simplest production code that will work. Don’t worry about finding a neat code structure; you can tidy it up later.

3. **Refactor your code**: Stop, slow down, and resist the urge to move on to the next feature. Work hard to make your code — both production and test code — as clean as it can be.

That’s all there is to it. You’ve already seen this cycle in action in the preceding two sections, and we’ll continue to use it throughout the rest of the book.

## Streamlining your testing process

Think about the effort you’ve put into this book so far. What actions have you been doing the most? They are the following:

* Switching between **src/Appointment.js** and **test/Appointment.test.js**
* Running **npm test** and analyzing the output

Make sure you can perform these actions quickly.

For a start, you should use split-screen functionality in your editor. If you aren’t already, take this opportunity to learn how to do it. Load your production module on one side and the corresponding unit test file on the other.

Here’s a picture of our setup; we use **nvim** and **tmux**:

Figure 1.2 – A typical TDD setup running tmux and vim in a terminal

You can see that we also have a little test window at the bottom for showing test output.

Jest can also watch your files and auto-run tests when they change. To enable this, change the test command in `package.json` to `jest --watchAll`. This reruns all of your tests when it detects any changes.

#### WATCHING FILES FOR CHANGES

Jest’s watch mode has an option to run only the tests in files that have changed, but since your React app will be composed of many different files, each of which are interconnected, it’s better to run everything as breakages can happen in many modules.

## Summary

Tests act like a safety harness in our learning; we can build little blocks of understanding, building on top of each other, up and up to ever-greater heights, without fear of falling.

In this chapter, you’ve learned a *lot* about the TDD experience.

To begin with, you set up a React project from scratch, pulling in only the dependencies you need to get things running. You’ve written two tests using Jest’s **describe**, **it**, and **beforeEach** functions. You discovered the **act** helper, **which ensures all React rendering has been completed before your test expectations execute**.

You’ve also seen plenty of testing ideas. Most importantly, you’ve practiced TDD’s red-green-refactor cycle. You’ve also used triangulation and you learned about the **Arrange, Act, Assert pattern**.

And we threw in a couple of design principles for good measure: **DRY** and **YAGNI.**

While this is a great start, the journey has only just begun. In the following chapter, we’ll test drive a more complex component.

## Further reading

Take a look at the Babel web page to discover how to correctly configure the Babel **env** preset. This is important for real-world applications, but we skipped over it in this chapter. You can find it at the following link:

[https://babeljs.io/docs/en/babel-preset-env](https://babeljs.io/docs/en/babel-preset-env).

React’s **act** function was introduced in React 17 and has seen updates in React 18. It is deceptively complex. See this blog post for some more discussion on how this function is used at the following link: [https://reacttdd.com/understanding-act](https://reacttdd.com/understanding-act).

This book doesn’t make much use of Jest’s **watch** functionality. In recent versions of Jest, this has seen some interesting updates, such as the ability to choose which files to watch. If you find rerunning tests a struggle, you might want to try it out. You can find more information at the following link: [https://jestjs.io/docs/en/cli#watch](https://reacttdd.com/understanding-act).

```
git add --all; git commit -m "Complete ch1: First steps with TDD"
```
