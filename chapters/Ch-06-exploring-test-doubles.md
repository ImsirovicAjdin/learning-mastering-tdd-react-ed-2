# Part 1 - Exploring the TDD workflow
# Chapter 6: Exploring test doubles

In this chapter, we’ll look at the most involved piece of the TDD puzzle: test doubles.

Jest has a set of convenience functions for test doubles, such as jest.spyOn and jest.fn. Unfortunately, using test doubles well is a bit of a dark art. If you don’t know what you’re doing, you can end up with complicated, brittle tests. Maybe this is why Jest doesn’t promote them as a first-class feature of its framework.

Don’t be turned off: test doubles are a highly effective and versatile tool. The trick is to restrict your usage to a small set of well-defined patterns, which you’ll learn about in the next few chapters.

In this chapter, we will build our own set of hand-crafted test double functions. They work pretty much just how Jest functions do, but with a simpler (and more clunky) interface. The aim is to take the magic out of these functions, showing you how they are built and how they can be used to simplify your tests.

In the test suites you’ve built so far, some tests didn’t use the normal Arrange-Act-Assert (AAA) test format. These are the tests that start with expect.hasAssertions. In a real code base, I would always avoid using this function and instead use test doubles, which help reorder the test into AAA order. We’ll start there: refactoring our existing tests to use our hand-crafted test doubles, and then swapping them out for Jest’s own test double functions.

The following topics will be covered in this chapter:

What is a test double?
Submitting forms using spies
Spying on the Fetch API
Stubbing fetch responses
Migrating to Jest’s built-in test double support
By the end of the chapter, you’ll have learned how to make effective use of Jest’s test double functionality.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter06

The code samples for this chapter and beyond contain extra commits that add a working backend to the application. This allows you to make requests to fetch data, which you’ll start doing in this chapter.

In the companion code repository, from Chapter06/Start onward, the npm run build command will automatically build the server.

You can then start the application by using the npm run serve command and browsing to http://localhost:3000 or http://127.0.0.1:3000.

IF YOU RUN INTO PROBLEMS

Check out the Troubleshooting section of the repository’s README.md file if you’re not able to get the application running.

What is a test double?
A unit in unit testing refers to a single function or component that we focus on for the duration of that test. The Act phase of a test should involve just one action on one unit. But units don’t act in isolation: functions call other functions, and components render child components and call callback props passed in from parent components. Your application can be thought of as a web of dependencies, and test doubles help us to design and test those dependencies.

When we’re writing tests, we isolate the unit under test. Often, that means we avoid exercising any of the collaborating objects. Why? Firstly, it helps us work toward our goal of independent, laser-focused tests. Secondly, sometimes those collaborating objects have side effects that would complicate our tests.

To give one example, with React components, we sometimes want to avoid rendering child components because they perform network requests when they are mounted.

A test double is an object that acts in place of a collaborating object. In Chapter 4, Test-Driving Data Input, you saw an example of a collaborator: the onSubmit function, which is a prop passed to both CustomerForm and AppointmentForm. We can swap that out with a test double in our tests. As we’ll see, that helps us define the relationship between the two.

The most important place to use test doubles is at the edges of our system when our code interacts with anything external to the page content: HyperText Transfer Protocol (HTTP) requests, filesystem access, sockets, local storage, and so on.

Test doubles are categorized into several different types: spies, stubs, mocks, dummies, and fakes. We normally only use the first two, and that’s what we’ll concentrate on in this chapter.

Learning to avoid fakes
A fake is any test double that has any kind of logic or control structure within it, such as conditional statements or loops. Other types of test objects, such as spies and stubs, are made up entirely of variable assignments and function calls.

One type of fake you’ll see is an in-memory repository. You can use this in place of Structured Query Language (SQL) data stores, message brokers, and other complex sources of data.

Fakes are useful when testing complex collaborations between two units. We’ll often start by using spies and stubs and then refactor to a fake once the code starts to feel unwieldy. A single fake can cover a whole set of tests, which is simpler than maintaining a whole bunch of spies and stubs.

We avoid fakes for these reasons:

Any logic requires tests, which means we must write tests for fakes, even though they are part of the test code. Spies and stubs don’t require tests.
Often, spies and stubs work in place of fakes. Only a small category of testing is simpler when we use fakes.
Fakes increase test brittleness because they are shared between tests, unlike other test doubles.
Now that we’ve covered the theory of test doubles, let’s move on to using them in our code.

Submitting forms using spies
In this section, you’ll hand-craft a reusable spy function and adjust your tests to get them back into AAA order.

Here’s a reminder of how one of those tests looked, from the CustomerForm test suite. It’s complicated by the fact it’s wrapped in a test generator, but you can ignore that bit for now—it’s the test content that’s important:


const itSubmitsExistingValue = (fieldName, value) =>
  it("saves existing value when submitted", () => {
    expect.hasAssertions();
    const customer = { [fieldName]: value };
    render(
      <CustomerForm
        original={customer}
        onSubmit={(props) =>
          expect(props[fieldName]).toEqual(value)
      }
    />
  );
  click(submitButton());
});
There are a couple of issues with this code, as follows:

The Assert phase of the test—the expectation—appears wrapped within the Act phase. That makes the test difficult to read and understand.
The call to expect.hasAssertions is ugly and is only there because our expectation is called as part of the onSubmit function, which may or may not be called.
We can fix both issues by building a spy.

WHAT IS A SPY?

A spy is a type of test double that records the arguments it is called with so that those values can be inspected later.

Untangling AAA
To move the expectation under the Act phase of the test, we can introduce a variable to store the firstName value that’s passed into the onSubmit function. We then write the expectation against that stored value.

Let’s do that now, as follows:

Modify the saves existing value when submitted test-generator function in test/CustomerForm.test.js, like so:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    let submitArg;

    const customer = { [fieldName]: value };

    render(

      <CustomerForm

        original={customer}

        onSubmit={submittedCustomer => (

          submitArg = submittedCustomer

        )}

      />

    );

    click(submitButton());

    expect(submitArg).toEqual(customer);

  });

The submitArg variable is assigned within our onSubmit handler and then asserted in the very last line of the test. This fixes both the issues we had with the first test: our test is back in AAA order and we got rid of the ugly expect.hasAssertions() call.

