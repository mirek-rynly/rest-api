/* jshint node: true */
"use strict";

// actual package payload with comments
var packageModel = {
  "recipient": {
    "note": "This is a delivery note", // TODO: pass in
    "isSignatureRequired": false // hard-coded
  },
  "fromAddress": { // TODO: pass in
    "line1": "5604 NE Flanders St",
    "line2": null,
    "state": "OR",
    "city": "Portland",
    "zip": "97213",
    "location": {
      "latitude": 45.525453,
      "longitude": -122.606249
    },
    "company": "",
    "contactName": "Uat Test",
    "phone": "+1 971-960-4585"
  },
  "toAddress": { // TODO: pass in
    "company": "SAFEWAY",
    "contactName": "Mitch Adams",
    "line1": "2836 Pacific Ave",
    "line2": null,
    "city": "Forest Grove",
    "state": "OR",
    "country": null,
    "zip": "97116",
    "phone": "+1 971-708-6202",
    "location": {
      "latitude": 45.519412,
      "longitude": -123.095353
    }
  },
  "isExpedited": false, // hardcoded
  "promoCode": "",
  "sourceHub": { // it looks like this get set server side once we make the call
    // "hub": {
    //   "id": "f3c2b89f-01eb-4f38-a679-b1f6059e495c",
    //   "name": "PDX4",
    //   "address": {
    //     "company": "Mailboxes & More",
    //     "contactName": "Mailboxes & More",
    //     "line1": "Mailboxes & More, 515 NW Saltzman Rd",
    //     "line2": "",
    //     "city": "Portland",
    //     "state": "OR",
    //     "country": "US",
    //     "zip": "97229",
    //     "phone": "5036448504",
    //     "location": {
    //       "latitude": 45.523998,
    //       "longitude": -122.807096
    //     }
    //   },
    //   "territory": "Portland",
    //   "code": "PDX4",
    //   "type": 0,
    //   "openHour": 540,
    //   "closeHour": 1140,
    //   "specialNotes": "Enter through the back door of Mailboxes & More",
    //   "firstName": null,
    //   "lastName": null,
    //   "email": null,
    //   "password": null,
    //   "history": [
    //   {
    //     "log": "JobOpeningScheduleString is set to 02:00 PM",
    //     "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
    //     "dateModified": "2019-07-12T20:57:02.402Z",
    //     "userName": "blr1 blr1"
    //   },
    //   {
    //     "log": "Territory is set to Portland",
    //     "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
    //     "dateModified": "2019-09-23T11:20:01.713Z",
    //     "userName": "blr1 blr1"
    //   }
    //   ],
    //   "zipZones": [
    //   {
    //     "zipCode": "97106",
    //     "zone": "A"
    //   },
    //   {
    //     "zipCode": "97266",
    //     "zone": "D"
    //   }
    //   ],
    //   "jobOpeningSchedule": [
    //   600,
    //   840,
    //   900
    //   ],
    //   "autoJobOpenDelivery": true,
    //   "autoJobOpenPickUp": false,
    //   "timezone": "Pacific Standard Time",
    //   "autoJobVolumeThreshold": 2
    // },
    // "distanceInMiles": 9.7,
    // "closingHours": "07:00 PM",
    // "openingHours": "09:00 AM"
  },
  "destinationHub": { // as above
    // "hub": {
    //   "id": "f3c2b89f-01eb-4f38-a679-b1f6059e495c",
    //   "name": "PDX4",
    //   "address": {
    //     "company": "Mailboxes & More",
    //     "contactName": "Mailboxes & More",
    //     "line1": "Mailboxes & More, 515 NW Saltzman Rd",
    //     "line2": "",
    //     "city": "Portland",
    //     "state": "OR",
    //     "country": "US",
    //     "zip": "97229",
    //     "phone": "5036448504",
    //     "location": {
    //       "latitude": 45.523998,
    //       "longitude": -122.807096
    //     }
    //   },
    //   "territory": "Portland",
    //   "code": "PDX4",
    //   "type": 0,
    //   "openHour": 540,
    //   "closeHour": 1140,
    //   "specialNotes": "Enter through the back door of Mailboxes & More",
    //   "firstName": null,
    //   "lastName": null,
    //   "email": null,
    //   "password": null,
    //   "history": [
    //   {
    //     "log": "JobOpeningScheduleString is set to 02:00 PM",
    //     "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
    //     "dateModified": "2019-07-12T20:57:02.402Z",
    //     "userName": "blr1 blr1"
    //   },
    //   {
    //     "log": "Territory is set to Portland",
    //     "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
    //     "dateModified": "2019-09-23T11:20:01.713Z",
    //     "userName": "blr1 blr1"
    //   }
    //   ],
    //   "zipZones": [
    //   {
    //     "zipCode": "97106",
    //     "zone": "A"
    //   },
    //   {
    //     "zipCode": "97266",
    //     "zone": "D"
    //   }
    //   ],
    //   "jobOpeningSchedule": [
    //   600,
    //   840,
    //   900
    //   ],
    //   "autoJobOpenDelivery": true,
    //   "autoJobOpenPickUp": false,
    //   "timezone": "Pacific Standard Time",
    //   "autoJobVolumeThreshold": 2
    // }
  },
  // "deliveryMethodId": 2, // 2 is a pickup package, 1 is delivery, only used client side (reverse below!!!)
  // "promoCodeDisplayText": "",
  // "totalAmount": 24, // "compare at" value
  // "totalDiscount": 0,
  // "totalSpecial": 11,
  // "deliveryDateMessage": "GUARANTEED EXPEDITED DELIVERY DATE",
  // "deliverybyLabelText": "GUARANTEED SAME DAY",
  // "packageType": "RYNLY MEDIUM PACK",
  // "envelope": {}, // looks to be unused even for envelopes? assume its for multi package creation?
  "deliveryTimeId": 1, // hardcoded, based on UAT db looks like this is always 1 (??)
  "pickupNote": "This is a pickup note.", // TODO: param
  "discount": 0, // hardcoded
  "UserId": "cdacc808-1efa-47e7-9a50-a78aa0801efb", // TODO: param
  // "isDropOf": true, // only present for dropoff
  "DeliveryMethodId": "1", // 1 and 2 only options... and HERE 1 is pickup and 2 is delivery (reverse of "deliveryMethodId")
  "dueDate": "2019-10-15T12:50:06.380Z",
  "items": [
  {
    "type": 1,
    "envelopeCount": 0,
    "height": 9,
    "width": 9,
    "depth": 12
  }
  ],
  "promoCodeId": "" // hardcoded
};
