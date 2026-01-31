from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

DB_FILE = "events.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/stats', methods=['GET'])
def get_stats():
    if not os.path.exists(DB_FILE):
        return jsonify({"status": "Waiting for data..."})
        
    conn = get_db_connection()
    
    # Get latest event
    latest = conn.execute('SELECT * FROM events ORDER BY id DESC LIMIT 1').fetchone()
    
    # Get counts
    total_anomalies = conn.execute("SELECT COUNT(*) FROM events WHERE status = 'CRITICAL'").fetchone()[0]
    total_events = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
    
    conn.close()
    
    if latest:
        return jsonify({
            "status": latest['status'],
            "probability": latest['probability'],
            "timestamp": latest['timestamp'],
            "syscall_rate": latest['syscall_rate'],
            "churn_rate": latest['churn_rate'],
            "total_anomalies": total_anomalies,
            "total_events": total_events
        })
    else:
        return jsonify({"status": "No data yet"})

@app.route('/api/history', methods=['GET'])
def get_history():
    if not os.path.exists(DB_FILE):
        return jsonify([])
        
    conn = get_db_connection()
    # Get last 100 events (approx 100 seconds)
    events = conn.execute('SELECT * FROM events ORDER BY id DESC LIMIT 100').fetchall()
    conn.close()
    
    # Reverse to chronological order
    data = [dict(row) for row in reversed(events)]
    return jsonify(data)

if __name__ == '__main__':
    print("Starting Dashboard Backend on port 5000...")
    app.run(debug=True, port=5000)
