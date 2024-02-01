# Part 4 - Behavior-Driven Development with Cucumber

Part 4 – Behavior-Driven Development with Cucumber
This part is about behavior-driven development (BDD) using Cucumber tests. Whereas the first three parts were focused on building Jest unit tests at the component level, this part looks at writing tests at the system level—you might also think of these as end-to-end tests. The goal is to show how the TDD workflow applies beyond unit testing and can be used by the whole team, not just developers.

Finally, we end the book with a discussion of how TDD fits within the wider testing landscape and suggestions for how you can continue your TDD journey.

This part includes the following chapters:

Chapter 17, Writing Your First Cucumber Test
Chapter 18, Adding Features Guided by Cucumber Tests
Chapter 19, Understanding TDD in the Wider Testing Landscape


# Chapter 17 - Writing Your First Cucumber Test

17
Writing Your First Cucumber Test
Test-driven development is primarily a process for developers. Sometimes, customers and product owners want to see the results of automated tests too. Unfortunately, the humble unit test that is the foundation of TDD is simply too low-level to be helpful to non-developers. That’s where the idea of Behavior Driven Development (BDD) comes in.

BDD tests have a few characteristics that set them apart from the unit tests you’ve seen so far:

They are end-to-end tests that operate across the entire system.
They are written in natural language rather than code, which is understandable by non-coders and coders alike.
They avoid making references to internal mechanics, instead focusing on the outward behavior of the system.
The test definition describes itself (with unit tests, you need to write a test description that matches the code).
The syntax is designed to ensure that your tests are written as examples, and as discrete specifications of behavior.
BDD TOOLS VS TDD VS UNIT TESTS

The style of TDD you’ve seen so far in this book treats (for the most part) its tests as examples that specify behavior. Also, our tests were always written in the Arrange-Act-Assert (AAA) pattern. However, notice that unit test tools such as Jest do not force you to write tests this way.

This is one reason why BDD tools exist: to force you to be very clear when you specify the behavior of your system.

This chapter introduces two new software packages: Cucumber and Puppeteer.

We’ll use Cucumber to build our BDD tests. Cucumber is a system that exists for many different programming environments, including Node.js. It consists of a test runner that runs tests contained within feature files. Features are written in a plain-English language known as Gherkin. When Cucumber runs your tests, it translates these feature files into function calls; these function calls are written in JavaScript support scripts.

Since Cucumber has its own test runner, it doesn’t use Jest. However, we will make use of Jest’s expect package in some of our tests.

CUCUMBER IS NOT THE ONLY WAY TO WRITE SYSTEM TESTS

Another popular testing library is Cypress, which may be a better choice for you and/or your team. Cypress puts the emphasis on the visual presentation of results. I tend to avoid it because its API is very different from industry-standard testing patterns, which increases the amount of knowledge developers need to have. Cucumber is cross-platform and tests look very similar to the standard unit tests you’ve seen throughout this book.

Puppeteer performs a similar function to the JSDOM library. However, while JSDOM implements a fake DOM API within the Node.js environment, Puppeteer uses a real web browser, Chromium. In this book, we’ll use it in headless mode, which means you won’t see the app running onscreen; but you can, if you wish, turn headless mode off. Puppeteer comes with all sorts of bolt-ons, such as the ability to take screenshots.

CROSS-BROWSER TESTING

If you wish to test cross-browser support for your application, you may be better off looking at an alternative such as Selenium, which isn’t covered in this book. However, the same testing principles apply when writing tests for Selenium.

This chapter covers the following topics:

Integrating Cucumber and Puppeteer into your code base
Writing your first Cucumber test
Using data tables to perform setup
By the end of the chapter, you’ll have a good idea of how a Cucumber test is built and run.

Technical requirements
The code files for this chapter can be found here:

https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition/tree/main/Chapter17

Integrating Cucumber and Puppeteer into your code base
Let’s add the necessary packages to our project:

Start by installing the packages we’re after. As well as Cucumber and Puppeteer, we’ll also pull in @babel/register, which will enable us to use ES6 features within our support files:
$ npm install --save-dev @cucumber/cucumber puppeteer

