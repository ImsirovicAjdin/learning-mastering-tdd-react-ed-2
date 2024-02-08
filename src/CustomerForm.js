import React from "react";
export const CustomerForm = ({
    original,
    onSubmit,
}) => {
    const handleSubmit = event => {
        event.preventDefault();
        onSubmit(original);
    };
    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="firstName">First name</label>
            <input
                type="text"
                name="firstName"
                id="firstName"
                value={original ? original.firstName : ""}
                readOnly
            />
            <input type="submit" value="Add" />
        </form>
    );
};
