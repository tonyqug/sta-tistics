'use client';

import { useState } from 'react';
import {useClass} from '../context/classContext'
import { ClipLoader } from 'react-spinners'; // Import the spinner component

export default function FeedbackForm() {
  const {ClassCode, setClassCode} = useClass();
  const [feedback, setFeedback] = useState('');
  const [response, setResponse] = useState('')
  const [questionCooldown, setQuestionCooldown] = useState(0);
  const [isCooldown, setIsCooldown] = useState(0); // Track cooldown status

  const handleSubmit = async (feedback: number) => {
    if (isCooldown) return; // Prevent action if in cooldown
    setIsCooldown(1);
    let timer = 1
    const int = setInterval(() => {
      timer += 1
      if (timer == 16) {
        clearInterval(int)
        setIsCooldown(0)
        return
      }
      setIsCooldown(timer)
    }, 1000)  
    console.log('Feedback submitted:', feedback);
    await sendToBackend(feedback);
    
  };
  const handleQuestionSubmit = async (question:string) => {
    if (question == "" || questionCooldown) return
    try {
      setFeedback("")
      setQuestionCooldown(1);
      let timer = 1
      const int = setInterval(() => {
        timer += 1
        if (timer == 16) {
          clearInterval(int)
          setQuestionCooldown(0)
          return
        }
        setQuestionCooldown(timer)
      }, 1000)  
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/insert-student-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({class: ClassCode, question: question}),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setResponse(result)
      
      console.log('Response from Flask:', result);
    } catch (error) {
      console.error('Failed to send data to backend:', error);
    }
  };

  const sendToBackend = async (data: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/insert-student-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({class: ClassCode,student: 'studentName', response: data, slide: 1}),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Response from Flask:', result);
    } catch (error) {
      console.error('Failed to send data to backend:', error);
    }
  };

  return (
    <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-white">
      <h2 className="text-2xl font-semibold text-center mb-4">How are you feeling?</h2>
      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button onClick = {() => handleSubmit(3)} disabled = {isCooldown> 0} className="disabled:text-gray-400 disabled:bg-green-700 bg-green-500 hover:bg-green-600 text-white p-2 rounded">
          {isCooldown ? (
              <div className = "flex flex-row items-center justify-center gap-2">
                <ClipLoader size={20} color="#ffffff" />
                <span>{isCooldown}</span>
                </div>
            ) : (
            `I already know this`)}</button>
          <button onClick = {() => handleSubmit(2)} disabled = {isCooldown > 0} className="disabled:text-gray-400 disabled:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          {isCooldown ? (
              <div className = "flex flex-row items-center justify-center gap-2">
              <ClipLoader size={20} color="#ffffff" />
              <span>{isCooldown}</span>
              </div>
            ) : (`I got it`)}</button>
          <button onClick = {() => handleSubmit(1)} disabled = {isCooldown > 0} className="disabled:text-gray-400 disabled:bg-yellow-700 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded">
          {isCooldown ? (
              <div className = "flex flex-row items-center justify-center gap-2">
              <ClipLoader size={20} color="#ffffff" />
              <span>{isCooldown}</span>
              </div>
            ) : (`I'm a little confused`)}</button>
          <button onClick = {() => handleSubmit(0)} disabled = {isCooldown > 0} className="disabled:text-gray-400 disabled:bg-red-700 bg-red-500 hover:bg-red-600 text-white p-2 rounded">
          {isCooldown ? (
              <div className = "flex flex-row items-center justify-center gap-2">
              <ClipLoader size={20} color="#ffffff" />
              <span>{isCooldown}</span>
              </div>
            ) : (`I'm lost`)}</button>
        </div>
        {response.length > 0 &&
        <div className = "w-full bg-gray-50">
          <span className = "text-green-600">AI Response: </span>{response}
          <br/>
          <span className = "italic text-[10pt] text-gray-400">AI is here to answer any questions, not to have conversations!</span>
        </div>}
        <textarea
          className="mt-4 p-2 border rounded w-full"
          placeholder="Ask a question..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button className="bg-black text-white w-full mt-2 p-2 rounded disabled:text-gray-400" disabled = {questionCooldown > 0}  onClick={() => handleQuestionSubmit(feedback)}>
        {questionCooldown ? (
              <div className = "flex flex-row items-center justify-center gap-2">
              <ClipLoader size={20} color="#ffffff" />
              <span>{questionCooldown}</span>
              </div>
            ) : (`Submit`)}
          </button>
      </div>
    </div>
  );
}