$ npm install --save-dev @babel/register

Next, create a new file named cucumber.json with the following content. This has two settings; publishQuiet turns off a bunch of noise that would otherwise appear when you run tests, and requireModule hooks up @babel/register before tests are run:
{

  "default": {

    "publishQuiet": true,

    "requireModule": [

      "@babel/register"

    ]

  }

}

Create a new folder called features. This should live at the same level as src and test.
Create another folder within that called features/support.
You can now run tests with the following command:

$ npx cucumber-js

You’ll see output like this:

0 scenarios

0 steps

0m00.000s

Throughout this chapter and the following one, it may be helpful to narrow down the tests you’re running. You can run a single scenario by providing the test runner with the filename and starting line number of the scenario:

$ npx cucumber-js features/drawing.feature:5

That’s all there is to getting set up with Cucumber and Puppeteer—now it’s time to write a test.

Writing your first Cucumber test
In this section, you’ll build a Cucumber feature file for a part of the Spec Logo application that we’ve already built.

WARNING ON GHERKIN CODE SAMPLES

If you’re reading an electronic version of this book, be careful when copying and pasting feature definitions. You may find extra line breaks are inserted into your code that Cucumber won’t recognise. Before running your tests, please look through your pasted code snippets and remove any line breaks that shouldn’t be there.

Let’s get started!

Before running any Cucumber tests, it’s important to ensure that your build output is up to date by running npm run build. Your Cucumber specs are going to run against the code built in the dist directory, not your source in the src directory.
USE PACKAGE.JSON SCRIPTS TO YOUR ADVANTAGE

You could also modify your package.json scripts to invoke a build before Cucumber specs are run, or to run webpack in watch mode.

Create a new file named features/sharing.feature and enter the following text. A feature has a name and a short description, as well as a bunch of scenarios listed one after another. We’ll start with just one scenario for now:
Feature: Sharing

  A user can choose to present their session to any

  number of other users, who observe what the

  presenter is doing via their own browser.

  Scenario: Observer joins a session

    Given the presenter navigated to the application page

    And the presenter clicked the button 'startSharing'

    When the observer navigates to the presenter's sharing link

    Then the observer should see a message saying 'You are now watching the session'

GHERKIN SYNTAX

Given, When, and Then are analogous to the Arrange, Act, and Assert phases of your Jest tests: given all these things are true, when I perform this action, then I expect all these things to happen.

Ideally, you’d have a single When clause in each of your scenarios.

You’ll notice that I’ve written the Given clauses in past tense and the When clause in the present tense, and the Then clause has a “should” in there.

Go ahead and run the feature by typing npx cucumber-js at the command line. You’ll see a warning printed, as shown in the following code block. Cucumber has stopped processing at the first Given... statement because it can’t find the JavaScript support function that maps to it. In the warning, Cucumber has helpfully given you a starting point for the definition:
? Given the presenter navigated to the application page

   Undefined. Implement with the following snippet:

     Given('the presenter navigated to the application page', function () {

       // Write code here that turns the phrase above

       // into concrete actions

       return 'pending';

     });

Let’s do exactly what it suggested. Create the features/support/sharing.steps.js file and add the following code. It defines a step definition that calls Puppeteer’s API to launch a new browser, then open a new page, and then navigate to the URL provided. The step definition description matches up with the Given clause in our test scenario.
The second parameter to Given is marked with the async keyword. This is an addition to what Cucumber tells us in its suggested function definition. We need async because Puppeteer’s API calls all return promises that we’ll need to await:
import {

  Given, When, Then

} from "@cucumber/cucumber";

import puppeteer from "puppeteer";

const port = process.env.PORT || 3000;

const appPage = `http://localhost:${port}/index.html`;

Given(

  "the presenter navigated to the application page",

  async function () {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(appPage);

  }

);

ANONYMOUS FUNCTIONS, NOT LAMBDA EXPRESSIONS

You may be wondering why we are defining anonymous functions (async function (...) { ... }) rather than lambda expressions (async (...) => { ... }). It allows us to take advantage of the implicit context binding that occurs with anonymous functions. If we used lambdas, we’d need to call .bind(this) on them.

