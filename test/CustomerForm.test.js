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
});
