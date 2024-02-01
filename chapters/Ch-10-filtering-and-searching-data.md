# Part 2 - Building Application Features

# Chapter 10: Filtering and Searching Data

In this chapter, we’ll continue applying the techniques we’ve already learned to another, more complex use case.

As we work through the chapter, we’ll learn how to adjust a component’s design using tests to show us where the design is lacking. Test-driven development really helps highlight design issues when the tests get knarly. Luckily, the tests we’ve already written give us the confidence to change course and completely reinvent our design. With each change, we simply run npm test and have our new implementation verified in a matter of seconds.

In the current workflow, users start by adding a new customer and then immediately book an appointment for that customer. Now, we’ll expand on that by allowing them to choose an existing customer before adding an appointment.

We want users to be able to quickly search through customers. There could be hundreds, maybe thousands, of customers registered with this salon. So, we’ll build a CustomerSearch search component that will allow our users to search for customers by name and to page through the returned results.

In this chapter, you’ll learn about the following topics:

Displaying tabular data fetched from an endpoint
Paging through a large dataset
Filtering data
Performing actions with render props
The following screenshot shows how the new component will look:

Figure 10.1 – The new CustomerSearch component
Figure 10.1 – The new CustomerSearch component

By the end of the chapter, you’ll have built a relatively complex component using all the techniques you’ve learned so far.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter10

Displaying tabular data fetched from an endpoint
In this section, we’ll get the basic form of the table in place, with an initial set of data retrieved from the server when the component is mounted.

The server application programming interface (API) supports GET requests to /customers. There is a searchTerm parameter that takes the string the user is searching for. There is also an after parameter that is used to retrieve the next page of results. The response is an array of customers, as shown here:


[{ id: 123, firstName: "Ashley"}, ... ]
Sending a request to /customers with no parameters will return the first 10 of our customers, in alphabetical order by first name.

This gives us a good place to start. When the component mounts, we’ll perform this basic search and display the results in a table.

SKIPPING THE STARTING POINT

If you’re following along using the GitHub repository, be aware that this chapter starts with a barebones CustomerSearch component already implemented, and it has already been hooked up to the App component. The component is displayed by clicking on the Search appointments button in the top menu.

Let’s start with our first test for the new CustomerSearch component. Follow these steps:

Open test/CustomerSearch.test.js and add the first test. It checks that a table has been rendered with the four headings that we want to see. The code is illustrated in the following snippet:
it("renders a table with four headings", async () => {

  await renderAndWait(<CustomerSearch />);

  const headings = elements("table th");

  expect(textOf(headings)).toEqual([

    "First name",

    "Last name",

    "Phone number",

    "Actions",

  ]);

});

That test should be simple to pass with the following definition for CustomerSearch in src/CustomerSearch.js:
export const CustomerSearch = () => (

  <table>

    <thead>

      <tr>

        <th>First name</th>

        <th>Last name</th>

        <th>Phone number</th>

        <th>Actions</th>

      </tr>

    </thead>

  </table>

);

In order to display data, the component will need to make a GET request. Write out this next test, which specifies that behavior:
it("fetches all customer data when component mounts", async () => {

  await renderAndWait(<CustomerSearch />);

  expect(global.fetch).toBeCalledWith("/customers", {

    method: "GET",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" },

  });

});

To make that pass, add a useEffect hook to the component that performs the search. We need to use the same useEffect ceremony that we’ve seen before, using an inline function to ensure we don’t return a value and passing an empty array to the dependency list, which ensures the effect only runs when the component is first mounted. The code is illustrated in the following screenshot:
export const CustomerSearch = () => {

  useEffect(() => {

    const fetchData = async () =>

      await global.fetch("/customers", {

        method: "GET",

        credentials: "same-origin",

        headers: {

          "Content-Type": "application/json"

        },

      });

    fetchData();

  }, []);

  return (

    ...

  )

};

Now, it’s time to code what happens depending on the data returned. We’ll start by figuring out the display of a single row of data. Add a definition of oneCustomer at the top of the file, above the describe block, as follows:
const oneCustomer = [

  {

    id: 1,

    firstName: "A",

    lastName: "B",

    phoneNumber: "1"

  },

];

