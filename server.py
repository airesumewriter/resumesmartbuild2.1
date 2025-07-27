from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"status": "OK", "message": "ResumeSmartBuild server is running."})

@app.route('/ats-scan', methods=['POST'])
def ats_scan():
    data = request.get_json()

    resume = data.get('resume')
    job_description = data.get('job_description')

    if not resume or not job_description:
        return jsonify({"error": "Missing 'resume' or 'job_description'"}), 400

    # --- Placeholder logic ---
    score = 85  # Dummy score (replace with actual logic later)
    suggestions = ["Use more industry keywords", "Optimize bullet points"]

    return jsonify({
        "match_score": score,
        "suggestions": suggestions
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))

    try:
        print(f"\n🚀 ResumeSmartBuild Server starting on port {port}\n")
        app.run(host='0.0.0.0', port=port, debug=True)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Please free it or change the port.")
        else:
            raise
