## File Browser

FileBrowser is a web-based application for file and directory management that runs on top of an HTTP service. FileBrowser allows users to centrally manage the file system (project file system) through a web interface, without requiring direct access to the operating system's file manager.

In the context of FhyServe, FileBrowser is used as a local file server management utility to simplify project management. All file operations are performed within the scope of a predefined directory, thus remaining secure and isolated from the host system.

---

## Main Functions of FileBrowser

FileBrowser provides various technical functions, including:

- Web-based directory navigation
- Upload, download, rename, move, and delete files
- Edit text files directly through a browser
- Access project files without CLI or OS file explorer
- Monitor project file structure

---

## Integration with FhyServe

FileBrowser integrates directly with FhyServe as an auxiliary service that runs locally. Some of its integration characteristics:

- Runs as a local HTTP service
- Does not require separate installation
- Uses portable resources bundled with FhyServe
- Can be started, stopped, and controlled from the FhyServe dashboard
- Suitable for managing web projects, assets, and project configurations

Default FileBrowser endpoint on FhyServe:

```
http://localhost:9595
```

---

## Login Access

Ensure the FileBrowser service is running and the HTTP listener is active before accessing it.

1. Run FileBrowser through FhyServe
2. Access the following endpoint through a browser:
```
http://localhost:9595
```

3. Enter login credentials:

| Parameters | Description |
| ------------ | ------------------------------------------------------------------------------- |
| **Username** | `admin` |
| **Password** | The initial password is automatically generated when FileBrowser is first launched.

4. Click Login to enter the FileBrowser dashboard.

> Technical Note:
> The initial password is only created once during the first initialization process and is stored in FileBrowser's internal configuration.

---

## FileBrowser Password Management

Password changes are made through the Command Line Interface (CLI) provided by FhyServe.

#### Prerequisites

- FhyServe is running
- FileBrowser service is active
- Access the CMD tab on the FhyServe dashboard

#### Changing the Admin Password

1. Open the FhyServe Dashboard
2. Go to the CMD tab
3. Run the following command:
```
fb -p <NewPassword>
```
4. Press Enter
5. If successful, the following output will appear:
```
Password changed successfully.
```
6. Re-login using the new password via:
```
http://localhost:9595
```

#### Command Explanation

| Component | Description |
| --------------- | -------------------------------------- |
| `fb` | FhyServe's default FileBrowser executable |
| `-p` | Flag to change the admin password |
| `<NewPassword>` | The new password to be applied |

---

## FileBrowser Port Configuration

Users can change the FileBrowser service port through the FhyServe application configuration. This setting is useful for avoiding port conflicts or adapting to the needs of the development environment.

#### Configuration Location

Access the following menu in FhyServe: `Home → Settings → app.config.json`
In the configuration file, adjust the following parameters:
```
"FILE_BROWSER_PORT": 9595
```

#### Parameter Explanation

| Parameter | Description |
| ------------------- | ---------------------------------------------------------------------- |
| `FILE_BROWSER_PORT` | Specifies the HTTP port used by the FileBrowser service |