Make use of that definition in the next test, shown in the following code snippet, which verifies that the component displays all the customer data for a single customer row:
it("renders all customer data in a table row", async () => {

  global.fetch.mockResolvedValue(

    fetchResponseOk(oneCustomer)

  );

  await renderAndWait(<CustomerSearch />);

  const columns = elements("table > tbody > tr > td");

  expect(columns[0]).toContainText("A");

  expect(columns[1]).toContainText("B");

  expect(columns[2]).toContainText("1");

});

To make this pass, we’ll need to use component state to pass data back from the useEffect hook into the next render cycle. Create a new state variable, customers, which has an initial value of the empty array ([]), as follows:
const [customers, setCustomers] = useState([]);

Save the results of the search into customers by modifying the definition of useEffect, as shown here:
const fetchData = async () => {

  const result = await global.fetch(...);

  setCustomers(await result.json());

};

We’re ready to display the data. We’ll do that with a new CustomerRow component that is responsible for displaying a single row of customer information. Add its implementation above the definition of CustomerSearch. Notice here how the final column is blank; it will hold action buttons that perform various operations on the specific customer record. We’ll use a separate test later to fill out that functionality:
const CustomerRow = ({ customer }) => (

  <tr>

    <td>{customer.firstName}</td>

    <td>{customer.lastName}</td>

    <td>{customer.phoneNumber}</td>

    <td />

  </tr>

);

All that’s left is to make use of this new component in CustomerSearch. Add the following tbody element, which renders CustomerRow for the first customer, if it exists. After adding this code, your test should now be passing:
return (

  <table>

    <thead>

      ...

    </thead>

    <tbody>

      {customers[0] ? (

        <CustomerRow customer={customers[0]} />

      ) : null}

    </tbody>

  </table>

);

For the final test in this section, let’s add a test to show that this works for multiple customers. For that, we need a new result set: twoCustomers. This can be placed at the top of the file, after oneCustomer, as shown in the following code snippet:
const twoCustomers = [

  {

    id: 1,

    firstName: "A",

    lastName: "B",

    phoneNumber: "1"

  },

  {

    id: 2,

    firstName: "C",

    lastName: "D",

    phoneNumber: "2"

  }

];

Then, add a test that makes use of this and checks that two rows are rendered, as follows:
it("renders multiple customer rows", async () => {

  global.fetch.mockResolvedValue(

    fetchResponseOk(twoCustomers)

  );

  await renderAndWait(<CustomerSearch />);

  const rows = elements("table tbody tr");

  expect(rows[1].childNodes[0]).toContainText("C");

});

Making this pass is a one-liner; change the JSX to map over each customer, instead of pulling out just the first customer:
<tbody>

  {customers.map(customer => (

     <CustomerRow

       customer={customer}

       key={customer.id}

     />

    )

  )}

</tbody>

This gives us a great base to build on for the remaining functionality we’ll build in this chapter.

In the next section, we’ll introduce the ability to move between multiple pages of search results.

Paging through a large dataset
By default, our endpoint returns 10 records. To get the next 10 records, we can page through the result set by using the after parameter, which represents the last customer identifier seen. The server will skip through results until it finds that ID and returns results from the next customer onward.

We’ll add Next and Previous buttons that will help us move between search results. Clicking Next will take the ID of the last customer record currently shown on the page and send it as the after parameter to the next search request.

To support Previous, we’ll need to maintain a stack of after IDs that we can pop each time the user clicks Previous.

Adding a button to move to the next page
Let’s start with the Next button, which the user can click to bring them to the next page of results. Since we’re going to be dealing with multiple buttons on the screens, we’ll build a new buttonWithLabel helper that will match a button with that label. Follow these steps:

In test/reactTestExtensions.js, add the following new helper function at the bottom of the file:
export const buttonWithLabel = (label) =>

  elements("button").find(

    ({ textContent }) => textContent === label

);

Back in test/CustomerSearch.test.js, update the import statement to include this new helper function, like so:
import {

  ...,

  buttonWithLabel,

} from "./reactTestExtensions";

Write the following test, which will let us get a Next button onto the page:
it("has a next button", async () => {

  await renderAndWait(<CustomerSearch />);

  expect(buttonWithLabel("Next")).not.toBeNull();

});

Create a SearchButtons component that renders the Next button in a menu element, just as we did in App. We’ll be expanding this menu bar with more buttons in subsequent tests. The code is illustrated here:
const SearchButtons = () => (

  <menu>

    <li>

      <button>Next</button>

    </li>

  </menu>

);