Run your tests again. Cucumber now dictates the next clause that needs work. For this clause, And the presenter clicked the button 'startSharing', we need to get access to the page object we just created in the previous step. The way to do this is by accessing what’s known as the World object, which is the context for all the clauses in the current scenario. We must build this now. Create the features/support/world.js file and add the following content. It defines two methods, setPage and getPage, which allow us to save multiple pages within the world. The ability to save multiple pages is important for this test, where we have at least two pages—the presenter page and the observer page:
import {

  setWorldConstructor

} from "@cucumber/cucumber";

class World {

  constructor() {

    this.pages = {};

  }

  setPage(name, page) {

    this.pages[name] = page;

  }

  getPage(name) {

    return this.pages[name];

  }

};

setWorldConstructor(World);

We can now use the setPage and getPage functions from within our step definitions. Our approach will be to call setPage from the first step definition—the one we wrote in step 3—and then use getPage to retrieve it in subsequent steps. Modify the first step definition now to include the call to setPage, as shown in the following code block:
Given(

  "the presenter navigated to the application page",

  async function () {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(appPage);

    this.setPage("presenter", page);

  }

);

Moving on to the next step, the presenter clicked the button 'startSharing', we’ll solve this by using the Page.click Puppeteer function to find a button with an ID of startSharing. As in the last test, we use a buttonId parameter so that this step definition can be used with other buttons in future scenarios:
Given(

  "the presenter clicked the button {string}",

  async function (buttonId) {

    await this.getPage(

      "presenter"

    ).click(`button#${buttonId}`);

  }

);

The next step, the observer navigates to the presenter's sharing link, is like the first step in that we want to open a new browser. The difference is that it’s for the observer, and we first need to look up the path to follow. The path is given to us through the URL that the presenter is shown once they start searching. We can look that up using the Page.$eval function:
When(

  "the observer navigates to the presenter's sharing link",

  async function () {

    await this.getPage(

      "presenter"

    ).waitForSelector("a");

    const link = await this.getPage(

      "presenter"

    ).$eval("a", a => a.getAttribute("href"));

    const url = new URL(link);

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    this.setPage("observer", page);

  }

);

STEP DEFINITION DUPLICATION

There’s some duplication building up between our step definitions. Later on, we’ll extract this commonality into its own function.

The final step definition uses the Page.$eval Puppeteer function again, this time to find an HTML node and then transform it into a plain JavaScript object. We then test that object using the expect function in the normal way. Make sure to place the listed import statement at the top of your file:
import expect from "expect";

...

Then(

  "the observer should see a message saying {string}",

  async function (message) {

    const pageText = await this.getPage(

      "observer"

    ).$eval("body", e => e.outerHTML);

    expect(pageText).toContain(message);

  }

);

Run your tests with npx cucumber-js. The output from your test run will look as follows. While our step definitions are complete, something is amiss:
1) Scenario: Observer joins a session

   ✖ Given the presenter navigated to the application page

        Error: net::ERR_CONNECTION_REFUSED at http://localhost:3000/index.html

Although our app has loaded, we still need to spin up the server to process our requests. To do that, add the following two functions to the World class in features/support/world.js, including the import statement for the app at the top of the file. The startServer function is equivalent to how we start the server in server/src/server.js. The closeServer function stops the server, but before it does this, it closes all Puppeteer browser instances. It’s important to do this before closing the server. That’s because the server does not kill any live websocket connections when the close method is called. We need to ensure they are closed first; otherwise, the server won’t stop:
STARTING A SERVER FROM WITHIN THE SAME PROJECT

We are lucky that all our code lives within the same project, so it can be started within the same process. If your code base is split over multiple projects, you may find yourself dealing with multiple processes.

import { app } from "../../server/src/app";

class World {

  ...

  startServer() {

    const port = process.env.PORT || 3000;

    this.server = app.listen(port);

  }

  closeServer() {

    Object.keys(this.pages).forEach(name =>

      this.pages[name].browser().close()

    );

    this.server.close();

  }

}

Make use of these new functions with the Before and After hooks. Create a new file, features/support/hooks.js, and add the following code:
import { Before, After } from "@cucumber/cucumber";

