import os
from flask import Flask, request
from supabase import create_client
from dotenv import load_dotenv
from flask_cors import CORS
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://tonyq.vercel.app"]}})

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

def newStudentFeedback(className, studentName, slide, response):
    return {
        "class": className,
        "student": studentName,
        "slide": slide,
        "response": response
    }

client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def insertStudentFeedback(data):
    client.from_("student_feedback").insert(data).execute()
    return {}

def insertStudentQuestions(data):
    return client.from_("student_questions").insert(data).execute()
def uploadPresentation(data):
    return client.storage.from_("presentations").upload(data["name"], data["data"])
def fetchStudentFeedback(className):
    return client.table("student_feedback").select("*").eq("class", className).execute()
def fetchStudentQuestions(className):
    return client.table("student_questions").select("*").eq("class", className).execute()

@app.route('/api/insert-student-feedback', methods=['POST'])
def insert_student_feedback():
    data = request.get_json()
    insertStudentFeedback(data)
    return {}

@app.route('/api/insert-student-question', methods=['POST'])
def insert_student_question():
    data = request.get_json()
    question = data["question"]
    response = "the-response"
    data["response"] = response
    insertStudentQuestions(data)
    return response

@app.route('/api/upload-presentation', methods=['POST'])
def upload_presentation():
    data = request.get_json()
    uploadPresentation(data)

if __name__ == "__main__":
    app.run(debug = True, port = 5000)