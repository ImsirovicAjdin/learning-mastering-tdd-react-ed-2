# Part 4 - Behavior-Driven Development with Cucumber

# Chapter 18 - Adding Features Guided By Cucumber Tests

18
Adding Features Guided by Cucumber Tests
In the last chapter, we studied the basic elements of writing Cucumber tests and how to use Puppeteer to manipulate our UI. But we haven’t yet explored how these techniques fit into the wider development process. In this chapter, we’ll implement a new application feature, but starting the process with Cucumber tests. These will act as acceptance tests that our (imaginary) product owner can use to determine whether the software works as required.

ACCEPTANCE TESTING

An acceptance test is a test that a product owner or customer can use to decide whether they accept the delivered software. If it passes, they accept the software. If it fails, the developers must go back and adjust their work.

We can use the term Acceptance-Test-Driven Development (ATDD) to refer to a testing workflow that the whole team can participate in. Think of it as like TDD but it is done at the wider team level, with the product owner and customer involved in the cycle. Writing BDD tests using Cucumber is one way—but not the only way—that you can bring ATDD to your team.

In this chapter, we’ll use our BDD-style Cucumber tests to act as our acceptance tests.

Imagine that our product owner has seen the great work that we’ve done building Spec Logo. They have noted that the share screen functionality is good, but it could do with an addition: it should give the presenter the option of resetting their state before sharing begins, as shown:

Figure 18.1 – The new sharing dialog
Figure 18.1 – The new sharing dialog

The product owner has provided us with some Cucumber tests that are currently red for implementation—both the step definitions and the production code.

This chapter covers the following topics:

Adding Cucumber tests for a dialog box
Fixing Cucumber tests by test-driving production code
Avoiding timeouts in test code
By the end of the chapter, you’ll have seen more examples of Cucumber tests and how they can be used as part of your team’s workflow. You’ll also have seen how to avoid using specific timeouts within your code.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter18

Adding Cucumber tests for a dialog box
In this section, we’ll add a new Cucumber test that won’t yet pass.

Let’s start by taking a look at the new feature:

Open the features/sharing.feature file and take a look at the first feature that you’ve been given. Read through the steps and try to understand what our product owner is describing. The test covers quite a lot of behavior—unlike our unit tests. It tells a complete story:
Scenario: Presenter chooses to reset current state when sharing

  Given the presenter navigated to the application page

  And the presenter entered the following instructions at the prompt:

    | forward 10 |

    | right 90 |

  And the presenter clicked the button 'startSharing'

  When the presenter clicks the button 'reset'

  And the observer navigates to the presenter's sharing link

  Then the observer should see no lines

  And the presenter should see no lines

  And the observer should see the turtle at x = 0, y = 0, angle = 0

  And the presenter should see the turtle at x = 0, y = 0, angle = 0

The first Given phrase, the presenter navigated to the application page, already works, and you can verify this if you run npx cucumber-js.
The next step, the presenter entered the following instructions at the prompt, is very similar to a step from the last chapter. We could choose to extract the commonality here, just as we did with the browseToPageFor function; however, we’ll wait until our test and implementation are complete before refactoring. For now, we’ll just duplicate the code. Open features/support/sharing.steps.js and add the following step definition at the bottom of the code:
When(

  "the presenter entered the following instructions at the prompt:",

  async function(dataTable) {

    for (let instruction of dataTable.raw()) {

      await this.getPage("presenter").type(

       "textarea",

       `${instruction}\n`

      );

      await this.getPage(

        "presenter"

      ).waitForTimeout(3500);

    }

  }

);

Next up is a Given clause that we have already: the presenter clicked the button 'startSharing'. The line that appears after this is the first When clause, which will need to be implemented. Run npx cucumber-js and you’ll be given template code for this function. Copy and paste the template code into your step definition file, as shown in the following code block:
When(

  "the presenter clicks the button {string}",

  function (string) {

    // Write code here that turns the phrase above

    // into concrete actions

    return "pending";

  }

);

TWO WHEN PHRASES