Before(function() {

  this.startServer();

});

After(function() {

  this.closeServer();

});

Run the npx cucumber-js command and observe the output. Your scenario should now be passing (if it isn’t, double-check you’ve run npm run build):
> npx cucumber-js

......

1 scenario (1 passed)

4 steps (4 passed)

0m00.848s

Let’s go back and tidy up that repeated code. We’ll extract a function called browseToPageFor and place it within our World class. Open features/support/world.js and add the following method at the bottom of the class:
async browseToPageFor(role, url) {

  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.goto(url);

  this.setPage(role, page);

}

Also, move the Puppeteer import statement across from features/support/sharing.steps.js into features/support/world.js:
import puppeteer from "puppeteer";

Finally, rewrite the two navigation steps in terms of browseToPageFor:
Given(

  "the presenter navigated to the application page",

  async function () {

    await this.browseToPageFor("presenter", appPage);

  }

);

When(

  "the observer navigates to the presenter's sharing link",

  async function () {

    await this.getPage(

      "presenter"

    ).waitForSelector("a");

    const link = await this.getPage(

      "presenter"

    ).$eval("a", a => a.getAttribute("href"));

    const url = new URL(link);

    await this.browseToPageFor("observer", url);

  }

);

OBSERVING WITHIN A BROWSER AND WITH CONSOLE LOGGING

The tests we’ve written run Puppeteer in headless mode, meaning that an actual Chrome browser window doesn’t launch. If you’d like to see that happen, you can turn headless mode off by modifying the launch commands (remember there are two in the previous step definitions) to read as follows:

const browser = await puppeteer.launch(

{ headless: false }

);

If you’re using console logging to assist in your debugging, you’ll need to provide another parameter to dump console output to stdout:

const browser = await puppeteer.launch(

{ dumpio: true }

);

You’ve now written a BDD test with Cucumber and Puppeteer. Next, let’s look at a more advanced Cucumber scenario.

Using data tables to perform setup
In this section, we’ll look at a useful time-saving feature of Cucumber: data tables. We’ll write a second scenario that, as with the previous one, will already pass given the existing implementation of Spec Logo:

Create a new feature file called features/drawing.feature with the following content. It contains a set of instructions to draw a square using a Logo function. A small side length of 10 is used; that’s to make sure the animation finishes quickly:
Feature: Drawing

  A user can draw shapes by entering commands

  at the prompt.

  Scenario: Drawing functions

    Given the user navigated to the application page

    When the user enters the following instructions at the prompt:

      | to drawsquare |

      |   repeat 4 [ forward 10 right 90 ] |

      | end |

      | drawsquare |

    Then these lines should have been drawn:

      | x1 | y1 | x2 | y2 |

      | 0  | 0  | 10 | 0  |

      | 10 | 0  | 10 | 10 |

      | 10 | 10 | 0  | 10 |

      | 0  | 10 | 0  | 0  |

The first phrase does the same thing as our previous step definition, except we’ve renamed presenter to user. Being more generic makes sense in this case as the role of the presenter is no longer relevant to this test. We can use the World function browseToPageFor for this first step. In the sharing feature, we used this function together with an appPage constant that contained the URL to navigate to. Let’s pull that constant into World now. In features/support/world.js, add the following constant at the top of the file, above the World class:
const port = process.env.PORT || 3000;

Add the following method to the World class:
appPage() {

  return `http://localhost:${port}/index.html`;

}

In features/support/sharing.steps.js, remove the definitions for port and appPage and update the first step definition, as shown:
Given(

  "the presenter navigated to the application page",

  async function () {

    await this.browseToPageFor(

      "presenter",

      this.appPage()

    );

  }

);

It’s time to create a new step definition for a user page. Open the features/support/drawing.steps.js file and add the following code:
import {

  Given,

  When,

  Then

} from "@cucumber/cucumber";

import expect from "expect";

Given("the user navigated to the application page",

  async function () {

    await this.browseToPageFor(

      "user",

      this.appPage()

    );

  }

);

