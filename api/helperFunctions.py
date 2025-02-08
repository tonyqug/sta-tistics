from supabase import create_client
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

genai.configure(api_key=os.getenv("GEMINI_KEY"))
genaimodel = genai.GenerativeModel('gemini-1.5-flash')


client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def insertStudentFeedback(data):
    return client.from_("student_feedback").insert(data).execute()

def insertStudentQuestions(data):
    return client.from_("student_questions").insert(data).execute()

def insertClassData(data):
    return client.from_("class_data").insert(data).execute()

def uploadPresentation(data):
    return client.storage.from_("presentations").upload(data["name"], data["data"])

def updateClassData(classCode, slide):
    return (    
        client
        .table("class_data")  # Replace with your actual table name
        .update({"slide": slide})
        .eq("classCode", classCode)
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
    return client.table("class_data").select("*").eq("class", classId).execute()[0]
