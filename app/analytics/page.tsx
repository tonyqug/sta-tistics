'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Carousel } from "flowbite-react";
import Link from 'next/link';
import { useClass } from '../context/classContext';

const customTheme: any = {
  "root": {
    "base": "relative h-full w-full",
    "leftControl": "absolute left-0 top-0 flex h-full items-center justify-center px-4 focus:outline-none",
    "rightControl": "absolute right-0 top-0 flex h-full items-center justify-center px-4 focus:outline-none"
  },
  "indicators": {
    "active": {
      "off": "bg-black/50 hover:bg-black dark:bg-gray-800/50 dark:hover:bg-gray-800",
      "on": "bg-black dark:bg-gray-800"
    },
    "base": "h-3 w-3 rounded-full",
    "wrapper": "absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-3"
  },
  "item": {
    "base": "absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2",
    "wrapper": {
      "off": "w-full flex-shrink-0 transform cursor-default snap-center",
      "on": "w-full flex-shrink-0 transform cursor-grab snap-center"
    }
  },
  "control": {
    "base": "inline-flex h-8 w-8 items-center justify-center rounded-full group-hover:bg-black/20 sm:h-10 sm:w-10",
    "icon": "h-5 w-5 text-gray-800 sm:h-6 sm:w-6"
  },
  "scrollContainer": {
    "base": "flex h-full snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth rounded-lg",
    "snap": "snap-x"
  }
};

export default function AnalyticsPage() {
  const {ClassCode, setClassCode} = useClass();
  const [responseData, setResponseData] = useState({});

  const grabData = async ()=> {
    let dataset : {[id: string] : {[id : string] : any}}= {}
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/fetch-student-feedback`, {
        method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({class: ClassCode}),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Response from Flask:', result);

      const key : {[id:number]:string}= {0:"Lost", 1:"Behind", 2:"Following", 3:"Easy"}
      result.forEach((elem:any) => {
        let num : number = elem.slide
        let level : number = elem.response
        
        dataset[`Slide ${num}`] = dataset[`Slide ${num}`] || {"Lost":0, "Behind":0, "Following":0, "Easy":0, "Questions": [], "QuestionCount": 0}

        dataset[`Slide ${num}`][key[level]] += 1
      });

      setResponseData(dataset)
      
      const response2 = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/fetch-student-questions`, {
        method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({class: ClassCode}),
      })

      if (!response2.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result2 = await response2.json()
      console.log("Resulting information")
      console.log(result2)

      result2.forEach((elem:any) => {
        let num : number = elem.slide
        let question : string = elem.question
        let response : string = elem.response
        
        dataset[`Slide ${num}`] = dataset[`Slide ${num}`] || {"Lost":0, "Behind":0, "Following":0, "Easy":0, "Questions": [], "QuestionCount": 0}

        dataset[`Slide ${num}`]["QuestionCount"] += 1
        dataset[`Slide ${num}`]["Questions"].push({"question":question, "response":response})
      });

    } catch (error) {
      console.error('Failed to send data to backend:', error);
    }
  }
  useEffect(()=>{grabData()}, [ClassCode])
  //grabData()

  const questions = [{question:"How do you do this?", answer:"Like this"}, {question:"What is the meaning of that word?", answer:"It means what it means"}, {question:"How do you do that?", answer:"Exactly how you saw your teacher do it"}, {question:"What kind of software was used to make this tool?", answer:"Nothing, basically"}]
  const data : any = [];

  Object.entries(responseData).forEach(([key, value] : [any, any])=>{
    value["name"] = key
    data.push(value)
  })

  console.log(data)
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-green-50 to-green-100">
      {data ?

      <Carousel className='flex flex-col bg-white px-10 py-5 rounded-2xl h-[500px] w-[800px]' slide={false} theme={customTheme}>
        <div data-carousel-item>
          <h1 className="text-center text-2xl">Reactions by Slide</h1>
          <LineChart width={700} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="Easy" stroke="#00FF00" />
            <Line type="monotone" dataKey="Following" stroke="#0000FF" />
            <Line type="monotone" dataKey="Behind" stroke="#fbff26" />
            <Line type="monotone" dataKey="Lost" stroke="#FF0000" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </div>
        <div data-carousel-item>
          <h1 className="text-center text-2xl">Question Count by Slide</h1>
          <LineChart width={700} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="QuestionCount" stroke="#00FF00" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </div>
        { data.map((slide:any)=>
        <div key={slide.name}>
          <h1 className="text-center text-2xl">Questions from {slide.name}</h1>
          <div className="overflow-y-scroll h-[300px]">
            {slide.Questions.map((e:any,i:any)=>
            <div key={i} className='px-16 py-5 text-lg'>
              <p>{e.question}</p>
              <p className="text-black/50">Answer: {e.response}</p>
            </div>
            )}
          </div>
        </div>
        )}
      </Carousel>
      :
      <h1>
        No data yet
      </h1>
      }
      <Link href="/teacher" className="group px-16 py-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-green-100 my-[20px]">
        Start Another Class
      </Link>
    </div>
  );
}