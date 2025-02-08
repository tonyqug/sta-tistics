import os
from flask import Flask, request
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

app = Flask(__name__)

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

def fetchStudentFeedback(className):
    return client.table("student_feedback").select("*").eq("class", className).execute()

@app.route('/api/insert-student-feedback', methods=['POST'])
def insert_student_feedback():
    data = request.get_json()
    res = client.from_("student_feedback").insert(data).execute()
    print(res)

@app.route('/api/insert-student-question', methods=['POST'])
def insert_student_questions():
    data = request.get_json()
    question = data["question"]
    response = "the-response"
    data["response"] = response
    res = client.from_("student_questions").insert(data).execute()
    print(res)
    return response

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    data = request.get_json()
    res = client.storage.from_("presentations").upload(data["name"], data["data"])
    print(res)
