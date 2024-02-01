# Part 2 - Building Application Features

# Chapter 11: Test-Driving React Router

11
Test-Driving React Router
React Router is a popular library of components that integrate with the browser’s own navigation system. It manipulates the browser’s address bar so that changes in your UI appear as page transitions. To the user, it seems like they are navigating between separate pages. In reality, they remain on the same page and avoid an expensive page reload.

In this chapter, we’ll refactor our example appointments system to make use of React Router. Unlike the rest of the book, this chapter is not a walkthrough. That’s because the refactoring process is quite long and laborious. Instead, we’ll look at each of the main changes in turn.

This chapter covers the following:

Designing React Router applications from a test-first perspective
Testing components within a router
Testing router links
Testing programmatic navigation
By the end of the chapter, you’ll have learned all the necessary techniques for test-driving React Router integrations.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter11

Designing React Router applications from a test-first perspective
This section is a run-down of all the major pieces of the React Router ecosystem, just in case you’re not familiar with it. It also contains guidance on how to test a system that relies on React Router.

A list of all the React Router pieces
Here’s what you’ll be working with from the React Router library:

A Router component. You’ll generally have one of these, and there are a bunch of different types. The basic one is BrowserRouter but you’ll undoubtedly upgrade to HistoryRouter if you need to manipulate history outside of the router, which, since you’re writing tests, you will. In Chapter 12, Test-Driving Redux, you’ll also see how this is necessary if you’re causing page transitions to occur within Redux actions.
A Routes component. This is analogous to the switch statement in our existing App component. It has a list of Route children and will choose just one of those children to display at one time.
A set of Route components with the Routes parent. Each Route has a path property, for example, /addCustomer, that the Router component uses to compare with the window’s current location. The route that matches is the one that is displayed.
One or more Link components. These display like normal HTML hyperlinks, but they don’t act like them; React Router stops the browser from receiving these navigation events and instead sends them back to the Routes component, meaning a page transition doesn’t occur.
The useNavigate hook. This is used to perform a page transition as part of a React side effect or event handler.
The useLocation and useSearchParams hooks. These are used to get parts of the current window location within your components.
Splitting tests when the window location changes
You can see from this list that React Router’s core function is to manipulate the window location and modify your application’s behavior based on that location.

One way to think about this is that we will utilize the window location as a form of application state that is accessible to all our components. Importantly, this state persists across web requests, because a user can save or bookmark links for use later.

A consequence of this is that we must now split apart some of our unit tests. Take, for example, the Create appointment button that was previously used to switch out the main component on display on the page. With React Router in place, this button will become a link. Previously, we had a single unit test named as follows:


displays the AppointmentFormLoader after the CustomerForm is submitted
But now, we’ll split that into two tests:


navigates to /addAppointment after the CustomerForm is submitted
renders AppointmentFormRoute at /addAppointment
You can see that the first test stops at the moment the window location changes. The second test begins at the moment the browser navigates to the same location.

It’s important to make this change because React Router isn’t just refactoring, it’s adding a new feature: the URL is now accessible as an entry point into your application.

That is, in essence, the most important thing you need to know before introducing React Router into your projects.

Up-front design for our new routes
Before launching into this refactor, let’s take a look at the routes we’ll be introducing:

The default route, /, will remain as our AppointmentsDayViewLoader together with navigation buttons. This is extracted out as a new component named MainScreen.
A route to add a new customer, at /addCustomer.
A route to add a new appointment for a given customer, at /addAppointment?customer=<id>.
A route to search for customers at /searchCustomers. This can receive a set of query string values: searchTerm, limit, and previousRowIds. For example, the query string might look as follows:
?searchTerm=An&limit=20&previousRowIds=123,456

Next, we’ll look at test-driving a Router component along with its Route children.

Testing components within a router
In this section, we’ll look at how to use the primary Router, Routes, and Route components.

NO WALKTHROUGH IN THIS CHAPTER

As mentioned in the chapter introduction, this chapter does not follow the usual walkthrough approach. The examples shown here are taken from the completed refactoring of our Appointments code base, which you’ll find in the Chapter11/Complete directory of the GitHub repository.

The Router component and its test equivalent
This is a top-level component that hooks into your browser’s location mechanics. We do not generally test drive this because JSDOM doesn’t deal with page transitions, or have full support for the window.location API.

