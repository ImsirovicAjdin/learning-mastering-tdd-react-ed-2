# Part 4 - Behavior-Driven Development with Cucumber

# Chapter 19 - Understanding TDD in the Wider Testing Landscape

19
Understanding TDD in the Wider Testing Landscape
Besides the mechanics of test-driven development, this book has touched on a few ideas about the mindset of the TDD practitioner: how and when to “cheat,” systematic refactoring, strict TDD, and so on.

Some dev teams like to adopt the mantra of move fast and break things. TDD is the opposite: go slow and think about things. To understand what this means in practice, we can compare TDD with various other popular testing techniques.

The following topics will be covered in this chapter:

Test-driven development as a testing technique
Manual testing
Automated testing
Not testing at all
By the end of this chapter, you should have a good idea of why and how we practice TDD compared to other programming practices.

Test-driven development as a testing technique
TDD practitioners sometimes like to say that TDD is not about testing; rather, it’s about design, behavior, or specification, and the automated tests we have at the end are simply a bonus.

Yes, TDD is about design, but TDD is certainly about testing, too. TDD practitioners care that their software has a high level of quality, and this is the same thing that testers care about.

Sometimes, people question the naming of TDD because they feel that the notion of a “test” confuses the actual process. The reason for this is that developers misunderstand what it means to build a “test.” A typical unit testing tool offers you practically no guidance on how to write good tests. And it turns out that reframing tests as specifications and examples is a good way to introduce testing to developers.

All automated tests are hard to write. Sometimes, we forget to write important tests, or we build brittle tests, write loose expectations, over-complicate solutions, forget to refactor, and so on.

It’s not just novices who struggle with this – everyone does it, experts included. People make a mess all the time. That’s also part of the fun. Discovering the joy of TDD requires a certain degree of humility and accepting that you aren’t going to be writing pristine test suites most of the time. Pristine test suites are very rare indeed.

If you are lucky enough to have a tester on your team, you may think that TDD encroaches on their work, or may even put them out of a job. However, if you ask them their opinion, you’ll undoubtedly find they are only too keen for developers to take an interest in the quality of their work. With TDD, you can catch all those trivial logic errors yourself without needing to rely on someone else’s manual testing. The testers can then better use their time by focusing on testing complex use cases and hunting down missed requirements.

Best practices for your unit tests
The following are some great unit tests:

Independent: Each test should test just one thing, and invoke only one unit. There are many techniques that we can employ to achieve this goal. To take just two examples, collaborators are often (but not always) mocked, and example data should be the minimum set of data required to correctly describe the test.
CLASSICIST VERSUS MOCKIST TDD

You may have heard of the great TDD debate of classicist versus mockist TDD. The idea is that the classicist will not use mocks and stubs, while the mockist will mock all collaborators. In reality, both techniques are important. You have seen both in use in this book. I encourage you to not limit yourself to a single approach, but instead experiment and learn to be comfortable with both.

Short, with a high level of abstraction: The test description should be concise. The test code should highlight all the pieces of code that are important to the test, and hide any apparatus that’s required but not relevant.
Quick to run: Use test doubles instead of interacting with system resources (files, network connections, and so on) or other processes. Do not use timeouts in your code, or rely on the passing of time.
Focused on observable behavior: The system is interesting for what it does to the outside world, not for how it does it. In the case of React, we care about DOM interaction.
In three parts: These parts are Arrange, Act, and Assert, also known as the AAA pattern. Each test should follow this structure.
Don’t Repeat Yourself (DRY): Always take the time to refactor and clean up your tests, aiming for readability.
A design tool: Great tests help you figure out how to design your system. That’s not to say that up-front design isn’t important. In almost every chapter in this book, we started with a little design before we embarked on our tests. It’s important to do some thinking so that you have an idea of the general direction you’re headed. Just don’t try to plan too far ahead, and be prepared to throw out your design entirely as you proceed.
TDD is not a replacement for great design. To be a great TDD practitioner, you should also learn about and practice software design. There are many books about software design. Do not limit yourself to books about JavaScript or TypeScript; good design transcends language.

