import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");

  // For listing items from backend
  const [intentsList, setIntentsList] = useState([]);
  const [techniquesList, setTechniquesList] = useState([]);
  const [evasionsList, setEvasionsList] = useState([]);

  // Selections
  const [selectedIntents, setSelectedIntents] = useState([]);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [selectedEvasions, setSelectedEvasions] = useState([]);

  // Response streaming and loading state
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Base URL for backend API - use runtime environment variable, environment variable, or default
  const baseUrl =
    (window.RUNTIME_ENV && window.RUNTIME_ENV.REACT_APP_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:9001";

  useEffect(() => {
    // Load lists from the backend
    fetchItems("/api/intents", setIntentsList);
    fetchItems("/api/techniques", setTechniquesList);
    fetchItems("/api/evasions", setEvasionsList);
  }, []);

  const fetchItems = async (endpoint, setFn) => {
    try {
      const res = await fetch(baseUrl + endpoint);
      const data = await res.json();
      setFn(data.items || []);
    } catch (err) {
      console.error("Failed to fetch items from", endpoint, err);
      setError(
        `Failed to fetch items from ${endpoint}. Please check if the backend server is running.`
      );
    }
  };

  const handleSelectChange = (e, setSelected) => {
    const { options } = e.target;
    const chosen = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        chosen.push(options[i].value);
      }
    }
    setSelected(chosen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseText("");
    setIsLoading(true);
    setError(null);

    const body = {
      apiKey,
      intents: selectedIntents,
      techniques: selectedTechniques,
      evasions: selectedEvasions,
    };

    try {
      const response = await fetch(baseUrl + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // SSE lines are typically in the format "data: <content>\n\n"
        const lines = chunk.split("\n");
        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "");
            if (text !== "[DONE]") {
              setResponseText((prev) => prev + text);
            }
          }
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred while generating content");
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Prompt Injection Generator</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="api-key-section">
          <div className="form-group">
            <label>OpenAI API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              required
            />
          </div>
        </div>

        <div className="form-layout">
          <div className="form-group">
            <label>
              Intents{" "}
              <span className="help-text">
                (hold Ctrl/Cmd to select multiple)
              </span>
            </label>
            <select
              multiple
              value={selectedIntents}
              onChange={(e) => handleSelectChange(e, setSelectedIntents)}
              size={5}
            >
              {intentsList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="selection-summary">
              {selectedIntents.length > 0 ? (
                <small>Selected: {selectedIntents.join(", ")}</small>
              ) : (
                <small>No intents selected</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              Techniques{" "}
              <span className="help-text">
                (hold Ctrl/Cmd to select multiple)
              </span>
            </label>
            <select
              multiple
              value={selectedTechniques}
              onChange={(e) => handleSelectChange(e, setSelectedTechniques)}
              size={5}
            >
              {techniquesList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="selection-summary">
              {selectedTechniques.length > 0 ? (
                <small>Selected: {selectedTechniques.join(", ")}</small>
              ) : (
                <small>No techniques selected</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              Evasions{" "}
              <span className="help-text">
                (hold Ctrl/Cmd to select multiple)
              </span>
            </label>
            <select
              multiple
              value={selectedEvasions}
              onChange={(e) => handleSelectChange(e, setSelectedEvasions)}
              size={5}
            >
              {evasionsList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="selection-summary">
              {selectedEvasions.length > 0 ? (
                <small>Selected: {selectedEvasions.join(", ")}</small>
              ) : (
                <small>No evasions selected</small>
              )}
            </div>
          </div>
        </div>

        <div className="button-container">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Prompt Injection"}
          </button>
        </div>
      </form>

      <div className="output">
        <h2>AI Generated Prompt Injection:</h2>
        <div className="response-box">
          {isLoading && !responseText ? (
            <div className="loading-dots">Generating prompt injection</div>
          ) : responseText ? (
            <div className="response-content">{responseText}</div>
          ) : (
            <div className="empty-state">
              Your generated prompt will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