Now, render that in CustomerSearch, above the table, as follows:
return (

  <>

    <SearchButtons />

    <table>

      ...

    </table>

  </>

);

When the button is clicked, we want to take the last customer ID already displayed and send that back to the server. To make that choice obvious in our tests, we’ll use a new return value named tenCustomers, which mimics the default number of records coming back from the server API. Place this definition of tenCustomers at the top of the file, next to your other customer definitions, like so:
const tenCustomers =

  Array.from("0123456789", id => ({ id })

);

MAKING GOOD USE OF ARRAY.FROM

This definition uses a “clever” version of the Array.from function that takes each character of the string and creates an object using that character as input. We end up with 10 objects, each with an id property ranging from 0 to 9.

The next test checks that when the Next button is clicked, the component makes a new GET request with the last seen customer ID. Given our previous definition of tenCustomers, that is the customer with ID 9. Notice in the following code snippet how toHaveBeenLastCalledWith is needed since this will be the second call to global.fetch:
it("requests next page of data when next button is clicked", async () => {

  global.fetch.mockResolvedValue(

    fetchResponseOk(tenCustomers)

  );

  await renderAndWait(<CustomerSearch />);

  await clickAndWait(buttonWithLabel("Next"));

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers?after=9",

    expect.anything()

  );

});

AVOIDING UNNECESSARY FIELDS TO HIGHLIGHT IMPORTANT IMPLICATIONS

The tenCustomers value is only a partial definition for each customer: only the id property is included. That’s not lazy: it’s intentional. Because the logic of taking the last ID is non-obvious, it’s important to highlight the id property as the key feature of this flow. We won’t worry about the other fields because our previous tests check their correct usage.

To make this pass, define a handler for the Next button that performs the fetch request. It calculates the after request parameter by taking the last customer in the customers state variable, as illustrated in the following code snippet:
const handleNext = useCallback(() => {

  const after = customers[customers.length - 1].id;

  const url = `/customers?after=${after}`;

  global.fetch(url, {

    method: "GET",

    credentials: "same-origin",

    headers: { "Content-Type": "application/json" }

  });

}, [customers]);

Give SearchButtons a handleNext prop and set that as the onClick handler on the button, like so:
const SearchButtons = ({ handleNext }) => (

  <menu>

    <li>

      <button onClick={handleNext}>Next</button>

    </li>

  </menu>

);

Hook the handler up to SearchButtons, as follows. After this change, your test should be passing:
<SearchButtons handleNext={handleNext} />

Continue by adding the following test. It sets up two fetch responses using a sequence of mockResolvedValueOnce followed by mockResolvedValue. The second response only contains one record. The test asserts that this record is displayed after pressing the Next button:
it("displays next page of data when next button is clicked", async () => {

  const nextCustomer = [{ id: "next", firstName: "Next" }];

  global.fetch

    .mockResolvedValueOnce(

      fetchResponseOk(tenCustomers)

    )

    .mockResolvedValue(fetchResponseOk(nextCustomer));

  await renderAndWait(<CustomerSearch />);

  await clickAndWait(buttonWithLabel("Next"));

  expect(elements("tbody tr")).toHaveLength(1);

  expect(elements("td")[0]).toContainText("Next");

});

To make this pass, modify handleNext to save its response into the customers state variable, as follows:
const handleNext = useCallback(async () => {

  ...

  const result = await global.fetch(...);

  setCustomers(await result.json());

}, [customers]);

That’s it for our Next button. Before we move on to the Previous button, we need to correct a design issue.

Adjusting the design
Look here at the similarities between the handleNext and fetchData functions. They are almost identical; the only place they differ is in the first parameter to the fetch call. The handleNext function has an after parameter; fetchData has no parameters:


const handleNext = useCallback(async () => {
  const after = customers[customers.length - 1].id;
  const url = `/customers?after=${after}`;
  const result = await global.fetch(url, ...);
  setCustomers(await result.json());
}, [customers]);
const fetchData = async () => {
  const result = await global.fetch(`/customers`, ...);
  setCustomers(await result.json());
};
We will be adding a Previous button, which would result in further duplication if we carried on with this same design. But there’s an alternative. We can take advantage of the useEffect hook’s ability to rerun when the state changes.

We will introduce a new state variable, queryString, which handleNext will update and useEffect will listen for.

Let’s do that now. Proceed as follows:

Add that new variable now at the top of the CustomerSearch component, as shown in the following code snippet. Its initial value is the empty string, which is important:
const [queryString, setQueryString] = useState("");

