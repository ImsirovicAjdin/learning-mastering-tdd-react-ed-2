# Part 1 - Exploring the TDD workflow
# Chapter 7: Testing useEffect and Mocking Components

In the previous chapter, you saw how test doubles can be used to verify network requests that occur upon user actions, such as clicking a submit button. We can also use them to verify side effects when our components mount, like when we're fetching data from the server that the component needs to function. In addition, test doubles can be used to verify the rendering of child components. Both use cases often occur together with container components, which are responsible for simply loading data and passing it to another component for display.

In this chapter, we’ll build a new component, AppointmentsDayViewLoader, that loads the day’s appointments from the server and passes them to the AppointmentsDayView component that we implemented in Chapter 2, Rendering Lists and Detail Views. By doing so, the user can view a list of appointments occurring today.

In this chapter, we will cover the following topics:

Mocking child components
Fetching data on mount with useEffect
Variants of the jest.mock call
These are likely the most difficult tasks you’ll encounter while test-driving React components.

Technical requirements
The code files for this chapter can be found here: https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter07

Mocking child components
In this section, we’re going to use the jest.mock test helper to replace the child component with a dummy implementation. Then, we’ll write expectations that check whether we passed the right props to the child component and that it is correctly rendered on the screen.

But first, let’s take a detailed look at how mocked components work.

How to mock components, and why?
The component we’re going to build in this chapter has the following shape:


export const AppointmentsDayViewLoader = ({ today }) => {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    // fetch data from the server
    const result = await global.fetch(...);
    // populate the appointments array:
    setAppointments(await result.json());
  }, [today]);
  return (
    <AppointmentsDayView appointments={appointments} />
  );
};
Its purpose is to display all the current appointments for a given day. This information is then passed into the component as the today prop. The component’s job is to fetch data from the server and then pass it to the AppointmentsDayView component, which we built previously and already tested.

Think about the tests we may need. First, we’d want a test to prove that AppointmentsDayView loads with no appointments shown initially. Then, we’d want some tests that verify our global.fetch call is called successfully, and the returned data is passed into AppointmentsDayView.

How do we test that AppointmentsDayView is called with the right data? We could repeat some of the tests we have already written in the test suite for AppointmentsDayView – for example, by testing that a list of appointments is displayed, and that the relevant appointment data is shown.

However, we’d then be introducing repetition into our test suites. If we modify how AppointmentsDayView works, we’ll have two places to update tests.

An alternative is to mock the component with a spy object. For this, we can use the jest.mock function, in tandem with a spy. This is how it will look:


jest.mock("../src/AppointmentsDayView", () => ({
  AppointmentsDayView: jest.fn(() => (
    <div id="AppointmentsDayView" />
  )),
}));
The first argument to the function is the file path that is being mocked. It must match the path that’s passed to the import statement. This function is mocking the entire module:


import { MyComponent } from "some/file/path";
jest.mock("/some/file/path", ...);
describe("something that uses MyComponent", () => {
});
In the preceding code, Jest hoists this call to the top of the file and hooks into import logic so that when the import statement is run, your mock is returned instead.

Any time AppointmentsDayView is referenced in either the test suite or the component under test, you’ll get this mock value rather than the real component. Instead of rendering our day view, we’ll get a single div with an id value of AppointmentsDayView.

The second parameter is the module factory parameter. This is a factory method that is invoked when the mock is imported. It should return a set of named exports – in our case, this means a single component, AppointmentsDayView.

Because the mock definition is hoisted to the top of the file, you can’t reference any variables in this function: they won’t have been defined by the time your function is run. However, you can write JSX, as we have done here!

THE COMPLEXITY OF COMPONENT MOCK SETUP

This code is super cryptic, I know. Thankfully, you generally just need to write it once. I often find myself copy-pasting mocks when I need to introduce a new one into a test suite. I’ll look up a previous one I wrote in some other test suite and copy it across, changing the relevant details.

So, now comes the big question: why would you want to do this?

Firstly, using mocks can improve test organization by encouraging multiple test suites with independent surface areas. If both a parent component and its child component are non-trivial components, then having two separate test suites for those components can help reduce the complexity of your test suites.

