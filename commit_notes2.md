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