Replace handleNext with the following function:
const handleNext = useCallback(() => {

  const after = customers[customers.length - 1].id;

  const newQueryString = `?after=${after}`;

  setQueryString(newQueryString);

}, [customers]);

Update useEffect with the following definition, appending queryString to the Uniform Resource Locator (URL). Your tests should still be passing at this point:
useEffect(() => {

  const fetchData = async () => {

    const result = await global.fetch(

      `/customers${queryString}`,

      ...

    );

    setCustomers(await result.json());

  };

  fetchData();

}, [queryString]);

That’s it for the Next button: you’ve seen how to write elegant tests for a complex piece of API orchestration logic, and we’ve refactored our production code to be elegant, too.

Adding a button to move to the previous page
Let’s move on to the Previous button:

Write out the following test:
it("has a previous button", async () => {

  await renderAndWait(<CustomerSearch />);

  expect(buttonWithLabel("Previous")).not.toBeNull();

});

Make that pass by modifying SearchButtons to include the following button, just before the Next button:
<menu>

  <li>

    <button>Previous</button>

  </li>

  ...

</menu>

The next test mounts the component, clicks Next, and then clicks Previous. It expects another call to the endpoint to have been made, but this time identical to the initial page—in other words, with no query string. The code is illustrated here:
it("moves back to first page when previous button is clicked", async () => {

  global.fetch.mockResolvedValue(

    fetchResponseOk(tenCustomers)

  );

  await renderAndWait(<CustomerSearch />);

  await clickAndWait(buttonWithLabel("Next"));

  await clickAndWait(buttonWithLabel("Previous"));

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers",

    expect.anything()

  );

});

To make this pass, start by defining a handlePrevious function, as follows:
const handlePrevious = useCallback(

  () => setQueryString(""),

  []

);

Modify SearchButtons to take a new handlePrevious prop, and set that as the onClick handler on the new button, like so:
const SearchButtons = (

  { handleNext, handlePrevious }

) => (

  <menu>

    <li>

      <button

        onClick={handlePrevious}

      >

        Previous

      </button>

    </li>

    ...

  </menu>

);

Hook up the handler to SearchButtons, like so. After this, your test should be passing:
<SearchButtons

  handleNext={handleNext}

  handlePrevious={handlePrevious}

/>

The next test is one that’ll require us to do some thinking. It simulates clicking Next twice, then clicking Previous once. For the second Next click, we need another set of customers. Add anotherTenCustomers just after the definition of tenCustomers, as follows:
const anotherTenCustomers =

  Array.from("ABCDEFGHIJ", id => ({ id }));

Now, add the next test, which checks that the Previous button still works after navigating to two more pages:
it("moves back one page when clicking previous after multiple clicks of the next button", async () => {

  global.fetch

    .mockResolvedValueOnce(

      fetchResponseOk(tenCustomers)

    )

    .mockResolvedValue(

      fetchResponseOk(anotherTenCustomers)

    );

  await renderAndWait(<CustomerSearch />);

  await clickAndWait(buttonWithLabel("Next"));

  await clickAndWait(buttonWithLabel("Next"));

  await clickAndWait(buttonWithLabel("Previous"));

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers?after=9",

    expect.anything()

  );

});

We’ll make this pass by maintaining a record of the query strings that were passed to the endpoint. For this specific test, we only need to know what the previous query string was. Add a new state variable to record that, as follows:
const [

  previousQueryString, setPreviousQueryString

] = useState("");

FORCING DESIGN ISSUES

You may recognize this as an overly complicated design. Let’s just go with it for now: we will simplify this again with another test.

Change handleNext to save the previous query string, making sure that this happens before the call to setQueryString. Include queryString in the array passed to the second parameter of useCallback so that this callback is regenerated each time the value of queryString changes. The code is illustrated in the following snippet:
const handleNext = useCallback(queryString => {

  ...

  setPreviousQueryString(queryString);

  setQueryString(newQueryString);

}, [customers, queryString]);

Now, handlePrevious can use this value as the query string to pass to fetchData, as illustrated here. Your test should be passing at this point:
const handlePrevious = useCallback(async () =>

  setQueryString(previousQueryString)

, [previousQueryString]);

That’s it for a basic Previous button implementation. However, what happens when we want to go back two or more pages? Our current design only has a “depth” of two additional pages. What if we want to support any number of pages?

