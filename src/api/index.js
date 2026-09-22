// src/api/index.js
// Central barrel for the RightTouch Admin/Owner API layer.
// Usage (modular):
//   import { auth, users, zones, zoneGeofence, serviceAvailability } from "api";
//   const { data, error } = await auth.ownerLogin({ identifier, password });
//
// Each function returns { data, error } — data is the response body on
// success, error is a normalized message string on failure.
import * as auth from "./auth";
import * as users from "./users";
import * as categories from "./categories";
import * as services from "./services";
import * as products from "./products";
import * as bookingsReports from "./bookingsReports";
import * as payments from "./payments";
import * as finance from "./finance";
import * as wallet from "./wallet";
import * as commission from "./commission";
import * as operationalCities from "./operationalCities";
import * as districts from "./districts";
import * as zones from "./zones";
import * as zoneMappings from "./zoneMappings";
import * as zoneGeofence from "./zoneGeofence";
import * as serviceAvailability from "./serviceAvailability";
import * as technicians from "./technicians";
import * as technicianDistricts from "./technicianDistricts";
import * as refundsComplaints from "./refundsComplaints";
import * as notifications from "./notifications";
import * as audit from "./audit";
import * as settings from "./settings";
import * as addresses from "./addresses";
import * as quotations from "./quotations";

export {
  auth,
  users,
  categories,
  services,
  products,
  bookingsReports,
  payments,
  finance,
  wallet,
  commission,
  operationalCities,
  districts,
  zones,
  zoneMappings,
  zoneGeofence,
  serviceAvailability,
  technicians,
  technicianDistricts,
  refundsComplaints,
  notifications,
  audit,
  settings,
  addresses,
  quotations,
};

export default {
  auth,
  users,
  categories,
  services,
  products,
  bookingsReports,
  payments,
  finance,
  wallet,
  commission,
  operationalCities,
  districts,
  zones,
  zoneMappings,
  zoneGeofence,
  serviceAvailability,
  technicians,
  technicianDistricts,
  refundsComplaints,
  notifications,
  audit,
  settings,
  addresses,
  quotations,
};
