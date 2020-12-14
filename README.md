### Desc

Multi-outlet Service serves the multi-outlet dashboard to manage multiple outlets

### Sign up a user
`POST /auth/signup`

_Request Body_

```javascript
{
    "firstName": "Alex",
    "lastName": "Snow",
    "email": "aslan.alice@extraale.com",
    "password": "P@ssword123",
    "profileImageId": "image-id",
    "gender": "MALE",
    "phoneNumber": "08034767464",
    "businessName": "GOOD BUSINESS",
    "address": "12 Adewole Street",
    "state": "Abuja",
    "lga": "Garki",
    "dob": "01-07-1990"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "5fce3ef6e1954d0f532051fd",
        "firstName": "alex",
        "lastName": "snow",
        "dateOfBirth": "01-07-1990",
        "profileImageId": null,
        "gender": "UNDEFINED",
        "businessName": "good business",
        "businessType": "OUTLET_OWNER",
        "username": null,
        "email": "aslan.alice@extraale.com",
        "phoneNumber": "+234 803 476 7464",
        "phoneCarrier": "mtn",
        "userType": "OUTLET_OWNER",
        "tierLevel": null,
        "fcmToken": null,
        "utilityImageId": null,
        "identificationImageId": null,
        "placeOfBusinessImageId": null,
        "store": [],
        "region": null,
        "zone": null,
        "goal": "ACTIVE",
        "emailVerified": false,
        "bvnVerified": false,
        "ninVerified": false,
        "utilityImageIdVerified": false,
        "identificationImageVerified": false,
        "placeOfBusinessImageVerified": false
    }
}
```


### Send verification email - userId is gotten at the point of registration
`POST /auth/email-verification`

_Request Body_

```javascript
{
    "userId": "5fcf1a3ce1954d0f53205202"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "verificationId": "5fcf1abce1954d0f53205206",
        "expirationTimeInMilliSecs": 1607408496351,
        "userId": "5fcf1a3ce1954d0f53205202"
    }
}
```


### Verify OTP sent to user email - verification-id is gotten after calling /auth/email-verification above
`POST /auth/email-validation`

_Request Body_

```javascript
{
    "verificationId": "5fcf1b81e1954d0f53205207",
    "otpCode": "404235"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "5fcf1a3ce1954d0f53205202",
        "firstName": "alex",
        "lastName": "snow",
        "dateOfBirth": "01-07-1990",
        "profileImageId": null,
        "gender": "UNDEFINED",
        "businessName": "good business",
        "businessType": "OUTLET_OWNER",
        "username": null,
        "email": "aslan.alice@extraale.com",
        "phoneNumber": "+234 803 476 7464",
        "phoneCarrier": "mtn",
        "userType": "OUTLET_OWNER",
        "tierLevel": null,
        "fcmToken": null,
        "utilityImageId": null,
        "identificationImageId": null,
        "placeOfBusinessImageId": null,
        "store": [],
        "region": null,
        "zone": null,
        "goal": "ACTIVE",
        "emailVerified": true,
        "bvnVerified": false,
        "ninVerified": false,
        "utilityImageIdVerified": false,
        "identificationImageVerified": false,
        "placeOfBusinessImageVerified": false
    }
}
```


### Login a user
`POST /auth/login`

_Request Body_

```javascript
{
    "email": "elihu.tyking@extraale.com",
    "password": "P@ssword123"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmY2UzZWY4NDFiNDFmMDAxNzcxMjc2NyIsInJvbGUiOiJhZG1pbiIsInVzZXJuYW1lIjoiZWxpaHUudHlraW5nQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmY2UzZWY2ZTE5NTRkMGY1MzIwNTFmZCIsImlhdCI6MTYwNzM2MjMzMSwiZXhwIjoxNjA3NDM3MzMxfQ.TEFsCAcfUAtMZ0ZHOfvHmnSYyYyohwnVAaz7BdmfVFM",
        "userId": "5fce3ef6e1954d0f532051fd",
        "id": "5fce3ef6e1954d0f532051fd",
        "firstName": "alex",
        "lastName": "snow",
        "dateOfBirth": "01-07-1990",
        "profileImageId": null,
        "gender": "UNDEFINED",
        "businessName": "good business",
        "businessType": "OUTLET_OWNER",
        "username": null,
        "email": "elihu.tyking@extraale.com",
        "phoneNumber": "+234 803 476 4424",
        "phoneCarrier": "mtn",
        "userType": "OUTLET_OWNER",
        "tierLevel": null,
        "fcmToken": null,
        "utilityImageId": null,
        "identificationImageId": null,
        "placeOfBusinessImageId": null,
        "store": [
            {
                "id": "5fce3ef6e1954d0f532051ff",
                "address": "12 adewole street",
                "state": "abuja",
                "lga": "garki",
                "country": "ngn",
                "bank": null,
                "bankCode": null,
                "accountName": null,
                "accountNumber": null,
                "terminalId": null,
                "wallet": [
                    {
                        "id": "70d1fcce-2a29-4be1-8672-0f845d8f48e3",
                        "currency": "NGN",
                        "type": "MAIN"
                    },
                    {
                        "id": "e3ad0f21-5b55-4358-924b-bfa9983f5334",
                        "currency": "NGN",
                        "type": "COMMISSION"
                    }
                ],
                "terminalMapped": false
            }
        ],
        "region": null,
        "zone": null,
        "goal": "ACTIVE",
        "emailVerified": true,
        "bvnVerified": false,
        "ninVerified": false,
        "utilityImageIdVerified": false,
        "identificationImageVerified": false,
        "placeOfBusinessImageVerified": false
    }
}
```


