// const today = new Date();
// const at = (hours) => today.setHours(hours, 0);
// export const sampleAppointments = [
//     { startsAt: at(9), customer: { firstName: "Charlie" } },
//     { startsAt: at(10), customer: { firstName: "Frankie" } },
//     { startsAt: at(11), customer: { firstName: "Casey" } },
//     { startsAt: at(12), customer: { firstName: "Ashley" } },
//     { startsAt: at(13), customer: { firstName: "Jordan" } },
//     { startsAt: at(14), customer: { firstName: "Jay" } },
//     { startsAt: at(15), customer: { firstName: "Alex" } },
//     { startsAt: at(16), customer: { firstName: "Jules" } },
//     { startsAt: at(17), customer: { firstName: "Stevie" } },
// ];

import { faker } from "@faker-js/faker";

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

Array.prototype.pickRandom = function () {
  return this[
    Math.floor(Math.random() * this.length)
  ];
};

const today = new Date();
const at = (hours) => today.setHours(hours, 0);

const stylists = [0, 1, 2, 3, 4, 5, 6]
  .map(() => faker.name.firstName())
  .unique();

const services = [
  "Cut",
  "Blow-dry",
  "Cut & color",
  "Beard trim",
  "Cut & beard trim",
  "Extensions",
];

const generateFakeCustomer = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  phoneNumber: faker.phone.number("(###) ###-####"),
});

const generateFakeAppointment = () => ({
  customer: generateFakeCustomer(),
  stylist: stylists.pickRandom(),
  service: services.pickRandom(),
  notes: faker.lorem.paragraph(),
});

export const sampleAppointments = [
  { startsAt: at(9), ...generateFakeAppointment() },
  { startsAt: at(10), ...generateFakeAppointment() },
  { startsAt: at(11), ...generateFakeAppointment() },
  { startsAt: at(12), ...generateFakeAppointment() },
  { startsAt: at(13), ...generateFakeAppointment() },
  { startsAt: at(14), ...generateFakeAppointment() },
  { startsAt: at(15), ...generateFakeAppointment() },
  { startsAt: at(16), ...generateFakeAppointment() },
  { startsAt: at(17), ...generateFakeAppointment() },
];