Improving your technique
The following are some general tips for improving:

Work with others: Beyond reading this book, the best way to level up in TDD is to work with experts. Since TDD lends itself so well to pair and mob programming, it can give structure to teams of mixed experience. More experienced developers can use the granularity of small tests to help improve the work of less experienced developers.
Experiment with design: TDD gives you a safety net that allows you to experiment with the style and shape of your programs. Make use of that safety net to learn more about design. Your tests will keep you safe.
Learn to slow down: TDD requires a great deal of personal discipline. Unfortunately, there is no room for sloppiness. You must not cut corners; instead, take every opportunity to refactor. Once your test passes, sit with your code. Before moving on to the next test, stare at your current solution and think carefully about whether it is the best it can be.
Don’t be afraid to defer design decisions: Sometimes, we’re faced with several design options, and it can be tricky to know which option to choose. Even a simple act such as naming variables can be difficult. Part of having a sense of design is knowing when to defer your thinking. If you’re in the refactor stage and feel yourself weighing up two or more options, move on and add another test, and then revisit your design. You’ll often find that you have more design knowledge and will be closer to the right answer.
Solve a kata each day: A kata is a short exercise designed to be practiced repeatedly to teach you a certain technique. Two basic katas are Coin Changer and Roman Numerals. More complex katas include the bowling game kata, the bank kata, and Conway’s Game of Life. The diamond kata is a favorite of mine, as are sorting algorithms.
Attend a Coderetreat: Coderetreats involve a day of pairing and TDD that revolves around the Game of Life kata. The Global Day of Coderetreat is held in November. Groups from all around the world get together to solve this problem. It’s not only fun but a great way to expand your TDD horizons.
That covers the general advice on TDD. Next, let’s look at manual testing techniques.

Manual testing
Manual testing, as you may have guessed, means starting your application and actually using it.

Since your software is your creative work, naturally, you are interested to find out how it performs. You should certainly take the time to do this but think of it as downtime and a chance to relax, rather than a formal part of your development process.

The downside to using your software as opposed to developing your software is that using it takes up a lot of time. It sounds silly but pointing, clicking, and typing all take up valuable time. Plus, it takes time to get test environments set up and primed with the relevant test data.

For this reason, it’s important to avoid manual testing where possible. There are, however, times when it’s necessary, as we’ll discover in this section.

There is always a temptation to manually test the software after each feature is complete, just to verify that it works. If you find yourself doing this a lot, consider how much confidence you have in your unit tests.

If you can claim, “I have 100% confidence in my unit tests,” why would you ever need to use your software to prove it?

Let’s look at some specific types of manual testing, starting with demonstrating software.

Demonstrating software
There are at least two important occasions where you should always manually test: when you are demonstrating your software to your customers and users, and when you are preparing to demonstrate your software.

Preparing means writing down a demo script that lists every action you want to perform. Rehearse your script at least a couple of times before you perform it live. Very often, rehearsals will bring about changes to the script, which is why rehearsals are so important. Always make sure you’ve done at least one full run-through that didn’t require changes before you perform a live demo.

Testing the whole product
Frontend development includes a lot of moving parts, including the following:

Multiple browser environments that require support
CSS
Distributed components, such as proxies and caches
Authentication mechanisms
Manually testing is necessary because of the interaction of all these moving parts. We need to check that everything sits together nicely.

Alternatively, you can use end-to-end tests for the same coverage; however, these are costly to develop and maintain.

Exploratory testing
Exploratory testing is what you want your QA team to do. If you don’t work with a QA team, you should allocate time to do this yourself. Exploratory testing involves exploring software and hunting for missing requirements or complex use cases that your team has not thought about yet.

Because TDD works at a very low level, it can be easy to miss or even misunderstand requirements. Your unit tests may cover 95% of cases, but you can accidentally forget about the remaining 5%. This happens a lot when a team is new to TDD, or is made up of novice programmers. It happens all the time with experienced TDDers, too – even those of us who write books on TDD! We all make errors from time to time.