If you run your tests now, they should be green. However, any time you refactor tests in this way, you should verify that you’re still testing the right thing by unwinding the production code and watching the test fail. To check that our tests still work, locate this line in src/CustomerForm.js:
<form id="customer" onSubmit={handleSubmit}>

Remove the onSubmit prop entirely, like so:

<form id="customer">

Run npm test. You’ll get multiple test failures from various different tests. However, we’re only interested in this one test generator, so update its declaration to it.only rather than it, as follows:
it.only("saves existing value when submitted", () => {

Now, you should have just three failures, one for each of the fields that uses this generator function, as illustrated in the following code snippet. That’s a good sign; any fewer and we would have been generating false positives:
FAIL test/CustomerForm.test.js

  ● CustomerForm › first name field › saves existing value when submitted

    expect(received).toEqual(expected) // deep equality

    Expected: {"firstName": "existingValue"}

    Received: undefined

We’ve proved the test works, so you can go ahead and change the it.only declaration back to it, and reinsert the onSubmit prop that you removed from CustomerForm.js.
The code you’ve written in this test shows the essence of the spy function: we set a variable when the spy is called, and then we write an expectation based on that variable value.

But we don’t yet have an actual spy function. We’ll create that next.

Making a reusable spy function
We still have other tests within both CustomerForm and AppointmentForm that use the expect.hasAssertions form. How can we reuse what we’ve built in this one test across everything else? We can create a generalized spy function that can be used any time we want spy functionality.

Let’s start by defining a function that can stand in for any single-argument function, such as the event handlers we would pass to the onSubmit form prop, as follows:

Define the following function at the top of test/CustomerForm.test.js. Notice how the fn definition has a similar format to the onSubmit handler we used in the previous test:
const singleArgumentSpy = () => {

  let receivedArgument;

  return {

    fn: arg => (receivedArgument = arg),

    receivedArgument: () => receivedArgument

  };

};

Rewrite your test generator to use this function. Although your tests should still pass, remember to watch your tests fail by unwinding the production code. The code is illustrated in the following snippet:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const submitSpy = singleArgumentSpy();

    const customer = { [fieldName]: value };

    render(

      <CustomerForm

        original={customer}

        onSubmit={submitSpy.fn}

      />

    );

    click(submitButton());

    expect(submitSpy.receivedArgument()).toEqual(

      customer

    );

  });

Make your spy function work for functions with any number of arguments by replacing singleArgumentSpy with the following function:
const spy = () => {

  let receivedArguments;

  return {

    fn: (...args) => (receivedArguments = args),

    receivedArguments: () => receivedArguments,

    receivedArgument: n => receivedArguments[n]

  };

};

This uses parameter destructuring to save an entire array of parameters. We can use receivedArguments to return that array or use receivedArgument(n) to retrieve the nth argument.

Update your test code to use this new function, as shown in the following code snippet. You can include an extra expectation that checks toBeDefined on receivedArguments. This is a way of saying “I expect the function to be called”:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const submitSpy = spy();

    const customer = { [fieldName]: value };

    render(

      <CustomerForm

        original={customer}

        onSubmit={submitSpy.fn}

      />

    );

    click(submitButton());

    expect(

      submitSpy.receivedArguments()

    ).toBeDefined();

    expect(submitSpy.receivedArgument(0)).toEqual(

      customer

    );

  });

That’s really all there is to a spy: it’s just there to keep track of when it was called, and the arguments it was called with.

Using a matcher to simplify spy expectations
Let’s write a matcher that encapsulates these expectations into one single statement, like this:


expect(submitSpy).toBeCalledWith(value);
This is more descriptive than using a toBeDefined() argument on the matcher. It also encapsulates the notion that if receivedArguments hasn’t been set, then it hasn’t been called.

THROWAWAY CODE

We’ll spike this code—in other words, we won’t write tests. That’s because soon, we’ll replace this with Jest’s own built-in spy functionality. There’s no point in going too deep into a “real” implementation since we’re not intending to keep it around for long.

We’ll start by replacing the functionality of the first expectation, as follows:

Add the following code at the bottom of test/domMatchers.js. It adds the new matcher, ready for our tests:
expect.extend({

  toBeCalled(received) {

    if (received.receivedArguments() === undefined) {

      return {

        pass: false,

        message: () => "Spy was not called.",

      };

    }

    return {

      pass: true,

      message: () => "Spy was called.",

    };

  },

});

Update the test to use the new matcher, replacing the first expectation that used toBeDefined, as follows:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const submitSpy = spy();

    const customer = { [fieldName]: value };

    render(

      <CustomerForm

        original={customer}

        onSubmit={submitSpy.fn}

      />

    );

    click(submitButton());

    expect(submitSpy).toBeCalled(customer);

    expect(submitSpy.receivedArgument(0)).toEqual(

      customer

    );

  });

Verify the new matcher works by commenting out the call to onSubmit in your production code and watching the test fail. Then, undo the comment and try the negated form in your .not.toBeCalled test.
Now we can work on the second expectation—the one that checks the function arguments. Add the following code to your new matcher and rename it from toBeCalled to toBeCalledWith:
expect.extend({

  toBeCalledWith(received, ...expectedArguments) {

    if (received.receivedArguments() === undefined) {

      ...

    }

    const notMatch = !this.equals(

      received.receivedArguments(),

      expectedArguments

    );

    if (notMatch) {

      return {

        pass: false,

        message: () =>

          "Spy called with the wrong arguments: " +

          received.receivedArguments() +

          ".",

      };

    }

    return ...;

  },

});

USING THIS.EQUALS IN A MATCHER

The this.equals method is a special type of equality function that can be used in matchers. It does deep equality matching, meaning it will recurse through hashes and arrays looking for differences. It also allows the use of expect.anything(), expect.objectContaining(), and expect.arrayContaining() special functions.

If you were test-driving this matcher and had extracted it into its own file, you wouldn’t use this.equals. Instead, you’d import the equals function from the @jest/expect-utils package. We’ll do this in Chapter 7, Testing useEffect and Mocking Components.