Instead, we put it in the src/index.js file:


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
This is necessary because if you try to use any of the other React Router components outside of a child of a Router component, it will blow up. The same is true for our tests: our components need to be rendered inside of a router. So, we introduce a new render helper called renderWithRouter.

This definition is within test/reactTestExtensions.js:


import { createMemoryHistory } from "history";
import {
  unstable_HistoryRouter as HistoryRouter
} from "react-router-dom";
export let history;
export const renderWithRouter = (
  component,
  { location } = { location: "" }
) => {
  history = createMemoryHistory({
    initialEntries: [location]
  });
  act(() =>
    reactRoot.render(
      <HistoryRouter history={history}>
        {component}
      </HistoryRouter>
    )
  );
};
MEMORYROUTER VERSUS HISTORYROUTER

The React Router documentation will suggest you use MemoryRouter, which is often good enough. Using HistoryRouter allows you to control the history instance that is passed in, meaning you can manipulate it from within your tests.

For more information, take a look at https://reacttdd.com/memory-router-vs-history-router.

It’s important to export the history variable itself if you want to manipulate the window location from within your own tests. A special case of this is if you want to set the window location before mounting the component; in this situation, you can simply pass a location property to the renderWithRouter function. You’ll see how this works next.

Using the Routes component to replace a switch statement
Now let’s look at using the Routes component to switch components depending on the window location. This component is generally at the top of the application component hierarchy, and in our case, it is indeed the first component within App.

The Routes component is analogous to the switch statement that existed in the original app. The switch statement was using a state variable to determine which component should be shown. The Routes component relies on the parent Router to feed it the window location as context.

Here’s what the original switch statement looked like in the App component:


const [view, setView] = useState("dayView");
...
switch (view) {
  case "addCustomer":
    return (
      <CustomerForm ... />
    );
  case "searchCustomers":
    return (
      <CustomerSearch ... />
    );
  case "addAppointment":
    return (
      <AppointmentFormLoader ... />
    );
  default:
    return ...
}
Its Router replacement looks like this:


<Routes>
  <Route
    path="/addCustomer"
    element={<CustomerForm ... />}
  />
  <Route
    path="/addAppointment"
    element={<AppointmentFormRoute ... />}
  />
  <Route
    path="/searchCustomers"
    element={<CustomerSearchRoute ... />}
  />
  <Route path="/" element={<MainScreen />} />
</Routes>
The view state variable is no longer needed. Notice how we have a couple of new components with a Route suffix. These components are small wrappers that pull out the customer ID and other parameters from the window location before passing it to the original components. We’ll look at those soon.

But first, how do the tests look for these new routes?

For the default route, the tests are simple, and are updates to the tests that were there before:


it("initially shows the AppointmentDayViewLoader", () => {
  renderWithRouter(<App />);
  expect(AppointmentsDayViewLoader).toBeRendered();
});
it("has a menu bar", () => {
  renderWithRouter(<App />);
  expect(element("menu")).not.toBeNull();
});
The only difference is that we use the renderWithRouter helper, not render.

The other routes are similar, except that they use the location property to set the initial window location, and their assertions are based on mocked components:


it("renders CustomerForm at the /addCustomer endpoint", () => {
  renderWithRouter(<App />, {
    location: "/addCustomer"
  });
  expect(CustomerForm).toBeRendered();
});
it("renders AppointmentFormRoute at /addAppointment", () => {
  renderWithRouter(<App />, {
    location: "/addAppointment?customer=123",
  });
  expect(AppointmentFormRoute).toBeRendered();
});
it("renders CustomerSearchRoute at /searchCustomers", () => {
  renderWithRouter(<App />, {
    location: "/searchCustomers"
  });
  expect(CustomerSearchRoute).toBeRendered();
});
Using intermediate components to translate URL state
Let’s take a closer look at AppointmentFormRoute and CustomerSearchRoute. What are these components doing?

Here’s the definition of AppointmentFormRoute:


import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  AppointmentFormLoader
} from "./AppointmentFormLoader";
const blankAppointment = {
  service: "",
  stylist: "",
  startsAt: null,
};
export const AppointmentFormRoute = (props) => {
  const [params, _] = useSearchParams();
  return (
    <AppointmentFormLoader
      {...props}
      original={{
        ...blankAppointment,
        customer: params.get("customer"),
      }}
    />
  );
};
This component is an intermediate component that sits between the Route component instance for /addAppointment and the AppointmentFormLoader component instance.

