// Commit message: Green: Implement Appointment component
import React from "react";

export const Appointment = ({ customer }) => {
    return (
        <div>
            {customer.firstName}
        </div>
    );
};

export const AppointmentsDayView = ({ appointments }) => (
    <div id="appointmentsDayView">
        <ol>
            {appointments.map(() => (
                <li />
            ))}
        </ol>
    </div>
);
