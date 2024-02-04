import React from "react";
export const CustomerForm = ({ original }) => (
    <form>
        <input
            type="text"
            name="firstName"
            value={original.firstName}
        />
    </form>
);