Update your test to merge both expectations into one, as follows:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    ...

    click(submitButton());

    expect(submitSpy).toBeCalledWith(customer);

  });

Make this fail by changing the onSubmit call in your CustomerForm test suite to send obviously wrong data—for example, onSubmit(1, 2, 3). Then, try the negated form of the matcher too.
This completes our spy implementation, and you’ve seen how to test callback props. Next, we’ll look at spying on a more difficult function: global.fetch.

Spying on the fetch API
In this section, we’ll use the Fetch API to send customer data to our backend service. We already have an onSubmit prop that is called when the form is submitted. We’ll morph this onSubmit call into a global.fetch call, in the process of adjusting our existing tests.

In our updated component, when the Submit button is clicked, a POST HTTP request is sent to the /customers endpoint via the fetch function. The body of the request will be a JavaScript Object Notation (JSON) object representation of our customer.

The server implementation that’s included in the GitHub repository will return an updated customer object with an additional field: the customer id value.

If the fetch request is successful, we’ll call a new onSave callback prop with the fetch response. If the request isn’t successful, onSave won’t be called and we’ll instead render an error message.

You can think of fetch as a more advanced form on onSubmit: both are functions that we’ll call with our customer object. But fetch needs a special set of parameters to define the HTTP request being made. It also returns a Promise object, so we’ll need to account for that, and the request body needs to be a string, rather than a plain object, so we’ll need to make sure we translate it in our component and in our test suite.

One final difference: fetch is a global function, accessible via global.fetch. We don’t need to pass that as a prop. In order to spy on it, we replace the original function with our spy.

UNDERSTANDING THE FETCH API

The following code samples show how the fetch function expects to be called. If you’re unfamiliar with this function, see the Further reading section at the end of this chapter.

With all that in mind, we can plan our route forward: we’ll start by replacing the global function with our own spy, then we’ll add new tests to ensure we call it correctly, and finally, we’ll update our onSubmit tests to adjust its existing behavior.

Replacing global functions with spies
We’ve seen how to spy on a callback prop, by simply passing the spy as the callback’s prop value. To spy on a global function, we simply overwrite its value before our test runs and reset it back to the original function afterward.

Since global.fetch is a required dependency of your component—it won’t function without it—it makes sense to set a default spy in the test suite’s beforeEach block so that the spy is primed in all tests. The beforeEach block is also a good place for setting default return values of stubs, which we’ll do a little later in the chapter.

Follow these steps to set a default spy on global.fetch for your test suite:

Add the following declarations at the top of the outer describe block in test/CustomerForm.test.js:
describe("CustomerForm", () => {

  const originalFetch = global.fetch;

  let fetchSpy;

  ...

})

The originalFetch constant will be used when restoring the spy after our tests are complete. The fetchSpy variable will be used to store our fetch object so that we can write expectations against it.

Change the beforeEach block to read as follows. This sets up global.fetch as a spy for every test in your test suite:
beforeEach(() => {

  initializeReactContainer();

  fetchSpy = spy();

  global.fetch = fetchSpy.fn;

});

Just below the beforeEach block, add an afterEach block to unset your mock, like so:
afterEach(() => {

  global.fetch = originalFetch;

});

RESETTING GLOBAL SPIES WITH ORIGINAL VALUES

It’s important to reset any global variables that you replace with spies. This is a common cause of test interdependence: with a “dirty” spy, one test may break because some other test failed to reset its spies.

In this specific case, the Node.js runtime environment doesn’t actually have a global.fetch function, so the originalFetch constant will end up as undefined. You could argue, then, that this is unnecessary: in our afterEach block, we could simply delete the fetch property from global instead.

Later in the chapter, we’ll modify our approach to setting global spies when we use Jest’s built-in spy functions.

With the global spy in place, you’re ready to make use of it in your tests.

Test-driving fetch argument values
It’s time to add global.fetch to our component. When the submit button is clicked, we want to check that global.fetch is called with the right arguments. Similar to how we tested onSubmit, we’ll split this into a test for each field, specifying that each field must be passed along.

It turns out that global.fetch needs a whole bunch of parameters passed to it. Rather than test them all in one single unit test, we’re going to split up the tests according to their meaning.

We’ll start by checking the basics of the request: that it’s a POST request to the /customers endpoint. Follow these steps:

Add the following new test at the bottom of your CustomerForm test suite. Notice how onSubmit is given an empty function definition—() => {}—rather than a spy since we aren’t interested in that prop in this test:
it("sends request to POST /customers when submitting the form", () => {

  render(

    <CustomerForm

      original={blankCustomer}

      onSubmit={() => {}}

    />

  );

  click(submitButton());

  expect(fetchSpy).toBeCalledWith(

    "/customers",

    expect.objectContaining({

      method: "POST",

    })

  );

});