It would have been possible to simply reference the useSearchParams function from within AppointmentFormLoader itself, but by using this intermediate class, we can avoid modifying that component and keep the two responsibilities separate.

Having a single responsibility per component helps with comprehension. It also means that should we ever wish to rip out React Router at a later date, AppointmentFormLoader doesn’t need to be touched.

There are a couple of interesting tests for this component. The first is the check for parsing the customer search parameter:


it("adds the customer id into the original appointment object", () => {
  renderWithRouter(<AppointmentFormRoute />, {
    location: "?customer=123",
  });
  expect(AppointmentFormLoader).toBeRenderedWithProps({
    original: expect.objectContaining({
      customer: "123",
    }),
  });
});
The location property sent to renderWithRouter is just a standard query string: ?customer=123. We could have entered a full URL here, but the test is clearer by focusing purely on the query string portion of the URL.

The second test is for the remainder of the props:


it("passes all other props through to AppointmentForm", () => {
  const props = { a: "123", b: "456" };
  renderWithRouter(<AppointmentFormRoute {...props} />);
  expect(AppointmentFormLoader).toBeRenderedWithProps(
    expect.objectContaining({
      a: "123",
      b: "456",
    })
  );
});
The test is important because the Route element passes through an onSave property that is for AppointmentFormLoader:


<Route
  path="/addAppointment"
  element={
    <AppointmentFormRoute onSave={transitionToDayView} />
  }
/>
We’ll look at what the transitionToDayView function does in the Testing navigation section a little further on.

Now let’s see CustomerSearchRoute. This is a little more complicated because it parses some of the query string parameters, using a function called convertParams:


const convertParams = () => {
  const [params] = useSearchParams();
  const obj = {};
  if (params.has("searchTerm")) {
    obj.searchTerm = params.get("searchTerm");
  }
  if (params.has("limit")) {
    obj.limit = parseInt(params.get("limit"), 10);
  }
  if (params.has("lastRowIds")) {
    obj.lastRowIds = params
      .get("lastRowIds")
      .split(",")
      .filter((id) => id !== "");
  }
  return obj;
};
This function replaces the three state variables that were used in the existing CustomerSearch component. Since all query string parameters are strings, each value needs to be parsed into the right format. These values are then passed into CustomerSearch as props:


import React from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CustomerSearch
} from "./CustomerSearch/CustomerSearch";
const convertParams = ...; // as above
export const CustomerSearchRoute = (props) => (
  <CustomerSearch
    {...props}
    navigate={useNavigate()}
    {...convertParams()}
  />
);
This parameter parsing functionality could have been put into CustomerSearch, but keeping that logic in a separate component helps with readability.

This example also shows the use of useNavigate, which is passed through to CustomerSearch. Passing this hook function return value as a prop means we can test CustomerSearch with a standard Jest spy function for the value of navigate, avoiding the need to render the test component within a router.

The tests for this component are straightforward. Let’s take a look at one example:


it("parses lastRowIds from query string", () => {
  const location =
    "?lastRowIds=" + encodeURIComponent("1,2,3");
  renderWithRouter(<CustomerSearchRoute />, { location });
  expect(CustomerSearch).toBeRenderedWithProps(
    expect.objectContaining({
      lastRowIds: ["1", "2", "3"],
    })
  );
});
You’ve now learned all there is to working with the three components: Router, Routes, and Route. Next up is the Link component.

Testing router links
In this section, you’ll learn how to use and test the Link component. This component is React Router’s version of the humble HTML anchor (or a) tag.

There are two forms of the Link component that we use. The first uses the to prop as a string, for example, /addCustomer:


<Link to="/addCustomer" role="button">
  Add customer and appointment
</Link>
The second sets the to prop to an object with a search property:


<Link
    to={{
      search: objectToQueryString(queryParams),
    }}
>
  {children}
</Link>
This object form also takes a pathname property, but we can avoid setting that since the path remains the same for our use case.

We’ll look at two different ways of testing links: the standard way (by checking for hyperlinks), and the slightly more painful way of using mocks.