This scenario has two When phrases, which is unusual. Just as with your unit tests in the Act phase, you generally want just one When phrase. However, since there are two users working together at this point, it makes sense to have a single action for both of them, so we’ll let our product owner off the hook on this occasion.

This step definition is very similar to the ones we’ve written before. Fill out the function as shown in the following code block. There is a new call to waitForSelector. This waits for the button to appear on the page before we continue, which gives the dialog time to render:
When(

  "the presenter clicks the button {string}",

  async function (

    buttonId

  ) {

    await this.getPage(

      "presenter"

    ).waitForSelector(`button#${buttonId}`);

    await this.getPage(

      "presenter"

    ).click(`button#${buttonId}`);

  }

);

The second When clause already has a definition from our previous test, so we move on to the Then clauses. The first is the observer should see no lines; run npx cucumber-js and copy and paste the template function that Cucumber provides, as shown in the following code block:
Then("the observer should see no lines", function () {

  // Write code here that turns the phrase above

  // into concrete actions

  return "pending";

});

For this step, we want to assert that there are no line elements on the page:
Then(

  "the observer should see no lines",

  async function () {

    const numLines = await this.getPage(

      "observer"

    ).$$eval("line", lines => lines.length);

    expect(numLines).toEqual(0);

  }

);

Running npx cucumber-js, you should see that this step passes, and the next one is very similar. Copy the step definition you just wrote and modify it to work for the presenter, as shown in the following code block. Again, we can clean up the duplication later:
Then(

  "the presenter should see no lines",

  async function () {

    const numLines = await this.getPage(

      "presenter"

    ).$$eval("line", lines => lines.length);

    expect(numLines).toEqual(0);

  }

);

Run Cucumber now, and you’ll see that this step fails; this is the first failure that we’ve got. It points to the specific change that we’ll need to make in the code base:
✖ And the presenter should see no lines

   Error: expect(received).toEqual(expected)

   Expected value to equal:

   0

   Received:

   1

Since we have hit a red step, we could now go back and start working on our code to make this green. However, because we just have two almost identical clauses to complete, I’m going to choose to complete these definitions before continuing. Cucumber tells us the template function that we should use, so add that now, as follows:
Then(

  "the observer should see the turtle at x = {int}, y = {int}, angle = {int}",

  function (int, int2, int3) {

    // Write code here that turns the phrase above

    // into concrete actions

    return "pending";

});

We need to define a couple of helpers that can tell us the current x, y, and angle values of the turtle. We need this because all we have is the SVG polygon element, which uses a points string and a transform string to position the turtle. Our helpers will take these strings and convert them back to numbers for us. As a reminder, here’s how the turtle is initially positioned:
<polygon

  points="-5,5, 0,-7, 5,5"

  fill="green"

  stroke-width="2"

  stroke="black"

  transform="rotate(90, 0, 0)" />

We can use the first points coordinate to calculate x and y, by adding 5 to the first number and subtracting 5 from the second. The angle can be calculated by taking the first parameter to rotate and subtracting 90. Create a new file named features/support/turtle.js, and then add the following two definitions:

export const calculateTurtleXYFromPoints = points => {

  const firstComma = points.indexOf(",");

  const secondComma = points.indexOf(

    ",",

    firstComma + 1

  );

  return {

    x:

      parseFloat(

        points.substring(0, firstComma)

      ) + 5,

    y:

      parseFloat(

        points.substring(firstComma + 1, secondComma)

      ) - 5

  };

};

export const calculateTurtleAngleFromTransform = (

  transform

) => {

  const firstParen = transform.indexOf("(");

  const firstComma = transform.indexOf(",");

  return (

    parseFloat(

      transform.substring(

        firstParen + 1,

        firstComma

      )

    ) - 90

  );

}

