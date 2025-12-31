<img width="1278" height="599" alt="image" src="https://github.com/user-attachments/assets/f5866ddf-9313-4a08-8212-952413482f27" />

# GitReview

GitReview is an AI-powered code analysis tool that helps developers review and evaluate codebases. It provides automated scoring on readability, maintainability, performance, and overall quality using advanced language models.

## Features

- **File Upload Analysis**: Upload code files for instant AI-powered review
- **GitHub Repository Analysis**: Analyze entire repositories by providing a GitHub URL
- **Comprehensive Scoring**: Get scores for readability, maintainability, performance, and overall quality
- **Detailed Descriptions**: Receive detailed feedback and suggestions for improvement

## Tech Stack

### Backend
- **Flask**: Python web framework for the API server
- **OpenAI GPT-4o-mini**: AI model for code analysis
- **GitHub API**: For fetching repository contents
- **Flask-CORS**: Cross-origin resource sharing support

### Frontend
- **React**: JavaScript library for building user interfaces
- **Framer Motion**: Animation library for smooth interactions
- **React Snow Overlay**: Seasonal snow effect overlay

## Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key
- GitHub Personal Access Token (optional, for higher rate limits)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gitreview
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install flask flask-cors openai python-dotenv requests
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

1. **Create environment file for backend:**
   ```bash
   cd backend
   touch .env
   ```

2. **Add your API keys to `.env`:**
   ```
   OPENAI_API=your_openai_api_key_here
   GITHUB_TOKEN=your_github_token_here  # Optional
   ```

## Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   python server.py
   ```
   The backend will run on `http://127.0.0.1:5000`

2. **Start the Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Choose between "File Upload" or "Repository URL" mode
3. For file upload: Select a code file to analyze
4. For repository analysis: Enter a GitHub repository URL
5. Click "Review" to get AI-powered analysis results

## API Endpoints

### POST /upload/
Upload a file for analysis.

**Request:** Multipart form data with `file` field containing the code file.

**Response:** JSON with analysis results.

### POST /analyze_repo/
Analyze a GitHub repository.

**Request:** JSON with `github_url` field.

**Response:** JSON with analysis results.

## Analysis Metrics

- **Overall Score**: Composite score from 0-100
- **Readability**: How easy the code is to read and understand
- **Maintainability**: How easy the code is to maintain and modify
- **Performance**: Code efficiency and optimization potential
- **Description**: Detailed AI-generated feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
