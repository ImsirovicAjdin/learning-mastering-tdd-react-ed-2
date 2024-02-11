## If you compare our select box tests to those of the text box, you will see that it’s a similar pattern but with a couple of additional techniques: we used defaultProps to separate the definition of production data from test behavior, and we defined a couple of localized helper methods, labelsOfAllOptions and findOption, to help keep our tests short.

Let’s move on to the next item in our form: the time of the appointment.

## Constructing a calendar view
In this section, we’ll learn how to use our existing helpers, such as element and elements, mixed with CSS selectors, to select specific elements we’re interested in within our HTML layout.

But first, let’s start with some planning.

We’d like AppointmentForm to display available time slots over the next 7 days as a grid, with columns representing days and rows representing 30-minute time slots, just like a standard calendar view. The user will be able to quickly find a time slot that works for them and then select the right radio button before submitting the form:

![images/Figure_5.01_B18423 (1).jpg](Figure 5.1 – The visual design of our calendar view)

Here’s an example of the HTML structure that we’re aiming to build. We can use this as a guide as we write out our React component:


<table id="time-slots">
  <thead>
    <tr>
      <th></th>
      <th>Oct 11</th>
      <th>Oct 12</th>
      <th>Oct 13</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>9:00</th>
      <td>
        <input type="option" name="timeSlot" value="..." />
      </td>
    </tr>
    <!-- ... two more cells ... -->
  </tbody>
</table>
In the next few sections, we’ll test-drive the table element itself, then build a header column for times of the day, and then a header for days of the week.

Adding the table
Let’s begin by building table itself:

Create a nested describe block with a new test at the bottom of test/AppointmentForm.test.js:
describe("time slot table", () => {
  it("renders a table for time slots with an id", () => {
    render(
      <AppointmentForm original={blankAppointment} />
    );
    expect(
      element("table#time-slots")
    ).not.toBeNull();
  });
});

You’ll need to pull the element helper into your imports:
import {
  initializeReactContainer,
  render,
  field,
  form,
  element,
} from "./reactTestExtensions";

**My npm test results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/AppointmentForm.test.js
  ● AppointmentForm › time slot table › renders a table for time slots with an id

    expect(received).not.toBeNull()

    Received: null

      77 |             expect(
      78 |                 element("table#time-slots")
    > 79 |             ).not.toBeNull();
         |                   ^
      80 |         });
      81 |     });
      82 | });

      at Object.toBeNull (test/AppointmentForm.test.js:79:19)

 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toHaveClass.test.js

Test Suites: 1 failed, 5 passed, 6 total
Tests:       1 failed, 74 passed, 75 total
Snapshots:   0 total
Time:        1.72 s
Ran all test suites.
```

## To make that pass, move to src/AppointmentForm.js and define a new TimeSlotTable component, above the definition of AppointmentForm. We don’t need to mark this one as an export as it will only be referenced by AppointmentForm:
const TimeSlotTable = () => <table id="time-slots" />;

WHY ADD AN ID?

The ID is important because that’s what the application’s CSS uses to find the table element. Although it’s not covered in this book, if you’re using CSS and it defines selectors based on element IDs, then you should treat those IDs as a kind of technical specification that your code must satisfy. That’s why we write unit tests for them.

Add this component to your AppointmentForm JSX, right at the bottom, just below the select tag:
<form>

  ...

  <TimeSlotTable />

</form>;

Run the tests and verify that they are all passing.

That’s all there is to the table element. Now, let’s get some data into the first column.

MY TESTS PASS NOW.


## Adding a header column
For the next test, we’ll test the left-hand header column that displays a list of times. We’ll introduce two new props, `salonOpensAt` and `salonClosesAt`, which inform the component of which time to show each day. Follow these steps:

Add the following test:
```
it("renders a time slot for every half an hour between open and close times", () => {
  render(
    <AppointmentForm
      original={blankAppointment}
      salonOpensAt={9}
      salonClosesAt={11}
    />
  );
  const timesOfDayHeadings = elements("tbody >* th");
  expect(timesOfDayHeadings[0]).toContainText(
    "09:00"
  );
  expect(timesOfDayHeadings[1]).toContainText(
    "09:30"
  );
  expect(timesOfDayHeadings[3]).toContainText(
    "10:30"
  );
});
```

**My npm test results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentsDayView.test.js
 PASS  test/CustomerForm.test.js
 PASS  test/matchers/toContainText.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toHaveClass.test.js
 FAIL  test/AppointmentForm.test.js
  ● AppointmentForm › time slot table › renders a time slot for every half an hour between open and close times

    ReferenceError: elements is not defined

      87 |                 />
      88 |             );
    > 89 |             const timesOfDayHeadings = elements("tbody >* th");
         |                                        ^
      90 |             expect(timesOfDayHeadings[0]).toContainText(
      91 |                 "09:00"
      92 |             );

      at Object.elements (test/AppointmentForm.test.js:89:40)

Test Suites: 1 failed, 5 passed, 6 total
Tests:       1 failed, 75 passed, 76 total
Snapshots:   0 total
Time:        1.761 s
Ran all test suites.
```