In feature/sharing.steps.js, update the step definition, as shown in the following code block:
Then(

  "the observer should see the turtle at x = {int}, y = {int}, angle = {int}",

  async function (

    expectedX, expectedY, expectedAngle

  ) {

    await this.getPage(

      "observer"

    ).waitForTimeout(4000);

    const turtle = await this.getPage(

      "observer"

    ).$eval(

      "polygon",

      polygon => ({

        points: polygon.getAttribute("points"),

        transform: polygon.getAttribute("transform")

      })

    );

    const position = calculateTurtleXYFromPoints(

      turtle.points

    );

    const angle = calculateTurtleAngleFromTransform(

      turtle.transform

    );

    expect(position.x).toBeCloseTo(expectedX);

    expect(position.y).toBeCloseTo(expectedY);

    expect(angle).toBeCloseTo(expectedAngle);

  }

);

Finally, repeat this step definition for the presenter, as follows:
Then(

  "the presenter should see the turtle at x = {int}, y = {int}, angle = {int}",

  async function (

    expectedX, expectedY, expectedAngle

  ) {

    await this.getPage(

      "presenter"

    ).waitForTimeout(4000);

    const turtle = await this.getPage(

      "presenter"

    ).$eval(

      "polygon",

      polygon => ({

        points: polygon.getAttribute("points"),

        transform: polygon.getAttribute("transform")

      })

    );

    const position = calculateTurtleXYFromPoints(   

      turtle.points

    );

    const angle = calculateTurtleAngleFromTransform(

      turtle.transform

    );

    expect(position.x).toBeCloseTo(expectedX);

    expect(position.y).toBeCloseTo(expectedY);

    expect(angle).toBeCloseTo(expectedAngle);

  }

);

That’s the first test; now, let’s move on to the second scenario:

Nearly all of the step definitions for our second scenario are already implemented; there are only two that aren’t:
  Then these lines should have been drawn for the observer:

    | x1 | y1 | x2 | y2 |

    | 0 | 0 | 10 | 0 |

  And these lines should have been drawn for the presenter:

    | x1 | y1 | x2 | y2 |

    | 0 | 0 | 10 | 0 |

We already have a step definition that is very similar to these two in features/support/drawing.steps.js. Let’s extract that logic into its own module so that we can reuse it. Create a new file named features/support/svg.js and then duplicate the following code from the drawing step definitions:

import expect from "expect";

export const checkLinesFromDataTable = page =>

  return async function (dataTable) {

    await this.getPage(page).waitForTimeout(2000);

    const lines = await this.getPage(page).$$eval(

      "line",

      lines =>

        lines.map(line => ({

          x1: parseFloat(line.getAttribute("x1")),

          y1: parseFloat(line.getAttribute("y1")),

          x2: parseFloat(line.getAttribute("x2")),

          y2: parseFloat(line.getAttribute("y2"))

        }))

    );

    for (let i = 0; i < lines.length; ++i) {

      expect(lines[i].x1).toBeCloseTo(

        parseInt(dataTable.hashes()[i].x1)

      );

      expect(lines[i].y1).toBeCloseTo(

        parseInt(dataTable.hashes()[i].y1)

      );

      expect(lines[i].x2).toBeCloseTo(

        parseInt(dataTable.hashes()[i].x2)

      );

      expect(lines[i].y2).toBeCloseTo(

        parseInt(dataTable.hashes()[i].y2)

      );

    }

  };

In features/support/drawing.steps.js, modify the these lines should have been drawn step definition so that it now uses this function:
import { checkLinesFromDataTable } from "./svg";

Then(

  "these lines should have been drawn:",

  checkLinesFromDataTable("user")

);

The two new step definitions for our latest sharing scenario are now straightforward. In features/support/sharing.steps.js, add the following import statement and step definitions:
import { checkLinesFromDataTable } from "./svg";

Then(

  "these lines should have been drawn for the presenter:",

  checkLinesFromDataTable("presenter")

);

Then(

  "these lines should have been drawn for the observer:",

  checkLinesFromDataTable("observer")

);

You’ve now seen how to write longer step definitions and how to extract common functionality into support functions.

With the step definitions complete, it’s time to make both these scenarios pass.

Fixing Cucumber tests by test-driving production code
In this section, we’ll start by doing a little up-front design, then we’ll write unit tests that cover the same functionality as the Cucumber tests, and then use those to build out the new implementation.

Let’s do a little up-front design:

