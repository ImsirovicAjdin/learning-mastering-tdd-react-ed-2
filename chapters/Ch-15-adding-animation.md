# Part 3 - Interactivity

# Chapter 15: Adding Animation

15
Adding Animation
Animation lends itself to test-driven development just as much as any other feature. In this chapter, we’ll animate the Logo turtle movement as the user inputs commands.

There are two types of animation in Spec Logo:

First, when the turtle moves forward. For example, when the user enters forward 100 as an instruction, the turtle should move 100 units along, at a fixed speed. As it moves, it will draw a line behind it.
Second, when the turtle rotates. For example, if the user types rotate 90, then the turtle should rotate slowly until it has made a quarter turn.
Much of this chapter is about test-driving the window.requestAnimationFrame function. This is the browser API that allows us to animate visual elements on the screen, such as the position of the turtle or the length of a line. The mechanics of this function are explained in the third section of this chapter, Animating with requestAnimationFrame.

THE IMPORTANCE OF MANUAL TESTING

When writing animation code, it’s natural to want to visually check what we’re building. Automated tests aren’t enough. Manually testing is also important because animation is not something that most programmers do every day. When something is new, it’s often better to do lots of manual tests to verify behavior in addition to your automated tests.

In fact, while preparing for this chapter, I did a lot of manual testing. The walk-through presented here experiments with several different approaches. There were many, many times that I opened my browser to type forward 100 or right 90 to visually verify what was happening.

This chapter covers the following topics:

Designing animation
Building an animated line component
Animating with requestAnimationFrame
Canceling animations with cancelAnimationFrame
Varying animation behavior
The code we’ll write is relatively complicated compared to the code in the rest of the book, so we need to do some upfront design first.

By the end of the chapter, you’ll have gained a deep understanding of how to test-drive one of the more complicated browser APIs.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter15

Designing animation
As you read through this section, you may wish to open src/Drawing.js and read the existing code to understand what it’s doing.

The current Drawing component shows a static snapshot of how the drawing looks at this point. It renders a set of Scalable Vector Graphics (SVG) lines to represent the path the turtle has taken to this point, and a triangle to represent the turtle.

The component makes use of two child components:

The Turtle component is displayed once and draws an SVG triangle at the given location
The StaticLines component is a set of SVG lines that are drawn onscreen to represent the drawn commands
We will add a new AnimatedLine component that represents the current line being animated. As lines complete their animation, they will move into the StaticLines collection.

We’ll need to do some work to convert this from a static view to an animated representation.

As it stands, the component takes a turtle prop and a drawCommands prop. The turtle prop is the current position of the turtle, given that all the draw commands have already been drawn.

In our new animated drawing, we will still treat drawCommands as a list of commands to execute. But rather than relying on a turtle prop to tell us where the turtle is, we’ll store the current position of the turtle as a component state. We will work our way through the drawCommands array, one instruction at a time, and update the turtle component state as it animates. Once all instructions are completed, the turtle component state will match what would have originally been set for the turtle prop.

The turtle always starts at the 0,0 coordinate with an angle of 0.

We will need to keep track of which commands have already been animated. We’ll create another component state variable, animatingCommandIndex, to denote the index of the array item that is currently being animated.

We start animating at the 0 index. Once that command has been animated, we increment the index by 1, moving along to the next command, and animate that. The process is repeated until we reach the end of the array.

This design means that the user can enter new drawCommands at the prompt even if animations are currently running. The component will take care to redraw with animations at the same point it left off at.

Finally, are two types of draw commands: drawLine and rotate. Here are a couple of examples of commands that will appear in the drawCommands array:


{
  drawCommand: "drawLine",
  id: 123,
  x1: 100,
  y1: 100,
  x2: 200,
  y2: 100
}
{
  drawCommand: "rotate",
  id: 234,
  previousAngle: 0,
  newAngle: 90
}
Each type of animation will need to be handled differently. So, for example, the AnimatedLine component will be hidden when the turtle is rotating.

That about covers it. We’ll follow this approach:

Start with building the AnimatedLine component
Create a useEffect hook in Drawing that calls the window.requestAnimationFrame function to animate drawLine commands
Cancel the animation of drawLine commands when new instructions are added
Add the animation of turtle rotations
Let’s get started with the AnimatedLine component.

