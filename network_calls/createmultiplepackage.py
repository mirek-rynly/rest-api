"""
curl 'https://uatuser.rynly.com/api/package/createmultiplepackage' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' -H 'Origin: https://uatuser.rynly.com' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9,cs;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Referer: https://uatuser.rynly.com/user/Home/PackageCreate' -H 'Cookie: _ga=GA1.2.257506453.1559084098; __stripe_mid=0551dbea-62af-4c95-acd3-a5bb1c097ad6; RynlyAccessToken=%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg; _gid=GA1.2.1111520727.1571061713; __stripe_sid=e4fcffa5-2921-4ebb-9612-5ba7f8b209ac' -H 'Connection: keep-alive' --data-binary '{\"packageCreateModels\":[{\"recipient\":{\"note\":\"This is a delivery note\",\"isSignatureRequired\":true},\"fromAddress\":{\"line1\":\"5604 NE Flanders St\",\"line2\":null,\"state\":\"OR\",\"city\":\"Portland\",\"zip\":\"97213\",\"location\":{\"latitude\":45.525453,\"longitude\":-122.606249},\"company\":\"\",\"contactName\":\"Uat Test\",\"phone\":\"+1 971-960-4585\"},\"toAddress\":{\"company\":\"SAFEWAY\",\"contactName\":\"Mitch Adams\",\"line1\":\"2836 Pacific Ave\",\"line2\":null,\"city\":\"Forest Grove\",\"state\":\"OR\",\"country\":null,\"zip\":\"97116\",\"phone\":\"+1 971-708-6202\",\"location\":{\"latitude\":45.519412,\"longitude\":-123.095353}},\"isExpedited\":true,\"promoCode\":\"\",\"sourceHub\":{\"hub\":{\"id\":\"f3c2b89f-01eb-4f38-a679-b1f6059e495c\",\"name\":\"PDX4\",\"address\":{\"company\":\"Mailboxes & More\",\"contactName\":\"Mailboxes & More\",\"line1\":\"Mailboxes & More, 515 NW Saltzman Rd\",\"line2\":\"\",\"city\":\"Portland\",\"state\":\"OR\",\"country\":\"US\",\"zip\":\"97229\",\"phone\":\"5036448504\",\"location\":{\"latitude\":45.523998,\"longitude\":-122.807096}},\"territory\":\"Portland\",\"code\":\"PDX4\",\"type\":0,\"openHour\":540,\"closeHour\":1140,\"specialNotes\":\"Enter through the back door of Mailboxes & More\",\"firstName\":null,\"lastName\":null,\"email\":null,\"password\":null,\"history\":[{\"log\":\"JobOpeningScheduleString is set to 02:00 PM\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"AutoJobOpenDelivery is changed from False to True\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"AutoJobVolumeThreshold is changed from 0 to 2\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"JobOpeningScheduleString is changed from 02:00 PM to 10:00 AM, 02:00 PM, 03:00 PM\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:54.15Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"Territory is set to Portland\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-09-23T11:20:01.713Z\",\"userName\":\"blr1 blr1\"}],\"zipZones\":[{\"zipCode\":\"97106\",\"zone\":\"A\"},{\"zipCode\":\"97109\",\"zone\":\"A\"},{\"zipCode\":\"97113\",\"zone\":\"A\"},{\"zipCode\":\"97116\",\"zone\":\"A\"},{\"zipCode\":\"97124\",\"zone\":\"A\"},{\"zipCode\":\"97125\",\"zone\":\"A\"},{\"zipCode\":\"97133\",\"zone\":\"A\"},{\"zipCode\":\"97229\",\"zone\":\"A\"},{\"zipCode\":\"97231\",\"zone\":\"A\"},{\"zipCode\":\"97201\",\"zone\":\"B\"},{\"zipCode\":\"97203\",\"zone\":\"B\"},{\"zipCode\":\"97204\",\"zone\":\"B\"},{\"zipCode\":\"97205\",\"zone\":\"B\"},{\"zipCode\":\"97208\",\"zone\":\"B\"},{\"zipCode\":\"97209\",\"zone\":\"B\"},{\"zipCode\":\"97210\",\"zone\":\"B\"},{\"zipCode\":\"97211\",\"zone\":\"B\"},{\"zipCode\":\"97212\",\"zone\":\"B\"},{\"zipCode\":\"97213\",\"zone\":\"B\"},{\"zipCode\":\"97214\",\"zone\":\"B\"},{\"zipCode\":\"97215\",\"zone\":\"B\"},{\"zipCode\":\"97216\",\"zone\":\"B\"},{\"zipCode\":\"97217\",\"zone\":\"B\"},{\"zipCode\":\"97218\",\"zone\":\"B\"},{\"zipCode\":\"97220\",\"zone\":\"B\"},{\"zipCode\":\"97227\",\"zone\":\"B\"},{\"zipCode\":\"97232\",\"zone\":\"B\"},{\"zipCode\":\"98660\",\"zone\":\"B\"},{\"zipCode\":\"98661\",\"zone\":\"B\"},{\"zipCode\":\"98663\",\"zone\":\"B\"},{\"zipCode\":\"98664\",\"zone\":\"B\"},{\"zipCode\":\"98665\",\"zone\":\"B\"},{\"zipCode\":\"98685\",\"zone\":\"B\"},{\"zipCode\":\"97006\",\"zone\":\"C\"},{\"zipCode\":\"97007\",\"zone\":\"C\"},{\"zipCode\":\"97008\",\"zone\":\"C\"},{\"zipCode\":\"97123\",\"zone\":\"C\"},{\"zipCode\":\"97140\",\"zone\":\"C\"},{\"zipCode\":\"97005\",\"zone\":\"D\"},{\"zipCode\":\"97034\",\"zone\":\"D\"},{\"zipCode\":\"97035\",\"zone\":\"D\"},{\"zipCode\":\"97062\",\"zone\":\"D\"},{\"zipCode\":\"97202\",\"zone\":\"D\"},{\"zipCode\":\"97206\",\"zone\":\"D\"},{\"zipCode\":\"97219\",\"zone\":\"D\"},{\"zipCode\":\"97221\",\"zone\":\"D\"},{\"zipCode\":\"97222\",\"zone\":\"D\"},{\"zipCode\":\"97223\",\"zone\":\"D\"},{\"zipCode\":\"97224\",\"zone\":\"D\"},{\"zipCode\":\"97225\",\"zone\":\"D\"},{\"zipCode\":\"97239\",\"zone\":\"D\"},{\"zipCode\":\"97266\",\"zone\":\"D\"}],\"jobOpeningSchedule\":[600,840,900],\"autoJobOpenDelivery\":true,\"autoJobOpenPickUp\":false,\"timezone\":\"Pacific Standard Time\",\"autoJobVolumeThreshold\":2},\"distanceInMiles\":9.7,\"closingHours\":\"07:00 PM\",\"openingHours\":\"09:00 AM\"},\"destinationHub\":{\"hub\":{\"id\":\"f3c2b89f-01eb-4f38-a679-b1f6059e495c\",\"name\":\"PDX4\",\"address\":{\"company\":\"Mailboxes & More\",\"contactName\":\"Mailboxes & More\",\"line1\":\"Mailboxes & More, 515 NW Saltzman Rd\",\"line2\":\"\",\"city\":\"Portland\",\"state\":\"OR\",\"country\":\"US\",\"zip\":\"97229\",\"phone\":\"5036448504\",\"location\":{\"latitude\":45.523998,\"longitude\":-122.807096}},\"territory\":\"Portland\",\"code\":\"PDX4\",\"type\":0,\"openHour\":540,\"closeHour\":1140,\"specialNotes\":\"Enter through the back door of Mailboxes & More\",\"firstName\":null,\"lastName\":null,\"email\":null,\"password\":null,\"history\":[{\"log\":\"JobOpeningScheduleString is set to 02:00 PM\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"AutoJobOpenDelivery is changed from False to True\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"AutoJobVolumeThreshold is changed from 0 to 2\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:02.402Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"JobOpeningScheduleString is changed from 02:00 PM to 10:00 AM, 02:00 PM, 03:00 PM\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-07-12T20:57:54.15Z\",\"userName\":\"blr1 blr1\"},{\"log\":\"Territory is set to Portland\",\"userId\":\"7065e111-d0d4-4c17-bf23-49e5f1addcb9\",\"dateModified\":\"2019-09-23T11:20:01.713Z\",\"userName\":\"blr1 blr1\"}],\"zipZones\":[{\"zipCode\":\"97106\",\"zone\":\"A\"},{\"zipCode\":\"97109\",\"zone\":\"A\"},{\"zipCode\":\"97113\",\"zone\":\"A\"},{\"zipCode\":\"97116\",\"zone\":\"A\"},{\"zipCode\":\"97124\",\"zone\":\"A\"},{\"zipCode\":\"97125\",\"zone\":\"A\"},{\"zipCode\":\"97133\",\"zone\":\"A\"},{\"zipCode\":\"97229\",\"zone\":\"A\"},{\"zipCode\":\"97231\",\"zone\":\"A\"},{\"zipCode\":\"97201\",\"zone\":\"B\"},{\"zipCode\":\"97203\",\"zone\":\"B\"},{\"zipCode\":\"97204\",\"zone\":\"B\"},{\"zipCode\":\"97205\",\"zone\":\"B\"},{\"zipCode\":\"97208\",\"zone\":\"B\"},{\"zipCode\":\"97209\",\"zone\":\"B\"},{\"zipCode\":\"97210\",\"zone\":\"B\"},{\"zipCode\":\"97211\",\"zone\":\"B\"},{\"zipCode\":\"97212\",\"zone\":\"B\"},{\"zipCode\":\"97213\",\"zone\":\"B\"},{\"zipCode\":\"97214\",\"zone\":\"B\"},{\"zipCode\":\"97215\",\"zone\":\"B\"},{\"zipCode\":\"97216\",\"zone\":\"B\"},{\"zipCode\":\"97217\",\"zone\":\"B\"},{\"zipCode\":\"97218\",\"zone\":\"B\"},{\"zipCode\":\"97220\",\"zone\":\"B\"},{\"zipCode\":\"97227\",\"zone\":\"B\"},{\"zipCode\":\"97232\",\"zone\":\"B\"},{\"zipCode\":\"98660\",\"zone\":\"B\"},{\"zipCode\":\"98661\",\"zone\":\"B\"},{\"zipCode\":\"98663\",\"zone\":\"B\"},{\"zipCode\":\"98664\",\"zone\":\"B\"},{\"zipCode\":\"98665\",\"zone\":\"B\"},{\"zipCode\":\"98685\",\"zone\":\"B\"},{\"zipCode\":\"97006\",\"zone\":\"C\"},{\"zipCode\":\"97007\",\"zone\":\"C\"},{\"zipCode\":\"97008\",\"zone\":\"C\"},{\"zipCode\":\"97123\",\"zone\":\"C\"},{\"zipCode\":\"97140\",\"zone\":\"C\"},{\"zipCode\":\"97005\",\"zone\":\"D\"},{\"zipCode\":\"97034\",\"zone\":\"D\"},{\"zipCode\":\"97035\",\"zone\":\"D\"},{\"zipCode\":\"97062\",\"zone\":\"D\"},{\"zipCode\":\"97202\",\"zone\":\"D\"},{\"zipCode\":\"97206\",\"zone\":\"D\"},{\"zipCode\":\"97219\",\"zone\":\"D\"},{\"zipCode\":\"97221\",\"zone\":\"D\"},{\"zipCode\":\"97222\",\"zone\":\"D\"},{\"zipCode\":\"97223\",\"zone\":\"D\"},{\"zipCode\":\"97224\",\"zone\":\"D\"},{\"zipCode\":\"97225\",\"zone\":\"D\"},{\"zipCode\":\"97239\",\"zone\":\"D\"},{\"zipCode\":\"97266\",\"zone\":\"D\"}],\"jobOpeningSchedule\":[600,840,900],\"autoJobOpenDelivery\":true,\"autoJobOpenPickUp\":false,\"timezone\":\"Pacific Standard Time\",\"autoJobVolumeThreshold\":2}},\"deliveryMethodId\":2,\"promoCodeDisplayText\":\"\",\"totalAmount\":24,\"totalDiscount\":0,\"totalSpecial\":11,\"deliveryDateMessage\":\"GUARANTEED EXPEDITED DELIVERY DATE\",\"deliverybyLabelText\":\"GUARANTEED SAME DAY\",\"packageType\":\"RYNLY MEDIUM PACK\",\"envelope\":{},\"deliveryTimeId\":1,\"pickupNote\":\"This is a pickup note.\",\"discount\":0,\"UserId\":\"cdacc808-1efa-47e7-9a50-a78aa0801efb\",\"isDropOf\":true,\"DeliveryMethodId\":\"1\",\"dueDate\":\"2019-10-15T12:50:06.380Z\",\"items\":[{\"type\":1,\"envelopeCount\":0,\"height\":9,\"width\":9,\"depth\":12}],\"promoCodeId\":\"\"}]}' --compressed
"""
data = {
  "packageCreateModels": [
    {
      "recipient": {
        "note": "This is a delivery note",
        "isSignatureRequired": true
      },
      "fromAddress": {
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
      "toAddress": {
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
      "isExpedited": true,
      "promoCode": "",
      "sourceHub": {
        "hub": {
          "id": "f3c2b89f-01eb-4f38-a679-b1f6059e495c",
          "name": "PDX4",
          "address": {
            "company": "Mailboxes & More",
            "contactName": "Mailboxes & More",
            "line1": "Mailboxes & More, 515 NW Saltzman Rd",
            "line2": "",
            "city": "Portland",
            "state": "OR",
            "country": "US",
            "zip": "97229",
            "phone": "5036448504",
            "location": {
              "latitude": 45.523998,
              "longitude": -122.807096
            }
          },
          "territory": "Portland",
          "code": "PDX4",
          "type": 0,
          "openHour": 540,
          "closeHour": 1140,
          "specialNotes": "Enter through the back door of Mailboxes & More",
          "firstName": null,
          "lastName": null,
          "email": null,
          "password": null,
          "history": [
            {
              "log": "JobOpeningScheduleString is set to 02:00 PM",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "AutoJobOpenDelivery is changed from False to True",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "AutoJobVolumeThreshold is changed from 0 to 2",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "JobOpeningScheduleString is changed from 02:00 PM to 10:00 AM, 02:00 PM, 03:00 PM",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:54.15Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "Territory is set to Portland",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-09-23T11:20:01.713Z",
              "userName": "blr1 blr1"
            }
          ],
          "zipZones": [
            {
              "zipCode": "97106",
              "zone": "A"
            },
            {
              "zipCode": "97109",
              "zone": "A"
            },
            {
              "zipCode": "97113",
              "zone": "A"
            },
            {
              "zipCode": "97116",
              "zone": "A"
            },
            {
              "zipCode": "97124",
              "zone": "A"
            },
            {
              "zipCode": "97125",
              "zone": "A"
            },
            {
              "zipCode": "97133",
              "zone": "A"
            },
            {
              "zipCode": "97229",
              "zone": "A"
            },
            {
              "zipCode": "97231",
              "zone": "A"
            },
            {
              "zipCode": "97201",
              "zone": "B"
            },
            {
              "zipCode": "97203",
              "zone": "B"
            },
            {
              "zipCode": "97204",
              "zone": "B"
            },
            {
              "zipCode": "97205",
              "zone": "B"
            },
            {
              "zipCode": "97208",
              "zone": "B"
            },
            {
              "zipCode": "97209",
              "zone": "B"
            },
            {
              "zipCode": "97210",
              "zone": "B"
            },
            {
              "zipCode": "97211",
              "zone": "B"
            },
            {
              "zipCode": "97212",
              "zone": "B"
            },
            {
              "zipCode": "97213",
              "zone": "B"
            },
            {
              "zipCode": "97214",
              "zone": "B"
            },
            {
              "zipCode": "97215",
              "zone": "B"
            },
            {
              "zipCode": "97216",
              "zone": "B"
            },
            {
              "zipCode": "97217",
              "zone": "B"
            },
            {
              "zipCode": "97218",
              "zone": "B"
            },
            {
              "zipCode": "97220",
              "zone": "B"
            },
            {
              "zipCode": "97227",
              "zone": "B"
            },
            {
              "zipCode": "97232",
              "zone": "B"
            },
            {
              "zipCode": "98660",
              "zone": "B"
            },
            {
              "zipCode": "98661",
              "zone": "B"
            },
            {
              "zipCode": "98663",
              "zone": "B"
            },
            {
              "zipCode": "98664",
              "zone": "B"
            },
            {
              "zipCode": "98665",
              "zone": "B"
            },
            {
              "zipCode": "98685",
              "zone": "B"
            },
            {
              "zipCode": "97006",
              "zone": "C"
            },
            {
              "zipCode": "97007",
              "zone": "C"
            },
            {
              "zipCode": "97008",
              "zone": "C"
            },
            {
              "zipCode": "97123",
              "zone": "C"
            },
            {
              "zipCode": "97140",
              "zone": "C"
            },
            {
              "zipCode": "97005",
              "zone": "D"
            },
            {
              "zipCode": "97034",
              "zone": "D"
            },
            {
              "zipCode": "97035",
              "zone": "D"
            },
            {
              "zipCode": "97062",
              "zone": "D"
            },
            {
              "zipCode": "97202",
              "zone": "D"
            },
            {
              "zipCode": "97206",
              "zone": "D"
            },
            {
              "zipCode": "97219",
              "zone": "D"
            },
            {
              "zipCode": "97221",
              "zone": "D"
            },
            {
              "zipCode": "97222",
              "zone": "D"
            },
            {
              "zipCode": "97223",
              "zone": "D"
            },
            {
              "zipCode": "97224",
              "zone": "D"
            },
            {
              "zipCode": "97225",
              "zone": "D"
            },
            {
              "zipCode": "97239",
              "zone": "D"
            },
            {
              "zipCode": "97266",
              "zone": "D"
            }
          ],
          "jobOpeningSchedule": [
            600,
            840,
            900
          ],
          "autoJobOpenDelivery": true,
          "autoJobOpenPickUp": false,
          "timezone": "Pacific Standard Time",
          "autoJobVolumeThreshold": 2
        },
        "distanceInMiles": 9.7,
        "closingHours": "07:00 PM",
        "openingHours": "09:00 AM"
      },
      "destinationHub": {
        "hub": {
          "id": "f3c2b89f-01eb-4f38-a679-b1f6059e495c",
          "name": "PDX4",
          "address": {
            "company": "Mailboxes & More",
            "contactName": "Mailboxes & More",
            "line1": "Mailboxes & More, 515 NW Saltzman Rd",
            "line2": "",
            "city": "Portland",
            "state": "OR",
            "country": "US",
            "zip": "97229",
            "phone": "5036448504",
            "location": {
              "latitude": 45.523998,
              "longitude": -122.807096
            }
          },
          "territory": "Portland",
          "code": "PDX4",
          "type": 0,
          "openHour": 540,
          "closeHour": 1140,
          "specialNotes": "Enter through the back door of Mailboxes & More",
          "firstName": null,
          "lastName": null,
          "email": null,
          "password": null,
          "history": [
            {
              "log": "JobOpeningScheduleString is set to 02:00 PM",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "AutoJobOpenDelivery is changed from False to True",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "AutoJobVolumeThreshold is changed from 0 to 2",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:02.402Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "JobOpeningScheduleString is changed from 02:00 PM to 10:00 AM, 02:00 PM, 03:00 PM",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-07-12T20:57:54.15Z",
              "userName": "blr1 blr1"
            },
            {
              "log": "Territory is set to Portland",
              "userId": "7065e111-d0d4-4c17-bf23-49e5f1addcb9",
              "dateModified": "2019-09-23T11:20:01.713Z",
              "userName": "blr1 blr1"
            }
          ],
          "zipZones": [
            {
              "zipCode": "97106",
              "zone": "A"
            },
            {
              "zipCode": "97109",
              "zone": "A"
            },
            {
              "zipCode": "97113",
              "zone": "A"
            },
            {
              "zipCode": "97116",
              "zone": "A"
            },
            {
              "zipCode": "97124",
              "zone": "A"
            },
            {
              "zipCode": "97125",
              "zone": "A"
            },
            {
              "zipCode": "97133",
              "zone": "A"
            },
            {
              "zipCode": "97229",
              "zone": "A"
            },
            {
              "zipCode": "97231",
              "zone": "A"
            },
            {
              "zipCode": "97201",
              "zone": "B"
            },
            {
              "zipCode": "97203",
              "zone": "B"
            },
            {
              "zipCode": "97204",
              "zone": "B"
            },
            {
              "zipCode": "97205",
              "zone": "B"
            },
            {
              "zipCode": "97208",
              "zone": "B"
            },
            {
              "zipCode": "97209",
              "zone": "B"
            },
            {
              "zipCode": "97210",
              "zone": "B"
            },
            {
              "zipCode": "97211",
              "zone": "B"
            },
            {
              "zipCode": "97212",
              "zone": "B"
            },
            {
              "zipCode": "97213",
              "zone": "B"
            },
            {
              "zipCode": "97214",
              "zone": "B"
            },
            {
              "zipCode": "97215",
              "zone": "B"
            },
            {
              "zipCode": "97216",
              "zone": "B"
            },
            {
              "zipCode": "97217",
              "zone": "B"
            },
            {
              "zipCode": "97218",
              "zone": "B"
            },
            {
              "zipCode": "97220",
              "zone": "B"
            },
            {
              "zipCode": "97227",
              "zone": "B"
            },
            {
              "zipCode": "97232",
              "zone": "B"
            },
            {
              "zipCode": "98660",
              "zone": "B"
            },
            {
              "zipCode": "98661",
              "zone": "B"
            },
            {
              "zipCode": "98663",
              "zone": "B"
            },
            {
              "zipCode": "98664",
              "zone": "B"
            },
            {
              "zipCode": "98665",
              "zone": "B"
            },
            {
              "zipCode": "98685",
              "zone": "B"
            },
            {
              "zipCode": "97006",
              "zone": "C"
            },
            {
              "zipCode": "97007",
              "zone": "C"
            },
            {
              "zipCode": "97008",
              "zone": "C"
            },
            {
              "zipCode": "97123",
              "zone": "C"
            },
            {
              "zipCode": "97140",
              "zone": "C"
            },
            {
              "zipCode": "97005",
              "zone": "D"
            },
            {
              "zipCode": "97034",
              "zone": "D"
            },
            {
              "zipCode": "97035",
              "zone": "D"
            },
            {
              "zipCode": "97062",
              "zone": "D"
            },
            {
              "zipCode": "97202",
              "zone": "D"
            },
            {
              "zipCode": "97206",
              "zone": "D"
            },
            {
              "zipCode": "97219",
              "zone": "D"
            },
            {
              "zipCode": "97221",
              "zone": "D"
            },
            {
              "zipCode": "97222",
              "zone": "D"
            },
            {
              "zipCode": "97223",
              "zone": "D"
            },
            {
              "zipCode": "97224",
              "zone": "D"
            },
            {
              "zipCode": "97225",
              "zone": "D"
            },
            {
              "zipCode": "97239",
              "zone": "D"
            },
            {
              "zipCode": "97266",
              "zone": "D"
            }
          ],
          "jobOpeningSchedule": [
            600,
            840,
            900
          ],
          "autoJobOpenDelivery": true,
          "autoJobOpenPickUp": false,
          "timezone": "Pacific Standard Time",
          "autoJobVolumeThreshold": 2
        }
      },
      "deliveryMethodId": 2,
      "promoCodeDisplayText": "",
      "totalAmount": 24,
      "totalDiscount": 0,
      "totalSpecial": 11,
      "deliveryDateMessage": "GUARANTEED EXPEDITED DELIVERY DATE",
      "deliverybyLabelText": "GUARANTEED SAME DAY",
      "packageType": "RYNLY MEDIUM PACK",
      "envelope": {},
      "deliveryTimeId": 1,
      "pickupNote": "This is a pickup note.",
      "discount": 0,
      "UserId": "cdacc808-1efa-47e7-9a50-a78aa0801efb",
      "isDropOf": true,
      "DeliveryMethodId": "1",
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
      "promoCodeId": ""
    }
  ]
}

requests.post("https://uatuser.rynly.com/api/package/createmultiplepackage",
    data=data,
    headers={
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
        "Connection": "keep-alive",
        "Content-Type": "application/json;charset=UTF-8",
        "Origin": "https://uatuser.rynly.com",
        "Referer": "https://uatuser.rynly.com/user/Home/PackageCreate",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    },
    cookies={
        "RynlyAccessToken": "%2BRjECzm8Xk9Y%2BboADaS4FZu2%2FBjR0aBZ9cT8cXRzW59Va5xOgJpXoI1G%2F8DxuRGg",
        "__stripe_mid": "0551dbea-62af-4c95-acd3-a5bb1c097ad6",
        "__stripe_sid": "e4fcffa5-2921-4ebb-9612-5ba7f8b209ac",
        "_ga": "GA1.2.257506453.1559084098",
        "_gid": "GA1.2.1111520727.1571061713"
    },
)
