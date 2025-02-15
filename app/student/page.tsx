'use client';

import { useState } from 'react';
import FeedbackForm from './feedbackForm'
import {useClass} from '../context/classContext'

export default function Student() {
  const {ClassCode, setClassCode} = useClass();
  const [code, setCode] = useState("");
  const [validCodes, setValidCodes] = useState<any>([])
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex flex-row items-center w-full">
        {!isValidated ? 
        <div className="flex w-full flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
          <div className="w-96 p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100">
            <h2 className="text-3xl font-medium text-green-800 mb-6 text-center">Enter Class Code</h2>
            <input
              type="text"
              className="w-full px-4 py-3 text-center text-xl bg-white/70 rounded-lg outline-none border border-green-200 focus:border-green-400 transition-colors"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(""); // Clear error when typing
              }}
              placeholder="Enter 5-digit code"
              maxLength={5}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  const response2 = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/fetch-all-classes`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                  })
                  const json = await response2.json()
                  console.log(json)
                  setValidCodes(json)
                  if (code.length !== 5) {
                    setError("Please enter a 5-digit code");
                  } else if (!json.includes(code)) {
                    setError("Invalid code. Please try again.");
                  } else {
                    setClassCode(code);
                    setIsValidated(true);
                  }
                }
              }}
            />
            {error && (
              <div className="mt-3 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div className="mt-4 text-green-600/50 text-sm text-center">
              Press Enter to submit
            </div>
          </div>
        </div>
        :
        <div className = "flex w-full flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
          <div className = "bg-gray-50 py-2 px-4 rounded-t-lg">
              Connected to code: <span className = "text-green-500">{code}</span>
          </div>
          <FeedbackForm/>
        </div>}
    </div>
  );
}
