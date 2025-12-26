## Login Access

1. Make sure **File Browser** is running.
2. Open your browser and go to:

```
http://localhost:9595
```

3. Enter the credentials:

| Field    | Value                                               |
| -------- | --------------------------------------------------- |
| Username | `admin`                                             |
| Password | The password generated when File Browser first runs |

4. Click **Login** to access the File Browser dashboard.


## Change File Browser Password

* Launch **FhyServe**.
* Open the **CMD** tab from the dashboard.
* Type the following command to set a new password for the File Browser admin account:

```
fb -p NewPassword
```

* Press **Enter**.
* You will see a confirmation in the CMD output:

```
Password changed successfully.
```

* Now you can log in to **File Browser** using the new password at:

```
http://localhost:9595
```

**Notes:**

* Replace `"NewPassword` with your desired password.
* Make sure File Browser is **running** before changing the password.