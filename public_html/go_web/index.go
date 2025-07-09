package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"io/ioutil"
)

type Project struct {
	Name string `json:"name"`
	Port int    `json:"port"`
}

type Response struct {
	Main     string    `json:"main"`
	RootDirectory string    `json:"rootDirectory"`
	Projects []Project `json:"projects"`
}

func main() {
	port := "5000"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	rootDir := "."

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		projects := []Project{}

		mainPort := 0
		mainIndex := filepath.Join(rootDir, "index.go")
		if fileExists(mainIndex) {
			mainPort = extractPort(mainIndex)
			if mainPort == 0 {
				mainPort = 5000
			}
			projects = append(projects, Project{Name: "main", Port: mainPort})
		}

		files, err := ioutil.ReadDir(rootDir)
		if err == nil {
			for _, f := range files {
				if f.IsDir() {
					subIndex := filepath.Join(rootDir, f.Name(), "index.go")
					if fileExists(subIndex) {
						port := extractPort(subIndex)
						if port == 0 {
							port = 5000
						}
						projects = append(projects, Project{Name: f.Name(), Port: port})
					}
				}
			}
		}

		resp := Response{
			Main:     fmt.Sprintf("localhost:%s", port),
			RootDirectory: "public_html/go_web/*",
			Projects: projects,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	fmt.Printf("Main server started on http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Failed to start main server:", err)
	}
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	return err == nil && !info.IsDir()
}

func extractPort(filename string) int {
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return 0
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "port :=") {
			start := strings.Index(line, "\"")
			end := strings.LastIndex(line, "\"")
			if start >= 0 && end > start {
				var port int
				fmt.Sscanf(line[start+1:end], "%d", &port)
				return port
			}
		}
	}

	return 0
}