## ASSERTING ON ARRAY PATTERNS

In this example, we are checking `textContent` on three array entries, even though there are four entries in the array.

**Properties that are the same for all array entries only need to be tested on one entry. Properties that vary per entry, such as `textContent`, need to be tested on two or three entries, depending on how many you need to test a pattern.**

**For this test, I want to test that it starts and ends at the right time and that each time slot increases by 30 minutes. I can do that with assertions on array entries 0, 1, and 3.**

**This test “breaks” our rule of one expectation per test. However, in this scenario, I think it’s okay. An alternative approach might be to use the `textOf` helper instead.**

You’ll need to pull the `elements` helper into your imports:
import {
  initializeReactContainer,
  render,
  field,
  form,
  element,
  elements,
} from "./reactTestExtensions";

To make this pass, add the following functions above the TimeSlotTable component. They calculate the list of daily time slots:
const timeIncrements = (
  numTimes,
  startTime,
  increment
) =>
  Array(numTimes)
    .fill([startTime])
    .reduce((acc, _, i) =>
      acc.concat([startTime + i * increment])
    );
const dailyTimeSlots = (
  salonOpensAt,
  salonClosesAt
) => {
  const totalSlots =
    (salonClosesAt – salonOpensAt) * 2;
  const startTime = new Date()
    .setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return timeIncrements(
    totalSlots,
    startTime,
    increment
  );
};
Define the toTimeValue function, as follows:
const toTimeValue = timestamp =>

  new Date(timestamp).toTimeString().substring(0, 5);

Now, you can make use of those two functions. Update TimeSlotTable so that it reads as follows:
const TimeSlotTable = ({
  salonOpensAt,
  salonClosesAt
}) => {
  const timeSlots = dailyTimeSlots(
    salonOpensAt,
    salonClosesAt);
  return (
    <table id="time-slots">
      <tbody>
        {timeSlots.map(timeSlot => (
          <tr key={timeSlot}>
            <th>{toTimeValue(timeSlot)}</th>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

In the JSX for AppointmentForm, pass the salonOpensAt and salonClosesAt props to TimeSlotTable:
export const AppointmentForm = ({
  original,
  selectableServices,
  service,
  salonOpensAt,
  salonClosesAt
}) => (
  <form>
    ...
    <TimeSlotTable
      salonOpensAt={salonOpensAt}
      salonClosesAt={salonClosesAt} />
  </form>
);

Fill in defaultProps for both salonOpensAt and salonsCloseAt:
AppointmentForm.defaultProps = {
  salonOpensAt: 9,
  salonClosesAt: 19,
  selectableServices: [ ... ]
};

Run the tests and make sure everything is passing.

**My npm test results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/CustomerForm.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 6 passed, 6 total
Tests:       76 passed, 76 total
Snapshots:   0 total
Time:        1.756 s
Ran all test suites.
```

## That’s all there is to adding the left-hand side column of headings.

## Adding a header row
Now, what about the column headings? In this section, we’ll create a new top row that contains these cells, making sure to leave an empty cell in the top-left corner, since the left column contains the time headings and not data. Follow these steps:

Add the following test:
it("renders an empty cell at the start of the header row", () =>
  render(
    <AppointmentForm original={blankAppointment} />
  );
  const headerRow = element("thead > tr");
  expect(headerRow.firstChild).toContainText("");
});


**My npm test results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 FAIL  test/AppointmentForm.test.js
  ● AppointmentForm › time slot table › renders an empty cell at the start of the header row

    TypeError: Cannot read properties of null (reading 'firstChild')

      104 |             );
      105 |             const headerRow = element("thead > tr");
    > 106 |             expect(headerRow.firstChild).toContainText("");
          |                              ^
      107 |         })
      108 |     });
      109 | });

      at Object.firstChild (test/AppointmentForm.test.js:106:30)

 PASS  test/AppointmentsDayView.test.js
 PASS  test/CustomerForm.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 1 failed, 5 passed, 6 total
Tests:       1 failed, 76 passed, 77 total
Snapshots:   0 total
Time:        1.813 s
Ran all test suites.
```

## Modify the table JSX so that it includes a new table row:
<table id="time-slots">
  <thead>
    <tr>
      <th />
    </tr>
  </thead>
  <tbody>
    ...
  </tbody>
</table>

**My npm test results:**
```
npm test

> my-mastering-tdd@1.0.0 test
> jest

 PASS  test/AppointmentForm.test.js
 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 6 passed, 6 total
Tests:       77 passed, 77 total
Snapshots:   0 total
Time:        1.723 s
Ran all test suites.
```