Building an animated line component
In this section, we’ll create a new AnimatedLine component.

This component contains no animation logic itself but, instead, draws a line from the start of the line being animated to the current turtle position. Therefore, it needs two props: commandToAnimate, which would be one of the drawLine command structures shown previously, and the turtle prop, containing the position.

Let’s begin:

Create a new file, test/AnimatedLine.test.js, and prime it with the following imports and describe block setup. Notice the inclusion of the sample instruction definition for horizontalLine:
import React from "react";

import ReactDOM from "react-dom";

import {

  initializeReactContainer,

  render,

  element,

} from "./reactTestExtensions";

import { AnimatedLine } from "../src/AnimatedLine";

import { horizontalLine } from "./sampleInstructions";

const turtle = { x: 10, y: 10, angle: 10 };

describe("AnimatedLine", () => {

  beforeEach(() => {

    initializeReactContainer();

  });

  const renderSvg = (component) =>

    render(<svg>{component}</svg>);

  const line = () => element("line");

});

Now add the first test, which checks the starting position of the line:
it("draws a line starting at the x1,y1 co-ordinate of the command being drawn", () => {

  renderSvg(

    <AnimatedLine

      commandToAnimate={horizontalLine}

      turtle={turtle}

    />

  );

  expect(line()).not.toBeNull();

  expect(line().getAttribute("x1")).toEqual(

    horizontalLine.x1.toString()

  );

  expect(line().getAttribute("y1")).toEqual(

    horizontalLine.y1.toString()

  );

});

Create a new file, src/AnimatedLine.js, and make your test pass by using the following implementation:
import React from "react";

export const AnimatedLine = ({

  commandToAnimate: { x1, y1 }

}) => (

  <line x1={x1} y1={y1} />

);

On to the next test. In this one, we explicitly set the turtle values so that it’s clear to see where the expected values come from:
it("draws a line ending at the current position of the turtle", () => {

  renderSvg(

    <AnimatedLine

      commandToAnimate={horizontalLine}

      turtle={{ x: 10, y: 20 }}

    />

  );

  expect(line().getAttribute("x2")).toEqual("10");

  expect(line().getAttribute("y2")).toEqual("20");

});

To make that pass, we just need to set the x2 and y2 props on the line element, pulling that in from the turtle:
export const AnimatedLine = ({

  commandToAnimate: { x1, y1 },

  turtle: { x, y }

}) => (

  <line x1={x1} y1={y1} x2={x} y2={y} />

);

Then we need two tests to set the strokeWidth and stroke props:
it("sets a stroke width of 2", () => {

  renderSvg(

    <AnimatedLine

      commandToAnimate={horizontalLine}

      turtle={turtle}

    />

  );

  expect(

    line().getAttribute("stroke-width")

  ).toEqual("2");

});

it("sets a stroke color of black", () => {

  renderSvg(

    <AnimatedLine

      commandToAnimate={horizontalLine}

      turtle={turtle}

    />

  );

  expect(

    line().getAttribute("stroke")

  ).toEqual("black");

});

Finish off the component by adding in those two props:
export const AnimatedLine = ({

  commandToAnimate: { x1, y1 },

  turtle: { x, y }

}) => (

  <line

    x1={x1}

    y1={y1}

    x2={x}

    y2={y}

    strokeWidth="2"

    stroke="black"

  />

);

That completes the AnimatedLine component.

Next, it’s time to add it into Drawing, by setting the commandToAnimate prop to the current line that’s animating and using requestAnimationFrame to vary the position of the turtle prop.

Animating with requestAnimationFrame
In this section, you will use the useEffect hook in combination with window.requestAnimationFrame to adjust the positioning of AnimatedLine and Turtle.

The window.requestAnimationFrame function is used to animate visual properties. For example, you can use it to increase the length of a line from 0 units to 200 units over a given time period, such as 2 seconds.

To make this work, you provide it with a callback that will be run at the next repaint interval. This callback is provided with the current animation time when it’s called:


const myCallback = time => {
  // animating code here
};
window.requestAnimationFrame(myCallback);
If you know the start time of your animation, you can work out the elapsed animation time and use that to calculate the current value of your animated property.