### Request for a password reset
`POST /auth/reset-password-request`

_Request Body_

```javascript
{
    "email": "aslan.alice@extraale.com",
}
```

_Response Body_

```javascript
{
    "status": true
}
```


### Process reset password - get token from the link sent to email
`PUT /auth/reset-password`

_Request Body_

```javascript
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmY2YxYTNlNDFiNDFmMDAxNzcxMjc2YSIsInJvbGUiOiJhZG1pbiIsInVzZXJuYW1lIjoiYXNsYW4uYWxpY2VAZXh0cmFhbGUuY29tIiwidXNlcklkIjoiNWZjZjFhM2NlMTk1NGQwZjUzMjA1MjAyIiwiaWF0IjoxNjA3NDA5MDA1LCJleHAiOjE2MDc0MTYyMDV9.tJhIJRt9RVZt4DE00vEv7HFz12W8SfQrAqxdohwkFzg",
    "password": "password"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": "Password reset is successful. Kindly login to your account"
}
```


### Change password
`PUT /auth/change-password`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Request Body_

```javascript
{
    "currentPassword": "password",
    "newPassword": "P@ssword123"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": "Password is successfully changed"
}
```

### Update profile
`PUT /auth/update-profile`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Request Body_

```javascript
{
    "firstName": "alex",
    "lastName": "snow",
    "profileImageId": "image-id-2",
    "gender": "MALE",
    "phoneNumber": "+234 803 476 4424",
    "businessName": "Good business",
    "address": "12 Adewole Street",
    "state": "Abuja",
    "lga": "Garki",
    "dob": "01-07-1991"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "5fd35d158677251eabdf8ef5",
        "firstName": "alex",
        "lastName": "snow",
        "dateOfBirth": "01-07-1991",
        "profileImageId": null,
        "gender": "MALE",
        "businessName": "Good business",
        "businessType": "OUTLET_OWNER",
        "username": null,
        "email": "coehn.jaheim@extraale.com",
        "phoneNumber": "+234 803 123 0924",
        "phoneCarrier": "mtn",
        "userType": "OUTLET_OWNER",
        "tierLevel": null,
        "fcmToken": null,
        "utilityImageId": null,
        "identificationImageId": null,
        "placeOfBusinessImageId": null,
        "store": [
            {
                "id": "5fd35d158677251eabdf8ef7",
                "address": "12 adewole street",
                "state": "abuja",
                "lga": "garki",
                "country": "ngn",
                "bank": "Providus Bank",
                "bankCode": "101",
                "accountName": "alex snow",
                "accountNumber": "4000050197",
                "terminalId": null,
                "wallet": [
                    {
                        "id": "ed8f14ba-93c8-46f5-8433-65e92d2476c4",
                        "currency": "NGN",
                        "type": "MAIN"
                    }
                ],
                "terminalMapped": false
            }
        ],
        "region": null,
        "zone": null,
        "goal": "ACTIVE",
        "emailVerified": true,
        "bvnVerified": false,
        "placeOfBusinessImageVerified": false,
        "utilityImageIdVerified": false,
        "identificationImageVerified": false,
        "ninVerified": false
    }
}
```


### Link Outlet
`POST /outlet/link`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Request Body_

```javascript
{
    "phoneNumber": "08123487027",
    "pin": "2345"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "5fd3650b8677251eabdf8f01",
        "verificationStatus": "CODE_SENT",
        "expiredAt": 1607689663702
    }
}
```


### Verify Linked Outlet - OTP received from '/outlet/link' is used for verification 
`POST /outlet/verify`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Request Body_