Checking the page for hyperlinks
Here’s the MainScreen component in src/App.js, which shows the navigation links and the appointments day view:


export const MainScreen = () => (
  <>
    <menu>
      <li>
        <Link to="/addCustomer" role="button">
          Add customer and appointment
        </Link>
      </li>
      <li>
        <Link to="/searchCustomers" role="button">
          Search customers
        </Link>
      </li>
    </menu>
    <AppointmentsDayViewLoader />
  </>
);
EXTRACTED COMPONENT

The MainScreen component has been extracted out of App. The same code previously lived in the switch statement as the default case.

The Link component generates a standard HTML anchor tag. This means we create a helper to find a specific link by looking for an anchor tag with a matching href attribute. This is in test/reactTestExtensions.js:


export const linkFor = (href) =>
  elements("a").find(
    (el) => el.getAttribute("href") === href
  );
That can be then used to test for the presence of a link and its caption:


it("renders a link to the /addCustomer route", async () => {
  renderWithRouter(<App />);
  expect(linkFor("/addCustomer")).toBeDefined();
});
it("captions the /addCustomer link as 'Add customer and appointment'", async () => {
  renderWithRouter(<App />);
  expect(linkFor("/addCustomer")).toContainText(
    "Add customer and appointment"
  );
});
Another way to test this would be to click the link and check that it works, as shown in the following test. However, as mentioned at the beginning of this chapter, this test isn’t necessary because you’ve already tested the two “halves” of this test: that the link is displayed, and that navigating to the URL renders the right component:


it("displays the CustomerSearch when link is clicked", async () => {
  renderWithRouter(<App />);
  click(linkFor("/searchCustomers"));
  expect(CustomerSearchRoute).toBeRendered();
});
That covers the main way to test Link components. Another way to test links is to mock the Link component, which we’ll cover next.

Mocking the Link component
This method is slightly more complicated than simply testing for HTML hyperlinks. However, it does mean you can avoid rendering your component under test within a Router component.

The src/CustomerSearch/RouterButton.js file contains this component:


import React from "react";
import {
  objectToQueryString
} from "../objectToQueryString";
import { Link } from "react-router-dom";
export const RouterButton = ({
  queryParams,
  children,
  disabled,
}) => (
  <Link
    className={disabled ? "disabled" : ""}
    role="button"
    to={{
      search: objectToQueryString(queryParams),
    }}
  >
    {children}
  </Link>
);
To test this using plain render, instead of renderWithRouter, we’ll need to mock out the Link component. Here’s how that looks in test/CustomerSearch/RouterButton.test.js:


import { Link } from "react-router-dom";
import {
  RouterButton
} from "../../src/CustomerSearch/RouterButton";
jest.mock("react-router-dom", () => ({
  Link: jest.fn(({ children }) => (
    <div id="Link">{children}</div>
  )),
}));
Now, you can happily use that mock in your test:


it("renders a Link", () => {
  render(<RouterButton queryParams={queryParams} />);
  expect(Link).toBeRenderedWithProps({
    className: "",
    role: "button",
    to: {
      search: "?a=123&b=234",
    },
  });
});
There’s one final piece to think about. Sometimes, you have a single mocked component that has multiple rendered instances on the same page, and this happens frequently with Link instances.

In our case, this is the SearchButtons component, which contains a list of RouterButton and ToggleRouterButton components:


<menu>
  ...
  <li>
    <RouterButton
      id="previous-page"
      queryParams={previousPageParams()}
      disabled={!hasPrevious}
    >
      Previous
    </RouterButton>
  </li>
  <li>
    <RouterButton
      id="next-page"
      queryParams={nextPageParams()}
      disabled={!hasNext}
    >
      Next
    </RouterButton>
  </li>
</menu>
When it comes to testing these links, the simplest approach is to use renderWithRouter to render the SearchButtons components and then check the rendered HTML hyperlinks.

However, if you’ve decided to mock, then you need a way to easily find the element you’ve rendered.

First, you’d specify the mock to include an id property:


jest.mock("../../src/CustomerSearch/RouterButton", () => ({
  RouterButton: jest.fn(({ id, children }) => (
    <div id={id}>{children}</div>
  )),
}));
Then, you can use a new test extension called propsMatching to find the specific instance. Here’s the definition from test/reactTestExtensions.js:


