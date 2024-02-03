// Commit message: Green: Implement Appointment component
import React, { useState } from "react";

const appointmentTimeOfDay = (startsAt) => {
    const [h, m] = new Date(startsAt)
        .toTimeString()
        .split(":");
    return `${h}:${m}`;
}

export const Appointment = ({ customer }) => {
    return (
        <div>
            {customer.firstName}
        </div>
    );
};

export const AppointmentsDayView = ({ appointments }) => {
    const [selectedAppointment, setSelectedAppointment] = useState(0);
    return (
        <div id="appointmentsDayView">
            <ol>
                {appointments.map(appointment => (
                    <li key={appointment.startsAt}>
                        <button type="button">
                            {appointmentTimeOfDay(appointment.startsAt)}
                        </button>
                    </li>
                ))}
            </ol>
            {appointments.length === 0 ? (
                <p>There are no appointments scheduled for today.</p>
            ) : (
                <Appointment {...appointments[selectedAppointment]} />
            )}
        </div>
    )
};