Forcing design changes using tests
We can use a test to force the design issue. The process of TDD helps us to ensure that we always take time to think about the simplest solution that solves all tests. So, if we add one more test that highlights the limits of the current design, that test becomes a trigger for us to stop, think, and reimplement.

In this case, we can use a stack of previous query strings to remember the history of pages. We’ll replace our two state variables, queryString and previousQueryString, with a single state variable, queryStrings, which is a stack of all previous query strings.

Let’s get started with the test. Follow these steps:

Add this test, which asserts that the Previous button works for multiple presses:
it("moves back multiple pages", async () => {

  global.fetch

    .mockResolvedValue(fetchResponseOk(tenCustomers));

  await renderAndWait(<CustomerSearch />);

  await clickAndWait(buttonWithLabel("Next"));

  await clickAndWait(buttonWithLabel("Next"));

  await clickAndWait(buttonWithLabel("Previous"));

  await clickAndWait(buttonWithLabel("Previous"));

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers",

    expect.anything()

  );

});

For this to pass, start by adding a new queryStrings state variable, deleting queryString and previousQueryStrings, as follows:
const [queryStrings, setQueryStrings] = useState([]);

Change fetchData as follows. If there are entries in the queryStrings array, it sets queryString to the last entry, and that value is then passed to the fetch call. If there’s nothing in the array, then queryString will be an empty string:
useEffect(() => {

  const fetchData = async () => {

    const queryString =

      queryStrings[queryStrings.length - 1] || "";

    const result = await global.fetch(

      `/customers${queryString}`,

      ...

    );

    setCustomers(await result.json());

  };

  fetchData();

}, [queryStrings]);

Change handleNext as follows. It now appends the current query string to the previous query strings:
const handleNext = useCallback(() => {

  const after = customers[customers.length - 1].id;

  const newQueryString = `?after=${after}`;

  setQueryStrings([...queryStrings, newQueryString]);

}, [customers, queryStrings]);

Change handlePrevious as follows. The last value is popped off the query string stack:
const handlePrevious = useCallback(() => {

  setQueryStrings(queryStrings.slice(0, -1));

} [queryStrings]);

You now have a relatively complete implementation for the Next and Previous buttons. You’ve also seen how tests can help you alter your design as you encounter issues with it.

Next, we’ll continue building out our integration with the searchTerm parameter of the /customers HTTP endpoint.

Filtering data
In this section, we’ll add a textbox that the user can use to filter names. Each character that the user types into the search field will cause a new fetch request to be made to the server. That request will contain the new search term as provided by the search box.

The /customers endpoint supports a parameter named searchTerm that filters search results using those terms, as shown in the following code snippet:


GET /customers?searchTerm=Dan
[
  {
    firstName: "Daniel",
    ...
  }
  ...
]
Let’s start by adding a text field into which the user can input a search term, as follows:

Add the following test to the CustomerSearch test suite, just below the last test. It simply checks for a new field:
it("renders a text field for a search term", async () => {

  await renderAndWait(<CustomerSearch />);

  expect(element("input")).not.toBeNull();

});

In CustomerSearch, update your JSX to add that input element at the top of the component, as follows:
return (

  <>

    <input />

    ...

  </>

);

Next, we want to check that the placeholder attribute for that field is set. We can do this by running the following code:
it("sets the placeholder text on the search term field", async () => {

  await renderAndWait(<CustomerSearch />);

  expect(

    element("input").getAttribute("placeholder")

  ).toEqual("Enter filter text");

});

To make that pass, add the placeholder to the input element in your JSX, like so:
<input placeholder="Enter filter text" />

We want to hook this up to the DOM change event: we’ll make an async fetch request every time the value changes. For that, we’ll need a new helper. In test/reactTestExtensions.js, add the following definition for changeAndWait, just below the definition of change. This allows us to run effects when the DOM change event occurs:
export const changeAndWait = async (target, value) =>

  act(async () => change(target, value));

Import the new helper at the top of test/CustomerSearch.test.js, like so:
import {

  ...,

  changeAndWait,

} from "./reactTestExtensions";

Each time a new character is entered into the search box, we should perform a new search with whatever text is entered in the textbox. Add the following test:
it("performs search when search term is changed", async () => {

  await renderAndWait(<CustomerSearch />);

  await changeAndWait(element("input"), "name");

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers?searchTerm=name",

    expect.anything()

  );

});

