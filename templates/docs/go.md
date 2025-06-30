## Create New Project

- Launch **FhyServe**.
- In the **Go** section, click the **Settings** icon.
- Click **Root Directory**.
- Create a New Folder for your project (for example, myproject).
- Inside the folder, create an **index.go** file or other necessary project files.
- **Start** the Golang server by clicking Start.
- To see a list of projects, open your browser and navigate to:

```
http://localhost:5000
```

**Example of `myproject/index.go` content:**

```
package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	port := "5001"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})

	fmt.Printf("Server started at http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Server failed:", err)
	}
}
```