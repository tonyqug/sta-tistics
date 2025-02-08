import os
import time
from flask import Flask, request
from flask_cors import CORS
from supabase import create_client
import google.generativeai as genai
from dotenv import load_dotenv

genai.configure(api_key=os.getenv("GEMINI_KEY"))
client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

genaimodel = genai.GenerativeModel('gemini-1.5-flash')

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://tonyq.vercel.app"]}})

def insertStudentFeedback(data):
    return client.from_("student_feedback").insert(data).execute()

def insertStudentQuestions(data):
    return client.from_("student_questions").insert(data).execute()

def insertClassData(data):
    return client.from_("class_data").insert(data).execute()

def uploadPresentation(data):
    return client.storage.from_("presentations").upload(data["name"], data["data"])

def updateClassData(classId, data):
    return client.storage.from_("class_data").update(data).eq("class", classId).execute()

def deleteStudentFeedback(classId):
    return client.from_("student_feedback").delete().eq("class", classId).execute()

def deleteStudentQuestions(classId):
    return client.from_("student_questions").delete().eq("class", classId).execute()

def deleteClassData(classId):
    return client.from_("class_data").delete().eq("class", classId).execute()

def deleteClass(classId):
    return (deleteStudentFeedback(classId), deleteStudentQuestions(classId), deleteClassData(classId))

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

# expects { name: , data: }
@app.route('/api/upload-presentation', methods=['POST'])
def upload_presentation():
    data = request.get_json()
    uploadPresentation(data)

# expects { class: , slide: }
@app.route('/api/update-class-data', methods=['POST'])
def update_class_data():
    data = request.get_json()
    data["time"] = time.time()
    updateClassData(data["class"], data)

# expects { class: }
@app.route('/api/delete-class-data', methods=['POST'])
def delete_class_data():
    data = request.get_json()
    deleteClass(data["class"])

# expects { class: }
@app.route('/api/fetch-student-feedback', methods=['POST'])
def fetch_student_feedback():
    data = request.get_json()
    return fetchStudentFeedback(data["class"])

# expects { class: }
@app.route('/api/fetch-student-questions', methods=['POST'])
def fetch_student_questions():
    data = request.get_json()
    return fetchStudentQuestions(data["class"])

# expects { class: }
@app.route('/api/fetch-class-slide', methods=['POST'])
def fetch_class_slide():
    data = request.get_json()
    return fetchClassData(data["class"])["slide"]

if __name__ == "__main__":
    app.run(debug = True, port = 5000)
