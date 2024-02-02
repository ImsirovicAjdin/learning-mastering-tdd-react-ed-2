// Commit message: Green: Implement Appointment component
import React from "react";

export const Appointment = ({ customer }) => {
    return (
        <div>
            {customer.firstName}
        </div>
    );
};

export const AppointmentsDayView = () => (
    <div id="appointmentsDayView">
        <ol />
    </div>
);
