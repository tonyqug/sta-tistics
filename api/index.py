import os
from flask import Flask, request
from supabase import create_client
import google.generativeai as genai
from dotenv import load_dotenv

genai.configure(api_key=os.getenv("GEMINI_KEY"))
genaimodel = genai.GenerativeModel('gemini-1.5-flash')

from flask_cors import CORS

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://tonyq.vercel.app"]}})

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

def newStudentFeedback(classId, studentName, slide, response):
    return {
        "class": classId,
        "student": studentName,
        "slide": slide,
        "response": response
    }

def newStudentQuestion(classId, studentName, slide, question, response):
    return {
        "class": classId,
        "student": studentName,
        "slide": slide,
        "question": question,
        "response": response
    }

client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def insertStudentFeedback(data):
    return client.from_("student_feedback").insert(data).execute()


def insertStudentQuestions(data):
    return client.from_("student_questions").insert(data).execute()

def insertClassData(data):
    return client.from_("class_data").insert(data).execute()

def uploadPresentation(data):
    return client.storage.from_("presentations").upload(data["name"], data["data"])

def deleteStudentFeedback(classId):
    return client.from_("student_feedback").delete().eq("class", classId)

def deleteStudentQuestions(classId):
    return client.from_("student_questions").delete().eq("class", classId)

def deleteClassData(classId):
    return client.from_("class_data").delete().eq("class", classId)

def fetchStudentFeedback(classId):
    return client.table("student_feedback").select("*").eq("class", classId).execute()

def fetchStudentQuestions(classId):
    return client.table("student_questions").select("*").eq("class", classId).execute()

def fetchClassData(classId):
    return client.table("class_data").select("*").eq("class", classId).execute()[0]

# expects { class: , student: , response: }
@app.route('/api/insert-student-feedback', methods=['POST'])
def insert_student_feedback():
    data = request.get_json()
    data["slide"] = fetchClassData(data["class"])["slide"]
    insertStudentFeedback(data)
    return {}

# expects { class: , student: , question: }
@app.route('/api/insert-student-question', methods=['POST'])
def insert_student_question():
    data = request.get_json()
    data["slide"] = fetchClassData(data["class"])["slide"]
    data["response"] = genaimodel.generate_content(data["question"])
    insertStudentQuestions(data)
    return data["response"]

# expects { }
@app.route('/api/insert-class-data', methods=['POST'])
def insert_class_data():
    data = request.get_json()
    insert_class_data(data)

# expects { class: }
@app.route('/api/delete-class-data', methods=['POST'])
def delete_class_data():
    data = request.get_json()
    deleteStudentFeedback(data["class"])
    deleteStudentQuestions(data["class"])
    deleteClassData(data["class"])

# expects { name: , data: }
@app.route('/api/upload-presentation', methods=['POST'])
def upload_presentation():
    data = request.get_json()
    uploadPresentation(data)

if __name__ == "__main__":
    app.run(debug = True, port = 5000)