A very common error scenario involves mocks. When a class or function signature is changed, any mocks of that class or function must also be updated. This step is often forgotten; the unit tests still pass, and the error is only discovered when you run the application for real.

BUG-FREE SOFTWARE

TDD can give you more confidence, but there is absolutely no way that TDD guarantees bug-free software.

With time and experience, you’ll get better at spotting all those pesky edge cases before they make it to the QA team.

An alternative to exploratory testing is automated acceptance tests, but as with end-to-end tests, these are costly to develop and maintain, and they also require a high level of expertise and team discipline.

Debugging in the browser
Debugging is always an epic time sink. It can be an incredibly frustrating experience, with a lot of hair-pulling. That’s a big reason we test-drive: so that we never have to debug. Our tests do the debugging for us.

Conversely, a downside of TDD is that your debugging skills will languish.

For the TDD practitioner, debugging should, in theory, be a very rare experience, or at least something that is actively avoided. But there are always occasions when debugging is necessary.

Print-line debugging is the name given to the debugging technique where a code base is littered with console.log statements in the hope that they can provide runtime clues about what’s going wrong. I’ve worked with many programmers who began their careers with TDD; for many of them, print-line debugging is the only form of debugging they know. Although it’s a simple technique, it’s also time-consuming, involves a lot of trial and error, and you have to remember to clean up after yourself when you’re done. There’s a risk of accidentally forgetting about a stray console.log and it then going live in production.

Modern browsers have very sophisticated debugging tools that, until just recently, would have been imaginable only in a “full-fat” IDE such as Visual Studio or IntelliJ. You should make time to learn about all of the standard debugging techniques, including setting breakpoints (including conditional breakpoints), stepping in, out, and over, watching variables, and so on.

A common anti-pattern is to use debugging techniques to track down a bug, and once it’s discovered, fix it and move on to the next task. What you should be doing instead is writing a failing test to prove the existence of a bug. As if by magic, the test has done the debugging for you. Then, you can fix the bug, and immediately, the test will tell you whether the issue has been fixed, without you needing to manually re-test. Think of all the time you’ll save!

Check out the Further reading section for resources on the Chrome debugger.

That covers the main types of manual testing that you’ll perform. Next, let’s take a look at automated testing techniques.

Automated testing
TDD is a form of automated testing. This section lists some other popular types of automated testing and how they compare to TDD.

Integration tests
These tests check how two or more independent processes interact. Those processes could either be on the same machine or distributed across a network. However, your system should exercise the same communication mechanisms as it would in production, so if it makes HTTP calls out to a web service, then it should do so in your integration tests, regardless of where the web service is running.

Integration tests should be written in the same unit test framework that you use for unit tests, and all of the same rules about writing good unit tests apply to integration tests.

The trickiest part of integration testing is the orchestration code, which involves starting and stopping processes, and waiting for processes to complete their work. Doing that reliably can be difficult.

If you’re choosing to mock objects in your unit tests, you will need at least some coverage of those interactions when they aren’t mocked, and integration tests are one way to do that. Another way is system testing, as discussed below.

System tests and end-to-end tests
These are automated tests that exercise the entire system, usually (but not necessarily) by driving a UI.

They are useful when manual exploratory testing starts taking an inordinate amount of time. This happens with codebases as they grow in size and age.

End-to-end tests are costly to build and maintain. Fortunately, they can be introduced gradually, so you can start small and prove their value before increasing their scope.

Acceptance tests
Acceptance tests are written by the customer, or a proxy to the customer such as a product owner, where acceptance refers to a quality gate that must be passed for the released software to be accepted as complete. They may or may not be automated, and they specify behavior at a system level.

How should the customer write these tests? For automated tests, you can often use system testing tools such as Cucumber and Cypress. The Gherkin syntax that we saw in Chapter 17, Writing Your First Cucumber Test, and Chapter 18, Adding Features Guided by Cucumber Tests, is one way to do it.

