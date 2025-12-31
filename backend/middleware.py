import os
import re
import json
import base64
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENAI_KEY = os.environ["OPENAI_API"]
HEADERS = {"Authorization": f"Bearer {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

MODEL = "gpt-4o-mini"
MIN_LINES = 20
MAX_PAYLOAD = 120_000

TEXT_EXTS = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rs", ".sh", "c", "cpp"}
EXCLUDE = {"tests/", "docs/", "examples/", "node_modules/", "dist/", "build/"}
IMPORTANT = {"src/", "app/", "lib/", "api/", "services/"}

llm = OpenAI(api_key=OPENAI_KEY)


def normalize_score(v):
    try:
        v = float(v)
        if 0 <= v <= 10:
            v *= 10
        return max(0, min(100, v))
    except Exception:
        return 0.0


def extract_text(resp):
    if hasattr(resp, "output_text"):
        return resp.output_text
    out = []
    for m in getattr(resp, "output", []):
        for p in getattr(m, "content", []):
            if getattr(p, "type", "") == "output_text":
                out.append(p.text)
    return "".join(out)


def safe_json(text):
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", text)
        return json.loads(m.group()) if m else {}


def analyze(payload):
    prompt = f"""
Analyze the codebase as a whole.

Score each metric from 0 to 100.

Return ONLY JSON with:
overall_score, readability, maintainability, performance, description

Code:
{json.dumps(payload, ensure_ascii=False)}
"""

    r = llm.responses.create(
        model=MODEL,
        input=[{"role": "user", "content": prompt}]
    )

    data = safe_json(extract_text(r))

    return {
        "overall_score": normalize_score(data.get("overall_score")),
        "readability": normalize_score(data.get("readability")),
        "maintainability": normalize_score(data.get("maintainability")),
        "performance": data.get("performance", "Unknown"),
        "description": data.get("description", "No description"),
    }


def fetch_repo_and_analyze(url):
    m = re.match(r"https?://github.com/([^/]+)/([^/]+)", url)
    if not m:
        raise ValueError("Invalid GitHub URL")

    owner, repo = m.groups()

    repo_info = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}",
        headers=HEADERS
    ).json()

    branch = repo_info.get("default_branch", "main")

    tree = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
        headers=HEADERS
    ).json().get("tree", [])

    files = {}

    for f in tree:
        path = f.get("path", "")
        if (
            f.get("type") != "blob"
            or not any(path.endswith(e) for e in TEXT_EXTS)
            or any(path.startswith(x) for x in EXCLUDE)
            or not (any(path.startswith(i) for i in IMPORTANT) or path.count("/") <= 3)
        ):
            continue

        blob = requests.get(f["url"], headers=HEADERS).json()
        code = base64.b64decode(blob.get("content", "")).decode("utf-8", "ignore")

        if code.count("\n") < MIN_LINES:
            continue

        files[path] = code

        if len(json.dumps(files)) > MAX_PAYLOAD:
            break

    if not files:
        return {
            "overall_score": 0,
            "readability": 0,
            "maintainability": 0,
            "performance": "N/A",
            "description": "No relevant files found.",
        }

    return analyze(files)


def analyze_uploaded_file(content: str):
    return analyze(content)
