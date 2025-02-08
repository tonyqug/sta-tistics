'use client';

import { useState } from 'react';
import FeedbackForm from './feedbackForm'

export default function Student() {
  const [code, setCode] = useState("");
  const [validCodes, setValidCodes] = useState(["12345"])
  return (
    <div className = "flex flex-row items-center w-full">
        {!(validCodes.includes(code)) ? 
   
        <div className = "flex w-full flex-col items-center justify-center min-h-screen">
       
        <div className="w-full text-center text-[30pt] text-gray-700 font-medium">Enter the class code:</div>
          <textarea
            className="text-green-500 bg-transparent text-center text-lg outline-none w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code..."
          />
      </div>
   :
      <div className = "flex w-full flex-col items-center justify-center min-h-screen">
        <div>
            Connected to code: <span className = "text-green-500">{code}</span>
        </div>
        <FeedbackForm/>
      </div>}
    </div>
  );
}