Acceptance tests can be used to build trust between developers and product stakeholders. If the customer is endlessly testing your software looking for bugs, that points to a low level of trust between the development team and the outside world. Acceptance tests could help improve that trust if they start catching bugs that would otherwise be found by your customer. At the same time, however, you should be asking yourself why TDD isn’t catching all those bugs in the first place and consider how you can improve your overall testing process.

Property-based and generative testing
In traditional TDD, we find a small set of specifications or examples to test our functions against. Property-based testing is different: it generates a large set of tests based on a definition of what the inputs to those functions should be. The test framework is responsible for generating the input data and the tests.

For example, if I had a function that converted Fahrenheit to Celsius, I could use a generative test framework to generate tests for a large, random sample of integer-valued Fahrenheit measurements and ensure that each of them converts into the correct Celsius value.

Property-based testing is just as hard as TDD. It is no magic bullet. Finding the right properties to assert is challenging, particularly if you aim to build them up in a test-driven style.

This kind of testing does not replace TDD, but it is another tool in any TDD practitioner’s toolbox.

Snapshot testing
This is a popular testing technique for React applications. React component trees are serialized to disk as a JSON string and then compared between test runs.

React component trees are useful in a couple of important scenarios, including the following:

When your team has a low level of experience with TDD and general program design and could become more confident with a safety net of snapshot testing
When you have zero test coverage of software that is already being used in production, and you would like to quickly gain some level of confidence before making any changes
QA teams are sometimes interested in how software changes visually between releases, but they will probably not want to write tests in your unit test suites; they’ll have their own specialized tool for that.

Snapshot testing is certainly a useful tool to know about, but be aware of the following issues:

Snapshots are not descriptive. They do not go beyond saying, “this component tree looks the same as it did before.” This means that if they break, it will not be immediately clear why they broke.
If snapshots are rendered at a high level in your component tree, they are brittle. Brittle tests break frequently and therefore take a lot of time to correct. Since the tests are at a high level, they do not pinpoint where the error is, so you’ll spend a lot of time hunting down failures.
Snapshot tests can pass in two scenarios: first, when the component tree is the same as the previous version that was tested, and second, when no snapshot artifacts from the previous test run are found. This means that a green test does not give you full confidence – it could simply be green because previous artifacts are missing.
When writing good tests (of any kind), you want the following to be true of any test failure that occurs:

It is very quick to ascertain whether the failure is due to an error or a change in specification
In the case of errors, it is very quick to pinpoint the problem and the location of the error
TDD is an established technique that the community has learned enough about to know how to write good tests. We aren’t quite there with snapshot testing. If you absolutely must employ snapshot testing in your code base, make sure that you measure how much value it is providing you and your team.

Canary testing
Canary testing is when you release your software to a small proportion of your users and see what happens. It can be useful for web applications with a large user base. One version of canary testing involves sending each request to two systems: the live system and the system under test. Users only sense the live system but the test system results are recorded and analyzed by you. Differences in functionality and performance can then be observed, while your users are never subjected to test software.

Canary testing is attractive because, on the surface, it seems very cost-effective, and also requires next to no thinking from the programmer.

Unlike TDD, canary testing cannot help you with the design of your software, and it may take a while for you to get any feedback.

That completes our look at the automated testing landscape. We started this chapter by looking at manual testing techniques. Now, let’s round this chapter off with a final technique: not testing at all!

Not testing at all
There is a belief that TDD doesn’t apply to some scenarios in which it does – for example, if your code is throwaway or if it’s presumed to never need modification once it’s deployed. Believing this is almost ensuring the opposite is true. Code, particularly code without tests, has a habit of living on beyond its intended lifespan.

FEAR OF DELETING CODE

In addition to reducing the fear of changing code, tests also reduce the fear of removing code. Without tests, you’ll read some code and think “maybe something uses this code for some purpose I don’t quite remember.” With tests in place, this won’t be a concern. You’ll read the test, see that the test no longer applies due to a changed requirement, and then delete the test and its corresponding production code.

