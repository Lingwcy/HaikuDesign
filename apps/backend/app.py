from __future__ import annotations

import os
import uuid
from pathlib import Path

from flask import Flask, jsonify, make_response, request
from werkzeug.utils import secure_filename


APP_ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = APP_ROOT / "uploads"

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/upload", methods=["POST", "OPTIONS", "GET"])
def upload():
    if request.method == "OPTIONS":
        return make_response("", 204)

    if request.method == "GET":
        return jsonify({"status": "ok"}), 200

    if "file" not in request.files:
        return jsonify({"error": "file field is required"}), 400

    file_storage = request.files["file"]
    if not file_storage or file_storage.filename == "":
        return jsonify({"error": "file is empty"}), 400

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = secure_filename(file_storage.filename)
    ext = Path(safe_name).suffix
    unique_name = f"{Path(safe_name).stem}-{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_name

    file_storage.save(file_path)

    return jsonify(
        {
            "status": "success",
            "filename": unique_name,
            "originalName": file_storage.filename,
            "size": file_path.stat().st_size,
            "contentType": file_storage.mimetype,
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