The browser can invoke your callback at a very high refresh rate, such as 60 times per second. Because of these very small intervals of time, your changes appear as a smooth animation.

Note that the browser only invokes your callback once for every requested frame. That means it’s your responsibility to repeatedly call the requestAnimationFrame function until the animation time reaches your defined end time, as in the following example. The browser takes care of only invoking your callback when the screen is due to be repainted:


let startTime;
let endTimeMs = 2000;
const myCallback = time => {
  if (startTime === undefined) startTime = time;
  const elapsed = time - startTime;
  // ... modify visual state here ...
  if (elapsed < endTimeMs) {
    window.requestAnimationFrame(myCallback);
  }
};
// kick off the first animation frame
window.requestAnimationFrame(myCallback);
As we progress through this section, you’ll see how you can use this to modify the component state (such as the position of AnimatedLine), which then causes your component to rerender.

Let’s begin by getting rid of the existing turtle value from the Redux store—we’re no longer going to use this, and instead, rely on the calculated turtle position from the drawCommands array:

Open test/Drawing.test.js and find the test with the name passes the turtle x, y and angle as props to Turtle. Replace it with the following:
it("initially places the turtle at 0,0 with angle 0", () => {

  renderWithStore(<Drawing />);

  expect(Turtle).toBeRenderedWithProps({

    x: 0,

    y: 0,

    angle: 0

  });

});

Now, in src/Drawing.js, you can remove the turtle value that was extracted from the Redux store, by replacing the useSelector call with this one:
const { drawCommands } = useSelector(

  ({ script }) => script

);

We’ll replace the existing turtle value with a new state variable. This will come in useful later when we start moving the position of the turtle. Start by importing useState into src/Drawing.js:
import React, { useState } from "react";

Then, just below the call to useSelector, add another call to useState. After this change, your test should be passing:
const [turtle, setTurtle] = useState({

  x: 0,

  y: 0,

  angle: 0

});

Back in test/Drawing.test.js, stub out the requestAnimationFrame function in the describe block’s beforeEach:
beforeEach(() => {

  ...

  jest

    .spyOn(window, "requestAnimationFrame");

});

Add the following new describe block and test to the bottom of the existing describe block, inside the existing describe block (so it’s nested). It defines an initial state of horizontalLineDrawn that has a single line—this line is defined in the sampleInstructions file. The test states that we expect requestAnimationFrame to be invoked when the component mounts:
describe("movement animation", () => {

  const horizontalLineDrawn = {

    script: {

      drawCommands: [horizontalLine],

      turtle: { x: 0, y: 0, angle: 0 },

    },

  };

  it("invokes requestAnimationFrame when the timeout fires", () => {

    renderWithStore(<Drawing />, horizontalLineDrawn);

    expect(window.requestAnimationFrame).toBeCalled();

  });

});

To make this pass, open src/Drawing.js and start by importing the useEffect hook:
import React, { useState, useEffect } from "react";

Then, add the new useEffect hook into the Drawing component. Add the following three lines, just above the return statement JSX:
export const Drawing = () => {

  ...

  useEffect(() => {

    requestAnimationFrame();

  }, []);

  return ...

};

Since we’re now in the realms of useEffect, any actions that cause updates to the component state must occur within an act block. That includes any triggered animation frames, and we’re about to trigger some. So, back in test/Drawing.test.js, add the act import now:
import { act } from "react-dom/test-utils";

We also need an import for AnimatedLine because, in the next test, we’ll assert that we render it. Add the following import, together with its spy setup, as shown:
import { AnimatedLine } from "../src/AnimatedLine";

jest.mock("../src/AnimatedLine", () => ({

  AnimatedLine: jest.fn(

    () => <div id="AnimatedLine" />

  ),

}));

The call to requestAnimationFrame requires a handler function as an argument. The browser will then call this function during the next animation frame. For the next test, we’ll check that the turtle is at the start of the first line when the timer first fires. We need to define a new helper to do this, which is triggerRequestAnimationFrame. In a browser environment, this call would happen automatically, but in our test, we play the role of the browser and trigger it in code. It’s this call that must be wrapped in an act function call since our handler will cause the component state to change:
const triggerRequestAnimationFrame = time => {

  act(() => {

    const mock = window.requestAnimationFrame.mock

    const lastCallFirstArg =

      mock.calls[mock.calls.length - 1][0]

    lastCallFirstArg(time);

  });

};