The parent component’s test suite will contain just a handful of tests to prove that the child component was rendered and passed the expected prop value.

By mocking out the child component in the parent component’s test suite, you are effectively saying, “I want to ignore this child component right now, but I promise I’ll test its functionality elsewhere!”

A further reason is that you may already have tests for the child component. This is the scenario we find ourselves in: we already have tests for AppointmentsDayView, so unless we want to repeat ourselves, it makes sense to mock out the component wherever it’s used.

An extension of this reason is the use of library components. Because someone else built them, you have reason to trust that they’ve been tested and do the right thing. And since they’re library components, chances are they do something quite complex anyway, so rendering them within your tests may have unintended side effects.

Perhaps you have a library component that builds all sorts of elaborate HTML widgets and you don’t want your test code to know that. Instead, you can treat it as a black box. In that scenario, it’s preferable to verify the prop values that are passed to the component, again trusting that the component works as advertised.

Library components often have complex component APIs that allow the component to be configured in many ways. Mocking the component allows you to write contract tests that ensure you’re setting up props correctly. We’ll see this later in Chapter 11, Test-Driving React Router, when we mock out React Router’s Link component.

The final reason to mock components is if they have side effects on mount, such as performing network requests to pull in data. By mocking out the component, your test suite does not need to account for those side effects. We’ll do this in Chapter 8, Building an Application Component.

With all that said, let’s start building our new component.

Testing the initial component props
We’ll start by building a test suite for the new component:

Create a new file, test/AppointmentsDayViewLoader.js, and add all the following imports. We’re importing not just the component under test (AppointmentsDayViewLoader) but also the child component we’ll be mocking (AppointmentsDayView):
import React from "react";

import {

  initializeReactContainer,

  render,

  element,

} from "./reactTestExtensions";

import {

  AppointmentsDayViewLoader

} from "../src/AppointmentsDayViewLoader";

import {

  AppointmentsDayView

} from "../src/AppointmentsDayView";

Add the mock setup, just below the imports:
jest.mock("../src/AppointmentsDayView", () => ({

  AppointmentsDayView: jest.fn(() => (

    <div id="AppointmentsDayView" />

  )),

}));

Start with the first test, as shown here. This checks that the component we just mocked out is rendered. The mock renders a div element with an id value of AppointmentsDayView. The test looks up the id value using the element helper and checks that it isn’t null:
describe("AppointmentsDayViewLoader", () => {

  beforeEach(() => {

    initializeReactContainer();

  });

  it("renders an AppointmentsDayView", () => {

    await render(<AppointmentsDayViewLoader />);

    expect(

      element("#AppointmentsDayView")

    ).not.toBeNull();

  });

});

USE OF THE ID ATTRIBUTE

If you have experience with React Testing Library, you may have come across the use of data-testid for identifying components. If you want to use these mocking techniques with React Testing Library, then you can use data-testid instead of the id attribute, and then find your element using the queryByTestId function.

Although it’s generally recommended not to rely on data-testid for selecting elements within your test suites, that doesn’t apply to mock components. You need IDs to be able to tell them apart because you could end up with more than a few mocked components all rendered by the same parent. Giving an ID to each component is the simplest way to find them for these DOM presence tests. Remember that the mocks will never make it outside of your unit testing environment, so there’s no harm in using IDs.

For more discussions on mocking strategies with React Testing Library, head over to https://reacttdd.com/mocking-with-react-testing-library.

Let’s make that test pass. Create a new file, src/AppointmentsDayViewLoader.js, and go ahead and fill in the implementation, as follows. It does nothing but render the component, which is all the test asked for:
import React from "react";

import {

  AppointmentsDayView

} from "./AppointmentsDayView";

export const AppointmentsDayViewLoader = () => (

  <AppointmentsDayView />

);

Time for the next test. We’ll check whether the initial value of the props sent to
AppointmentsDayView is what we expect. We’ll do this by using the toBeCalledWith matcher, which we’ve used already. Notice the second parameter value of expect.anything(): that’s needed because React passes a second parameter to the component function when it’s rendered. You’ll never need to be concerned with this in your code – it’s an internal detail of React’s implementation – so we can safely ignore it. We’ll use expect.anything to assert that we don’t care what that parameter is:

it("initially passes empty array of appointments to AppointmentsDayView", () => {

  await render(<AppointmentsDayViewLoader />);

  expect(AppointmentsDayView).toBeCalledWith(

    { appointments: [] },

    expect.anything()

  );

});

VERIFYING PROPS AND THEIR PRESENCE IN THE DOM

It’s important to test both props that were passed to the mock and that the stubbed value is rendered in the DOM, as we have done in these two tests. In Chapter 8, Building an Application Component, we’ll see a case where we want to check that a mocked component is unmounted after a user action.

Make that pass by updating your component definition, as shown here:
export const AppointmentsDayViewLoader = () => (

  <AppointmentsDayView appointments={[]} />

);

You’ve just used your first mocked component! You’ve seen how to create the mock, and the two types of tests needed to verify its use. Next, we’ll add a useEffect hook to load data when the component is mounted and pass it through to the appointments prop.

Fetching data on mount with useEffect
The appointment data we’ll load comes from an endpoint that takes start and end dates. These values filter the result to a specific time range:


GET /appointments/<from>-<to>
Our new component is passed a today prop that is a Date object with the value of the current time. We will calculate the from and to dates from the today prop and construct a URL to pass to global.fetch.

To get there, first, we’ll cover a bit of theory on testing the useEffect hook. Then, we’ll implement a new renderAndWait function, which we’ll need because we’re invoking a promise when the component is mounted. Finally, we’ll use that function in our new tests, building out the complete useEffect implementation.

Understanding the useEffect hook
The useEffect hook is React’s way of running side effects. The idea is that you provide a function that will run each time any of the hook’s dependencies change. That dependency list is specified as the second parameter to the useEffect call.

Let’s take another look at our example:


export const AppointmentsDayViewLoader = ({ today }) => {
  useEffect(() => {
    // ... code runs here
  }, [today]);
  
  // ... render something
}
The hook code will run any time the today prop changes. This includes when the component first mounts. When we test-drive this, we’ll start with an empty dependency list and then use a specific test to force a refresh when the component is remounted with a new today prop value.

The function you pass to useEffect should return another function. This function performs teardown: it is called any time the value changes, especially before the hook function is invoked again, enabling you to cancel any running tasks.

We’ll explore this return function in detail in Chapter 15, Adding Animation. However, for now, you should be aware that this affects how we call promises. We can’t do this:


useEffect(async () => { ... }, []);
Defining the outer function as async would mean it returns a promise, not a function. We must do this instead:


useEffect(() => {
  const fetchAppointments = async () => {
    const result = await global.fetch(...);      
    setAppointments(await result.json());
  };
  fetchAppointments();
}, [today]);
When running tests, if you were to call global.fetch directly from within the useEffect hook, you’d receive a warning from React. It would alert you that the useEffect hook should not return a promise.

USING SETTERS INSIDE USEEFFECT HOOK FUNCTIONS

React guarantees that setters such as setAppointments remain static. This means they don’t need to appear in the useEffect dependency list.

To get started with our implementation, we’ll need to ensure our tests are ready for render calls that run promises.

Adding the renderAndWait helper
Just as we did with clickAndWait and submitAndWait, now, we need renderAndWait. This will render the component and then wait for our useEffect hook to run, including any promise tasks.

To be clear, this function is necessary not because of the useEffect hook itself – just a normal sync act call would ensure that it runs – because of the promise that useEffect runs:

In test/reactTestExtensions.js, add the following function below the definition of render:
export const renderAndWait = (component) =>

  act(async () => (

    ReactDOM.createRoot(container).render(component)

  )

);

Update the import in your test suite so that it references this new function:
import {

  initializeReactContainer,

  renderAndWait,

  element,

} from "./reactTestExtensions";

Then, update the first test:
it("renders an AppointmentsDayView", async () => {

  await renderAndWait(<AppointmentsDayViewLoader />);

  expect(

    element("#AppointmentsDayView")

  ).not.toBeNull();

});

Add the second test, which checks that we send an empty array of appointments to AppointmentsDayView before the server has returned any data:
it("initially passes empty array of appointments to AppointmentsDayView", async () => {

  await renderAndWait(<AppointmentsDayViewLoader />);

  expect(AppointmentsDayView).toBeCalledWith(

    { appointments: [] },

    expect.anything()

  );

});