When the user clicks on Start sharing, a dialog should appear with a Reset button.
If the user chooses to reset, the Redux store is sent a START_SHARING action with a new reset property that is set to true:
{ type: "START_SHARING", reset: true }

If the user chooses to share their existing commands, then the START_SHARING action is sent with reset set to false:
{ type: "START_SHARING", reset: false }

When the user clicks on Reset, a RESET action should be sent to the Redux store.
Sharing should not be initiated until after the RESET action has occurred.
That’s all the up-front design we need. Let’s move on to integrating the Dialog component.

Adding a dialog box
Now that we know what we’re building, let’s go for it! To do so, perform these steps:

Open test/MenuButtons.test.js and skip the test that is titled dispatches an action of START_SHARING when start sharing is clicked. We’re going to sever this connection for the moment. But we’ll come back to fix this later:
it.skip("dispatches an action of START_SHARING when start sharing is clicked", () => {

  ...

});

In the same file, add a new import statement for the Dialog component, and mock it out using jest.mock. The Dialog component already exists in the code base but has remained unused until now:
import { Dialog } from "../src/Dialog";

jest.mock("../src/Dialog", () => ({

  Dialog: jest.fn(() => <div id="Dialog" />),

});

Add this new test just below the one you’ve skipped. Very simply, it checks that we display the dialog when the appropriate button is clicked:
it("opens a dialog when start sharing is clicked", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  expect(Dialog).toBeCalled();

});

In src/MenuButtons.js, add a new Dialog element to the JSX, including the import statement at the top of the file. The new component should be placed at the very bottom of the returned JSX. The test should then pass:
import { Dialog } from "./Dialog";

export const MenuButtons = () => {

  ...

  return (

    <>

      ...

     <Dialog />

    </>

  );

};

Next, let’s set the message prop to something useful for the user. Add this to your test suite:
it("prints a useful message in the sharing dialog", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  expect(propsOf(Dialog).message).toEqual(

    "Do you want to share your previous commands, or would you like to reset to a blank script?"

  );

});

To make that pass, add the message prop to your implementation:
<Dialog

  message="Do you want to share your previous commands, or would you like to reset to a blank script?"

/>

Now, we need to make sure the dialog isn’t shown until the sharing button is clicked; add the following test:
it("does not initially show the dialog", () => {

  renderWithStore(<MenuButtons />);

  expect(Dialog).not.toBeCalled();

});

Make this pass by adding a new state variable, isSharingDialogOpen. The sharing button will set this to true when it’s clicked. You’ll need to add the import statement for useState at the top of the file:
import React, { useState } from "react";

export const MenuButtons = () => {

  const [

    isSharingDialogOpen, setIsSharingDialogOpen

  ] = useState(false);

  const openSharingDialog = () =>

   setIsSharingDialogOpen(true);

  ...

  return (

    <>

      ...

      {environment.isSharing ? (

        <button

          id="stopSharing"

          onClick={() => dispatch(stopSharing())}

        >

          Stop sharing

        </button>

      ) : (

        <button

          id="startSharing"

          onClick={openSharingDialog}

        >

          Start sharing

        </button>

      )}

      {isSharingDialogOpen ? (

        <Dialog

          message="..."

        />

      ) : null}

    </>

  );

};

Now, let’s add a test for adding buttons to the dialog. This is done by specifying the buttons prop on the Dialog component:
it("passes Share and Reset buttons to the dialog", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  expect(propsOf(Dialog).buttons).toEqual([

    { id: "keep", text: "Share previous" },

    { id: "reset", text: "Reset" }

  ]);

});

Make this pass by adding a buttons prop to the Dialog component, as follows:
{isSharingDialogOpen ? (

  <Dialog

    message="..."

    buttons={[

     { id: "keep", text: "Share previous" },

     { id: "reset", text: "Reset" }

    ]}

  />

) : null}

For the next test, we’ll test that the dialog closes. Start by defining a new closeDialog helper in your test suite:
const closeDialog = () =>

  act(() => propsOf(Dialog).onClose());

Add the next test, which checks that the Dialog component disappears once the dialog has had its onClose prop invoked:
it("closes the dialog when the onClose prop is called", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  closeDialog();

  expect(element("#dialog")).toBeNull();

});

