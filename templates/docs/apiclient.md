## API Client

The **API Client** is a built-in feature of **FhyServe** designed to test and interact with **HTTP/HTTPS APIs** directly from the application. It allows developers to send requests to local or public endpoints without relying on external tools such as Postman or `curl`.

This feature is intended for **API debugging, response validation, and integration testing** in a unified development environment.

---

## Key Features

* Supports HTTP and HTTPS
* Supported methods: **GET, POST, PUT, DELETE**
* Custom request headers
* JSON / raw request body
* Displays response status and payload
* Suitable for local and public APIs

---

## API Request Structure

### Endpoint URL

Specify the target API endpoint:

```
https://example.com/endpoint
```

---

## HTTP Methods

The API Client supports the following HTTP methods:

| Method     | Description                   |
| ---------- | ----------------------------- |
| **GET**    | Retrieve data from the server |
| **POST**   | Create or submit new data     |
| **PUT**    | Update existing data          |
| **DELETE** | Remove data from the server   |

---

## Headers

Headers are used to send additional metadata to the server, such as authentication tokens and content type.

Example:

```json
{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}
```

---

## Request Body

The request body is used to send data to the server and is typically required for **POST** and **PUT** requests.

Example JSON body:

```json
{
  "name": "example",
  "status": "active"
}
```

> **Technical Note:**
> **GET** and **DELETE** requests generally do not include a request body.

---

## Request Examples

### GET Request

```http
GET /endpoint HTTP/1.1
Host: example.com
Authorization: Bearer token
```

---

### POST Request

```http
POST /endpoint HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "name": "example"
}
```

---

### PUT Request

```http
PUT /endpoint HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "status": "updated"
}
```

---

### DELETE Request

```http
DELETE /endpoint HTTP/1.1
Host: example.com
Authorization: Bearer token
```

---

## API Response

After sending a request, the response will be displayed in the API Client interface.

### Response Details

| Field             | Description                             |
| ----------------- | --------------------------------------- |
| **Status Code**   | HTTP response status                    |
| **Headers**       | Response headers returned by the server |
| **Body**          | Response payload                        |
| **Response Time** | Request execution time                  |

---

### Example Response

```json
{
  "status": "success",
  "message": "Request processed successfully"
}
```

---

## How to Use the API Client

1. Open the **FhyServe Dashboard**
2. Navigate to **API Client**
3. Enter the **Endpoint URL**
4. Select the **HTTP Method**
5. Add **Headers** if required
6. Provide the **Request Body** (if applicable)
7. Click **Send Request**
8. Review the response output

---

## Technical Notes

* `Content-Type` header is required for requests with a body
* Bearer tokens must be valid
* API Client does not permanently store sensitive data
* Supports both local and public endpoints
* Responses are displayed as returned by the server