export const propsMatching = (mockComponent, matching) => {
  const [k, v] = Object.entries(matching)[0];
  const call = mockComponent.mock.calls.find(
    ([props]) => props[k] === v
  );
  return call?.[0];
};
You can then write your test to make use of that, as shown in the following code. Remember though, it’s probably going to be easier not to mock this component and simply use renderWithRouter, and then check the HTML hyperlinks directly:


const previousPageButtonProps = () =>
  propsMatching(RouterButton, { id: "previous-page" });
it("renders", () => {
  render(<SearchButtons {...testProps} />);
  expect(previousPageButtonProps()).toMatchObject({
    disabled: false,
  });
  expect(element("#previous-page")).toContainText(
    "Previous"
  );
});
That’s everything there is to testing the Link component. In the next section, we’ll look at the final aspect of testing React Router: navigating programmatically.

Testing programmatic navigation
Sometimes, you’ll want to trigger a location change programmatically—in other words, without waiting for a user to click a link.

There are two ways to do this: one using the useNavigate hook, and the second using a history instance that you pass into your top-level router.

NAVIGATION INSIDE AND OUTSIDE OF COMPONENTS

In this chapter, we’ll look at just the first method, using the hook. Later, in Chapter 12, Test-Driving Redux, we’ll use the second method to change the location within a Redux action.

The useNavigate hook is the appropriate method when you’re able to navigate from within a React component.

In the Appointments application, this happens in two places. The first is after a customer has been added and we want to move the user on to the /addAppointment route. The second is after that form has been completed and the appointment has been created—then we want to move them back to the default route.

Since these are very similar, we’ll look at just the first.

Here’s how the /addCustomer route definition looks in src/App.js:


<Route
  path="/addCustomer"
  element={
    <CustomerForm
      original={blankCustomer}
      onSave={transitionToAddAppointment}
    />
  }
/>
Notice the onSave prop; this is the callback that gets called once the customer form submission is completed. Here’s that callback definition, together with the bits relevant for the useNavigate hook:


import {
  ...,
  useNavigate,
} from "react-router-dom";
export const App = () => {
  const navigate = useNavigate();
  const transitionToAddAppointment = (customer) =>
    navigate(`/addAppointment?customer=${customer.id}`);
  ...
};
When it comes to testing this, clearly, we can’t simply rely on the presence of a Link component, because there isn’t one. Instead, we must call the onSave callback:


import {
  ...,
  history,
} from "./reactTestExtensions";
...
it("navigates to /addAppointment after the CustomerForm is submitted", () => {
  renderWithRouter(<App />);
  click(linkFor("/addCustomer"));
  const onSave = propsOf(CustomerForm).onSave;
  act(() => onSave(customer));
  expect(history.location.pathname).toEqual(
    "/addAppointment"
  );
});
The expectation is to test that the history is updated correctly. This history is the exported constant from test/reactTestExtensions.js that is set in the renderWithRouter function that we defined in the Testing components within a router section.

There is a variation of this. Instead of using the history import, you could also simply use the window.location instance:


expect(
  window.location.pathname
).toEqual("/addAppointment");
You’ve now learned how to test programmatic React Router navigation.

In the next chapter, Test-Driving Redux, we’ll see how we can use this same history instance from a Redux saga.

Summary
This chapter has shown you how to use React Router in a testable fashion. You have learned how to test-drive the Router, Routes, Route, and Link components. You have seen how to use the React Router useSearchParams and useNavigate hooks.

Most importantly, you’ve seen that because routes give an extra level of entry into your application, you must split your existing navigation tests into two parts: one to test that a link exists (or is followed), and one to check that if you visit that URL, the right component is displayed.

Now that we’ve successfully integrated one library, the next one shouldn’t be too tricky, right? In the next chapter, we’ll apply all the skills we’ve learned in this chapter to the integration of another library: Redux.

Exercise
In this chapter, there was no walkthrough because the refactoring process is quite involved and would have taken up a decent chunk of time and space.

Use this opportunity to try refactoring yourself. Use a systematic refactoring approach to break down the change to React Router into many small steps. At each step, you should still have working software.

You can find a guide on how to approach this type of refactoring at https://reacttdd.com/refactoring-to-react-router.

Further reading
The official React Router documentation can be found at the following link:

https://reacttraining.com/react-router/

