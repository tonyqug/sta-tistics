import os
import time
from flask import Flask, request
from flask_cors import CORS


from helperFunctions import *

app = Flask(__name__)
CORS(app)

# expects { class: , student: , response: }
@app.route('/api/insert-student-feedback', methods=['POST'])
def insert_student_feedback():
    data = request.get_json()
    data["slide"] = fetchClassData(data["class"])["slide"]
    insertStudentFeedback(data)
    return {}

# expects { classCode: , question: }
@app.route('/api/insert-student-question', methods=['POST'])
def insert_student_question():
    data = request.get_json()
    data["response"] = generate_response(data["question"],data["class"])
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
    print(data)
    uploadPresentation(data)

# expects { classCode: , slide: }
@app.route('/api/update-class-data', methods=['POST'])
def update_class_data():
    data = request.get_json()
    updateClassData(data["classCode"], data["slide"])

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
