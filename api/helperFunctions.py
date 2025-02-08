from supabase import create_client
import os
import google.generativeai as genai
from dotenv import load_dotenv
import fitz
import io
from PIL import Image
import base64

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

genai.configure(api_key=os.getenv("GEMINI_KEY"))
genaimodel = genai.GenerativeModel('gemini-1.5-flash')



client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def generate_response(question, classCode, slideNumber):
    # Fetch class data
    

    # Fetch the PDF file from Supabase storage
    response = client.storage.from_("presentations").download(f"{classCode}.pdf")
    if response is None:
        return "Error: File not found."
    
    # Open the PDF using PyMuPDF
    pdf_document = fitz.open(stream=response, filetype="pdf")  # Load the PDF from bytes
    
    # Ensure the slide number is within range
    if slideNumber < 1 or slideNumber > pdf_document.page_count:
        return "Error: Slide number out of range."
    
    # Extract the current slide
    current_slide_page = pdf_document.load_page(slideNumber - 1)  # PyMuPDF pages are 0-indexed
    current_slide_pix = current_slide_page.get_pixmap()  # Get the slide as a pixmap (image)

    # Extract the previous slide (if exists)
    previous_slide_pix = None
    if slideNumber > 1:
        previous_slide_page = pdf_document.load_page(slideNumber - 2)
        previous_slide_pix = previous_slide_page.get_pixmap()
    
    # Convert current slide to bytes (PNG format)
    current_slide_bytes = io.BytesIO()
    current_slide_bytes.write(current_slide_pix.tobytes("png"))
    current_slide_bytes.seek(0)  # Rewind the BytesIO object to the beginning
    current_slide_image = Image.open(current_slide_bytes)
    # Convert previous slide to bytes (PNG format) if it exists
    previous_slide_image = None
    if previous_slide_pix:
        previous_slide_bytes = io.BytesIO()
        previous_slide_bytes.write(previous_slide_pix.tobytes("png"))
        previous_slide_bytes.seek(0)  # Rewind the BytesIO object to the beginning
        previous_slide_image = Image.open(previous_slide_bytes)
  
    
    # Pass slides through Google Generative AI model
    contents = [
        f"You are an expert in academia teaching a lecture with slides. Linked is the current slide, then the previous slide (if it exists). Answer the student's question, if it is legitimate. Don't try to answer things that you don't know very well, don't format your answer, don't have a conversation, and try to be concise. Question: `{question}`",
         current_slide_image,
        previous_slide_image if previous_slide_image else None
    ]
    contents = [content for content in contents if content is not None]  # Remove None values
    
    response = genaimodel.generate_content(contents)
    
    return response.text

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


def fetchSegmentedQuestions(classCode):
  
    # Fetch questions for the specified class
    response = client.table("your_table_name").select("slide, question").eq("class", classCode).execute()

    # Initialize a dictionary to hold questions grouped by slide
    questions_by_slide = {}

    # Iterate through the fetched rows
    for row in response.data:
        slide_number = row["slide"]
        question = row["question"]

        # Append the question to the corresponding slide number
        if slide_number not in questions_by_slide:
            questions_by_slide[slide_number] = []
        questions_by_slide[slide_number].append(question)

    return questions_by_slide