Make sure to check that these tests are passing before you continue.

Adding the useEffect hook
We’re about to introduce a useEffect hook with a call to global.fetch. We’ll start by mocking that call using jest.spyOn. Then, we’ll continue with the test:

Add the following new imports to the top of the test suite:
import { todayAt } from "./builders/time";

import { fetchResponseOk } from "./builders/fetch";

Define a sample set of appointments at the top of the describe block:
describe("AppointmentsDayViewLoader", () => {

  const appointments = [

    { startsAt: todayAt(9) },

    { startsAt: todayAt(10) },

  ];

  ...

});

To set up global.fetch so that it returns this sample array, modify the test suite’s beforeEach block, as shown here:
beforeEach(() => {

  initializeReactContainer();

  jest

    .spyOn(global, "fetch")

    .mockResolvedValue(fetchResponseOk(appointments));

});

It’s time for our test. We assert that when the component is mounted, we should expect to see a call to global.fetch being made with the right parameters. Our test calculates what the right parameter values should be – it should be from midnight today to midnight tomorrow:
it("fetches data when component is mounted", async () => {

  const from = todayAt(0);

  const to = todayAt(23, 59, 59, 999);

  await renderAndWait(

    <AppointmentsDayViewLoader today={today} />

  );

  expect(global.fetch).toBeCalledWith(

    `/appointments/${from}-${to}`,

    {

      method: "GET",

      credentials: "same-origin",

      headers: { "Content-Type": "application/json" },

    }

  );

});

To make this test pass, first, we’ll need to introduce a useEffect hook into the component file:
import React, { useEffect } from "react";

Now, we can update the component to make the call, as follows. Although this is a lot of code already, notice how we aren’t making use of the return value yet: there’s no state being stored and AppointmentsDayView still has its appointments prop set to an empty array. We’ll fill that in later:
export const AppointmentsDayViewLoader = (

  { today }

) => {

  useEffect(() => {

    const from = today.setHours(0, 0, 0, 0);

    const to = today.setHours(23, 59, 59, 999);

    const fetchAppointments = async () => {

      await global.fetch(

        `/appointments/${from}-${to}`,

        {

          method: "GET",

          credentials: "same-origin",

          headers: {

            "Content-Type": "application/json"

          },

        }

      );

    };

    fetchAppointments();

  }, []);

  return <AppointmentsDayView appointments={[]} />;

};

Before continuing with the next test, let’s set a default value for the today prop so that any callers don’t need to specify this:
AppointmentsDayViewLoader.defaultProps = {

  today: new Date(),

};

The next test will ensure we use the return value of our global.fetch call. Notice how we use the toHaveBeenLastCalledWith matcher. This is important because the first render of the component will be an empty array. It’s the second call that will contain data:
it("passes fetched appointments to AppointmentsDayView once they have loaded", async () => {

  await renderAndWait(<AppointmentsDayViewLoader />);

  

  expect(

    AppointmentsDayView

  ).toHaveBeenLastCalledWith(

    { appointments },

    expect.anything()

  );

});

To make that pass, first, update your component’s import to pull in the useState function:
import React, { useEffect, useState } from "react";

Now, update your component’s definition, as shown here:
export const AppointmentsDayViewLoader = (

  { today }

) => {

  const [

    appointments, setAppointments

  ] = useState([]);

  useEffect(() => {

    ...

    const fetchAppointments = async () => {

      const result = await global.fetch(

        ...

      );

      setAppointments(await result.json());

    };

    fetchAppointments();

  }, []);

  return (

    <AppointmentsDayView

      appointments={appointments}

    />

  );

};

This completes the basic useEffect implementation – our component is now loading data. However, there’s a final piece we must address with the useEffect implementation.

Testing the useEffect dependency list
The second parameter to the useEffect call is a dependency list that defines the variables that should cause the effect to be re-evaluated. In our case, the today prop is the important one. If the component is re-rendered with a new value for today, then we should pull down new appointments from the server.

We’ll write a test that renders a component twice. This kind of test is very important any time you’re using the useEffect hook. To support that, we’ll need to adjust our render functions to ensure they only create one root:

In test/reactTestExtensions.js, add a new top-level variable called reactRoot and update initializeReactContainer to set this variable:
export let container;

let reactRoot;

export const initializeReactContainer = () => {

   container = document.createElement("div");

   document.body.replaceChildren(container);

  reactRoot = ReactDOM.createRoot(container);

};

Now, update the definitions of render and renderAndWait so that they use this reactRoot variable. After making this change, you’ll be able to re-mount components within a single test:
export const render = (component) =>

  act(() => reactRoot.render(component));

export const renderAndWait = (component) =>

  act(async () => reactRoot.render(component));

Back in your test suite, update import so that it includes today, tomorrow, and tomorrowAt. We’ll use these in the next test:
import {

  today,

  todayAt,

  tomorrow,

  tomorrowAt

} from "./builders/time";

Now, add the test. This renders the component twice, with two separate values for the today prop. Then, it checks whether global.fetch was called twice:
it("re-requests appointment when today prop changes", async () => {

  const from = tomorrowAt(0);

  const to = tomorrowAt(23, 59, 59, 999);

  await renderAndWait(

    <AppointmentsDayViewLoader today={today} />

  );

  await renderAndWait(

    <AppointmentsDayViewLoader today={tomorrow} />

  );

  expect(global.fetch).toHaveBeenLastCalledWith(

    `/appointments/${from}-${to}`,

    expect.anything()

  );

});

If you run the test now, you’ll see that global.fetch is only being called once:
    AppointmentsDayViewLoader ' re-requests appointment when today prop changes

    expect(

      jest.fn()

    ).toHaveBeenLastCalledWith(...expected)

    Expected: "/appointments/1643932800000-1644019199999", Anything

    Received: "/appointments/1643846400000-1643932799999", {"credentials": "same-origin", "headers": {"Content-Type": "application/json"}, "method": "GET"}

Making it pass is a one-word change. Find the second parameter of the useEffect call and change it from an empty array, as shown here:
useEffect(() => {

  ...

}, [today]);

That’s it for the implementation of this component. In the next section, we’ll clean up our test code with a new matcher.

Building matchers for component mocks
In this section, we’ll introduce a new matcher, toBeRenderedWithProps, that simplifies the expectations for our mock spy object.

Recall that our expectations look like this:


expect(AppointmentsDayView).toBeCalledWith(
  { appointments },
  expect.anything()
);
Imagine if you were working on a team that had tests like this. Would a new joiner understand what that second argument, expect.anything(), is doing? Will you understand what this is doing if you don’t go away for a while and forget how component mocks work?

Let’s wrap that into a matcher that allows us to hide the second property.

We need two matchers to cover the common use cases. The first, toBeRenderedWithProps, is the one we’ll work through in this chapter. The second, toBeFirstRenderedWithProps, is left as an exercise for you.

The matcher, toBeRenderedWithProps, will pass if the component is currently rendered with the given props. This function will be equivalent to using the toHaveBeenLastCalledWith matcher.

The essential part of this matcher is when it pulls out the last element of the mock.calls array:


const mockedCall =
  mockedComponent.mock.calls[
    mockedComponent.mock.calls.length – 1
  ];
THE MOCK.CALLS ARRAY

Recall that every mock function that’s created with jest.spyOn or jest.fn will have a mock.calls property, which is an array of all the calls. This was covered in Chapter 6, Exploring Test Doubles.

The second matcher is toBeFirstRenderedWithProps. This will be useful for any test that checks the initial value of the child props and before any useEffect hooks have run. Rather than picking the last element of the mock.calls array, we’ll just pick the first:


const mockedCall = mockedComponent.mock.calls[0];
Let’s get started with toBeRenderedWithProps:

Create a new matcher test file at test/matchers/toBeRenderedWithProps.test.js. Add the following imports:
import React from "react";

import {

  toBeRenderedWithProps,

} from "./toBeRenderedWithProps";

import {

  initializeReactContainer,

  render,

} from "../reactTestExtensions";

Add the following test setup. Since our tests will be operating on a spy function, we can set that up in our beforeEach block, as shown here:
describe("toBeRenderedWithProps", () => {

  let Component;

  beforeEach(() => {

    initializeReactContainer();

    Component = jest.fn(() => <div />);

  });

});