Run tests with npm test and verify that you receive an expectation failure with a Spy was not called message, as shown in the following code snippet:
  ● CustomerForm › sends request to POST /customers when submitting the form

    Spy was not called.

      163 |     );

      164 |     click(submitButton());

    > 165 |     expect(fetchSpy).toBeCalledWith(

          |                      ^

      166 |       "/customers",

      167 |       expect.objectContaining({

      168 |         method: "POST",

To make that pass, modify CustomerForm’s handleSubmit function by adding a call to global.fetch above the call to onSubmit, as shown in the following code snippet:
const handleSubmit = (event) => {

  event.preventDefault();

  global.fetch("/customers", {

    method: "POST",

  });

  onSubmit(customer);

};

SIDE-BY-SIDE IMPLEMENTATIONS

This is a side-by-side implementation. We leave the “old” implementation—the call to onSubmit—in place so that the other tests continue to pass.

With that test passing, add the next one. In this test, we test all the plumbing that’s necessary for our request, which we’ll call “configuration,” but you can think of this as batching up all the constant, less relevant information. This test also uses two new functions, expect.anything and expect.objectContaining, which are shown in the following code snippet:
it("calls fetch with the right configuration", () => {

  render(

    <CustomerForm

      original={blankCustomer}

      onSubmit={() => {}}

    />

  );

  click(submitButton());

  expect(fetchSpy).toBeCalledWith(

    expect.anything(),

    expect.objectContaining({

      credentials: "same-origin",

      headers: {

        "Content-Type": "application/json",

      },

    })

  );

});

TESTING A SUBSET OF PROPERTIES WITH EXPECT.ANYTHING AND EXPECT.OBJECTCONTAINING

The expect.anything function is a useful way of saying: “I don’t care about this argument in this test; I’ve tested it somewhere else.” It’s another great way of keeping your tests independent of each other. In this case, our previous test checks that the first parameter is set to /customers, so we don’t need to test that again in this test.

The expect.objectContaining function is just like expect.arrayContaining, and allows us to test just a slice of the full argument value.

Run that test and observe the test failure. You can see in the following code snippet that our matcher hasn’t done a great job of printing the message: the second actual parameter is printed as [object Object]. Let’s ignore that for now since later in the chapter, we’ll move to using Jest’s built-in matcher:
  ● CustomerForm › calls fetch with the right configuration when submitting the form

    Spy was called with the wrong arguments: /customers,[object Object].

To make that pass, simply insert the remaining properties into your call to global.fetch:
const handleSubmit = (event) => {

  event.preventDefault();

  global.fetch("/customers", {

    method: "POST",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" },

  });

  onSubmit(customer);

};

That gets the plumbing in place for our global.fetch call, with each of the constant arguments defined and in its place. Next, we’ll add in the dynamic argument: the request body.

Reworking existing tests with the side-by-side implementation
You’ve already started to build out the side-be-side implementation by using new tests. Now, it’s time to rework the existing tests. We’ll remove the old implementation (onSubmit, in this case) and replace it with the new implementation (global.fetch).

Once we’ve completed that, all the tests will point to global.fetch and so we can update our implementation to remove the onSubmit call from the handleSubmit function.

We’ve got two tests to update: the test that checks submitting existing values, and the test that checks submitting new values. They are complicated by the fact that they are wrapped in test-generator functions. That means as we change them, we should expect all the generated tests—one for each field—to fail as a group. It’s not ideal, but the process we’re following would be the same even if it were just a plain test.

Let’s get started with the test you’ve already worked on in this chapter, for submitting existing values. Follow these steps:

Move back to the itSubmitsExistingValue test-generator function and update it by inserting a new expectation at the bottom. Leave the existing expectation as it is (for now). Run the test and ensure the generated test fails. The code is illustrated in the following snippet:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const customer = { [fieldName]: value };

    const submitSpy = spy();

    render(

      <CustomerForm

        original={customer}

        onSubmit={submitSpy.fn}

      />

    );

    click(submitButton());

    expect(submitSpy).toBeCalledWith(customer);

    expect(fetchSpy).toBeCalledWith(

      expect.anything(),

      expect.objectContaining({

        body: JSON.stringify(customer),

      })

    );

  });

To make that pass, update the handleSubmit function in your CustomerForm component, as shown in the following code snippet. After this change, your tests should pass:
const handleSubmit = (event) => {

  event.preventDefault();

  global.fetch("/customers", {

    method: "POST",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(original),

  });

  onSubmit(customer);

};

The final test reference to the onSubmit prop is the itSubmitsNewValue test generator. This test still uses the old expect.hasAssertions style; we’ll get round to deleting that later. For now, simply add in a new expectation at the bottom of the test, as shown here:
const itSubmitsNewValue = (fieldName, value) =>

  it("saves new value when submitted", () => {

    ...

    expect(fetchSpy).toBeCalledWith(

      expect.anything(),

      expect.objectContaining({

        body: JSON.stringify({

          ...blankCustomer,

          [fieldName]: value,

        }),

      })

    );

  });

Run the test and verify that this test fails with a Spy was called with the wrong arguments: /customers,[object Object] failure message.
To make that pass, it’s a case of changing original to customer in your handleSubmit function, as follows:
const handleSubmit = (event) => {

  event.preventDefault();

  global.fetch("/customers", {

    method: "POST",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(customer),

  });

  onSubmit(customer);

};

Your call to fetch is now complete, so you can remove the original implementation. Start by removing the onSubmit prop and the submitSpy variable from the itSubmitsExistingValue test generator. The new version looks like this:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const customer = { [fieldName]: value };

    render(<CustomerForm original={customer} />);

    click(submitButton());

    expect(fetchSpy).toBeCalledWith(

      expect.anything(),

      expect.objectContaining({

        body: JSON.stringify(customer),

      })

    );

  });

Do the same for itSubmitsNewValue—you can get rid of the hasAssertions call too. The new version looks like this:
const itSubmitsNewValue = (fieldName, value) =>

  it("saves new value when submitted", () => {

    render(<CustomerForm original={blankCustomer} />);

    change(field(fieldName), value);

    click(submitButton());

    expect(fetchSpy).toBeCalledWith(

      expect.anything(),

      expect.objectContaining({

        body: JSON.stringify({

          ...blankCustomer,

          [fieldName]: value,

        }),

      })

    );

  });

Remove the call to onSubmit in the handleSubmit method.
Remove the onSubmit prop from the CustomerForm component definition.
Finally, remove the onSubmit prop from the prevents the default action... test.
Verify that all your tests are passing with npm test.
You’ve now seen how you can continue your side-by-side implementation by reworking tests. Once all the tests are reworked, you can delete the original implementation.

Our tests have gotten pretty long-winded again. Let’s finish this section with a little cleanup.

Improving spy expectations with helper functions
When we’re writing expectations for our spies, we aren’t just limited to using the toBeCalledWith matcher. We can pull out arguments and give them names, and then use standard Jest matchers on them instead. This way, we can avoid all the ceremony with expect.anything and expect.objectContaining.

Let’s do that now. Proceed as follows:

Add a new helper function, bodyOfLastFetchRequest, at the top of CustomerForm, as follows:
const bodyOfLastFetchRequest = () =>

  JSON.parse(fetchSpy.receivedArgument(1).body);

Update your itSubmitsExistingValue test generator to use this new helper to simplify its expectation. Note here the use of toMatchObject, which takes the place of expect.objectContaining in the previous version of this test:
const itSubmitsExistingValue = (fieldName, value) =>

  it("saves existing value when submitted", () => {

    const customer = { [fieldName]: value };

    render(<CustomerForm original={customer} />);

    click(submitButton());

    expect(bodyOfLastFetchRequest()).toMatchObject(

      customer

    );

  });

