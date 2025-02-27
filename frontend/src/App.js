import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");

  // For listing items from backend
  const [intentsList, setIntentsList] = useState([]);
  const [techniquesList, setTechniquesList] = useState([]);
  const [evasionsList, setEvasionsList] = useState([]);

  // Selections
  const [selectedIntent, setSelectedIntent] = useState("");
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [selectedEvasions, setSelectedEvasions] = useState([]);

  // Response streaming and loading state
  const [responseExamples, setResponseExamples] = useState(["", "", ""]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
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

  const handleIntentChange = (e) => {
    setSelectedIntent(e.target.value);
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
    setResponseExamples(["", "", ""]);
    setCurrentExampleIndex(0);
    setIsLoading(true);
    setError(null);

    // Check if intent is selected
    if (!selectedIntent) {
      setError("Please select an intent");
      setIsLoading(false);
      return;
    }

    const generateExample = async (index) => {
      try {
        const body = {
          apiKey,
          intents: [selectedIntent],
          techniques: selectedTechniques,
          evasions: selectedEvasions,
          numExamples: 1,
        };

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
        let exampleText = "";

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
                exampleText += text;
                setResponseExamples((prev) => {
                  const updated = [...prev];
                  updated[index] = exampleText;
                  return updated;
                });
              }
            }
          });
        }

        return exampleText;
      } catch (err) {
        setError(err.message || "An error occurred while generating content");
        console.error("Generation error:", err);
        return "";
      }
    };

    try {
      // Generate 3 examples sequentially
      setCurrentExampleIndex(0);
      await generateExample(0);

      setCurrentExampleIndex(1);
      await generateExample(1);

      setCurrentExampleIndex(2);
      await generateExample(2);
    } catch (err) {
      setError(err.message || "An error occurred while generating content");
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
      setCurrentExampleIndex(-1);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img
            src="https://avatars.githubusercontent.com/u/171357548?s=400&u=a47e288f29a9d0c0fa3806539dc69e9666481108&v=4"
            alt="Arcanum Logo"
            className="logo"
          />
        </div>
        <h1>Prompt Injection Generator</h1>
      </header>

      <div className="container">
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
              <label>Intent (select one)</label>
              <select
                value={selectedIntent}
                onChange={handleIntentChange}
                className="single-select"
                required
              >
                <option value="">-- Select an Intent --</option>
                {intentsList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Generating Examples..." : "Generate 3 Examples"}
            </button>
          </div>
        </form>

        <div className="output">
          <h2>AI Generated Prompt Injections:</h2>

          {responseExamples.map((example, index) => (
            <div key={index} className="example-container">
              <h3>Example {index + 1}</h3>
              <div className="response-box">
                {isLoading && currentExampleIndex === index ? (
                  <div className="loading-dots">
                    Generating example {index + 1}
                  </div>
                ) : example ? (
                  <div className="response-content">{example}</div>
                ) : (
                  <div className="empty-state">
                    {isLoading && currentExampleIndex < index
                      ? "Waiting to generate..."
                      : "Example will appear here"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="app-footer">
        <p>Powered by Arcanum Intelligence</p>
      </footer>
    </div>
  );
}

export default App;