Make that pass by adding the following line to the Dialog JSX:
<Dialog

  onClose={() => setIsSharingDialogOpen(false)}

  ...

/>

Now go back to the test that you skipped and modify it so that it reads the same as the following code block. We’re going to modify the START_SHARING Redux action to take a new reset Boolean variable:
const makeDialogChoice = button =>

  act(() => propsOf(Dialog).onChoose(button));

it("dispatches an action of START_SHARING when dialog onChoose prop is invoked with reset", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  makeDialogChoice("reset");

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({ type: "START_SHARING", reset: true });

});

To make this pass, move to src/MenuButtons.js and modify the startSharing function to add a reset property to the created Redux action. Notice how we hardcode the value to true for now—we’ll need to triangulate in the upcoming test:
const startSharing = () => ({

  type: "START_SHARING",

  reset: true,

});

TRIANGULATION WITHIN TESTS

See Chapter 1, First Steps with Test-Driven Development, for a reminder on triangulation and why we do it.

In the MenuButtons component, set the onChoose prop on the Dialog component:
return (

  <>

    ...

    {isSharingDialogOpen ? (

      <Dialog

        onClose={() => setIsSharingDialogOpen(false)}

        onChoose={() => dispatch(startSharing())}

        ...

      />

    ) : null}

  </>

);

Finally, we need to add a new test for sending a value of false through for the reset action property:
it("dispatches an action of START_SHARING when dialog onChoose prop is invoked with share", () => {

  renderWithStore(<MenuButtons />);

  click(buttonWithLabel("Start sharing"));

  makeDialogChoice("share");

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({

      type: "START_SHARING",

      reset: false

    });

});

To make that pass, modify startSharing to take a button parameter and then use that to set the reset property:
const startSharing = (button) => ({

  type: "START_SHARING",

  reset: button === "reset",

});

Then, finally, in the MenuButtons component JSX, set the onChoose prop on the Dialog element:
onChoose={(button) => dispatch(startSharing(button))}

You’ve now completed the first new piece of functionality specified in the Cucumber test. There’s a dialog box being displayed and a reset Boolean flag being sent through to the Redux store. We are inching toward a working solution.

Updating sagas to a reset or replay state
Now, we need to update the sharing saga to handle the new reset flag:

Open test/middleware/sharingSagas.test.js and add the following test to the end of the START_SHARING nested describe block:
it("puts an action of RESET if reset is true", async () => {

  store.dispatch({

    type: "START_SHARING",

    reset: true,

  });

  await notifySocketOpened();

  await sendSocketMessage({

    type: "UNKNOWN",

    id: 123,

  });

  return expectRedux(store)

    .toDispatchAnAction()

    .matching({ type: "RESET" });

});

In src/middleware/sharingSagas.js, modify startSharing so that it reads the same as the following code block. Don’t forget to add the new action parameter to the top line:
function* startSharing(action) {

  ...

  if (action.reset) {

    yield put({ type: "RESET" });

  }

}

Now for the tricky second test. If reset is false, we want to replay all the current actions:
it("shares all existing actions if reset is false", async () => {

  const forward10 = {

    type: "SUBMIT_EDIT_LINE",

    text: "forward 10",

  };

  const right90 = {

    type: "SUBMIT_EDIT_LINE",

    text: "right 90"

  };

  store.dispatch(forward10);

  store.dispatch(right90);

  store.dispatch({

    type: "START_SHARING",

    reset: false,

  });

  await notifySocketOpened();

  await sendSocketMessage({

    type: "UNKNOWN",

    id: 123,

  });

  expect(sendSpy).toBeCalledWith(

    JSON.stringify({

      type: "NEW_ACTION",

      innerAction: forward10,

    })

  );

  expect(sendSpy).toBeCalledWith(

    JSON.stringify({

      type: "NEW_ACTION",

      innerAction: right90

    })

  );

});