Define a new searchTerm variable, as follows:
const [searchTerm, setSearchTerm] = useState("");

Add a new handler, handleSearchTextChanged, as follows. It stores the search term in the state because we’ll need to pull it back when moving between pages:
const handleSearchTextChanged = (

  { target: { value } }

) => setSearchTerm(value);

Hook it up to the input element, like so:
<input

  value={searchTerm}

  onChange={handleSearchTextChanged}

  placeholder="Enter filter text"

/>

Now, we can use the searchTerm variable in fetchData to fetch the updated set of customers from the server, as follows:
const fetchData = async () => {

  let queryString = "";

  if (searchTerm !== "") {

    queryString = `?searchTerm=${searchTerm}`;

  } else if (queryStrings.length > 0) {

    queryString =

     queryStrings[queryStrings.length - 1];

  }

  ...

};

Finally, we need to modify useEffect by adding searchTerm to the dependency list, as follows. After this, the test should be passing:
useEffect(() => {

...

}, [queryStrings, searchTerm]);

We need to ensure that hitting the Next button will maintain our search term. Right now, it won’t. We can use the following test to fix that:
it("includes search term when moving to next page", async () => {

  global.fetch.mockResolvedValue(

    fetchResponseOk(tenCustomers)

  );

  await renderAndWait(<CustomerSearch />);

  await changeAndWait(element("input"), "name");

  await clickAndWait(buttonWithLabel("Next"));

  expect(global.fetch).toHaveBeenLastCalledWith(

    "/customers?after=9&searchTerm=name",

    expect.anything()

  );

});

To make this pass, let’s force the behavior into fetchData with an addition to the if statement, as follows:
const fetchData = async () => {

  let queryString;

  if (queryStrings.length > 0 && searchTerm !== "") {

    queryString =

      queryStrings[queryStrings.length - 1]

      + `&searchTerm=${searchTerm}`;

  } else if (searchTerm !== '') {

    queryString = `?searchTerm=${searchTerm}`;

  } else if (queryStrings.length > 0) {

    queryString =

      queryStrings[queryStrings.length - 1];

  }

  ...

};

We’ve made this test pass... but this is a mess! Any if statement with so many moving parts (variables, operators, conditions, and so on) is a signal that the design isn’t as good as it can be. Let’s fix it.

Refactoring to simplify the component design
The issue is the queryString data structure and its historical counterpart, the queryStrings state variable. The construction is complex.

How about we just store the original data instead—the ID of the customer in the last table row? Then, we can construct the queryString data structure immediately before fetching, since in reality, queryString is an input to the fetch request only. Keeping the raw data seems like it will be simpler.

Let’s plan out our refactor. At each of the following stages, our tests should still be passing, giving us confidence that we’re still on the right path:

First, move the query string building logic from handleNext into fetchData, changing the values that are stored in queryStrings from query strings to customer IDs in the process.
Then, change the names of those variables, using your editor’s search and replace facility.
Finally, simplify the logic in fetchData.
Doesn’t sound so hard, does it? Let’s begin, as follows:

At the top of the component, replace the queryStrings variable with this new one:
const [lastRowIds, setLastRowIds] = useState([]);

Use your editor’s search and replace facility to change all occurrences of queryStrings to lastRowIds.
Likewise, change the call to setQueryStrings to a call to setLastRowIds. Your tests should still be passing at this point.
Delete the following line from handleNext:
const newQueryString = `?after=${after}`;

On the line below that, change the call to fetchData to pass in after instead of the now deleted newQueryString, as follows:
const handleNext = useCallback(() => {

  const after = customers[customers.length - 1].id;

  setLastRowIds([...lastRowIds, after]);

}, [customers, lastRowIds]);

In the same function, rename after currentLastRowId. Your tests should still be passing at this point.
It’s time to simplify the logic within fetchData. Create a searchParams function that will generate the search parameters for us, given values for after and searchTerm. This can be defined outside of your component. The code is illustrated here:
const searchParams = (after, searchTerm) => {

  let pairs = [];

  if (after) {

    pairs.push(`after=${after}`);

  }

  if (searchTerm) {

    pairs.push(`searchTerm=${searchTerm}`);

  }

  if (pairs.length > 0) {

    return `?${pairs.join("&")}`;

  }

  return "";

};

