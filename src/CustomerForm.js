import React from "react";
export const CustomerForm = ({ original }) => (
    <form>
        <input
            type="text"
            name="firstName"
            value={original ? original.firstName : ""}
        />
    </form>
);
