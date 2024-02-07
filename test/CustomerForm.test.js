import React from "react";
import {
    initializeReactContainer,
    render,
    element,
    form,
    field,
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
});
