'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setFeedback('');
  };

  return (
   
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-semibold text-center mb-4">How are you feeling?</h2>
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">I already know this</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">I got it</button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded">I'm a little confused</button>
            <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">I'm lost</button>
          </div>
          <textarea
            className="mt-4 p-2 border rounded w-full"
            placeholder="Ask a question..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button className="bg-black text-white w-full mt-2 p-2 rounded" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
 
  );
}