Since you’ve modified your test, you should verify that it still tests the right thing: mark it as it.only and then delete the body property from the global.fetch call. Check the test fails, and then undo the change, getting you back to a passing test.
Repeat for the itSubmitsNewValue test helper, as shown here:
const itSubmitsNewValue = (fieldName, value) =>

  it("saves new value when submitted", () => {

    render(<CustomerForm original={blankCustomer} />);

    change(field(fieldName), value);

    click(submitButton());

    expect(bodyOfLastFetchRequest()).toMatchObject({

      [fieldName]: value,

    });

  });

These tests are now looking very smart!

This has been a complicated change: we’ve replaced the onSubmit prop with a call to global.fetch. We did that by introducing a global spy in the beforeEach block and writing a side-by-side implementation while we reworked our tests.

In the next part of this chapter, we’ll add to our knowledge of spies, turning them into stubs.

Stubbing fetch responses
As with many HTTP requests, our POST /customers endpoint returns data: it will return the customer object together with a newly generated identifier that the backend has chosen for us. Our application will make use of this by taking the new ID and sending it back to the parent component (although we won’t build this parent component until Chapter 8, Building an Application Component).

To do that, we’ll create a new CustomerForm prop, onSave, which will be called with the result of the fetch call.

But hold on—didn’t we just remove an onSubmit prop? Yes, but this isn’t the same thing. The original onSubmit prop received the form values submitted by the user. This onSave prop is going to receive the customer object from the server after a successful save.

To write tests for this new onSave prop, we’ll need to provide a stub value for global.fetch, which essentially says, “This is the return value of calling the POST /customers endpoint with global.fetch.”

WHAT IS A STUB?

A stub is a test double that always returns the same value when it is invoked. You decide what this value is when you construct the stub.

In this section, we’ll upgrade our hand-crafted spy function so that it can also stub function return values. Then, we’ll use it to test the addition of the new onSave prop to CustomerForm. Finally, we’ll use it to display an error to the user if, for some reason, the server failed to save the new customer object.

Upgrading spies to stubs
A stub is different from a spy because it’s not interested in tracking the call history of the function being stubbed—it just cares about returning a single value.

However, it turns out that our existing tests that use spies will also need to stub values. That’s because as soon as we use the returned value in our production code, the spy must return something; otherwise, the test will break. So, all spies end up being stubs, too.

Since we already have a spy function, we can “upgrade” it so that it has the ability to stub values too. Here’s how we can do this:

In test/CustomerForm.test.js, change the spy function to include the following new variable declaration at the top. This variable will store the value, ready to be returned by our function:
let returnValue;

Change the fn definition to the one shown here:
fn: (...args) => {

  receivedArguments = args;

  return returnValue;

},

Add this new function to your spy object, which sets the returnValue variable:
stubReturnValue: value => returnValue = value

It’s as simple as that: your function is now both a spy and a stub. Let’s make use of it in our tests.

Acting on the fetch response
So far, the handleSubmit function causes a fetch request to be made, but it doesn’t do anything with the response. In particular, it doesn’t wait for a response; the fetch API is asynchronous and returns a promise. Once that promise resolves, we can do something with the data that’s returned.

The next tests we’ll write will specify what our component should do with the resolved data.

The asynchronous form of act
When we’re dealing with promises in React callbacks, we need to use the asynchronous form of act. It looks like this:


await act(async () => performAsyncAction());
The performAsyncAction function doesn’t necessarily need to return a promise; act will wait for the browser’s async task queue to complete before it returns.

The action may be a button click, form submission, or any kind of input field event. It could also be a component render that has a useEffect hook that performs some asynchronous side effects, such as loading data.

Adding async tasks to an existing component
Now, we’ll use the asynchronous form of act to test that the fetch promise is awaited. Unfortunately, introducing async/await into our handleSubmit function will then require us to update all our submission tests to use the asynchronous form of act.

As usual, we start with the test. Proceed as follows:

Define a test helper function in test/CustomerForm.test.js that builds you a type of Response object to mimic what would be returned from the fetch API. That means it returns a Promise object with an ok property with a value of true, and a json function that returns another Promise that, when resolved, returns the JSON we pass in. You can define this just under your spy function, like so:
const fetchResponseOk = (body) =>

  Promise.resolve({

    ok: true,

    json: () => Promise.resolve(body)

  });

FETCH RETURN VALUES

The ok property returns true if the HTTP response status code was in the 2xx range. Any other kind of response, such as 404 or 500, will cause ok to be false.

Add the following code to test/reactTestExtensions.js, just below the definition of click:
export const clickAndWait = async (element) =>

  act(async () => click(element));

Now, import the new helper function into test/CustomerForm.test.js, as follows:
import {

  ...,

  clickAndWait,

} from "./reactTestExtensions";

Add the next test to the CustomerForm test suite, which checks that the onSave prop function is called when the user submits the form, and passes back the customer object. The best place for this test is under the calls fetch with correct configuration test. The code is illustrated in the following snippet:
it("notifies onSave when form is submitted", async () => {

  const customer = { id: 123 };

  fetchSpy.stubReturnValue(fetchResponseOk(customer));

  const saveSpy = spy();

  render(

    <CustomerForm

      original={customer}

      onSave={saveSpy.fn}

    />

  );

  await clickAndWait(submitButton());

  expect(saveSpy).toBeCalledWith(customer);

});

To make this pass, start by defining a new onSave prop for CustomerForm, in src/CustomerForm.js, as follows:
export const CustomerForm = ({

  original, onSave

}) => {

  ...

};

Add the following code at the end of handleSubmit. The function is now declared async and uses await to unwrap the promise returned from global.fetch:
const handleSubmit = async (event) => {

  event.preventDefault();

  const result = await global.fetch(...);

  const customerWithId = await result.json();

  onSave(customerWithId);

};

