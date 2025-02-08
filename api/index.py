import os
import time
from flask import Flask, request, jsonify
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
    classData = fetchClassData(data["class"])
    slideNumber = classData['slide']
    data["response"] = generate_response(data["question"],data["class"], slideNumber)
    data['slide'] = slideNumber
    insertStudentQuestions(data)
    return jsonify(data["response"])

# expects { }
@app.route('/api/insert-class-data', methods=['POST'])
def insert_class_data():
    data = request.get_json()
    insertClassData(data)
    return {}

# expects { classCode: data: }
@app.route('/api/upload-presentation', methods=['POST'])
def upload_presentation():
    data = request.get_json()
    print(len(data["data"]))
    uploadPresentation(data["classCode"],data["data"])
    return {}

# expects { classCode: , slide: }
@app.route('/api/update-class-data', methods=['POST'])
def update_class_data():
    data = request.get_json()
    updateClassData(data["classCode"], data["slide"])
    return {}

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

# expects { class: }
@app.route('/api/fetch-all-classes', methods=['POST'])
def fetch_all_classes():
    return jsonify(fetchAllClasses())

if __name__ == "__main__":
    app.run(debug = True, port = 5328)
