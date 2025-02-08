'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (feedback: number) => {
    console.log('Feedback submitted:', feedback);
    await sendToBackend(feedback);
    setFeedback('');
  };

  const sendToBackend = async (data: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/insert-student-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({class: "010215",student: 'studentName', response: data, slide: 1}),
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
          <button onClick = {() => handleSubmit(3)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">I already know this</button>
          <button onClick = {() => handleSubmit(2)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">I got it</button>
          <button onClick = {() => handleSubmit(1)} className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded">I'm a little confused</button>
          <button onClick = {() => handleSubmit(0)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">I'm lost</button>
        </div>
        <textarea
          className="mt-4 p-2 border rounded w-full"
          placeholder="Ask a question..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button className="bg-black text-white w-full mt-2 p-2 rounded" onClick={() => handleSubmit(2)}>Submit</button>
      </div>
    </div>
  );
}