Now, we’re ready to write tests for the animation cycle. The first one is a simple one: at time zero, the turtle position is placed at the start of the line. If you check the definition in test/sampleInstructions.js, you’ll see that horizontalLine starts at position 100,100:
it("renders an AnimatedLine with turtle at the start position when the animation has run for 0s", () => {

  renderWithStore(<Drawing />, horizontalLineDrawn);

  triggerRequestAnimationFrame(0);

  expect(AnimatedLine).toBeRenderedWithProps({

    commandToAnimate: horizontalLine,

    turtle: { x: 100, y: 100, angle: 0 }

  });

});

USING THE TURTLE POSITION FOR ANIMATION

Remember that the AnimatedLine component draws a line from the start position of the drawLine instruction to the current turtle position. That turtle position is then animated, which has the effect of the AnimatedLine instance growing in length until it finds the end position of the drawLine instruction.

Making this test pass will be a bit of a big bang. To start, extend useEffect as shown. We define two variables, commandToAnimate and isDrawingLine, which we use to determine whether we should animate at all. The isDrawingLine test is necessary because some of the existing tests send no draw commands at all to the component, in which case commandToAnimate will be null. Yet another test passes a command of an unknown type into the component, which would also blow up if we tried to pull out x1 and y1 from it. That explains the call to isDrawLineCommand—a function that is defined already at the top of the file:
const commandToAnimate = drawCommands[0];

const isDrawingLine =

  commandToAnimate &&  

  isDrawLineCommand(commandToAnimate);

useEffect(() => {

  const handleDrawLineFrame = time => {

    setTurtle(turtle => ({

      ...turtle,

      x: commandToAnimate.x1,

      y: commandToAnimate.y1,

    }));

  };

  if (isDrawingLine) {

    requestAnimationFrame(handleDrawLineFrame);

  }

}, [commandToAnimate, isDrawingLine]);

USING THE FUNCTIONAL UPDATE SETTER

This code uses the functional update variant of setTurtle that takes a function rather than a value. This is used when the new state value depends on the old value. Using this form of setter means that the turtle doesn’t need to be in the dependency list of useEffect and won’t cause the useEffect hook to reset itself.

At this point, we still aren’t rendering AnimatedLine, which is what our test expects. Let’s fix that now. Start by adding the import:
import { AnimatedLine } from "./AnimatedLine";

Insert this just below the JSX for StaticLines. At this point, your test should be passing:
<AnimatedLine

  commandToAnimate={commandToAnimate}

  turtle={turtle}

/>

We need a further test to check that we don’t render AnimatedLine if no lines are being animated. Add the next test as shown, but don’t add it in the movement animation block; instead, place it into the parent context:
it("does not render AnimatedLine when not moving", () => {

  renderWithStore(<Drawing />, {

    script: { drawCommands: [] }

  });

  expect(AnimatedLine).not.toBeRendered();

});