However, there are several scenarios in which not writing tests is acceptable. The two most important ones are as follows.

When quality doesn’t matter
Unfortunately, in many environments, quality doesn’t matter. Many of us can relate to this. We’ve worked for employers who actively disregard quality. These people make enough profit that they don’t need or want to care. Caring about quality is, unfortunately, a personal choice. If you are in a team that does not value quality, it will be hard to convince them that TDD is worthwhile.

If you’re in this situation and you have a burning desire to use TDD, then you have a few options. First, you can spend time convincing your colleagues that it is a good idea. This is never an easy task. You could also play the TDD-by-stealth game, in which you don’t ask permission before you start. Failing these options, some programmers will be fortunate enough that they can take the risk of finding an alternative employer that does value quality.

Spiking and deleting code
Spiking means coding without tests. We spike when we’re in uncharted territory. We need to find a workable approach to a problem we’ve never solved before, and there is likely to be a great deal of trial and error, along with a lot of backtracking. There is a high chance of finding unworkable approaches before a workable one. Writing tests doesn’t make much sense in this situation because many of the tests written along the way will ultimately end up being scrapped.

Let’s say, for example, that I’m building a web socket server and client, but it’s the first time I’ve used WebSockets. This would be a good candidate for spiking – I can safely explore the WebSocket API until I’m comfortable baking it into my application.

It’s important to stop spiking when you feel that you’ve hit on a workable approach. You don’t need a complete solution, just one that teaches you enough to set you off on the right path.

In the purist vision of TDD, spiking must be followed by deleting. If you’re going to spike, you must be comfortable with deleting your work. Unfortunately, that’s easier said than done; it’s hard to scrub out creative output. You must shake off the belief that your code is sacred. Be happy to chuck it away.

In the pragmatic vision of TDD, spiking can often be followed by writing tests around the spiked code. I use this technique all the time. If you’re new to TDD, it may be wise to avoid this particular cheat until you’re confident that you can think out a test sequence of required tests that will cover all the required functionality within spike code.

A purist may say that your spike code can include redundant code, and it may not be the simplest solution because tests will not have driven the implementation. There is some merit to this argument.

SPIKING AND TEST-LAST DEVELOPMENT

Spiking is related to the practice of test last, but there’s a subtle difference. Writing code around a spike is a TDD cheat in that you want your finished tests to look as if you used TDD in the first place. Anyone else coming along after you should never know that you cheated.

Test last, however, is a more loosely defined way of testing where you write all the production code and then write some unit tests that prove some of the more important use cases. Writing tests like this gives you some level of regression coverage but none of the other benefits of TDD.

Summary
Becoming a great practitioner of TDD takes great effort. It requires practice, experience, determination, and discipline.

Many people have tried TDD and failed. Some of them will conclude that TDD is broken. But I don’t believe it’s broken. It just takes effort and patience to get right.

But what is getting it right, anyway?

All software development techniques are subjective. Everything in this book is subjective; it is not the right way. It is a collection of techniques that I like to use, and that I have found success with. Other people have found success with other techniques.

The exciting part of TDD is not the black-and-white, strict form of the process; it is the grays in which we can define (and refine) a development process that works for us and our colleagues. The TDD cycle gives us just enough structure that we can find joy in fleshing it out with our rules and our own dogma.

I hope you have found this book valuable and enjoyable. There are many, many ways to test-drive React applications and I hope that this is the launchpad for you to evolve your testing practice.

Further reading
To learn more about the topics that were covered in this chapter, take a look at the following resources:

Useful Kata resources:
http://codingdojo.org/kata/

http://codekata.com

http://kata-log.rocks

https://github.com/sandromancuso/Bank-kata

http://www.natpryce.com/articles/000807.html

Global Day of Coderetreat: https://www.coderetreat.org
Getting Started with Debugging JavaScript in Chrome DevTools: https://developers.google.com/web/tools/chrome-devtools/javascript/
Property-based testing for JavaScript: https://github.com/leebyron/testcheck-js