If you run tests, you’ll notice that although your latest test passes, your previous test fails and there’s a whole bunch of unhandled promise exceptions. In fact, anything that submits the form will fail, because they use the fetchSpy variable that’s initialized in the beforeEach block, and this is not a stub—it’s just a plain old spy. Fix that now by giving the spy a return value, within beforeEach. In this case, we don’t need to give it a customer; an empty object will do, as illustrated in the following code snippet:
beforeEach(() => {

  ...

  fetchSpy.stubReturnValue(fetchResponseOk({}));

});

DUMMY VALUES IN BEFOREEACH BLOCKS

When stubbing out global functions such as global.fetch, always set a default dummy value within your beforeEach block and then override it in individual tests that need specific stubbed values.

Run tests again. You might see some odd behavior at this point; I see my recent test supposedly run six times with failures! What’s happening is that our previous tests are now firing off a whole bunch of promises that continue running even when the tests end. Those asynchronous tasks cause Jest to incorrectly report failures. To solve this, we need to update all our tests to use await clickAndWait. In addition, the tests need to be marked as async. Do this now for every test that calls click. An example is shown here:
it("sends HTTP request to POST /customers when submitting data", async () => {

  render(<CustomerForm original={blankCustomer} />);

  await clickAndWait(submitButton());

  ...

});

Delete the click import, leaving clickAndWait.
There’s one more test that has this issue, and that’s the test that submits the form: prevents the default action when submitting the form. This test calls our submit helper function. We need to wrap that in act, too. Let’s create a submitAndWait helper function in our test extensions file. Add the following function just below submit to test/reactTestExtensions.js:
export const submitAndWait = async (formElement) =>

  act(async () => submit(formElement));

Add submitAndWait into your import statements, just below clickAndWait, as follows:
import {

  ...,

  submitAndWait,

} from "./reactTestExtensions";

Now, you can update the test to use the new helper function, like so:
it("prevents the default action when submitting the form", async () => {

  render(<CustomerForm original={blankCustomer} />);

  const event = await submitAndWait(form());

  expect(event.defaultPrevented).toBe(true);

});

If you run tests again, we still have test failures (although thankfully, things look more orderly with the async tasks being properly accounted for). You’ll see that you now have a bunch of failures that say onSave is not a function. To fix that, we need to ensure we specify the onSave prop for every test that submits the form. A blank, no-op function will do. An example is shown here. Go ahead and add this prop to every test that submits the form. After this change, your tests should be passing without any warnings:
it("calls fetch with correct configuration", async () => {

  render(

    <CustomerForm

      original={blankCustomer}

      onSave={() => {}}

    />

  );

  ...

});

INTRODUCING TESTPROPS OBJECTS WHEN REQUIRED PROPS ARE ADDED

The introduction of this onSave no-op function creates noise, which doesn’t help with the readability of our test. This would be a perfect opportunity to introduce a testProps object, as covered in Chapter 5, Adding Complex Form Interactions.

Add another test to ensure that we do not call onSave when the fetch response has an error status (in other words, when the ok property is set to false). Start by defining another helper, fetchResponseError, right under fetchResponseOk, as illustrated in the following code snippet. This one doesn’t need a body as we aren’t interested in it just yet:
const fetchResponseError = () =>

  Promise.resolve({ ok: false });

Use the new function in the next CustomerForm test, as follows:
it("does not notify onSave if the POST request returns an error", async () => {

  fetchSpy.stubReturnValue(fetchResponseError());

  const saveSpy = spy();

  render(

    <CustomerForm

      original={blankCustomer}

      onSave={saveSpy.fn}

    />

  );

  await clickAndWait(submitButton());

  expect(saveSpy).not.toBeCalledWith();

});

NEGATING TOBECALLEDWITH

This expectation is not what we really want: this one would pass if we still called onSave but passed the wrong arguments—for example, if we wrote onSave(null). What we really want is .not.toBeCalled(), which will fail if onSave is called in any form. But we haven’t built that matcher. Later in the chapter, we’ll fix this expectation by moving to Jest’s built-in spy function.

To make this pass, move the onSave call into a new conditional in handleSubmit, as follows:
const handleSubmit = async (event) => {

  ...

  const result = ...;

  if (result.ok) {

    const customerWithId = await result.json();

    onSave(customerWithId);

  }

};

As you’ve seen, moving a component from synchronous to asynchronous behavior can really disrupt our test suites. The steps just outlined are fairly typical of the work needed when this happens.

ASYNC COMPONENT ACTIONS CAN CAUSE MISREPORTED JEST TEST FAILURES

If you’re ever surprised to see a test fail and you’re at a loss to explain why it’s failing, double-check all the tests in the test suite to ensure that you’ve used the async form of act when it’s needed. Jest won’t warn you when a test finishes with async tasks still to run, and since your tests are using a shared DOM document, those async tasks will affect the results of subsequent tests.

Those are the basics of dealing with async behavior in tests. Now, let’s add a little detail to our implementation.

Displaying errors to the user
Let’s display an error to the user if the fetch returns an ok value of false. This would occur if the HTTP status code returned was in the 4xx or 5xx range, although for our tests we won’t need to worry about the specific status code. Follow these steps:

Add the following test to test/CustomerForm.test.js. This checks that an area is shown on the page for errors. It relies on the ARIA role of alert, which is a special signifier for screen readers that this area could change to hold important information:
it("renders an alert space", async () => {

  render(<CustomerForm original={blankCustomer} />);

  expect(element("[role=alert]")).not.toBeNull();

});

To make that pass, first, define a new Error component, as follows. This can live in src/CustomerForm.js, just above the CustomerForm component itself:
const Error = () => (

  <p role="alert" />

);

Then, add an instance of that component into the CustomerForm’s JSX, just at the top of the form element, as follows:
<form>

  <Error />

  ...

</form>

Back in test/CustomerForm.test.js, add the next test, which checks the error message in the alert, as follows:
it("renders error message when fetch call fails", async () => {

  fetchSpy.mockReturnValue(fetchResponseError());

  render(<CustomerForm original={blankCustomer} />);

  await clickAndWait(submitButton());

  expect(element("[role=alert]")).toContainText(

    "error occurred"

  );

});

To make that pass, all we need to do is hardcode the string in the Error component. We’ll use another test to triangulate to get to the real implementation, as follows:
const Error = () => (

  <p role="alert">

    An error occurred during save.

  </p>

);

