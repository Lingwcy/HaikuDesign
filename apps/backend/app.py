from __future__ import annotations

import os
import uuid
from pathlib import Path

from flask import Flask, jsonify, make_response, request
from werkzeug.utils import secure_filename


APP_ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = APP_ROOT / "uploads"
TEMP_CHUNK_DIR = APP_ROOT / "temp_chunks"

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
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


# =====================
# 分片上传接口
# =====================

@app.route("/api/upload/chunk", methods=["POST", "OPTIONS"])
def upload_chunk():
    """上传单个分片"""
    if request.method == "OPTIONS":
        return make_response("", 204)

    if "file" not in request.files:
        return jsonify({"error": "file field is required"}), 400

    file_storage = request.files["file"]
    if not file_storage or file_storage.filename == "":
        return jsonify({"error": "file is empty"}), 400

    # 获取分片信息
    try:
        chunk_index = int(request.form.get("chunkIndex", 0))
        total_chunks = int(request.form.get("totalChunks", 1))
        file_name = request.form.get("fileName", "unknown")
        file_size = int(request.form.get("fileSize", 0))
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid chunk info: {str(e)}"}), 400

    # 创建临时目录
    TEMP_CHUNK_DIR.mkdir(parents=True, exist_ok=True)

    # 使用原文件名 + 分片索引作为临时文件标识
    safe_name = secure_filename(file_name)
    temp_file_name = f"{safe_name}.part{chunk_index}"
    temp_path = TEMP_CHUNK_DIR / temp_file_name

    file_storage.save(temp_path)

    return jsonify({
        "success": True,
        "chunkIndex": chunk_index,
        "totalChunks": total_chunks,
        "fileName": file_name,
    })


@app.route("/api/upload/chunks", methods=["GET", "OPTIONS"])
def get_uploaded_chunks():
    """查询已上传的分片列表（断点续传）"""
    if request.method == "OPTIONS":
        return make_response("", 204)

    file_name = request.args.get("fileName", "")
    file_size = request.args.get("fileSize", "")
    chunk_size = request.args.get("chunkSize", "")

    if not file_name:
        return jsonify({"error": "fileName is required"}), 400

    safe_name = secure_filename(file_name)

    # 查找已上传的分片
    uploaded_chunks = []
    if TEMP_CHUNK_DIR.exists():
        for i in range(1000):  # 假设最多1000个分片
            temp_file_name = f"{safe_name}.part{i}"
            temp_path = TEMP_CHUNK_DIR / temp_file_name
            if temp_path.exists():
                uploaded_chunks.append(i)
            else:
                # 分片是连续的，一旦发现不存在的分片就停止
                if uploaded_chunks and i > max(uploaded_chunks) + 1:
                    break

    return jsonify({
        "success": True,
        "uploadedChunks": uploaded_chunks,
    })


@app.route("/api/upload/merge", methods=["POST", "OPTIONS"])
def merge_chunks():
    """合并所有分片"""
    if request.method == "OPTIONS":
        return make_response("", 204)

    data = request.json
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    file_name = data.get("fileName")
    total_chunks = data.get("totalChunks")

    if not file_name:
        return jsonify({"error": "fileName is required"}), 400

    if not total_chunks:
        return jsonify({"error": "totalChunks is required"}), 400

    safe_name = secure_filename(file_name)

    # 创建上传目录
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # 输出文件路径
    output_path = UPLOAD_DIR / safe_name

    # 合并分片
    try:
        # 先检查所有分片是否都已上传完成
        # 如果有分片未上传，等待一段时间后再检查
        import time

        max_wait = 30  # 最多等待30秒
        wait_interval = 1  # 每1秒检查一次
        waited = 0

        while waited < max_wait:
            # 检查所有分片是否都存在
            all_exist = True
            missing_chunks = []

            for i in range(int(total_chunks)):
                temp_file_name = f"{safe_name}.part{i}"
                temp_path = TEMP_CHUNK_DIR / temp_file_name
                if not temp_path.exists():
                    all_exist = False
                    missing_chunks.append(i)

            if all_exist:
                break

            # 还有分片未上传完成，等待
            time.sleep(wait_interval)
            waited += wait_interval

        if not all_exist:
            return jsonify({
                "error": "Some chunks are still uploading",
                "missingChunks": missing_chunks,
                "waited": waited
            }), 400

        # 所有分片都已上传，开始合并
        with open(output_path, "wb") as output_file:
            for i in range(int(total_chunks)):
                temp_file_name = f"{safe_name}.part{i}"
                temp_path = TEMP_CHUNK_DIR / temp_file_name

                with open(temp_path, "rb") as chunk_file:
                    output_file.write(chunk_file.read())

                # 删除临时分片
                os.remove(temp_path)

        return jsonify({
            "success": True,
            "url": f"/uploads/{safe_name}",
            "filename": safe_name,
            "size": output_path.stat().st_size,
        })
    except Exception as e:
        return jsonify({"error": f"Merge failed: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
