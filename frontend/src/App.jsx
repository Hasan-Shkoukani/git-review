import { useState } from "react";
import { motion } from "framer-motion";
import { SnowOverlay } from "react-snow-overlay";
import "./App.css";

function App() {
  const [mode, setMode] = useState("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidURL = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleReview = async () => {
    setError("");
    setResult("");
    setAnalysis(null);

    if (mode === "text") {
      if (!file) {
        setError("Please select a file.");
        return;
      }
    } else {
      if (!input.trim()) {
        setError("Please enter a URL.");
        return;
      }
      if (!isValidURL(input)) {
        setError("Please enter a valid URL.");
        return;
      }
    }

    setLoading(true);

    try {
      let response;
      if (mode === "text") {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('http://127.0.0.1:5000/upload/', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('http://127.0.0.1:5000/analyze_repo/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ github_url: input })
        });
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Something went wrong while reviewing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SnowOverlay
        snowflakeCount={40}
        speed={0.2}
        opacity={0.35}
        zIndex={0}
      />

      <div className="app">
        <aside className="sidebar">
          <h2>GitReview</h2>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={mode === "text" ? "active" : ""}
            onClick={() => {
              setMode("text");
              setInput("");
              setFile(null);
              setResult("");
              setAnalysis(null);
              setError("");
              setLoading(false);
            }}
          >
             File Review
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={mode === "url" ? "active" : ""}
            onClick={() => {
              setMode("url");
              setInput("");
              setFile(null);
              setResult("");
              setAnalysis(null);
              setError("");
              setLoading(false);
            }}
          >
             URL Review
          </motion.button>
        </aside>

        <main className="main">
          <h1>{mode === "text" ? "File Review" : "URL Review"}</h1>

          <motion.div
            key={mode}
            className="input-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {mode === "text" ? (
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
              />
            ) : (
              <input
                type="text"
                placeholder="Paste the URL here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
            )}

            <button onClick={handleReview} disabled={loading}>
              {loading ? "Reviewing..." : "Review"}
            </button>
          </motion.div>

          {error && (
            <motion.p
              className="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
               {error}
            </motion.p>
          )}

          <motion.div className="result-box" layout>
            {loading ? (
              <motion.div
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                 AI is reviewing your content...
              </motion.div>
            ) : analysis ? (
              <div className="analysis">
                <h3>Analysis Results</h3>
                <p><strong>Overall Score:</strong> <span className="score overall">{analysis.overall_score}/100</span></p>
                <p><strong>Readability:</strong> <span className="score readability">{analysis.readability}/100</span></p>
                <p><strong>Maintainability:</strong> <span className="score maintainability">{analysis.maintainability}/100</span></p>
                <p><strong>Performance:</strong> <span className="performance">{analysis.performance}</span></p>
                <p><strong>Description:</strong> <span className="description">{analysis.description}</span></p>
              </div>
            ) : (
              <pre>{result || "feedback will appear here..."}</pre>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
}

export default App;
