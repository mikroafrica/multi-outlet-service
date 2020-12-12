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
                "isOutletSuspended": true
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
                "isOutletSuspended": false
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
                "isOutletSuspended": false
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

`Query -> page, limit, dateFrom, dateTo`

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

`Query -> page, limit, dateFrom, dateTo, page, limit, transactionType`

_Response Body_

```javascript
{
    "status": true,
    "data": {
        "page": 1,
        "limit": 20,
        "total": 0,
        "list": [],
        "additionalInformation": {}
    }
}
```
