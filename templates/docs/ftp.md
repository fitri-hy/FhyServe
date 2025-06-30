## FTP Command List

| Command       | Description                                  | Example Usage                       |
|---------------|----------------------------------------------|-----------------------------------|
| **USER**      | Send username (usually prompted automatically) | (Prompted automatically after connect) |
| **PASS**      | Send password (prompted automatically)       | (Prompted automatically)           |
| **ACCT**      | Send account information (rarely used)        | `acct account_name`                 |
| **CWD**       | Change working directory on server             | `cwd foldername`                   |
| **CDUP**      | Change to parent directory                      | `cdup`                            |
| **SMNT**      | Mount file system (rarely supported)           | `smnt pathname`                   |
| **QUIT**      | Terminate FTP session                           | `quit` or `bye`                   |
| **REIN**      | Reinitialize FTP session without disconnecting | `rein`                           |
| **PORT**      | Specify active mode data port                   | `port 192,168,1,2,7,138`          |
| **PASV**      | Request passive mode                            | `pasv`                           |
| **TYPE**      | Set transfer type (A=ASCII, I=Binary, etc.)    | `type I`                         |
| **STRU**      | Set file structure (F=file, R=record, P=page)  | `stru F`                         |
| **MODE**      | Set transfer mode (S=stream, B=block, C=compressed) | `mode S`                     |
| **RETR**      | Download file                                   | `get filename.txt`                |
| **STOR**      | Upload file                                     | `put filename.txt`                |
| **STOU**      | Upload file with unique filename                | `stou filename.txt`               |
| **APPE**      | Append data to existing file                     | `appe filename.txt`               |
| **ALLO**      | Allocate space (rarely needed)                   | `allo 10000`                     |
| **REST**      | Restart transfer from position                    | `rest 1000`                     |
| **RNFR**      | Rename from (specify old filename)                | `rename oldname.txt newname.txt` (using RNFR + RNTO) |
| **RNTO**      | Rename to (specify new filename)                   | (used after RNFR)                 |
| **ABOR**      | Abort current file transfer                        | `abor`                          |
| **DELE**      | Delete a file                                      | `delete filename.txt`             |
| **RMD**       | Remove directory                                  | `rmdir foldername` or `rmd foldername` |
| **MKD**       | Make directory                                    | `mkdir newfolder` or `mkd newfolder` |
| **PWD**       | Print working directory                           | `pwd`                           |
| **LIST**      | List files/directories with details                | `ls` or `list`                  |
| **NLST**      | List file and directory names only                 | `nlst`                         |
| **SITE**      | Send site-specific commands                        | `site help`                     |
| **SYST**      | Show server system type                            | `syst`                         |
| **STAT**      | Show status                                        | `stat`                         |
| **HELP**      | Show help                                          | `help` or `?`                  |
| **NOOP**      | No operation (keep connection alive)               | `noop`                         |

---

### Notes

- **PORT** format: IP address and port split in 6 numbers, e.g. `192,168,1,2,7,138`  
- **TYPE** values:  
  - `A` = ASCII mode  
  - `I` = Binary (Image) mode  
  - `E` = EBCDIC  
  - `L <byte>` = Local byte size  
- **STRU**: `F` (File - default), `R` (Record), `P` (Page)  
- **MODE**: `S` (Stream - default), `B` (Block), `C` (Compressed)  

---

### Example Session

```bash
ftp ftp.example.com
Name (ftp.example.com:john): john
Password:
ftp> pwd
257 "/home/john"
ftp> ls
file1.txt  file2.jpg  folder1/
ftp> cd folder1
ftp> get file1.txt
ftp> put newfile.txt
ftp> rename oldname.txt newname.txt
ftp> quit