Make that pass by wrapping the AnimatedLine component with a ternary. We simply return null if isDrawingLine is false:
{isDrawingLine ? (

  <AnimatedLine

    commandToAnimate={commandToAnimate}

    turtle={turtle}

/> : null}

We’ve handled what the first animation frame should do; now let’s code up the next animation frame. In the following test, there are two calls to triggerRequestAnimationFrame. The first one is used to signify that animation is started; the second one allows us to move. We need the first call (with a time index of 0) to be able to mark the time at which the animation started:
it("renders an AnimatedLine with turtle at a position based on a speed of 5px per ms", () => {

  renderWithStore(<Drawing />, horizontalLineDrawn);

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(250);

  expect(AnimatedLine).toBeRenderedWithProps({

    commandToAnimate: horizontalLine,

    turtle: { x: 150, y: 100, angle: 0 }

  });

});

USING ANIMATION DURATION TO CALCULATE THE DISTANCE MOVED

The handleDrawLineFrame function, when called by the browser, will be passed a time parameter. This is the current duration of the animation. The turtle travels at a constant velocity, so knowing the duration allows us to calculate where the turtle is.

To make this pass, first, we need to define a couple of functions. Scroll up src/Drawing.js until you see the definition for isDrawLineCommand and add these two new definitions there. The distance and movementSpeed functions are used to calculate the duration of the animation:
const distance = ({ x1, y1, x2, y2 }) =>

  Math.sqrt(

    (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

  );

const movementSpeed = 5;

Now we can calculate the duration of the animation; modify useEffect as shown:
useEffect(() => {

  let duration;

  const handleDrawLineFrame = time => {

    setTurtle(...);

  };

  if (isDrawingLine) {

    duration =

      movementSpeed * distance(commandToAnimate);

    requestAnimationFrame(handleDrawLineFrame);

  }

}, [commandToAnimate, isDrawingLine]);

By declaring duration as the very first line in the useEffect block, the variable is in scope for the requestAnimationFrame handler to read it to calculate distance. To do that, we take the elapsed time and divide it by the total duration:
useEffect(() => {

  let duration;

  const handleDrawLineFrame = time => {

    const { x1, x2, y1, y2 } = commandToAnimate;

    setTurtle(turtle => ({

      ...turtle,

      x: x1 + ((x2 - x1) * (time / duration)),

      y: y1 + ((y2 - y1) * (time / duration)),

    }));

  };

  if (isDrawingLine) {

    ...

  }

}, [commandToAnimate, isDrawingLine]);

We’re making great progress! In the previous test, we assumed that the starting time is 0, but actually, the browser could give us any time as the start time (the time it gives us is known as the time origin). So, let’s make sure our calculations work for a non-zero start time. Add the following test:
it("calculates move distance with a non-zero animation start time", () => {

  const startTime = 12345;

  renderWithStore(<Drawing />, horizontalLineDrawn);

  triggerRequestAnimationFrame(startTime);

  triggerRequestAnimationFrame(startTime + 250);

  expect(AnimatedLine).toBeRenderedWithProps({

    commandToAnimate: horizontalLine,

    turtle: { x: 150, y: 100, angle: 0 }

  });

});

Make that pass by introducing the start and elapsed times, as shown:
useEffect(() => {

  let start, duration;

  const handleDrawLineFrame = time => {

    if (start === undefined) start = time;

    const elapsed = time - start;

    const { x1, x2, y1, y2 } = commandToAnimate;

    setTurtle(turtle => ({

      ...turtle,

      x: x1 + ((x2 - x1) * (elapsed / duration)),

      y: y1 + ((y2 - y1) * (elapsed / duration)),

    }));

  };

  if (isDrawingLine) {

    ...

  }

}, [commandToAnimate, isDrawingLine]);

Our components need to call requestAnimationFrame repeatedly until the duration is reached. At that point, the line should have been fully drawn. In this test, we trigger three animation frames, and we expect requestAnimationFrame to have been called three times:
it("invokes requestAnimationFrame repeatedly until the duration is reached", () => {

  renderWithStore(<Drawing />, horizontalLineDrawn);

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(250);

  triggerRequestAnimationFrame(500);

  expect(

    window.requestAnimationFrame.mock.calls

  ).toHaveLength(3);

});

To make that pass, we need to ensure that handleDrawLineFrame triggers another requestAnimationFrame when it’s run. However, we should only do that until the time that the duration has been reached. Make that pass happen by wrapping the setTurtle and requestAnimationFrame calls with the following conditional:
const handleDrawLineFrame = (time) => {

  if (start === undefined) start = time;

  if (time < start + duration) {

    const elapsed = time - start;

    const { x1, x2, y1, y2 } = commandToAnimate;

    setTurtle(...);

    requestAnimationFrame(handleDrawLineFrame);

  }

};

For the next test, we will check that when a line has “finished” being drawn, we move on to the next one, if there is one (otherwise, we stop). Add a new describe block below the describe block we’ve just implemented, with the following test. The second time stamp, 500, is after the duration that is required for horizontalLine to be drawn and therefore, AnimatedLine should show verticalLine instead:
describe("after animation", () => {

  it("animates the next command", () => {

    renderWithStore(<Drawing />, {

      script: {

        drawCommands: [horizontalLine, verticalLine]

      }

    });

    triggerRequestAnimationFrame(0);

    triggerRequestAnimationFrame(500);

    expect(AnimatedLine).toBeRenderedWithProps(

      expect.objectContaining({

        commandToAnimate: verticalLine,

      })

    );

  });

});

To make that pass, we need to introduce a pointer to the command that is currently being animated. This will start at the 0 index, and we’ll increment it each time the animation finishes. Add the following new state variable at the top of the component:
const [

  animatingCommandIndex,

  setAnimatingCommandIndex

] = useState(0);

Update the commandToAnimate constant to use this new variable:
const commandToAnimate =

  drawCommands[animatingCommandIndex];

Add an else clause to the conditional in handleDrawLineFrame that increments the value:
if (time < start + duration) {

  ...

} else {

  setAnimatingCommandIndex(

    animatingCommandIndex => animatingCommandIndex + 1

  );

}

For the final test, we want to make sure that only previously animated commands are sent to StaticLines. The currently animating line will be rendered by AnimatedLine, and lines that haven’t been animated yet shouldn’t be rendered at all:
it("places line in StaticLines", () => {

  renderWithStore(<Drawing />, {

    script: {

      drawCommands: [horizontalLine, verticalLine]

    }

  });

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(500);

  expect(StaticLines).toBeRenderedWithProps({

    lineCommands: [horizontalLine]

  });

});

To make that pass, update lineCommands to take only the portion of drawCommands up until the current animatingCommandIndex value:
const lineCommands = drawCommands

  .slice(0, animatingCommandIndex)

  .filter(isDrawLineCommand);

Although the latest test will now pass, the existing test, sends only line commands to StaticLines, will now break. Since our latest test covers essentially the same functionality, you can safely delete that test now.
If you run the app, you’ll now be able to see lines being animated as they are placed on the screen.

In the next section, we’ll ensure the animations behave nicely when multiple commands are entered by the user at the same time.

Canceling animations with cancelAnimationFrame
The useEffect hook we’ve written has commandToAnimate and isDrawingLine in its dependency list. That means that when either of these values updates, the useEffect hook is torn down and will be restarted. But there are other occasions when we want to cancel the animation. One time this happens is when the user resets their screen.

If a command is currently animating when the user clicks the Reset button, we don’t want the current animation frame to continue. We want to clean that up.

Let’s add a test for that now:

Add the following test at the bottom of test/Drawing.test.js:
it("calls cancelAnimationFrame on reset", () => {

  renderWithStore(<Drawing />, {

    script: { drawCommands: [horizontalLine] }

  });

  renderWithStore(<Drawing />, {

    script: { drawCommands: [] }

  });

  expect(window.cancelAnimationFrame).toBeCalledWith(

    cancelToken

  );

});

You’ll also need to change the beforeEach block, making the requestAnimationFrame stub return a dummy cancel token, and adding in a new stub for the cancelAnimationFrame function:
describe("Drawing", () => {

  const cancelToken = "cancelToken";

  beforeEach(() => {

    ...

    jest

      .spyOn(window, "requestAnimationFrame")

      .mockReturnValue(cancelToken);

    jest.spyOn(window, "cancelAnimationFrame");

  });

});

To make the test pass, update the useEffect hook to store the cancelToken value that the requestAnimationFrame function returns when it’s called. Then return a cleanup function from the useEffect hook, which uses that token to cancel the next requested frame. This function will be called by React when it tears down the hook:
useEffect(() => {

  let start, duration, cancelToken;

  const handleDrawLineFrame = time => {

    if (start === undefined) start = time;

    if (time < start + duration) {

      ...

      cancelToken = requestAnimationFrame(

        handleDrawLineFrame

      );

    } else {

      ...

    }

  };

  if (isDrawingLine) {

    duration =

      movementSpeed * distance(commandToAnimate);

    cancelToken = requestAnimationFrame(

      handleDrawLineFrame

    );

  }

  return () => {

    cancelAnimationFrame(cancelToken);

  }

});

Finally, we don’t want to run this cleanup if cancelToken hasn’t been set. The token won’t have been set if we aren’t currently rendering a line. We can prove that with the following test, which you should add now:
it("does not call cancelAnimationFrame if no line animating", () => {

  jest.spyOn(window, "cancelAnimationFrame");

  renderWithStore(<Drawing />, {

    script: { drawCommands: [] }

  });

  renderWithStore(<React.Fragment />);

  expect(

    window.cancelAnimationFrame

  ).not.toHaveBeenCalled();

});

UNMOUNTING A COMPONENT

This test shows how you can mimic an unmount of a component in React, which is simply by rendering <React.Fragment /> in place of the component under test. React will unmount your component when this occurs.

To make that pass, simply wrap the returned cleanup function in a conditional:
return () => {

  if (cancelToken) {

    cancelAnimationFrame(cancelToken);

  }

};

That’s all we need to do for animating the drawLine commands. Next up is rotating the turtle.

Varying animation behavior
Our lines and turtle are now animating nicely. However, we still need to handle the second type of draw command: rotations. The turtle will move at a constant speed when rotating to a new angle. A full rotation should take 1 second to complete, and we can use this to calculate the duration of the rotation. For example, a quarter rotation will take 0.25 seconds to complete.

In the last section, we started with a test to check that we were calling requestAnimationFrame. This time, that test isn’t essential because we’ve already proved the same design with drawing lines. We can jump right into the more complex tests, using the same triggerRequestAnimationFrame helper as before.

Let’s update Drawing to animate the turtle’s coordinates:

Add the following test to the bottom of the Drawing describe block. Create it in another nested describe block, just below the last test you wrote. The test follows the same principle as our tests for drawing lines: we trigger two animation frames, one at time 0 ms and one at time 500 ms, and then expect the rotation to have occurred. Both the x and y coordinates are tested in addition to the angle; that’s to make sure we continue to pass those through:
describe("rotation animation", () => {

  const rotationPerformed = {

    script: { drawCommands: [rotate90] },

  };

  it("rotates the turtle", () => {

    renderWithStore(<Drawing />, rotationPerformed);

    triggerRequestAnimationFrame(0);

    triggerRequestAnimationFrame(500);

    expect(Turtle).toBeRenderedWithProps({

      x: 0,

      y: 0,

      angle: 90

    });

  });

});

Moving to src/Drawing.js, start by adding a definition of isRotateCommand, just below the definition of isDrawLineCommand:
const isRotateCommand = command =>

  command.drawCommand === "rotate";

In the Drawing component, add a new constant, isRotating, just below the definition of isDrawingLine:
const isRotating =

  commandToAnimate &&

    isRotateCommand(commandToAnimate);

In the useEffect hook, define a new handler for rotations, handleRotationFrame, just below the definition of handleDrawLineFrame. For the purposes of this test, it doesn’t need to do much other than set the angle to the new value:
const handleRotationFrame = time => {

  setTurtle(turtle => ({

    ...turtle,

    angle: commandToAnimate.newAngle

  }));

};

We can make use of that to call requestAnimationFrame when a rotation command is being animated. Modify the last section of the useEffect hook to look as follows, ensuring that you add isRotating to the dependency list. The test should pass after this change:
useEffect(() => {

  ...

  if (isDrawingLine) {

    ...

  } else if (isRotating) {

    requestAnimationFrame(handleRotationFrame);

  }

}, [commandToAnimate, isDrawingLine, isRotating]);

Let’s add a test to get the duration in and use it within our calculation. This is essentially the same as the last test, but with a different duration and, therefore, a different expected rotation:
it("rotates part-way at a speed of 1s per 180 degrees", () => {

  renderWithStore(<Drawing />, rotationPerformed);

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(250);

  expect(Turtle).toBeRenderedWithProps({

    x: 0,

    y: 0,

    angle: 45

  });

});

To make this pass, first, we need to define rotateSpeed. You can add this definition just below the definition for movementSpeed:
const rotateSpeed = 1000 / 180;

Next, update the conditional at the bottom of the useEffect handler to calculate the duration for the rotate command:
} else if (isRotating) {

  duration =

    rotateSpeed *

    Math.abs(

      commandToAnimate.newAngle -

        commandToAnimate.previousAngle

    );

requestAnimationFrame(handleRotationFrame);

}

Update handleRotationFrame to use the duration to calculate a proportionate angle to move by:
const handleRotationFrame = (time) => {

  const {

    previousAngle, newAngle

  } = commandToAnimate;

  setTurtle(turtle => ({

    ...turtle,

    angle:

      previousAngle +

      (newAngle - previousAngle) * (time / duration)

  }));

};

Just as with handleDrawLineFrame, we need to ensure that we can handle start times other than 0. Add the following test:
it("calculates rotation with a non-zero animation start time", () => {

  const startTime = 12345;

  renderWithStore(<Drawing />, rotationPerformed);

  triggerRequestAnimationFrame(startTime);

  triggerRequestAnimationFrame(startTime + 250);

  expect(Turtle).toBeRenderedWithProps({

    x: 0,

    y: 0,

    angle: 45

  });

});

Make that pass by adding the start and elapsed variables. After this, the test should be passing. You’ll notice the similarity between handleDrawLineFrame and handleRotationFrame:
const handleRotationFrame = (time) => {

  if (start === undefined) start = time;

  const elapsed = time - start;

  const {

   previousAngle, newAngle

  } = commandToAnimate;

  setTurtle(turtle => ({

    ...turtle,

    angle:

      previousAngle +

      (newAngle - previousAngle) *

      (elapsed / duration)

  }));

};

Add a test to make sure we’re calling requestAnimationFrame repeatedly. This is the same test that we used for the drawLine handler, except now we’re passing in the rotate90 command. Remember to make sure the test belongs in the nested context, so you can be sure that there’s no name clash:
it("invokes requestAnimationFrame repeatedly until the duration is reached", () => {

  renderWithStore(<Drawing />, rotationPerformed);

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(250);

  triggerRequestAnimationFrame(500);

  expect(

    window.requestAnimationFrame.mock.calls

  ).toHaveLength(3);

});

To make this pass, we need to do a couple of things. First, we need to modify handleRotationFrame in the same way we did with handleDrawLineFrame, by adding a conditional that stops animating after the duration has been reached. Second, we also need to fill in the second part of the conditional to set the turtle location when the animation is finished:
const handleRotationFrame = (time) => {

  if (start === undefined) start = time;

  if (time < start + duration) {

    ...

  } else {

    setTurtle(turtle => ({

      ...turtle,

      angle: commandToAnimate.newAngle

    }));

  }

};

HANDLING THE END ANIMATION STATE

This else clause wasn’t necessary with the drawLine handler because, as soon as a line finishes animating, it will be passed to StaticLines, which renders all lines with their full length. This isn’t the case with the rotation angle: it remains fixed until the next rotation. Therefore, we need to ensure it’s at its correct final value.

We’ve got one final test. We need to increment the current animation command once the animation is done. As with the same test in the previous section, this test should live outside the describe block we’ve just used since it has a different test setup:
it("animates the next command once rotation is complete", async () => {

  renderWithStore(<Drawing />, {

    script: {

      drawCommands: [rotate90, horizontalLine]

    }

  });

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(500);

  triggerRequestAnimationFrame(0);

  triggerRequestAnimationFrame(250);

  expect(Turtle).toBeRenderedWithProps({

    x: 150,

    y: 100,

    angle: 90

  });

});

To make that pass, add the call to setNextCommandToAnimate into the else condition:
} else {

  setTurtle(turtle => ({

    ...turtle,

    angle: commandToAnimate.newAngle

  }));

  setAnimatingCommandIndex(

    (animatingCommandToIndex) =>

      animatingCommandToIndex + 1

  );

}

That’s it! If you haven’t done so already, it’s worth running the app to try it out.

Summary
In this chapter, we’ve explored how to test the requestAnimationFrame browser API. It’s not a straightforward process, and there are multiple tests that need to be written if you wish to be fully covered.

Nevertheless, you’ve seen that it is entirely possible to write automated tests for onscreen animation. The benefit of doing so is that the complex production code is fully documented via the tests.

In the next chapter, we’ll look at adding WebSocket communication into Spec Logo.

Exercises
Update Drawing so that it resets the turtle position when the user clears the screen with the Reset button.
Our tests have a lot of duplication due to the repeated calls to triggerRequestAnimationFrame. Simplify how this is called by creating a wrapper function called triggerAnimationSequence that takes an array of frame times and calls triggerRequestAnimationFrame for each of those times.
Loading an existing script (for example, on startup) will take a long time to animate all instructions, and so will pasting in code snippets. Add a Skip animation button that can be used to skip all the queued animations.
Ensure that the Undo button works correctly when animations are in progress.

