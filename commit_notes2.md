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

## For the rest of the header row, we’ll show the 7 days starting from today. AppointmentForm will need to take a new prop, today, which is the first day to display within the table. The value that’s assigned to that prop is stored in a variable named specificDate. This name has been chosen to highlight the fact that this chosen date affects the rendered day output, for example, "Sat 01":
it("renders a week of available dates", () => {
  const specificDate = new Date(2018, 11, 1);
  render(
    <AppointmentForm
      original={blankAppointment}
      today={specificDate}
    />
  );
  const dates = elements(
    "thead >* th:not(:first-child)"
  );
  expect(dates).toHaveLength(7);
  expect(dates[0]).toContainText("Sat 01");
  expect(dates[1]).toContainText("Sun 02");
  expect(dates[6]).toContainText("Fri 07");
});

WHY PASS A DATE INTO THE COMPONENT?

When you’re testing a component that deals with dates and times, you almost always want a way to control the time values that the component will see, as we have in this test. You’ll rarely want to just use the real-world time because that can cause intermittent failures in the future. For example, your test may assume that a month has at least 30 days in the year, which is only true for 11 out of 12 months. It’s better to fix the month to a specific month rather than have an unexpected failure when February comes around.

For an in-depth discussion on this topic, take a look at https://reacttdd.com/controlling-time.

To make that pass, first, create a function that lists the 7 days we’re after, in the same way we did with time slots. You can place this just after the toTimeValue function:
const weeklyDateValues = (startDate) => {

  const midnight = startDate.setHours(0, 0, 0, 0);

  const increment = 24 * 60 * 60 * 1000;

  return timeIncrements(7, midnight, increment);

};

Define the toShortDate function, which formats our date as a short string:
const toShortDate = (timestamp) => {

  const [day, , dayOfMonth] = new Date(timestamp)

    .toDateString()

    .split(" ");

  return `${day} ${dayOfMonth}`;

};

Modify TimeSlotTable so that it takes the new today prop and uses the two new functions:
const TimeSlotTable = ({

  salonOpensAt,

  salonClosesAt,

  today

}) => {

  const dates = weeklyDateValues(today);

  ...

  return (

    <table id="time-slots">

      <thead>

        <tr>

          <th />

          {dates.map(d => (

            <th key={d}>{toShortDate(d)}</th>

          ))}

        </tr>

      </thead>

      ...

    </table>

  )

};

Within AppointmentForm, pass the today prop from AppointmentForm into TimeSlotTable:
export const AppointmentForm = ({

  original,

  selectableServices,

  service,

  salonOpensAt,

  salonClosesAt,

  today

}) => {

  ...

  return <form>

    <TimeSlotTable

      ...

      salonOpensAt={salonOpensAt}

      salonClosesAt={salonClosesAt}

      today={today}

    />

  </form>;

};

Finally, add a defaultProp for today. Set it to the current date by calling the Date constructor:
AppointmentForm.defaultProps = {

  today: new Date(),

  ...

}

Run the tests. They should be all green.
With that, we’re done with our table layout. You’ve seen how to write tests that specify the table structure itself and fill in both a header column and a header row. In the next section, we’ll fill in the table cells with radio buttons.

**My npm test results:**
```
npm te
st

> my-mastering-tdd@1.0.0 test
> jest

Determining test suites to r
 PASS  test/AppointmentForm.test.js
 PASS  test/CustomerForm.test.js
 PASS  test/AppointmentsDayView.test.js
 PASS  test/matchers/toBeInputFieldOfType.test.js
 PASS  test/matchers/toHaveClass.test.js
 PASS  test/matchers/toContainText.test.js

Test Suites: 6 passed, 6 total
Tests:       78 passed, 78 total
Snapshots:   0 total
Time:        1.946 s
Ran all test suites.
```

## Test-driving radio button groups
Now that we have our table with headings in place, it’s time to add radio buttons to each of the table cells. Not all cells will have radio buttons – only those that represent an available time slot will have a radio button.

This means we’ll need to pass in another new prop to AppointmentForm that will help us determine which time slots to show. This prop is availableTimeSlots, which is an array of objects that list times that are still available. Follow these steps:

Add the following test, which establishes a value for the availableTimeSlots prop and then checks that radio buttons have been rendered for each of those slots:
it("renders radio buttons in the correct table cell positions", () => {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  const tomorrow = new Date(
    today.getTime() + oneDayInMs
  );
  const availableTimeSlots = [
    { startsAt: today.setHours(9, 0, 0, 0) },
    { startsAt: today.setHours(9, 30, 0, 0) },
    { startsAt: tomorrow.setHours(9, 30, 0, 0) },
  ];
  render(
    <AppointmentForm
      original={blankAppointment}
      availableTimeSlots={availableTimeSlots}
      today={today}
    />
  );
  expect(cellsWithRadioButtons()).toEqual([0, 7, 8]);
});