To make this pass, we can use the toInstructions function from the export namespace. We also need to make use of two new redux-saga functions: select and all. The select function is used to retrieve the state and the all function is used with yield to ensure that we wait for all the passed calls to complete before continuing. Add those import statements now to src/middleware/sharingSagas.js:
import {

  call,

  put,

  takeLatest,

  take,

  all,

  select

} from "redux-saga/effects";

import { eventChannel, END } from "redux-saga";

import { toInstructions } from "../language/export";

Now, modify the startSharing function by tacking on an else block to the conditional:
if (action.reset) {

  yield put({ type: "RESET" });

} else {

  const state = yield select(state => state.script);

  const instructions = toInstructions(state);

  yield all(

    instructions.map(instruction =>

      call(shareNewAction, {

        innerAction: {

          type: "SUBMIT_EDIT_LINE",

          text: instruction

        }

      })

    )

  );

}

If you run the tests now, you’ll notice that there are a couple of unrelated failures. We can fix these by adding a default value for the reset property to the startSharing helper method in our tests:
const startSharing = async () => {

  store.dispatch({

    type: "START_SHARING",

    reset: true

  });

  ...

};

That completes the feature; both the unit tests and the Cucumber tests should be passing. Now would be a great time to try things out manually, too.

In the next section, we’ll focus on reworking our Cucumber tests to make them run much faster.

Avoiding timeouts in test code
In this section, we’ll improve the speed at which our Cucumber tests run by replacing waitForTimeout calls with waitForSelector calls.

Many of our step definitions contain waits that pause our test script interaction with the browser while we wait for the animations to finish. Here’s an example from our tests, which waits for a period of 3 seconds:


await this.getPage("user").waitForTimeout(3000);
Not only will this timeout slow down the test suite, but this kind of wait is also brittle as there are likely to be occasions when the timeout is slightly too short and the animation hasn’t finished. In this case, the test will intermittently fail. Conversely, the wait period is actually quite long. As more tests are added, the timeouts add up and the test runs suddenly take forever to run.

AVOIDING TIMEOUTS

Regardless of the type of automated test, it is a good idea to avoid timeouts in your test code. Timeouts will substantially increase the time it takes to run your test suite. There are almost always methods you can use to avoid using them, such as the one highlighted in this section.

What we can do instead is modify our production code to notify us when it is animating, by setting an isAnimating class when the element is animating. We then use the Puppeteer waitForSelector function to check for a change in the value of this class, replacing waitForTimeout entirely.

Adding HTML classes to mark animation status
We do this by adding an isAnimating class to the viewport div element when an animation is running.

Let’s start by adding the isAnimating class when the Drawing element is ready to animate a new Logo command:

In test/Drawing.test.js, add a new nested describe block within the main Display context, just below the context for resetting. Then, add the following test:
describe("isAnimating", () => {

  it("adds isAnimating class to viewport when animation begins", () => {

    renderWithStore(<Drawing />, {

      script: { drawCommands: [horizontalLine] }

    });

    triggerRequestAnimationFrame(0);

    expect(

      element("#viewport")

    ).toHaveClass("isAnimating");

  });

});

In src/Drawing.js, update the JSX to include this class name on the viewport element:
return (

  <div

    id="viewport"

    className="isAnimating"

  >

    ...

  </div>

);

Let’s triangulate in order to get this state variable in place. To do this, add the following test:
it("initially does not have the isAnimating class set", () => {

  renderWithStore(<Drawing />, {

    script: { drawCommands: [] }

  });

  expect(

    element("#viewport")

  ).not.toHaveClass("isAnimating");

});

To make this pass, update className to only set isAnimating if commandToAnimate is not null:
className={commandToAnimate ? "isAnimating" : ""}>

As a final flourish, we’ll add an arguably unnecessary test. We want to be careful about removing the isAnimating class once the animation is finished. However, our implementation already takes care of this as commandToAnimate will be set to undefined when that happens. In other words, we don’t need an explicit test for this, and we’re done with this addition. However, for completeness’ sake, you can add the test:
it("removes isAnimating class when animation is finished", () => {

  renderWithStore(<Drawing />, {

    script: { drawCommands: [horizontalLine] },

  });

  triggerAnimationSequence([0, 500]);

  expect(element("#viewport")).not.toHaveClass(

    "isAnimating"

  );

});