```javascript
{
    "verificationId": "5fd3650b8677251eabdf8f01",
    "otpCode": "794538"
}
```

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "outletStatus": "ACTIVE",
        "isOutletSuspended": false,
        "_id": "5fd365227a30216c8e8efff4",
        "ownerId": "5fd35d158677251eabdf8ef5",
        "outletUserId": "5fcda81e7e33f72dd1a1fe5f",
        "createdAt": "2020-12-11T12:25:06.694Z",
        "updatedAt": "2020-12-11T12:25:06.694Z",
        "__v": 0
    }
}
```


### Get Outlets 
`GET /outlet`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> page, limit`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "page": 1,
        "pages": 1,
        "limit": 10,
        "total": 3,
        "list": [
            {
                "id": "5fcda7c27e33f72dd1a1fe5c",
                "firstName": "John",
                "lastName": "Doe",
                "dateOfBirth": "01/01/2020",
                "profileImageId": "tfef-fefe-fefeg",
                "gender": "MALE",
                "businessName": "ACTIVE BUSINESS",
                "businessType": "AGENT",
                "username": "JohnDoe",
                "email": "waymon.nadir@extraale.com",
                "phoneNumber": "+234 812 348 7024",
                "phoneCarrier": "airtel",
                "userType": "AGENT",
                "tierLevel": "TIER_THREE",
                "fcmToken": "83844",
                "utilityImageId": null,
                "identificationImageId": null,
                "placeOfBusinessImageId": null,
                "store": [],
                "region": "Garki",
                "zone": "zone 1",
                "goal": "ACTIVE",
                "emailVerified": false,
                "bvnVerified": false,
                "placeOfBusinessImageVerified": false,
                "utilityImageIdVerified": false,
                "identificationImageVerified": false,
                "ninVerified": false,
                status: "ACTIVE"
            },
            {
                "id": "5fcda7eb7e33f72dd1a1fe5d",
                "firstName": "Jane",
                "lastName": "Doe",
                "dateOfBirth": "01/01/2020",
                "profileImageId": "tfef-fefe-fefeg",
                "gender": "MALE",
                "businessName": "ACTIVE BUSINESS",
                "businessType": "AGENT",
                "username": "JohnDoe",
                "email": "krosby.kervin@extraal.com",
                "phoneNumber": "+234 812 348 7025",
                "phoneCarrier": "airtel",
                "userType": "AGENT",
                "tierLevel": "TIER_THREE",
                "fcmToken": "83844",
                "utilityImageId": null,
                "identificationImageId": null,
                "placeOfBusinessImageId": null,
                "store": [],
                "region": "Garki",
                "zone": "zone 1",
                "goal": "ACTIVE",
                "emailVerified": false,
                "bvnVerified": false,
                "placeOfBusinessImageVerified": false,
                "utilityImageIdVerified": false,
                "identificationImageVerified": false,
                "ninVerified": false,
                "status": "SUSPENDED"
            },
            {
                "id": "5fcda81e7e33f72dd1a1fe5f",
                "firstName": "Nice",
                "lastName": "Jack",
                "dateOfBirth": "01/01/2020",
                "profileImageId": "tfef-fefe-fefeg",
                "gender": "MALE",
                "businessName": "ACTIVE BUSINESS 3",
                "businessType": "AGENT",
                "username": "JohnDoe",
                "email": "jakolby.angelino@extraale.com",
                "phoneNumber": "+234 812 348 7027",
                "phoneCarrier": "airtel",
                "userType": "AGENT",
                "tierLevel": "TIER_THREE",
                "fcmToken": "83844",
                "utilityImageId": null,
                "identificationImageId": null,
                "placeOfBusinessImageId": null,
                "store": [],
                "region": "Garki",
                "zone": "zone 1",
                "goal": "ACTIVE",
                "emailVerified": false,
                "bvnVerified": false,
                "placeOfBusinessImageVerified": false,
                "utilityImageIdVerified": false,
                "identificationImageVerified": false,
                "ninVerified": false,
                "status": "ACTIVE"
            }
        ]
    }
}
```


### Unlink Outlet 
`PUT /outlet/{outletUserId}/unlink`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Response Body_

```javascript
{
    "status": true
}
```

### Suspend Outlet 
`PUT /outlet/{outletUserId}/suspend`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Response Body_

```javascript
{
    "status": true
}
```


### Get multi-outlet owner wallet 
`GET /wallet`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "f1ef49f2-6a56-4491-a389-e06b14e0c3b1",
        "balance": 0,
        "totalCredit": 0,
        "totalDebit": 0,
        "numberOfTransaction": 0,
        "currency": "NGN",
        "timeCreated": 1607408981460
    }
}
```


### Get wallet summary by wallet id
`GET /wallet/{walletId}/summary`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> dateFrom, dateTo`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "id": "f1ef49f2-6a56-4491-a389-e06b14e0c3b1",
        "balance": 0,
        "totalCredit": 0,
        "totalDebit": 0,
        "numberOfTransaction": 0,
        "currency": "NGN",
        "timeCreated": 1607408981460
    }
}
```


