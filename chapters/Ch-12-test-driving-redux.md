# Part 2 - Building Application Features

# Chapter 12: Test-Driving Redux

12
Test-Driving Redux
Redux is a predictable state container. To the uninitiated, these words mean very little. Thankfully, TDD can help us understand how to think about and implement our Redux application architecture. The tests in the chapter will help you see how Redux can be integrated into any application.

The headline benefit of Redux is the ability to share state between components in a way that provides data consistency when operating in an asynchronous browser environment. The big drawback is that you must introduce a whole bunch of plumbing and complexity into your application.

HERE BE DRAGONS

For many applications, the complexity of Redux outweighs the benefits. Just because this chapter exists in this book does not mean you should be rushing out to use Redux. In fact, I hope that the code samples contained herein serve as warning enough for the complexity you will be introducing.

In this chapter, we’ll build a reducer and a saga to manage the submission of our CustomerForm component.

We’ll use a testing library named expect-redux to test Redux interactions. This library allows us to write tests that are not tied to the redux-saga library. Being independent of libraries is a great way of ensuring that your tests are not brittle and are resilient to change: you could replace redux-saga with redux-thunk and your tests would still work.

This chapter covers the following topics:

Up-front design for a reducer and a saga
Test-driving a reducer
Test-driving a saga
Switching component state for Redux state
By the end of the chapter, you’ll have seen all the techniques you need for testing Redux.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter12

Up-front design for a reducer and a saga
In this section, we’ll do the usual thing of mapping out a rough plan of what we’re going to build.

Let’s start by looking at what the actual technical change is going to be and discuss why we’re going to do it.

We’re going to move the logic for submitting a customer—the doSave function in CustomerForm—out of the React component and into Redux. We’ll use a Redux reducer to manage the status of the operation: whether it’s currently submitting, finished, or had a validation error. We’ll use a Redux saga to perform the asynchronous operation.

Why Redux?
Given the current feature set of the application, there’s really no reason to use Redux. However, imagine that in the future, we’d like to support these features:

After adding a new customer, the AppointmentForm component shows the customer information just before submitting it, without having to re-fetch the data from the server
After finding a customer from the CustomerSearch component and choosing to create an appointment, the same customer information is shown on the appointment screen, without having to re-fetch the data
In this future scenario, it might make sense to have some shared Redux state for the customer data.

I say “might” because there are other, potentially simpler solutions: component context, or perhaps some kind of HTTP response caching. Who knows what the solution would look like? It’s too hard to say without a concrete requirement.

To sum up: in this chapter, we’ll use Redux to store customer data. It has no real benefit over our current approach, and in fact, has the drawback of all the additional plumbing. However, let’s press on, given that the purpose of this book is educational.

Designing the store state and actions
A Redux store is simply an object of data with some restrictions on how it is accessed. Here’s how we want ours to look. The object encodes all the information that CustomerForm already uses about a fetch request to save customer data:


{
  customer: {
    status: SUBMITTING | SUCCESSFUL | FAILED | ...
    // only present if the customer was saved successfully
    customer: { id: 123, firstName: "Ashley" ... },
    // only present if there are validation errors
    validationErrors: { phoneNumber: "..." },
    // only present if there was another type of error
    error: true | false
  }
}
Redux changes this state by means of named actions. We will have the following actions:

ADD_CUSTOMER_REQUEST, called when the user presses the button to submit a customer. This triggers the saga, which then fires off the remaining actions
ADD_CUSTOMER_SUBMITTING, when the saga begins its work
ADD_CUSTOMER_SUCCESSFUL, when the server saves the customer and returns a new customer ID. With this action, we’ll also save the new customer information in the reducer, ready for later use
ADD_CUSTOMER_VALIDATION_FAILED, if the provided customer data is invalid
ADD_CUSTOMER_FAILED, if there is some other reason the server fails to save data
For reference, here’s the existing code that we’ll be extracting from CustomerForm. It’s all helpfully in one function, doSave, even though it is quite long:


