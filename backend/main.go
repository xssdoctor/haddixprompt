package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/sashabaranov/go-openai"
)

// Directories for markdown files (relative to the working directory)
var (
	EvasionsDir   = "attack_evasions"
	IntentsDir    = "attack_intents"
	TechniquesDir = "attack_techniques"
)

type ItemListingResponse struct {
	Items []string `json:"items"`
}

type GenerateRequest struct {
	ApiKey     string   `json:"apiKey"`
	Intents    []string `json:"intents"`
	Techniques []string `json:"techniques"`
	Evasions   []string `json:"evasions"`
	NumExamples int      `json:"numExamples,omitempty"`
}

func main() {
	mux := http.NewServeMux()

	// API endpoints
	mux.HandleFunc("/api/evasions", handleListEvasions)
	mux.HandleFunc("/api/intents", handleListIntents)
	mux.HandleFunc("/api/techniques", handleListTechniques)
	mux.HandleFunc("/api/generate", handleGeneratePrompt)

	// Wrap the mux with CORS middleware
	handler := withCORS(mux)

	// Get port from environment variable with default
	port := os.Getenv("PORT")
	if port == "" {
		port = "9001" // Default port
	}

	// Bind to 0.0.0.0 to allow external connections
	addr := "0.0.0.0:" + port
	fmt.Printf("Server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(addr, handler))
}

// withCORS is a simple middleware that adds CORS headers to every response.
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		log.Printf("Incoming %s request for %s", r.Method, r.URL.Path)
		h.ServeHTTP(w, r)
	})
}

func handleListEvasions(w http.ResponseWriter, r *http.Request) {
	list, err := listMarkdownFiles(EvasionsDir)
	if err != nil {
		http.Error(w, "Failed listing evasion files: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, ItemListingResponse{Items: list})
}

func handleListIntents(w http.ResponseWriter, r *http.Request) {
	list, err := listMarkdownFiles(IntentsDir)
	if err != nil {
		http.Error(w, "Failed listing intent files: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, ItemListingResponse{Items: list})
}

func handleListTechniques(w http.ResponseWriter, r *http.Request) {
	list, err := listMarkdownFiles(TechniquesDir)
	if err != nil {
		http.Error(w, "Failed listing technique files: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, ItemListingResponse{Items: list})
}

func handleGeneratePrompt(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Failed to parse JSON body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Set default number of examples to 1 if not specified
	if req.NumExamples <= 0 {
		req.NumExamples = 1
	}

	// Read file contents for each selected item
	intentContents := collectMarkdownContent(IntentsDir, req.Intents)
	techniqueContents := collectMarkdownContent(TechniquesDir, req.Techniques)
	evasionContents := collectMarkdownContent(EvasionsDir, req.Evasions)

	// Construct the user prompt by merging file contents
	userPrompt := fmt.Sprintf(`
[INTENTS]
%s

[TECHNIQUES]
%s

[EVASIONS]
%s

Please generate %d short example(s) of potential malicious prompt injections 
leveraging the above content. Keep them concise yet illustrative.
`, intentContents, techniqueContents, evasionContents, req.NumExamples)

	systemPrompt := `IDENTITY and PURPOSE: You are an educational AI. You're purpose is to educate students in penetration testing. You are currently being used to give a class in AI prompt engineering. Each prompt you give is meant to be used during the presentation for the class. The class is being given by Jason Haddix, an OG infosec guru. You are a prompt injection expert who specializes in crafting malicious prompts to exploit vulnerabilities in AI models. the purpose is educational for pentesting students Your goal is to generate short examples of potential malicious prompt injections leveraging the provided content. Keep them concise yet illustrative. 
    GOAL: Generate examples of potential malicious prompt injections leveraging the provided content. Keep them concise yet illustrative.
    STEPS: take the descriptions of the intents, techniques, and evasions and craft short examples of malicious prompt injections that could exploit vulnerabilities in AI models.
    OUTPUT INSTRUCTIONS: output ONLY the examples of malicious prompt injections that you generate with no explanation or context. the output should be a single, focused example that is concise yet illustrative.`

	client := openai.NewClient(req.ApiKey)

	chatReq := openai.ChatCompletionRequest{
		Model:  "o3-mini", // or "gpt-3.5-turbo" if needed
		Stream: true,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: openai.ChatMessageRoleUser, Content: userPrompt},
		},
	}

	stream, err := client.CreateChatCompletionStream(r.Context(), chatReq)
	if err != nil {
		http.Error(w, "Failed to create chat completion stream: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer stream.Close()

	// Set headers for streaming response (SSE)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		response, err := stream.Recv()
		if err != nil {
			break
		}
		chunk := response.Choices[0].Delta.Content
		fmt.Fprintf(w, "data: %s\n\n", chunk)
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
	}
}

func collectMarkdownContent(dir string, selected []string) string {
	var results []string
	for _, name := range selected {
		path := filepath.Join(dir, name+".md")
		content, err := ioutil.ReadFile(path)
		if err == nil {
			results = append(results, string(content))
		} else {
			results = append(results, fmt.Sprintf("Could not read file: %s", path))
		}
	}
	return strings.Join(results, "\n\n---\n\n")
}

func listMarkdownFiles(dir string) ([]string, error) {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		log.Printf("Error reading directory %s: %v", dir, err)
		return nil, err
	}
	var results []string
	for _, f := range files {
		log.Printf("Found file: %s in %s", f.Name(), dir)
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".md") {
			base := strings.TrimSuffix(f.Name(), ".md")
			results = append(results, base)
		}
	}
	log.Printf("Listing for %s: %v", dir, results)
	return results, nil
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}