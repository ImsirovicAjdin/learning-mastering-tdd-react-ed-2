import React from "react";
import ReactDOM from "react-dom/client";
import { Appointment } from "../src/Appointment";

it("renders the customer first name with a specific class", () => {
    const customer = { firstName: "Ashley" };
    const component = <Appointment customer={customer} />;
    const container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.createRoot(container).render(component);
    expect(document.body.textContent).toContain("Ashley");
    expect(document.body.innerHTML).toContain('<div class="specific-class">Ashley</div>');
});