Finally, update fetchData to use this new function in place of the existing query string logic, as shown here. At this point, your tests should be passing, with a vastly simpler and easier-to-understand implementation:
const fetchData = async () => {

  const after = lastRowIds[lastRowIds.length - 1];

  const queryString = searchParams(after, searchTerm);

  const response = await global.fetch(...);

};

You’ve now built a functional search component. You introduced a new helper, changeAndWait, and extracted out a searchParams function that could be reused in other places.

Next, we’ll add a final mechanism to the CustomerSearch component.

Performing actions with render props
Each row of the table will hold a Create appointment action button. When the user has found the customer that they are searching for, they can press this button to navigate to the AppointmentForm component, creating an appointment for that customer.

We’ll display these actions by using a render prop that is passed to CustomerSearch. The parent component—in our case, App—uses this to insert its own rendering logic into the child component. App will pass a function that displays a button that causes a view transition in App itself.

Render props are useful if the child component should be unaware of the context it’s operating in, such as the workflow that App provides.

UNNECESSARILY COMPLEX CODE ALERT!

The implementation you’re about to see could be considered more complex than it needs to be. There are other approaches to solving this problem: you could simply have CustomerSearch render AppointmentFormLoader directly, or you could allow CustomerSearch to render the button and then invoke a callback such as onSelect(customer).

Render props are probably more useful to library authors than to any application authors since library components can’t account for the context they run within.

The testing techniques we need for render props are much more complex than anything we’ve seen so far, which you can take as another sign that there are “better” solutions.

To begin with, we’ll add the renderCustomerActions prop to CustomerSearch and render it in a new table cell. Follow these steps:

In test/CustomerSearch.test.js, write the following test:
it("displays provided action buttons for each customer", async () => {

  const actionSpy = jest.fn(() => "actions");

  global.fetch.mockResolvedValue(

   fetchResponseOk(oneCustomer)

  );

  await renderAndWait(

    <CustomerSearch

      renderCustomerActions={actionSpy}

    />

  );

  const rows = elements("table tbody td");

  expect(rows[rows.length - 1])

    .toContainText("actions");

});

Set a default renderCustomerActions prop so that our existing tests won’t start failing when we begin using the new prop, as follows. This goes at the bottom of src/CustomerSearch.js:
CustomerSearch.defaultProps = {

  renderCustomerActions: () => {}

};

Destructure that prop in the top line of the CustomerSearch component, like so:
export const CustomerSearch = (

  { renderCustomerActions }

) => {

  ...

};

Pass it through to CustomerRow, like so:
<CustomerRow

  customer={customer}

  key={customer.id}

  renderCustomerActions={renderCustomerActions}

/>

In CustomerRow, update the fourth td cell to call this new prop, as follows:
const CustomerRow = (

  { customer, renderCustomerActions }

) => (

  <tr>

    <td>{customer.firstName}</td>

    <td>{customer.lastName}</td>

    <td>{customer.phoneNumber}</td>

    <td>{renderCustomerActions()}</td>

  </tr>

);

For the next test, we want to check that this render prop receives the specific customer record that applies to that row. Here’s how we can do this:
it("passes customer to the renderCustomerActions prop", async () => {

  const actionSpy = jest.fn(() => "actions");

  global.fetch.mockResolvedValue(

    fetchResponseOk(oneCustomer)

  );

  await renderAndWait(

    <CustomerSearch

      renderCustomerActions={actionSpy}

    />

  );

  expect(actionSpy).toBeCalledWith(oneCustomer[0]);

});

To make this pass, all you have to do is update the JSX call that you just wrote to include the customer as a parameter, as follows:
<td>{renderCustomerActions(customer)}</td>

That’s all there is to invoking the render prop inside the CustomerSearch component. Where it gets difficult is test-driving the implementation of the render prop itself, in the App component.

Testing render props in additional render contexts
Recall that the App component has a view state variable that determines which component the user is currently viewing on the screen. If they are searching for customers, then view will be set to searchCustomers.

Pressing the Create appointment button on the CustomerSearch component should have the effect of setting view to addAppointment, causing the user’s screen to hide the CustomerSearch component and show the AppointmentForm component.

We also need to set the App component’s customer state variable to the customer that the user just selected in the CustomerSearch component.

All of this will be done in the render prop that App passes to customer.

The big question is: how do we test-drive the implementation of this render prop?

There are a few different ways we could do it:

