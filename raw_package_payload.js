// actual package payload with comments
var packageModel = {
  "packageCreateModels": [
    {
      "recipient": {
        "note": "This is a delivery note", // TODO: pass in
      },
      "fromAddress": {
        "line1": "1145 se spokane st",
        "line2": null,
        "state": "OR",
        "city": "Portland",
        "zip": "97202",
        "location": {
          "latitude": 45.465231,
          "longitude": -122.653967
        },
        "company": "Test",
        "contactName": "Uat Test",
        "phone": "+1 503-960-4585"
      },
      "toAddress": {
        "company": null,
        "contactName": "mirek",
        "line1": "1145 SE Spokane St",
        "line2": null,
        "city": "Portland",
        "state": "OR",
        "country": null,
        "zip": "97202",
        "phone": "+1 971-222-9649",
        "location": {
          "latitude": 45.465231,
          "longitude": -122.653967
        }
      },
      "isExpedited": false,
      "promoCode": "",
      // "sourceHub": { // it looks like this get set server side once we make the call
      //   "hub": {
      //     "id": "6f6f00b1-62cf-4c3b-83b6-c6ff60086861",
      //     "name": "PDX2",
      //     "address": {
      //       "company": "",
      //       "contactName": "",
      //       "line1": "RYNLY Headquarters, 2505 SE 11th Ave Suite 105, Portland, OR 97202, USA",
      //       "line2": "",
      //       "city": "Portland",
      //       "state": "OR",
      //       "country": "US",
      //       "zip": "97202",
      //       "phone": "7435551578",
      //       "location": {
      //         "latitude": 45.504648,
      //         "longitude": -122.65544
      //       }
      //     },
      //     "territory": null,
      //     "code": "PDX2",
      //     "type": 0,
      //     "openHour": 510,
      //     "closeHour": 1020,
      //     "specialNotes": "",
      //     "firstName": null,
      //     "lastName": null,
      //     "email": null,
      //     "password": null,
      //     "history": [
      //       {
      //         "log": "Phone is set to 7435551578",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is set to 11:00 AM, 04:00 PM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "AutoJobOpenDelivery is changed from False to True",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "AutoJobVolumeThreshold is changed from 0 to 8",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "Timezone is set to Pacific Standard Time",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is changed from 11:00 AM, 04:00 PM to 10:00 AM, 01:30 AM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-05T17:55:38.112Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is changed from 10:00 AM, 01:30 AM to 11:00 AM, 01:30 PM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-05T17:56:37.473Z",
      //         "userName": "blr1 blr1"
      //       }
      //     ],
      //     "zipZones": [
      //       {
      //         "zipCode": "97005",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97006",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97007",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97008",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97113",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97123",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97124",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97201",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97203",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97204",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97205",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97208",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97209",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97210",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97217",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97221",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97225",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97227",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97229",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97239",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97024",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97030",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97060",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97080",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97202",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97206",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97211",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97212",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97213",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97214",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97215",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97216",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97218",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97220",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97230",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97232",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97233",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97236",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97266",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98661",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98663",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98664",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98683",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97034",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97035",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97062",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97068",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97070",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97140",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97219",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97223",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97224",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97009",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97015",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97022",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97027",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97045",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97086",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97089",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97222",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97267",
      //         "zone": "D"
      //       }
      //     ],
      //     "jobOpeningSchedule": [
      //       660,
      //       810
      //     ],
      //     "autoJobOpenDelivery": true,
      //     "autoJobOpenPickUp": false,
      //     "timezone": "Pacific Standard Time",
      //     "autoJobVolumeThreshold": 8
      //   }
      // },
      // "destinationHub": {
      //   "hub": {
      //     "id": "6f6f00b1-62cf-4c3b-83b6-c6ff60086861",
      //     "name": "PDX2",
      //     "address": {
      //       "company": "",
      //       "contactName": "",
      //       "line1": "RYNLY Headquarters, 2505 SE 11th Ave Suite 105, Portland, OR 97202, USA",
      //       "line2": "",
      //       "city": "Portland",
      //       "state": "OR",
      //       "country": "US",
      //       "zip": "97202",
      //       "phone": "7435551578",
      //       "location": {
      //         "latitude": 45.504648,
      //         "longitude": -122.65544
      //       }
      //     },
      //     "territory": null,
      //     "code": "PDX2",
      //     "type": 0,
      //     "openHour": 510,
      //     "closeHour": 1020,
      //     "specialNotes": "",
      //     "firstName": null,
      //     "lastName": null,
      //     "email": null,
      //     "password": null,
      //     "history": [
      //       {
      //         "log": "Phone is set to 7435551578",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is set to 11:00 AM, 04:00 PM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "AutoJobOpenDelivery is changed from False to True",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "AutoJobVolumeThreshold is changed from 0 to 8",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "Timezone is set to Pacific Standard Time",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-04T12:09:51.976Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is changed from 11:00 AM, 04:00 PM to 10:00 AM, 01:30 AM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-05T17:55:38.112Z",
      //         "userName": "blr1 blr1"
      //       },
      //       {
      //         "log": "JobOpeningScheduleString is changed from 10:00 AM, 01:30 AM to 11:00 AM, 01:30 PM",
      //         "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
      //         "dateModified": "2019-07-05T17:56:37.473Z",
      //         "userName": "blr1 blr1"
      //       }
      //     ],
      //     "zipZones": [
      //       {
      //         "zipCode": "97005",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97006",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97007",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97008",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97113",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97123",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97124",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97201",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97203",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97204",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97205",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97208",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97209",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97210",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97217",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97221",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97225",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97227",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97229",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97239",
      //         "zone": "A"
      //       },
      //       {
      //         "zipCode": "97024",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97030",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97060",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97080",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97202",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97206",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97211",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97212",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97213",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97214",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97215",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97216",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97218",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97220",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97230",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97232",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97233",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97236",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97266",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98661",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98663",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98664",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "98683",
      //         "zone": "B"
      //       },
      //       {
      //         "zipCode": "97034",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97035",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97062",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97068",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97070",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97140",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97219",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97223",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97224",
      //         "zone": "C"
      //       },
      //       {
      //         "zipCode": "97009",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97015",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97022",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97027",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97045",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97086",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97089",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97222",
      //         "zone": "D"
      //       },
      //       {
      //         "zipCode": "97267",
      //         "zone": "D"
      //       }
          // ],
      //     "jobOpeningSchedule": [
      //       660,
      //       810
      //     ],
      //     "autoJobOpenDelivery": true,
      //     "autoJobOpenPickUp": false,
      //     "timezone": "Pacific Standard Time",
      //     "autoJobVolumeThreshold": 8
      //   }
      // },
      "deliveryMethodId": 2,
      // "promoCodeDisplayText": "", // all of these are UI-only
      // "totalAmount": 18,
      // "totalDiscount": 0,
      // "totalSpecial": 7,
      // "deliveryDateMessage": "ESTIMATED DELIVERY DATE",
      // "deliverybyLabelText": "2-3 BUSINESS DAYS",
      // "packageType": "RYNLY LARGE PACK",
      // "envelope": {}, // looks to be unused even for envelopes? assume its for multi package creation?
      "pickupNote": "Test",
      "deliveryTimeId": 1,
      "discount": 0,
      "UserId": "cdacc808-1efa-47e7-9a50-a78aa0801efb",
      // "dueDate": 1571732204841, // ignored, recalculted on server
      "items": [
        {
          "type": 1,
          "envelopeCount": 0,
          "height": 9,
          "width": 12,
          "depth": 18
        }
      ],
      "promoCodeId": ""
    }
  ]
}