That completes adding the isAnimating class functionality. Now we can use this class as a means of replacing the waitForTimeout calls.

Updating step definitions to use waitForSelector
We’re ready to use this new behavior in our step definitions, bringing in a new call to waitForSelector that waits until the isAnimating class appears (or disappears) on an element:

In features/support/world.js, add the following two methods to the World class. The first waits for the isAnimating selector to appear within the DOM and the second waits for it to disappear:
waitForAnimationToBegin(page) {

  return this.getPage(page).waitForSelector(

    ".isAnimating"

  );

}

waitForAnimationToEnd(page) {

  return this.getPage(page).waitForSelector(

    ".isAnimating",

   { hidden: true }

  );

}

In features/support/drawing.steps.js, search for the single waitForTimeout invocation in this file and replace it with the code in the following block:
When(

  "the user enters the following instructions at the prompt:",

  async function (dataTable) {

    for (let instruction of dataTable.raw()) {

      await this.getPage("user").type(

        "textarea",

        `${instruction}\n`

      );

      await this.waitForAnimationToEnd("user");

    }

  }

);

BEING CAREFUL ABOUT CLASS TRANSITIONS

We’re waiting for animation after each instruction is entered. This is important as it mirrors how the isAnimating class will be added and removed from the application. If we only had one waitForAnimationToEnd function as the last instruction on the page, we may end up exiting the step definition early if the wait catches the removal of an isAnimating class in the middle of a sequence of instructions, rather than catching the last one.

Now, open features/support/sharing.steps.js; this file has a similar step in it as the previous one, so update that one now, in the same way:
When(

  "the presenter entered the following instructions at the prompt:",

  async function(dataTable) {

    for (let instruction of dataTable.raw()) {

      await this.getPage("presenter").type(

        "textarea",

        `${instruction}\n`

      );

      await this.waitForAnimationToEnd("presenter");

    }

  }

);

Toward the bottom of the file, update the two step definitions that check the turtle position:
Then(

  "the observer should see the turtle at x = {int}, y = {int}, angle = {int}",

  async function (

    expectedX, expectedY, expectedAngle

  ) {

    await this.waitForAnimationToEnd("observer");

    ...

  }

);

Then(

  "the presenter should see the turtle at x = {int}, y = {int}, angle = {int}",

  async function (

    expectedX, expectedY, expectedAngle

  ) {

    await this.waitForAnimationToEnd("presenter");

    ...

  }

);

Open features/support/svg.js and update the function within it, as follows:
export const checkLinesFromDataTable = page => {

  return async function (dataTable) {

    await this.waitForAnimationToEnd(page);

    ...

  }

};

If you run npx cucumber-js now, you’ll see that we have one test failure, which is related to the output on the observer’s screen. It indicates that we need to wait for the animations when we load the observer’s page. In this case, we need to wait for the animation to start before we can wait for it to finish. We can fix this by adding a new step to the feature. Open features/sharing.feature and modify the last test to include a third entry in the When section:
When the presenter clicks the button 'keep'

And the observer navigates to the presenter's sharing link

And the observer waits for animations to finish

ENCAPSULATING MULTIPLE WHEN CLAUSES

If you aren’t happy with having three When clauses, then you can always combine them into a single step.

Back in features/support/sharing.steps.js, add this new step definition just underneath the other When step definitions:
When(

  "the observer waits for animations to finish",

  async function () {

    await this.waitForAnimationToBegin("observer");

    await this.waitForAnimationToEnd("observer");

  }

);

Your tests should now be passing, and they should be much faster. On my machine, they now only take a quarter of the time than they did before.

Summary
In this chapter, we looked at how you can integrate Cucumber into your team’s workflow.

You saw some more ways that Cucumber tests differ from unit tests. You also learned how to avoid using timeouts to keep your test suites speedy.

We’re now finished with our exploration of the Spec Logo world.

In the final chapter of the book, we’ll look at how TDD compares to other developer processes.

Exercise
Remove as much duplication as possible from your step definitions.