As usual, our first test is to check that pass returns true. Notice how we must render the component before we call the matcher:
it("returns pass is true when mock has been rendered", () => {

  render(<Component />);

  const result = toBeRenderedWithProps(Component, {});

  expect(result.pass).toBe(true);

});

To make this pass, create a new file for the matcher, test/matchers/toBeRenderedWithProps.js, and add the following implementation:
export const toBeRenderedWithProps = (

  mockedComponent,

  expectedProps

) => ({  pass: true });

It’s time to triangulate. For the next test, let’s check that pass is false when we don’t render the component before calling it:
it("returns pass is false when the mock has not been rendered", () => {

  const result = toBeRenderedWithProps(Component, {});

  expect(result.pass).toBe(false);

});

To get the test to green, all we’ve got to do is check that the mock was called at least once:
export const toBeRenderedWithProps = (

  mockedComponent,

  expectedProps

) => ({

  pass: mockedComponent.mock.calls.length > 0,

});

Next, we’ll need to check that pass is false if the props don’t match. We can’t write the opposite test – that pass is true if the props match – because that test would already pass, given our current implementation:
it("returns pass is false when the properties do not match", () => {

  render(<Component a="b" />);

  const result = toBeRenderedWithProps(

    Component, {

      c: "d",

    }

  );

  expect(result.pass).toBe(false);

});

For the component code, we’ll use the equals function from inside the expect-utils package, which is already installed as part of Jest. This tests for deep equality but also allows you to make use of expect helpers such as expect.anything and expect.objectContaining:
import { equals } from "@jest/expect-utils";

export const toBeRenderedWithProps = (

  mockedComponent,

  expectedProps

) => {

  const mockedCall = mockedComponent.mock.calls[0];

  const actualProps = mockedCall ?

    mockedCall[0] : null;

  const pass = equals(actualProps, expectedProps);

  return { pass };

};

For our final test, we want an example that shows that this matcher works that the expectation will match on the last rendering of the mock:
it("returns pass is true when the properties of the last render match", () => {

  render(<Component a="b" />);

  render(<Component c="d" />);

  const result = toBeRenderedWithProps(

    Component,

    { c: "d" }

  );

  expect(result.pass).toBe(true);

});

To make that pass, we need to update the implementation so that it chooses the last element of the mock.calls array, rather than the first:
export const toBeRenderedWithProps = (

  mockedComponent,

  expectedProps

) => {

  const mockedCall =

    mockedComponent.mock.calls[

      mockedComponent.mock.calls.length – 1

    ];

  ...

};

We’ll leave our implementation here. Completing the tests for the message property is left as an exercise for you, but they follow the same order as the tests shown in Chapter 3, Refactoring the Test Suite. For now, move to test/domMatchers.js and register your new matcher:
import {

  toBeRenderedWithProps,

} from "./matchers/toBeRenderedWithProps";

expect.extend({

  ...,

  toBeRenderedWithProps,

});

Finally, back in your test suite, update the test that checks the appointments prop. It should look as follows; it’s much nicer now that the expect.anything parameter value has gone:
it("passes fetched appointments to AppointmentsDayView once they have loaded", async () => {

  await renderAndWait(<AppointmentsDayViewLoader />);

  expect(AppointmentsDayView).toBeRenderedWithProps({

    appointments,

  });

});

With that, you’ve learned how to build a matcher for component mocks, which reduces the verbiage that we originally had when we used the built-in toBeCalledWith matcher.

The other test in this test suite needs a second matcher, toBeFirstRenderedWithProps. The implementation of this is left as an exercise for you.

In the next section, we’ll look at a variety of ways that component mocks can become more complicated.

Variants of the jest.mock call
Before we finish up this chapter, let’s take a look at some variations on the jest.mock call that you may end up using.

The key thing to remember is to keep your mocks as simple as possible. If you start to feel like your mocks need to become more complex, you should treat that as a sign that your components are overloaded and should be broken apart in some way.

That being said, there are cases where you must use different forms of the basic component mock.

Removing the spy function
To begin with, you can simplify your jest.mock calls by not using jest.fn:


jest.mock("../src/AppointmentsDayView", () => ({
  AppointmentsDayView: () => (
    <div id="AppointmentsDayView" />
  ),
}));
With this form, you’ve set a stub return value, but you won’t be able to spy on any props. This is sometimes useful if, for example, you’ve got multiple files that are testing this same component but only some of them verify the mocked component props. It can also be useful with third-party components.

Rendering the children of mocked components
Sometimes, you’ll want to render grandchild components, skipping out the child (their parent). This often happens, for example, when a third-party component renders a complex UI that is difficult to test: perhaps it loads elements via the shadow DOM, for example. In that case, you can pass children through your mock:


jest.mock("../src/AppointmentsDayView", () => ({
  AppointmentsDayView: jest.fn(({ children }) => (
    <div id="AppointmentsDayView">{children}</div>
  )),
}));
We will see examples of this in Chapter 11, Test-Driving React Router.

Checking multiple instances of the rendered component
There are occasions when you’ll want to mock a component that has been rendered multiple times into the document. How can you tell them apart? If they have a unique ID prop (such as key), you can use that in the id field:


jest.mock("../src/AppointmentsDayView", () => ({
  AppointmentsDayView: jest.fn(({ key }) => (
    <div id={`AppointmentsDayView${key}`} />
  )),
}));
APPROACH WITH CAUTION!

One of the biggest issues with mocking components is that mock definitions can get out of control. But mock setup is complicated and can be very confusing. Because of this, you should avoid writing anything but the simplest mocks.

Thankfully, most of the time, the plain form of component mock is all you’ll need. These variants are useful occasionally but should be avoided.

We’ll see this variation in action in Chapter 11, Test-Driving React Router.

Alternatives to module mocks
Mocking out an entire module is fairly heavy-handed. The mock you set up must be used for all the tests in the same test module: you can’t mix and match tests, some using the mock and some not. If you wanted to do this with jest.mock, you’d have to create two test suites. One would have the mock and the other wouldn’t.

You also have the issue that the mock is at the module level. You can’t just mock out one part of the module. Jest has functions that allow you to reference the original implementation called requireActual. For me, that involves moving into the danger zone of overly complex test doubles, so I refrain from using it – I have encountered a use case that needed it.

However, there are alternatives to using jest.mock. One is shallow rendering, which utilizes a special renderer that renders a single parent component, ignoring all child components other than standard HTML elements. In a way, this is even more heavy-handed because all your components end up mocked out.

For CommonJS modules, you can also overwrite specific exports inside modules, simply by assigning new values to them! This gives you a much more granular way of setting mocks at the test level. However, this is not supported in ECMAScript, so in the interests of maximum capability, you may want to avoid this approach.

For examples of these alternative approaches and a discussion on when you may want to use them, take a look at https://reacttdd.com/alternatives-to-module-mocks.

Summary
This chapter covered the most complex form of mocking: setting up component mocks with jest.mock.

Since mocking is a complex art form, it’s best to stick with a small set of established patterns, which I’ve shown in this chapter. You can also refer to the code in Chapter 11, Test-Driving React Router, for examples that show some of the variations that have been described in this chapter.

You also learned how to test-drive a useEffect hook before writing another matcher.

You should now feel confident with testing child components by using component mocks, Including loading data into those components through useEffect actions.

In the next chapter, we’ll extend this technique further by pulling out callback props from mock components and invoking them within our tests.

Exercises
The following are some exercises for you to try out:

Complete the message property tests on the toBeRenderedWithProps matcher.
Add the toBeFirstRenderedWithProps matcher and update your test suite to use this matcher. Since this matcher is very similar to toBeRenderedWithProps, you can add it to the same module file that contains the toBeRenderedWithProps matcher. You can also try to factor out any shared code into its own function that both matchers can use.
Add a toBeRendered matcher that checks if a component was rendered without checking its props.
Complete the matchers you’ve written so that they throw an exception if the passed argument is not a Jest mock.
Create a new component, AppointmentFormLoader, that calls the GET /availableTimeSlots endpoint when mounted. It should render an AppointmentForm component with its appointments prop set to the data returned from the server.
Further reading
To learn how to mock components without relying on jest.mock, please check out https://reacttdd.com/alternatives-to-module-mocks.