Add the final test to test/CustomerForm.test.js, like so:
it("initially hano text in the alert space", async () => {

  render(<CustomerForm original={blankCustomer} />);

  expect(element("[role=alert]")).not.toContainText(

    "error occurred"

  );

});

To make this pass, introduce a new error state variable at the top of the CustomerForm definition, like so:
const [error, setError] = useState(false);

Change the handleSubmit function, as follows:
const handleSubmit = async (event) => {

  ...

  if (result.ok) {

    ...

  } else {

    setError(true);

  }

}

In the component’s JSX, update the Error instance to include a new hasError prop and set it to the error state, like so:
<form>

  <Error hasError={error} />

  ...

</form>

All that remains is to complete the Error component with the new prop, as follows:
const Error = ({ hasError }) => (

  <p role="alert">

    {hasError ? "An error occurred during save." : ""}

  </p>

);

That’s it for our CustomerForm implementation. Time for a little cleanup of our tests.

Grouping stub scenarios in nested describe contexts
A common practice is to use nested describe blocks to set up stub values as scenarios for a group of tests. We have just written four tests that deal with the scenario of the POST /customers endpoint returning an error. Two of these are good candidates for a nested describe context.

We can then pull up the stub value into a beforeEach block. Let’s start with the describe block. Follow these steps:

Look at the last four tests you’ve written. Two of them are about the alert space and are not related to the error case. Leave those two in place, and move the other two into a new describe block named when POST requests return an error, as shown here:
it("renders an alert space", ...)

it("initially has no text in the alert space", ...)

describe("when POST request returns an error", () => {

  it("does not notify onSave if the POST request returns an error", ...)

  it("renders error message when fetch call fails", ...)

});

Notice how the two of the test descriptions repeat themselves, saying the same thing as the describe block but in slightly different ways? Remove the if/when statements from the two test descriptions, as follows:
describe("when POST request returns an error", () => {

  it("does not notify onSave", ...)

  it("renders error message ", ...)

});

The two tests have identical global.fetch stubs. Pull that stub up into a new beforeEach block, as shown here:
describe("when POST request returns an error", () => {

  beforeEach(() => {

    fetchSpy.stubReturnValue(fetchResponseError());

  });

  ...

})

Finally, delete the stub call from the two tests, leaving just the stub call in the beforeEach block.
You’ve now seen how to use nested describe blocks to describe specific test scenarios, and that covers all the basic stubbing techniques. In the next section, we’ll continue our cleanup by introducing Jest’s own spy and stub functions, which are slightly simpler than the ones we’ve built ourselves.

Migrating to Jest’s built-in test double support
So far in this chapter, you’ve built your own hand-crafted spy function, with support for stubbing values and with its own matcher. The purpose of that has been to teach you how test doubles work and to show the essential set of spy and stub patterns that you’ll use in your component tests.

However, our spy function and the toBeCalledWith matcher are far from complete. Rather than investing any more time in our hand-crafted versions, it makes sense to switch to Jest’s own functions now. These work in essentially the same way as our spy function but have a couple of subtle differences.

This section starts with a rundown of Jest’s test double functionality. Then, we’ll migrate the CustomerForm test suite away from our hand-crafted spy function. Finally, we’ll do a little more cleanup by extracting more test helpers.

Using Jest to spy and stub
Here’s a rundown of Jest test double support:

To create a new spy function, call jest.fn(). For example, you might write const fetchSpy = jest.fn().
To override an existing property, call jest.spyOn(object, property). For example, you might write jest.spyOn(global, "fetch").
To set a return value, call spy.mockReturnValue(). You can also pass this value directly to the jest.fn() call.
You can set multiple return values by chaining calls to spy.mockReturnValueOnce().
When your function returns promises, you can use spy.mockResolvedValue() and spy.mockRejectedValue().
To check that your spy was called, use expect(spy).toBeCalled().
To check the arguments passed to your spy, you can use expect(spy).toBeCalledWith(arguments). Or, if your spy is called multiple times and you want to check the last time it was called, you can use expect(spy).toHaveLastBeenCalledWith(arguments).
Calling spy.mockReset() removes all mocked implementations, return values, and existing call history from a spy.
Calling spy.mockRestore() will remove the mock and give you back the original implementation.
In Jest’s configuration section of your package.json file, you can set restoreMocks to true and all spies that were created with jest.spyOn will be automatically restored after each test.
When using toBeCalledWith, you can pass an argument value of expect.anything() to say that you don’t care what the value of that argument is.
You can use expect.objectMatching(object) to check that an argument has all the properties of the object you pass in, rather than being exactly equal to the object.
When your spy is called multiple times, you can check the parameters passed to specific calls by using spy.mock.calls[n], where n is the call number (for example, calls[0] will return the arguments for the first time it was called).
If you need to perform complex matching on a specific argument, you can use spy.mock.calls[0][n], where n is in the argument number.
You can stub out and spy on entire modules using the jest.mock() function, which we’ll look at in the next chapter.
There’s a lot more available with the Jest API, but these are the core features and should cover most of your test-driven use cases.

Migrating the test suite to use Jest’s test double support
Let’s convert our CustomerForm tests away from our hand-crafted spy function. We’ll start with the fetchSpy variable.

We’ll use jest.spyOn for this. It essentially creates a spy with jest.fn() and then assigns it to the global.fetch variable. The jest.spyOn function keeps track of every object that has been spied on so that it can auto-restore them without our intervention, using the restoreMock configuration property.

It also has a feature that blocks us from spying on any property that isn’t already a function. That will affect us because Node.js doesn’t have a default implementation of global.fetch. We’ll see how to solve that issue in the next set of steps.

It’s worth pointing out a really great feature of jest.fn(). The returned spy object acts as both the function itself and the mock object. It does this by attaching a special mock property to the returned function. The upshot of this is that we no longer need a fetchSpy variable to store our spy object. We can just refer to global.fetch directly, as we’re about to see.

Follow these steps:

Update the beforeEach block to read as follows. This uses mockResolvedValue to set a return value wrapped in a promise (as opposed to mockReturnedValue, which just returns a value with no promise involved):
beforeEach(() => {

  initializeReactContainer();

  jest

    .spyOn(global, "fetch")

    .mockResolvedValue(fetchResponseOk({}));

});