Now, what about the second line, with the data table? What should our step definition look like? Well, let’s ask Cucumber. Run the npx cucumber-js command and have a look at the output. It gives us the starting point of our definition:
1) Scenario: Drawing functions

  ✔ Before # features/support/sharing.steps.js:5

  ✔ Given the user navigated to the application page

  ? When the user enters the following instructions at the prompt:

    | to drawsquare |

    |   repeat 4 [ forward 10 right 90 ] |

    | end |

    | drawsquare |

  Undefined. Implement with the following snippet:

  When('the user enters the following instructions at the prompt:',

    function (dataTable) {

      // Write code here that turns the phrase above

      // into concrete actions

      return 'pending';

    }

  );

Go ahead and add the suggested code to features/supports/drawing.steps.js. If you run npx cucumber-js at this point, you’ll notice that Cucumber successfully notices that the step definition is pending:
When(

  "the user enters the following instructions at the prompt:",

  function (dataTable) {

    // Write code here that turns the phrase above

    //into concrete actions

    return "pending";

  }

);

The dataTable variable is a DataTable object with a raw() function that returns an array of arrays. The outer array represents each row, and the inner arrays represent the columns of each row. In the next step definition, we want to take every single line and insert it into the edit prompt. Each line should be followed by a press of the Enter key. Create that now:
When(

  "the user enters the following instructions at the prompt:",

  async function (dataTable) {

    for (let instruction of dataTable.raw()) {

      await this.getPage("user").type(

        "textarea",

        `${instruction}\n`

      );

    }

  }

);

The final step requires us to look for line elements with the right attribute values and compare them to the values in our second data table. The following code does exactly that. Copy it out now and run your tests to ensure that it works and that the test will pass. An explanation of all the detailed points will follow:
Then("these lines should have been drawn:",

  async function(dataTable) {

    await this.getPage("user").waitForTimeout(2000);

    const lines = await this.getPage("user").$$eval(

      "line",

      lines => lines.map(line => {

        return {

          x1: parseFloat(line.getAttribute("x1")),

          y1: parseFloat(line.getAttribute("y1")),

          x2: parseFloat(line.getAttribute("x2")),

          y2: parseFloat(line.getAttribute("y2"))

        };

      })

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

  }

});

That last test contained some complexity that’s worth diving into:

We used Page.waitForTimeout to wait for 2 seconds, which gives the system time to complete animations. Including a timeout like this is not a great practice, but it’ll work for now. We’ll look at a way of making this more specific in the next chapter.
The Page.$$eval function is like Page.$eval but returns an array under the hood, and calls document.querySelector rather than document.querySelectorAll.
It’s important that we do all of the attribute transformation logic—moving from HTML line elements and attributes to “plain” integer values of x1, y1, and so on—within the transform function of Page.$$eval. This is because Puppeteer will garbage collect any DOM node objects once the $$eval call is done.
Our line values need to be parsed with parseFloat because the requestAnimationFrame logic we coded doesn’t perfectly line up with the integer endpoints—they are out by very slight fractional amounts.
That also means we need to use the toBeCloseTo Jest matcher rather than toBe, which we need because of the fractional value difference described previously.
Finally, we use the DataTable hashes() function here to pull out an array of objects that has a key for each of the columns in the data table, based on the header row that we provided in the feature definition. So, for example, we can call hashes()[0].x1 to pull out the value in the x1 column for the first row.
Go ahead and run your tests again with npx cucumber-js. Everything should be passing.

You’ve now got a good understanding of using Cucumber data tables to make more compelling BDD tests.

Summary
Cucumber tests (and BDD tests in general) are similar to the unit tests we’ve been writing in the rest of the book. They are focused on specifying examples of behavior. They should make use of real data and numbers as means to test a general concept, like we’ve done in the two examples in this chapter.

BDD tests differ from unit tests in that they are system tests (having a much broader test surface area) and they are written in natural language.

Just as with unit tests, it’s important to find ways to simplify the code when writing BDD tests. The number one rule is to try to write generic Given, When, and Then phrases that can be reused across classes and extracted out of step definition files, either into the World class or some other module. We’ve seen an example of how to do that in this chapter.

In the next chapter, we’ll use a BDD test to drive the implementation of a new feature in Spec Logo.