### Get wallet transactions by wallet id
`GET /wallet/{walletId}/transactions`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> page, limit, dateFrom, dateTo, transactionType`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "page": 1,
        "limit": 3,
        "total": 946,
        "list": [
            {
                "id": "fd88fb65-be9b-43b9-87e0-73f7b99c6f63",
                "amount": 248.62,
                "balance": 2012137.53,
                "transactionType": "CREDIT",
                "reference": "WDL-05f9cdd8-65af-4c97-85bd-f97992deb158-CREDIT",
                "timeCreated": 1607872095423
            },
            {
                "id": "1eca604b-e93d-4a18-ac54-79bf4c001181",
                "amount": 69,
                "balance": 2011888.9,
                "transactionType": "DEBIT",
                "reference": "POT-7be6472b-ad5d-4a3c-af90-ae333eaa9ba3-DEBIT",
                "timeCreated": 1607846406669
            },
            {
                "id": "674332f9-281f-4d33-a403-cee00853f18f",
                "amount": 196,
                "balance": 2011957.9,
                "transactionType": "DEBIT",
                "reference": "BIL-9df8fa5f-e33e-4a8b-8df1-26c7f09bc93f-DEBIT",
                "timeCreated": 1607825715844
            }
        ],
        "additionalInformation": {}
    }
}
```


### Get outlet transactions by user id
`GET /transaction/{userId}`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> page, limit, dateFrom, dateTo, type, status, customerBillerId`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "page": 1,
        "limit": 20,
        "total": 946,
        "list": [
             {
                 "id": "9eb2856f-86ed-4698-9d99-f03a3e24df9c",
                 "amount": 25,
                 "userId": null,
                 "transactionReference": "WDL-adbb5034-eeca-4bd6-b00c-ebf74cef6c76",
                 "transactionStatus": "payment failed",
                 "transactionType": "withdrawal",
                 "user": "1010101 (POS)",
                 "product": "POS Withdrawal",
                 "timeCreated": 1607857173009
             },
             {
                 "id": "59bba7fd-f07e-42cf-b700-c72f4ccecc82",
                 "amount": 250,
                 "userId": null,
                 "transactionReference": "WDL-05f9cdd8-65af-4c97-85bd-f97992deb158",
                 "transactionStatus": "successful",
                 "transactionType": "withdrawal",
                 "user": "1010101 (POS)",
                 "product": "POS Withdrawal",
                 "timeCreated": 1607856840220
             },
             {
                 "id": "56b355de-23bb-4d43-8742-6caa3e5735cf",
                 "amount": 69,
                 "userId": null,
                 "transactionReference": "POT-7be6472b-ad5d-4a3c-af90-ae333eaa9ba3",
                 "transactionStatus": "successful",
                 "transactionType": "p2p",
                 "user": "business profit",
                 "product": null,
                 "timeCreated": 1607846402442
             }
        ]
    }
}
```


### Get transactions category summary by user id
`GET /transaction/{userId}/category-summary`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> dateFrom: 1601506800000, dateTo: 1609369200000`

_Response Body_

```javascript
{
    "status": true,
    "data": [
        {
            "successfulAmount": 463494,
            "pendingAmount": 0,
            "failedAmount": 0,
            "count": 32,
            "type": "Cash",
            "success": 32,
            "pending": 0,
            "failed": 0,
            "openingDrawerBalance": null,
            "currentDrawerBalance": null
        },
        {
            "successfulAmount": 10300,
            "pendingAmount": 0,
            "failedAmount": 0,
            "count": 6,
            "type": "P2P",
            "success": 6,
            "pending": 0,
            "failed": 0,
            "openingDrawerBalance": null,
            "currentDrawerBalance": null
        },
        {
            "successfulAmount": 100,
            "pendingAmount": 0,
            "failedAmount": 0,
            "count": 1,
            "type": "Transfer",
            "success": 1,
            "pending": 0,
            "failed": 0,
            "openingDrawerBalance": null,
            "currentDrawerBalance": null
        },
        {
            "successfulAmount": 5500,
            "pendingAmount": 0,
            "failedAmount": 0,
            "count": 4,
            "type": "Withdrawal",
            "success": 4,
            "pending": 0,
            "failed": 0,
            "openingDrawerBalance": null,
            "currentDrawerBalance": null
        }
    ]
}
```


### Get multi-outlet transaction summary
`GET /transaction/summary`

`Authorization: Bearer eyJhbGciOiJIUJuYW1lIjoiY29laG4uamFoZWltQGV4dHJhYWxlLmNvbSIsInVzZXJJZCI6IjVmZDM1`

`Query -> dateFrom: 1601506800000, dateTo: 1609369200000`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "count": 120,
        "success": 110,
        "pending": 8,
        "failed": 2,
        "successAmount": 127585,
        "pendingAmount": 210,
        "failedAmount": 134
    }
}
```
