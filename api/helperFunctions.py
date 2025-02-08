from supabase import create_client
import os
import google.generativeai as genai
from dotenv import load_dotenv
from pdf2image import convert_from_bytes
import io
from PIL import Image
import base64

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

genai.configure(api_key=os.getenv("GEMINI_KEY"))
genaimodel = genai.GenerativeModel('gemini-1.5-flash')



client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def generate_response(question, classCode):
    classData = fetchClassData(classCode)
    slideNumber = classData['slide']

    response = client.storage.from_("presentations").download(f"{classCode}.pdf")
    if response is None:
        return "Error: File not found."
    
    # Load PDF into PIL images
   
    slides = convert_from_bytes(response, fmt="png")
    
    if slideNumber >= len(slides) or slideNumber <= 0:
        return "Error: Slide number out of range."
    
    current_slide = slides[slideNumber - 1]
    previous_slide = slides[slideNumber - 2] if slideNumber > 1 else None
    
    # Convert slides to bytes
    current_slide_bytes = io.BytesIO()
    current_slide.save(current_slide_bytes, format='PNG')
    current_slide_bytes = current_slide_bytes.getvalue()
    
    previous_slide_bytes = None
    if previous_slide:
        previous_slide_bytes = io.BytesIO()
        previous_slide.save(previous_slide_bytes, format='PNG')
        previous_slide_bytes = previous_slide_bytes.getvalue()
    
    # Pass slides through Google Generative AI model

    inputs = {
        "question":  "You are an expert in academia teaching a lecture with slides. Linked is the current and previous slide. Answer the student's question: " + question,
        "current_slide": current_slide_bytes,
        "previous_slide": previous_slide_bytes,
    }
    response = genaimodel.generate_content(inputs)
    
    return response

def insertStudentFeedback(data):
    return client.from_("student_feedback").insert(data).execute()

def insertStudentQuestions(data):
    return client.from_("student_questions").insert(data).execute()

def insertClassData(data):
    try:
        return client.from_("class_data").insert(data).execute()
    except Exception as e:
        print(e)
        return

def uploadPresentation(classCode, data):
    file_data = base64.b64decode(data)
    return client.storage.from_("presentations").upload(path = f"{classCode}.pdf", file=file_data,file_options={"content-type": "application/pdf"})

def updateClassData(classCode, slide):
    return (    
        client
        .table("class_data")
        .update({"slide": slide})
        .eq("class", classCode)
        .execute()
    )
    

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
    return client.table("class_data").select("*").eq("class", classId).execute().data[0]

def fetchAllClasses():
    response = client.table('class_data').select('class').execute()
    

    # Extract the 'class' values from the response
    class_list = [item['class'] for item in response.data]
    return class_list