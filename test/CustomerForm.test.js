import React from "react";
import {
    initializeReactContainer,
    render,
    element,
    form,
} from "./reactTestExtensions";

import { CustomerForm } from "../src/CustomerForm";

describe("CustomerForm", () => {
    beforeEach(() => {
        initializeReactContainer();
    });
    it("renders a form", () => {
        render(<CustomerForm />);
        // expect(element("form")).not.toBeNull();
        expect(form()).not.toBeNull();
    });
    it("renders the first name field as a text box", () => {
        render(<CustomerForm />);
        const field = form().elements.firstName;
        expect(field).not.toBeNull();
        expect(field.tagName).toEqual("INPUT");
        expect(field.type).toEqual("text");
    });
    it("includes the existing value for the first name", () => {
        const customer = { firstName: "Ashley" };
        render(<CustomerForm original={customer} />);
        const field = form().elements.firstName;
        expect(field.value).toEqual("Ashley");
    });
});