There are two lines in the CustomerForm test suite that follow the pattern shown here:
fetchSpy.stubResolvedValue(...);

Go ahead and replace them with the following code:

global.fetch.mockResolvedValue(...);

There are two expectations that check fetchSpy. Go ahead and replace expect(fetchSpy) with expect(global.fetch). Removing the fetchSpy variable gives you greater readability and understanding of what’s happening. Here’s one of the expectations:
expect(global.fetch).toBeCalledWith(

  "/customers",

  expect.objectContaining({

    method: "POST",

  })

);

The bodyOflastFetchRequest function needs to be updated to use the mock property of the Jest spy object. Update it to read as follows:
const bodyOfLastFetchRequest = () => {

  const allCalls = global.fetch.mock.calls;

  const lastCall = allCalls[allCalls.length - 1];

  return JSON.parse(lastCall[1].body);

};

Open package.json and add the restoreMocks property, which ensures the global.fetch spy is reset to its original setting after each test. The code is illustrated in the following snippet:
"jest": {

  ...,

  "restoreMocks": true

}

That should be it for your global.fetch spy. You can delete the afterEach block, the fetchSpy variable declaration, and the originalFetch constant definition.
Let’s move on to saveSpy. Back in your CustomerForm test suite, find the notifies onSave when form it submitted test. Update it as shown in the following code snippet. We’re replacing the use of spy() with jest.fn(). Notice how we no longer need to set the onSave prop to saveSpy.fn but just saveSpy itself:
it("notifies onSave when form is submitted", async () => {

  const customer = { id: 123 };

  global.fetch.mockResolvedValue(

    fetchResponseOk(customer)

  );

  const saveSpy = jest.fn();

  render(

    <CustomerForm

      original={blankCustomer}

      onSave={saveSpy}

    />

  );

  await clickAndWait(submitButton());

  expect(saveSpy).toBeCalledWith(customer);

});

Repeat for the does not notify onSave if the POST request returns an error test.
Delete your spy function definition at the top of the test suite.
Delete your toBeCalledWith matcher in test/domMatchers.js.
We’re now close to a working test suite. Try running your tests—you’ll see the following error:
Cannot spy the fetch property because it is not a function; undefined given instead

To fix this, we need to let Jest think that global.fetch is indeed a function. The simplest way to do this is to set a dummy implementation when your test suite launches. Create a test/globals.js file and add the following definition to it:
global.fetch = () => Promise.resolve({});

Now, back in package.json, add that file to the setupFilesAfterEnv property, like so:
"setupFilesAfterEnv": [

  "./test/domMatchers.js",

  "./test/globals.js"

],

Run all tests with npm test. They should be passing.
There’s just one final cleanup to do. Find the following expectation:
expect(saveSpy).not.toBeCalledWith();

As mentioned earlier in the chapter, this expectation is not correct, and we only used it because our hand-rolled matcher didn’t fully support this use case. What we want is for the expectation to fail if onSave is called in any form. Now that we’re using Jest’s own matchers, we can solve this more elegantly. Replace this expectation with the following code:

expect(saveSpy).not.toBeCalled();

Your CustomerForm test suite is now fully migrated. We’ll end this chapter by extracting some more helpers.

Extracting fetch test functionality
CustomerForm is not the only component that will call fetch: one of the exercises is to update AppointmentForm to also submit appointments to the server. It makes sense to reuse the common code we’ve used by pulling it out into its own module. Proceed as follows:

Create a file named test/spyHelpers.js and add the following function definition, which is the same as the function in your test suite, except this time it’s marked as an export:
export const bodyOfLastFetchRequest = () => {

  const allCalls = global.fetch.mock.calls;

  const lastCall = allCalls[allCalls.length - 1];

  return JSON.parse(lastCall[1].body);

};

Create a file named test/builders/fetch.js and add the following two functions to it:
export const fetchResponseOk = (body) =>

  Promise.resolve({

    ok: true,

    json: () => Promise.resolve(body),

  });

export const fetchResponseError = () =>

  Promise.resolve({ ok: false });

Delete those definitions from within test/CustomerForm.test.js and replace them with an import statement, as illustrated in the following code snippet. After this change, run your tests and check they are still passing:
import { bodyOfLastFetchRequest } from "./spyHelpers";

import {

  fetchResponseOk,

  fetchResponseError,

} from "./builders/fetch";

Finally, we can simplify fetchResponseOk and fetchResponseError by removing the call to Promise.resolve shown here. That’s because Jest’s mockResolvedValue function will automatically wrap the value in a promise:
export const fetchResponseOk = (body) => ({

  ok: true,

  json: () => Promise.resolve(body),

});

export const fetchResponseError = () => ({

  ok: false,

});

Ensure you’ve run all tests and you’re on green before continuing.
You’re now ready to reuse these functions in the AppointmentForm test suite.

Summary
We’ve just explored test doubles and how they are used to verify interactions with collaborating objects, such as component props (onSave) and browser API functions (global.fetch). We looked in detail at spies and stubs, the two main types of doubles you’ll use. You also saw how to use a side-by-side implementation as a technique to keep your test failures under control while you switch from one implementation to another.

Although this chapter covered the primary patterns you’ll use when dealing with test doubles, we have one major one still to cover, and that’s how to spy on and stub out React components. That’s what we’ll look at in the next chapter.

Exercises
Try the following exercises:

Add a test to the CustomerForm test suite to specify that the error state is cleared when the form is submitted a second time with all validation errors corrected.
Update the AppointmentForm test suite to use jest.fn() and jest.spyOn().
Extend AppointmentForm so that it submits an appointment using a POST request to /appointments. The /appointments endpoint returns a 201 Created response without a body, so you don’t need to call json on the response object or send back any parameters to onSave.
Further reading
For more information, refer to the following sources:

A cheat sheet showing all the Jest mocking constructs you’ll need for testing React code bases
https://reacttdd.com/mocking-cheatsheet

A good introduction to the different kinds of test doubles
https://martinfowler.com/articles/mocksArentStubs.html

An introduction to using the Fetch API
https://github.github.io/fetch

Information on the ARIA alert role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role