const doSave = async () => {
  setSubmitting(true);
  const result = await global.fetch("/customers", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  setSubmitting(false);
  if (result.ok) {
    setError(false);
    const customerWithId = await result.json();
    onSave(customerWithId);
  } else if (result.status === 422) {
    const response = await result.json();
    setValidationErrors(response.errors);
  } else {
    setError(true);
  }
};
We’ll replace all this code with a combination of a saga and reducer. We’ll start with the reducer, in the next section.

Test-driving a reducer
In this section, we’ll test-drive a new reducer function, and then pull out some repeated code.

A reducer is a simple function that takes an action and the current store state as input and returns a new state object as output. Let’s build that now, as follows:

Create a new file (in a new directory) named test/reducers/customer.test.js. Add the following first test, which checks that if the reducer is invoked with an unknown action, our reducer should return a default state for our object. This is standard behavior for Redux reducers, so you should always start with a test like this:
import { reducer } from "../../src/reducers/customer";

describe("customer reducer", () => {

  it("returns a default state for an undefined existing state", () => {

    expect(reducer(undefined, {})).toEqual({

      customer: {},

      status: undefined,

      validationErrors: {},

      error: false

    });

  });

});

Create a src/reducers/customer.js file, as follows, and let’s make that test pass:
const defaultState = {

  customer: {},

  status: undefined,

  validationErrors: {},

  error: false

};

export const reducer = (state = defaultState, action) => {

  return state;

};

For the next test, add in support for the ADD_CUSTOMER_SUBMITTING action, as follows. This test checks that when this action is received, the status value is updated to SUBMITTING:
describe("ADD_CUSTOMER_SUBMITTING action", () => {

  const action = { type: "ADD_CUSTOMER_SUBMITTING" };

  it("sets status to SUBMITTING", () => {

    expect(reducer(undefined, action)).toMatchObject({

      status: "SUBMITTING"

    });

  });

});

Make that pass by replacing the body of the reducer with the following code. We can jump directly to using a switch statement here (rather than using an if statement) because we know for certain that we’ll be filling out other action types:
switch(action.type) {

  case "ADD_CUSTOMER_SUBMITTING":

    return { status: "SUBMITTING" };

  default:

    return state;

}

Add a second test to the ADD_CUSTOMER_SUBMITTING describe block, as follows. This test specifies behavior that’s expected for reducer actions: any state that we don’t care about (which is status in this case) is maintained:
it("maintains existing state", () => {

  expect(reducer({ a: 123 }, action)).toMatchObject({

    a: 123

  });

});

Make that pass by modifying the reducers, as follows:
export const reducer = (state = defaultState, action) => {

  switch (action.type) {

    case "ADD_CUSTOMER_SUBMITTING":

      return { ...state, status: "SUBMITTING" };

    default:

      return state;

  }

};

We need to handle the ADD_CUSTOMER_SUCCESSFUL action. Start with the two tests shown next. I’m cheating by writing two tests at once, but that’s fine because I know they are a close replica of the ADD_CUSTOMER_SUBMITTING tests:
describe("ADD_CUSTOMER_SUCCESSFUL action", () => {

  const customer = { id: 123 };

  const action = {

    type: "ADD_CUSTOMER_SUCCESSFUL",

    customer

  };

  it("sets status to SUCCESSFUL", () => {

    expect(reducer(undefined, action)).toMatchObject({

      status: "SUCCESSFUL"

    });

  });

  it("maintains existing state", () => {

    expect(

      reducer({ a: 123 }, action)

    ).toMatchObject({ a: 123 });

  });

});

To make that pass, add a final case statement to your reducer, like so:
case "ADD_CUSTOMER_SUCCESSFUL":

  return { ...state, status: "SUCCESSFUL" };

Add a third test, shown next. The action provides a new customer object with its assigned ID, which we should save in the reducer for later use:
it("sets customer to provided customer", () => {

  expect(reducer(undefined, action)).toMatchObject({

    customer

  });

});

Make that pass by adding in the customer property, as follows:
case "ADD_CUSTOMER_SUCCESSFUL":

  return {

    ...state,

    status: "SUCCESSFUL",

    customer: action.customer

  };

Add the next describe block, for ADD_CUSTOMER_FAILED, as follows:
describe("ADD_CUSTOMER_FAILED action", () => {

  const action = { type: "ADD_CUSTOMER_FAILED" };

  it("sets status to FAILED", () => {

    expect(reducer(undefined, action)).toMatchObject({

      status: "FAILED"

    });

  });

  it("maintains existing state", () => {

    expect(

      reducer({ a: 123 }, action)

    ).toMatchObject({ a: 123 });

  });

});

Make those both pass by adding a new case statement to the switch reducer, like so:
case "ADD_CUSTOMER_FAILED":

  return { ...state, status: "FAILED" };

We aren’t quite done with ADD_CUSTOMER_FAILED. In this case, we also want to set error to true. Recall that we used an error state variable in the CustomerForm component to mark when an unexplained error had occurred. We need to replicate that here. Add this third test to the describe block, as follows:
it("sets error to true", () => {

  expect(reducer(undefined, action)).toMatchObject({

    error: true

  });

});

Make that pass by modifying the case statement, as shown here:
case "ADD_CUSTOMER_FAILED":

  return { ...state, status: "FAILED", error: true };

Add tests for the ADD_CUSTOMER_VALIDATION_FAILED action, which occurs if field validation failed. The code is illustrated here:
describe("ADD_CUSTOMER_VALIDATION_FAILED action", () => {

  const validationErrors = { field: "error text" };

  const action = {

    type: "ADD_CUSTOMER_VALIDATION_FAILED",

    validationErrors

  };

  it("sets status to VALIDATION_FAILED", () => {

    expect(reducer(undefined, action)).toMatchObject({

      status: "VALIDATION_FAILED"

    });

  });

  it("maintains existing state", () => {

    expect(

      reducer({ a: 123 }, action)

    ).toMatchObject({ a: 123 });

  });

});

Make these tests pass with another case statement in the reducer, as follows:
case "ADD_CUSTOMER_VALIDATION_FAILED":

  return { ...state, status: "VALIDATION_FAILED" };

This action also needs a third test. This time, the action can include error information on what the validation errors were, as shown in the following code snippet:
it("sets validation errors to provided errors", () => {

  expect(reducer(undefined, action)).toMatchObject({

    validationErrors

  });

});

Make that pass with the change shown here:
case "ADD_CUSTOMER_VALIDATION_FAILED":

  return {

    ...state,

    status: "VALIDATION_FAILED",

    validationErrors: action.validationErrors

  };

That completes the reducer, but before we use it from within a saga, how about we dry these tests up a little?

Pulling out generator functions for reducer actions
Most reducers will follow the same pattern: each action will set some new data to ensure that the existing state is not lost.

Let’s write a couple of test-generator functions to do that for us, to help us dry up our tests. Proceed as follows:

Create a new file, test/reducerGenerators.js, and add the following function to it:
export const itMaintainsExistingState = (reducer, action) => {

  it("maintains existing state", () => {

    const existing = { a: 123 };

    expect(

      reducer(existing, action)

    ).toMatchObject(existing);

  });

};

Add the following import statement to the top of src/reducers/customer.test.js:
import {

  itMaintainsExistingState

} from "../reducerGenerators";

Modify your tests to use this function, deleting the test in each describe block and replacing it with the following single line:
itMaintainsExistingState(reducer, action);

Back in test/reducerGenerators.js, define the following function:
export const itSetsStatus = (reducer, action, value) => {

  it(`sets status to ${value}`, () => {

    expect(reducer(undefined, action)).toMatchObject({

      status: value

    });

  });

};

Modify the existing import statement to pull in the new function, like so:
import {

  itMaintainsExistingState,

  itSetsStatus

} from "../reducerGenerators";

Modify your tests to use this function, just as you did before. Make sure you run your tests to prove they work! Your tests should now be much shorter. Here’s an example of the describe block for ADD_CUSTOMER_SUCCESSFUL:
describe("ADD_CUSTOMER_SUBMITTING action", () => {

  const action = { type: "ADD_CUSTOMER_SUBMITTING" };

  itMaintainsExistingState(reducer, action);

  itSetsStatus(reducer, action, "SUBMITTING");

});

That concludes the reducer. Before we move on to the saga, let’s tie it into the application. We won’t make use of it at all, but it’s good to get the plumbing in now.

Setting up a store and an entry point
In addition to the reducer we’ve written, we need to define a function named configureStore that we’ll then call when our application starts. Proceed as follows:

Create a new file named src/store.js with the following content. There’s no need to test this just yet, as it’s a bit like src/index.js: plumbing that connects everything together. However, we will utilize it in the next section when we test the saga:
import { createStore, combineReducers } from "redux";

import {

reducer as customerReducer

} from "./reducers/customer";

export const configureStore = (storeEnhancers = []) =>

  createStore(

    combineReducers({ customer: customerReducer }),

    storeEnhancers

  );

In src/index.js, add the following two import statements to the top of the file:
import { Provider } from "react-redux";

import { configureStore } from "./store";

Then, wrap the existing JSX in a Provider component, as shown here. This is how all our components will gain access to the Redux store:
ReactDOM.createRoot(

  document.getElementById("root")

).render(

  <Provider store={configureStore()}>

    <BrowserRouter>

      <App />

    </BrowserRouter>

  </Provider>

);

With that in place, we’re ready to write the tricky part: the saga.

Test-driving a saga
A saga is a special bit of code that uses JavaScript generator functions to manage asynchronous operations to the Redux store. Because it’s super complex, we won’t actually test the saga itself; instead, we’ll dispatch an action to the store and observe the results.

Before we get started on the saga tests, we need a new test helper function named renderWithStore.

Adding the renderWithStore test extension
Proceed as follows:

At the top of test/reactTestExtensions.js, add the following new import statements:
import { Provider } from "react-redux";

import { storeSpy } from "expect-redux";

import { configureStore } from "../src/store";

THE EXPECT-REDUX PACKAGE

For that, we’ll use the expect-redux package from NPM, which has already been included in the package.json file for you—make sure to run npm install before you begin.

Add a new variable, store, and initialize it in initializeReactContainer, as illustrated in the following code snippet. This makes use of storeSpy from expect-redux, which we’ll use in our tests to check calls to the store:
export let store;

export const initializeReactContainer = () => {

  store = configureStore([storeSpy]);

  container = document.createElement("div");

  document.body.replaceChildren(container);

  reactRoot = ReactDOM.createRoot(container);

};

Add your new render function below the renderWithRouter function, as illustrated in the following code snippet:
export const renderWithStore = (component) =>

  act(() =>

    reactRoot.render(

      <Provider store={store}>{component}</Provider>

    )

  );

Finally, add dispatchStore, which we’ll need when we start dispatching actions in our component, as follows:
export const dispatchToStore = (action) =>

  act(() => store.dispatch(action));

You’ve now got all the helpers you need to begin testing both sagas and components that are connected to a Redux store. With all that in place, let’s get started on the saga tests.

Using expect-redux to write expectations
The saga we’re writing will respond to an ADD_CUSTOMER_REQUEST action that’s dispatched from the CustomerForm component when the user submits the form. The functionality of the saga is just the same as the doSave function listed in the Designing the store state and actions section at the beginning of this chapter. The difference is we’ll need to use the saga’s function calls of put, call, and so forth.

Let’s begin by writing a generator function named addCustomer. Proceed as follows:

Create a new file (in a new directory) named test/sagas/customer.test.js and add the following code to set up our describe block. We initialize a store variable that both our sagas and our test expectations will make use of. This is a repeat of the code we had previously in our initializeReactContainer test helper—which we can’t use here because we’re not writing a component:
import { storeSpy, expectRedux } from "expect-redux";

import { configureStore } from "../../src/store";

describe("addCustomer", () => {

  let store;

  beforeEach(() => {

    store = configureStore([ storeSpy ]);

  });

});

Just below the beforeEach block, add the following helper function, which gives us a slightly more elegant way of constructing the action—you’ll see that in the first test, coming up next:
const addCustomerRequest = (customer) => ({

  type: "ADD_CUSTOMER_REQUEST",

  customer,

});

Now for the first test. What is the first thing our saga should do? It must update our store state to reflect that the form is submitting. That way, the CustomerForm component can immediately show a submitting indicator to the user. We use an expectation from expect-redux to ensure that we dispatch the right action, as shown here:
it("sets current status to submitting", () => {

  store.dispatch(addCustomerRequest());

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({ type: "ADD_CUSTOMER_SUBMITTING" });

});

RETURNING PROMISES FROM TESTS

This test returns a promise. This is a shortcut we can use instead of marking our test function as async and the expectation with await. Jest knows to wait if the test function returns a promise.

Let’s start with the saga implementation. Create a new file named src/sagas/customer.js with the following content. Notice the function* syntax, which signifies a generator function, and the use of put to fire off another action to the store:
import { put } from "redux-saga/effects";

export function* addCustomer() {

  yield put({ type: "ADD_CUSTOMER_SUBMITTING" });

}

GENERATOR-FUNCTION SYNTAX

The arrow-function syntax that we’ve been using throughout the book does not work for generator functions, so we need to fall back to using the function keyword.

Before that test will pass, we need to update the store with a root saga. That root saga then registers our addCustomer saga. Starting with the imports statements, update src/store.js to read as follows:
import {

  createStore,

  applyMiddleware,

  compose,

  combineReducers

} from "redux";

import createSagaMiddleware from "redux-saga";

import { takeLatest } from "redux-saga/effects";

import { addCustomer } from "./sagas/customer";

import {

  reducer as customerReducer

} from "./sagas/customer";

Just below those imports, add this definition of rootSaga:
function* rootSaga() {

  yield takeLatest(

    "ADD_CUSTOMER_REQUEST",

    addCustomer

  );

}

Now, update configureStore to include the saga middleware and “run” rootSaga, like so. After this change, your test should pass:
export const configureStore = (storeEnhancers = []) => {

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(

    combineReducers({ customer: customerReducer }),

    compose(

      applyMiddleware(sagaMiddleware),

      ...storeEnhancers

    )

  );

  sagaMiddleware.run(rootSaga);

  return store;

};

That completes the first test for the saga, and gets all the necessary plumbing into place. You’ve also seen how to use put. Next up, let’s introduce call.

Making asynchronous requests with sagas
Within a saga, call allows us to perform an asynchronous request. Let’s introduce that now. Follow these steps:

Add the following test, to check the call to fetch:
it("sends HTTP request to POST /customers", async () => {

  const inputCustomer = { firstName: "Ashley" };

  store.dispatch(addCustomerRequest(inputCustomer));

  expect(global.fetch).toBeCalledWith(

    "/customers",

    expect.objectContaining({

      method: "POST",

    })

  );

});

We’ll need to define a spy on global.fetch for this to work. Change the beforeEach block as follows, including the new customer constant:
beforeEach(() => {

  jest.spyOn(global, "fetch");

  store = configureStore([ storeSpy ]);

});

In src/sagas/customer.js, update the saga import to include the call function, like so:
import { put, call } from "redux-saga/effects";

Now, create a fetch function and invoke it in the saga with call, as follows. After this, your test should be passing:
const fetch = (url, data) =>

  global.fetch(url, {

    method: "POST",

  });

export function* addCustomer({ customer }) {

  yield put({ type: "ADD_CUSTOMER_SUBMITTING" });

  yield call(fetch, "/customers", customer);

}

Alright—now, let’s add a test to add in the configuration for our fetch request, as follows:
it("calls fetch with correct configuration", async () => {

  const inputCustomer = { firstName: "Ashley" };

  store.dispatch(addCustomerRequest(inputCustomer));

  expect(global.fetch).toBeCalledWith(

    expect.anything(),

    expect.objectContaining({

      credentials: "same-origin",

      headers: { "Content-Type": "application/json" },

    })

  );

});

To make that pass, add the following lines to the fetch definition:
const fetch = (url, data) =>

  global.fetch(url, {

    method: "POST",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" }

  });

Now, let’s test that we’re sending the right customer data across. Here’s how we can do that:
it("calls fetch with customer as request body", async () => {

  const inputCustomer = { firstName: "Ashley" };

  store.dispatch(addCustomerRequest(inputCustomer));

  expect(global.fetch).toBeCalledWith(

    expect.anything(),

    expect.objectContaining({

      body: JSON.stringify(inputCustomer),

    })

);

});

To make that pass, complete the fetch definition, as shown here:
const fetch = (url, data) =>

  global.fetch(url, {

    body: JSON.stringify(data),

    method: "POST",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" }

  });

For the next test, we want to dispatch an ADD_CUSTOMER_SUCCESSFUL event when the fetch call returns successfully. It uses a constant named customer that we’ll define in the next step. Here’s the code we need to execute:
it("dispatches ADD_CUSTOMER_SUCCESSFUL on success", () => {

  store.dispatch(addCustomerRequest());

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({

      type: "ADD_CUSTOMER_SUCCESSFUL",

      customer

    });

});

When we set up our fetch spy before, we didn’t set a return value. So, now, create a customer constant and set up the fetch spy to return it, like so:
const customer = { id: 123 };

beforeEach(() => {

  jest

    .spyOn(global, "fetch")

    .mockReturnValue(fetchResponseOk(customer));

  store = configureStore([ storeSpy ]);

});

Import fetchResponseOk, like so. After this, you’ll be able to run your test:
import { fetchResponseOk } from "../builders/fetch";

Make the test pass by processing the result from the call function, like so:
export function* addCustomer({ customer }) {

  yield put({ type: "ADD_CUSTOMER_SUBMITTING" });

  const result = yield call(fetch, "/customers", customer);

  const customerWithId = yield call([result, "json"]);

  yield put({

    type: "ADD_CUSTOMER_SUCCESSFUL",

    customer: customerWithId

  });

}

What about if the fetch call isn’t successful, perhaps because of a network failure? Add a test for that, as follows:
it("dispatches ADD_CUSTOMER_FAILED on non-specific error", () => {

  global.fetch.mockReturnValue(fetchResponseError());

  store.dispatch(addCustomerRequest());

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({ type: "ADD_CUSTOMER_FAILED" });

});

That test makes use of fetchResponseError; import it now, like so:
import {

  fetchResponseOk,

  fetchResponseError

} from "../builders/fetch";

Make the test pass by wrapping the existing code in an if statement with an else clause, as follows:
export function* addCustomer({ customer }) {

  yield put({ type: "ADD_CUSTOMER_SUBMITTING" });

  const result = yield call(

    fetch,

    "/customers",

    customer

  );

  if(result.ok) {

    const customerWithId = yield call(

      [result, "json"]

    );

    yield put({

      type: "ADD_CUSTOMER_SUCCESSFUL",

      customer: customerWithId

    });

  } else {

    yield put({ type: "ADD_CUSTOMER_FAILED" });

  }

}

Finally, add a test for a more specific type of failure—a validation failure, as follows:
it("dispatches ADD_CUSTOMER_VALIDATION_FAILED if validation errors were returned", () => {

  const errors = {

    field: "field",

    description: "error text"

  };

  global.fetch.mockReturnValue(

    fetchResponseError(422, { errors })

  );

  store.dispatch(addCustomerRequest());

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({

      type: "ADD_CUSTOMER_VALIDATION_FAILED",

      validationErrors: errors

    });

});

Make that pass with the following code:
export function* addCustomer({ customer }) {

  yield put({ type: "ADD_CUSTOMER_SUBMITTING" });

  const result = yield call(fetch, "/customers", customer);

  if(result.ok) {

    const customerWithId = yield call(

     [result, "json"]

    );

    yield put({

      type: "ADD_CUSTOMER_SUCCESSFUL",

      customer: customerWithId

    });

  } else if (result.status === 422) {

    const response = yield call([result, "json"]);

    yield put({

      type: "ADD_CUSTOMER_VALIDATION_FAILED",

      validationErrors: response.errors

    });

  } else {

    yield put({ type: "ADD_CUSTOMER_FAILED" });

  }

}

The saga is now complete. Compare this function to the function in CustomerForm that we’re replacing: doSave. The structure is identical. That’s a good indicator that we’re ready to work on removing doSave from CustomerForm.

In the next section, we’ll update CustomerForm to make use of our new Redux store.

Switching component state for Redux state
The saga and reducer are now complete and ready to be used in the CustomerForm React component. In this section, we’ll replace the use of doSave, and then as a final flourish, we’ll push our React Router navigation into the saga, removing the onSave callback from App.

Submitting a React form by dispatching a Redux action
At the start of the chapter, we looked at how the purpose of this change was essentially a transplant of CustomerForm’s doSave function into a Redux action.

With our new Redux setup, we used component state to display a submitting indicator and show any validation errors. That information is now stored within the Redux store, not component state. So, in addition to dispatching an action to replace doSave, the component also needs to read state from the store. The component state variables can be deleted.

This has a knock-on effect on our tests. Since the saga tests the failure modes, our component tests for CustomerForm simply need to handle various states of the Redux store, which we’ll manipulate using our dispatchToStore extension.

We’ll start by making our component Redux-aware, as follows:

Add the following import statement to the top of test/CustomerForm.test.js:
import { expectRedux } from "expect-redux";

Update the test extensions import statement, replacing render with renderWithStore, and adding the two new imports, as follows:
import {

  initializeReactContainer,

  renderWithStore,

  dispatchToStore,

  store,

  ...

} from "./reactTestExtensions";

Replace all calls to render with renderWithStore. Be careful if you’re doing a search and replace operation: the word render appears in some of the test descriptions, and you should keep those as they are.
Let’s rework a single test: the one with the sends HTTP request to POST /customers when submitting data description. Change that test to the following:
it("dispatches ADD_CUSTOMER_REQUEST when submitting data", async () => {

  renderWithStore(

    <CustomerForm {...validCustomer} />

  );

  await clickAndWait(submitButton());

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({

      type: 'ADD_CUSTOMER_REQUEST',

      customer: validCustomer

  });

});

To make this pass, we’ll use a side-by-side implementation to ensure our other tests continue to pass. In handleSubmit, add the line highlighted in the following code snippet. This calls a new addCustomerRequest prop that we’ll define soon:
const handleSubmit = async (event) => {

  event.preventDefault();

  const validationResult = validateMany(

    validators, customer

  );

  if (!anyErrors(validationResult)) {

    await doSave();

    dispatch(addCustomerRequest(customer));

  } else {

    setValidationErrors(validationResult);

  }

};

That makes use of the useDispatch hook. Import that now, as follows:
import {  useDispatch } from "react-redux";

Then, add this line to the top of the CustomerForm component:
const dispatch = useDispatch();

To make the test pass, all that’s left is the definition of addCustomerRequest, which you can add just below the import statements and above the CustomerForm component definition, like so:
const addCustomerRequest = (customer) => ({

  type: "ADD_CUSTOMER_REQUEST",

  customer,

});

At this point, your component is now Redux-aware, and it’s dispatching the right action to Redux. The remaining work is to modify the component to deal with validation errors coming from Redux rather than the component state.

Making use of store state within a component
Now, it’s time to introduce the useSelector hook to pull out state from the store. We’ll kick things off with the ADD_CUSTOMER_FAILED generic error action. Recall that when the reducer receives this, it updates the error store state value to true. Follow these steps:

Find the test named renders error message when fetch call fails. Replace it with the implementation shown here. It simulates an ADD_CUSTOMER_FAILED action so that we make sure all the Redux wiring is correct. Don’t forget to remove the async keyword from the test function:
it("renders error message when error prop is true", () => {

  renderWithStore(

    <CustomerForm {...validCustomer} />

  );

  dispatchToStore({ type: "ADD_CUSTOMER_FAILED" });

  expect(element("[role=alert]")).toContainText(

    "error occurred"

  );

});

Add an import statement for the useSelector hook at the top of src/CustomerForm.js, as follows:
import {

  useDispatch,

  useSelector

} from "react-redux";

Call the useSelector hook at the top of the CustomerForm component, as shown in the following code snippet. It pulls out the error state value from the customer section of the Redux store:
const {

  error,

} = useSelector(({ customer }) => customer);

Delete any line where setError is called. There are two occurrences, both in doSave.
Now, you can delete the error/setError pair of variables that are defined with the useState hook at the top of CustomerForm. Your tests won’t run until you do this, due to error being declared twice. Your tests should be passing at this stage.
The next test, clears error message when fetch call succeeds, can be deleted. The reducer, as it stands, doesn’t actually do this; completing it is one of the exercises in the Exercise section.
Find the does not submit the form when there are validation errors test and update it as follows. It should pass already:
it("does not submit the form when there are validation errors", async () => {

  renderWithStore(

    <CustomerForm original={blankCustomer} />

  );

  await clickAndWait(submitButton());

  return expectRedux(store)

    .toNotDispatchAnAction(100)

    .ofType("ADD_CUSTOMER_REQUEST");

});

THE TONOTDISPATCHANACTION MATCHER

This matcher should always be used with a timeout, such as 100 milliseconds in this case. That’s because, in an asynchronous environment, events may just be slow to occur, rather than not occurring at all.

Find the next test, renders field validation errors from server. Replace it with the following code, remembering to remove the async keyword from the function definition:
it("renders field validation errors from server", () => {

  const errors = {

    phoneNumber: "Phone number already exists in the system"

  };

  renderWithStore(

    <CustomerForm {...validCustomer} />

  );

  dispatchToStore({

    type: "ADD_CUSTOMER_VALIDATION_FAILED",

    validationErrors: errors

  });

  expect(

    errorFor(phoneNumber)

  ).toContainText(errors.phoneNumber);

});

To make this pass, we need to pull out validationErrors from the Redux customer store. There’s a bit of complexity here: the component already has a validationErrors state variable that covers both server and client validation errors. We can’t replace that entirely, because it handles client errors in addition to server errors.
So, let’s rename the prop we get back from the server, like so:

const {

  error,

  validationErrors: serverValidationErrors,

} = useSelector(({ customer }) => customer);

A DESIGN ISSUE

This highlights a design issue in our original code. The validationErrors state variable had two uses, which were mixed up. Our change here will separate those uses.

We’re not done with this test just yet. Update the renderError function to render errors for both validationErrors (client-side validation) and serverValidationErrors (server-side validation), as follows:
const renderError = fieldName => {

  const allValidationErrors = {

    ...validationErrors,

    ...serverValidationErrors

  };

  return (

    <span id={`${fieldname}error`} role="alert">

      {hasError(allValidationErrors, fieldName)

        ? allValidationErrors[fieldname]

        : ""}

    </span>

  );

};

The next tests we need to look at are for the submitting indicator. We’ll update these tests to respond to store actions rather than a form submission. Here’s the first one:
it("displays indicator when form is submitting", () => {

  renderWithStore(

    <CustomerForm {...validCustomer} />

  );

  dispatchToStore({

   type: "ADD_CUSTOMER_SUBMITTING"

  });

  expect(

    element(".submittingIndicator")

  ).not.toBeNull();

});

To make this pass, add status to the useSelector call, like so:
const {

  error,

  status,

  validationErrors: serverValidationErrors,

} = useSelector(({ customer }) => customer);

Delete anywhere that setSubmitting is called within this component.
Delete the state variable for submitting, and replace it with the following line of code. The test should now pass:
const submitting = status === "SUBMITTING";

Then, update the test named hides indicator when form has submitted, as follows. This test won’t need any change to the production code:
it("hides indicator when form has submitted", () => {

  renderWithStore(

    <CustomerForm {...validCustomer} />

  );

  dispatchToStore({

    type: "ADD_CUSTOMER_SUCCESSFUL"

  });

  expect(element(".submittingIndicator")).toBeNull();

});

Finally, find the disable the submit button when submitting test and modify it in the same way as Step 12.
That’s it for test changes, and doSave is almost fully redundant. However, the call to onSave still needs to be migrated across into the Redux saga, which we’ll do in the next section.

Navigating router history in a Redux saga
Recall that it is the App component that renders CustomerForm, and App passes a function to the CustomerForm’s onSave prop that causes page navigation. When the customer information has been submitted, the user is moved onto the /addAppointment route.

But now that the form submission happens within a Redux saga, how do we call the onSave prop? The answer is that we can’t. Instead, we can move page navigation into the saga itself and delete the onSave prop entirely.

To do this, we must update src/index.js to use HistoryRouter rather than BrowserRouter. That allows you to pass in your own history singleton object, which you can then explicitly construct yourself and then access via the saga. Proceed as follows:

Create a new file named src/history.js and add the following content to it. This is very similar to what we already did in test/reactTestExtensions.js:
import { createBrowserHistory } from "history";

export const appHistory = createBrowserHistory();

Update src/index.js, as shown here:
import React from "react";

import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";

import {

  unstable_HistoryRouter as HistoryRouter

} from "react-router-dom";

import { appHistory } from "./history";

import { configureStore } from "./store";

import { App } from "./App";

ReactDOM.createRoot(

  document.getElementById("root")

).render(

  <Provider store={configureStore()}>

    <HistoryRouter history={appHistory}>

      <App />

   </HistoryRouter>

  </Provider>

);

Now, we can use appHistory in our saga. Open test/sagas/customer.js and add the following import statement to the top of the file:
import { appHistory } from "../../src/history";

Then, add the following two tests to define how the navigation should occur:
it("navigates to /addAppointment on success", () => {

  store.dispatch(addCustomerRequest());

  expect(appHistory.location.pathname).toEqual(

    "/addAppointment"

  );

});

it("includes the customer id in the query string when navigating to /addAppointment", () => {

  store.dispatch(addCustomerRequest());

  expect(

    appHistory.location.search

  ).toEqual("?customer=123");

});

To make these pass, start by opening src/sagas/customer.js and adding the following import statement:
import { appHistory } from "../history";

Then, update the addCustomer generator function to navigate after a customer has been added successfully, like so:
export function* addCustomer({ customer }) {

  ...

  yield put({

    type: "ADD_CUSTOMER_SUCCESSFUL",

    customer: customerWithId,

  });

  appHistory.push(

    `/addAppointment?customer=${customerWithId.id}`

  );

}

Now, all that’s left is to delete the existing onSave plumbing from App and CustomerForm. Open test/App.test.js and delete the following three tests:
calls fetch with correct configuration
navigates to /addAppointment after the CustomerForm is submitted
passes saved customer to AppointmentFormLoader after the CustomerForm is submitted
You can also delete the beforeEach block that sets up global.fetch in the nested describe block labeled when POST request returns an error.
In src/App.js, delete the definition of transitionToAddAppointment and change the /addCustomer route to have no onSave prop, as shown in the following code snippet. Your App tests should be passing at this point:
<Route

  path="/addCustomer"

  element={<CustomerForm original={blankCustomer} />}

/>

Now, we can delete the onSave prop from CustomerForm. Start by deleting the following tests from the CustomerForm test suite that are no longer necessary:
notifies onSave when form is submitted
does not notify onSave if the POST request returns an error
Delete the onSave prop from the CustomerForm component.
Finally, remove the invocation of doSave from handleSubmit. This function no longer awaits anything, so you can safely remove async from the function definition. At this point, all your tests should be passing.
You’ve now seen how you can integrate a Redux store into your React components, and how you can control React Router navigation from within a Redux saga.

All being well, your application should now be running with Redux managing the workflow.

Summary
This has been a whirlwind tour of Redux and how to refactor your application to it, using TDD.

As warned in the introduction of this chapter, Redux is a complex library that introduces a lot of extra plumbing into your application. Thankfully, the testing approach is straightforward.

In the next chapter, we’ll add yet another library: Relay, the GraphQL client.

Exercise
Modify the customer reducer to ensure that error is reset to false when the ADD_CUSTOMER_SUCCESSFUL action occurs.
Further reading
For more information, have a look at the following sources:

MDN documentation on generator functions:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function*

Home page for the expect-redux package:
https://github.com/rradczewski/expect-redux