You could render an actual CustomerSearch component within your App components, navigate to a customer, and click the Create appointment button. While this is simple, it also introduces a dependency in your test suite, increasing its surface area. And since your current App tests have a module-level mock for CustomerSearch, you’d need to create a new test suite for those tests, which increases maintenance overhead.
You could modify the CustomerSearch mock to have some mechanism to trigger a render prop. This involves making the mock definition more complex than the standard form. That is an immediate red flag for me, for the reasons stated in Chapter 7, Testing useEffect and Mocking Components. This solution moves to the back of the pile.
You could pull out the render prop from your CustomerSearch component, render it, then find the Create appointment button and click it. This is the approach we’ll continue with.
If we use our render and renderAndWait functions to render this additional prop, it will replace the rendered App component. We would then click the button and we’d observe nothing happening because App has gone.

What we need is a second React root that can be used to just render that additional piece of the DOM. Our test can simply pretend that it is the CustomerSearch component.

To do this, we need a new render component that we’ll call renderAdditional. Let’s add that now and then write our test, as follows:

In test/reactTestExtensions.js, add the following function definition, just below the definition of renderAndWait:
export const renderAdditional = (component) => {

  const container = document.createElement("div");

  act(() =>

    ReactDOM.createRoot(container).render(component)

  );

  return container;

};

In test/App.test.js, update the import statement to pull in this new extension, like so:
import {

  ...,

  renderAdditional,

} from "./reactTestExtensions";

Locate the search customers nested describe block and add a searchFor helper function that calls the render prop for the supplied customer, as follows:
const searchFor = (customer) =>

  propsOf(CustomerSearch)

    .renderCustomerActions(customer);

Now, add the test. This renders the prop and checks that a button has been rendered, as illustrated in the following code snippet:
it("passes a button to the CustomerSearch named Create appointment", async () => {

  render(<App />);

  navigateToSearchCustomers();

  const buttonContainer =

    renderAdditional(searchFor());

  expect(

    buttonContainer.firstChild

  ).toBeElementWithTag("button");

  expect(

    buttonContainer.firstChild

  ).toContainText("Create appointment");

});

In src/App.js, add the following function just above the returned JSX:
const searchActions = () => (

  <button>Create appointment</button>

);

Set the prop on CustomerSearch, as follows. Your test should pass after this change:
case "searchCustomers":

  return (

    <CustomerSearch

      renderCustomerActions={searchActions}

    />

  );

Back in test/CustomerSearch.test.js, add the next test, as follows. This uses the same helper function, but this time clicks the button and verifies that AppointmentFormLoader was shown with the correct customer ID:
it("clicking appointment button shows the appointment form for that customer", async () => {

  const customer = { id: 123 };

  render(<App />);

  navigateToSearchCustomers();

  const buttonContainer = renderAdditional(

    searchFor(customer)

  );

  click(buttonContainer.firstChild);

  expect(

   element("#AppointmentFormLoader")

  ).not.toBeNull();

  expect(

    propsOf(AppointmentFormLoader).original

  ).toMatchObject({ customer: 123 });

});

To make that pass, update searchActions in src/App.js to use the customer parameter that will be passed to it by CustomerSearch, as follows:
const searchActions = (customer) => (

  <button

    onClick={

      () => transitionToAddAppointment(customer)

    }>

    Create appointment

</button>

);

That’s all there is to it: you’ve now used renderAdditional to trigger your render props and check that it works as expected.

This technique can be very handy when working with third-party libraries that expect you to pass render props.

That completes this feature; go ahead and manually test if you’d like to see it all in action.

Summary
This chapter has explored building out a component with some complex user interactions between the user interface and an API. You’ve created a new table component and integrated it into the existing application workflow.

You have seen how to make large changes to your component’s implementation, using your tests as a safety mechanism.

You have also seen how to test render props using an additional render root—a technique that I hope you don’t have to use too often!

In the next chapter, we’ll use tests to integrate React Router into our application. We’ll continue with the CustomerSearch component by adding the ability to use the browser location bar to specify search criteria. That will set us up nicely for introducing Redux and GraphQL later on.

Exercises
Disable the Previous button if the user is on the first page and disable the Next button if the current listing has fewer than 10 records on display.
Extract the searchParams function into a separate module that handles any number of parameters and uses the encodeURIComponent JavaScript function to ensure the values are encoded correctly.
The /customers endpoint supports a limit parameter that allows you to specify the maximum number of records that are returned. Provide a mechanism for the user to change the limit on each page.

