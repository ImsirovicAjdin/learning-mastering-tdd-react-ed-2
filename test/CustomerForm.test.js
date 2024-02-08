import React from "react";
import {
    initializeReactContainer,
    render,
    element,
    form,
    field,
    click,
    submit,
    submitButton,
} from "./reactTestExtensions";

import { CustomerForm } from "../src/CustomerForm";

describe("CustomerForm", () => {
    const blankCustomer = {
        firstName: "",
    };
    beforeEach(() => {
        initializeReactContainer();
    });
    it("renders a form", () => {
        render(<CustomerForm original={blankCustomer} />);
        // expect(element("form")).not.toBeNull();
        expect(form()).not.toBeNull();
    });
    it("renders the first name field as a text box", () => {
        render(<CustomerForm original={blankCustomer} />);
        const firstNameField = field("firstName");
        expect(firstNameField).not.toBeNull();
        expect(firstNameField.tagName).toEqual("INPUT"); // Check if the element is an input
        expect(firstNameField.type).toEqual("text"); // Check if the input type is "text"
    });
    it("includes the existing value for the first name", () => {
        const customer = { firstName: "Ashley" };
        render(<CustomerForm original={customer} />);
        expect(field("firstName").value).toEqual("Ashley");
    });
    it("renders a label for the first name field", () => {
        render(<CustomerForm original={blankCustomer} />);
        const label = element("label[for=firstName]");
        expect(label).not.toBeNull();
    });
    it("renders 'First name' as the first name label content", () => {
        render(<CustomerForm original={blankCustomer} />);
        const label = element("label[for=firstName]");
        expect(label).toContainText("First name");
    });
    it("assigns an id that matches the label id to the first name field", () => {
        render(<CustomerForm original={blankCustomer} />);
        expect(field("firstName").id).toEqual("firstName");
    });
    it("renders a submit button", () => {
        render(<CustomerForm original={blankCustomer} />);
        // const button = element("input[type=submit]");
        // expect(button).not.toBeNull();
        expect(submitButton()).not.toBeNull();
    });
    it("saves existing first name when submitted", () => {
        expect.hasAssertions();
        const customer = { firstName: "Ashley" };
        render(
            <CustomerForm
              original={customer}
              onSubmit={({ firstName }) =>
                expect(firstName).toEqual("Ashley")
              }
            />
        );
        const button = element("input[type=submit]");
        click(button);
    });
    it("prevents the default action when submitting the form", () => {
        render(
            <CustomerForm
                original={blankCustomer}
                onSubmit={() => {}}
            />
        );
        const event = submit(form());
        expect(event.defaultPrevented).toBe(true);
    });
    it("saves new first name when submitted", () => {
        expect.hasAssertions();
        render(
            <CustomerForm
                original={blankCustomer}
                onSubmit={
                    ({ firstName }) => expect(firstName).toEqual("Jamie")
                }
            />
        );
    });
});
