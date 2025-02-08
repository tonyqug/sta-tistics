'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Link from 'next/link';
import { useClass } from '../context/classContext';

// Set the workerSrc to the path of the pdf.worker.min.js file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfViewer() {
  const {ClassCode, setClassCode} = useClass();
  const [pdfData, setPdfData] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [code, setCode] = useState("");
  const [prevCode, setPrevCode] = useState("");
  const [numPages, setNumPages] = useState(1);
  const canvasRef = useRef(null);
  const renderTaskRef: any = useRef(null);
  const [fullScreen, setFullScreen] = useState(0);

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) { return }

    const arrayBuffer = await file.arrayBuffer();
    const saveBuffer = arrayBuffer.slice(0)

    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    console.log(saveBuffer)
    setPdfData(pdf);
    renderPage(pageNumber, pdf);
    setNumPages(pdf.numPages);

    let newCode = ""
    for(let i = 0; i < 5; i++) {
      newCode += Math.floor(Math.random() * 10)
    }

    setCode(newCode)

    const blob = new Blob([saveBuffer], { type: file.type });
    const reader: any = new FileReader();

    reader.onloadend = async function () {
        if (!reader || !reader.result) return
        const base64String = reader.result.split(",")[1]; // Remove data URL prefix

        // Send Base64 string to the backend
        const response = await  fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/upload-presentation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"classCode": newCode, "data":base64String}),
        })

        const result = await response.json();
        console.log(result);
    };
    
    reader.readAsDataURL(blob); // Convert Blob to Base64

  };

  useEffect(()=> {
    if (prevCode) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/delete-class-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({class: prevCode}),
      }).catch(error=>{})
    }
    
    setPrevCode(code)
    if(code) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/insert-class-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"class": code, "slide":1}),
      })
      setClassCode(code)
    }
  }, [code])



  async function updatePageNumber(newPageNumber: number, controller: AbortController) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/update-class-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classCode: code, slide: newPageNumber }),
        signal: controller.signal, // Attach the signal to the fetch request
      });
  
      if (!response.ok) {
        console.error("Failed to update page number");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch request aborted due to new page number update.");
      } else {
        console.error("Fetch error:", error);
      }
    }
  }
  
  useEffect(() => {
    const controller = new AbortController(); // Create an abort controller
  
    updatePageNumber(pageNumber, controller);
  
    return () => {
      controller.abort(); // Cancel the previous request when pageNumber changes
    };
  }, [pageNumber]);
  
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'ArrowLeft') {
        setPageNumber((prev: any) => Math.max(prev - 1, 1));
      } else if (event.key === 'ArrowRight') {
        setPageNumber((prev: any) => Math.min(prev + 1, numPages));
      } else if (event.key === 'Enter') {
        setFullScreen((prev: any) => 1 - prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  const renderPage = (num: any, pdf: any) => {
    pdf.getPage(num).then((page: any) => {
      const viewport = page.getViewport({ scale: 1 });
      const canvas: any = canvasRef.current;
      if (canvas){
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        renderTaskRef.current = page.render(renderContext);
      }
      
    });
  };

  useEffect(() => {
    if (pdfData) {
      renderPage(pageNumber, pdfData);
    }
  }, [pageNumber, pdfData]);

  console.log(fullScreen)

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 rounded-lg w-full items-center flex flex-col justify-center">
      {fullScreen==0 &&
      <div className="translate-y-[100px] flex flex-row z-10">    
          <label htmlFor="file-upload" className="block w-[400px] shadow-lg whitespace-nowrap font-medium text-[20pt] text-gray-700 cursor-pointer bg-green-200 w-full p-2 rounded-lg text-center">
              {pdfData ? `Class Code: ${code}`:"Upload Lecture PDF"}
          </label>
          <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
          />
          <Link 
            href="/analytics"
            className=" whitespace-nowrap flex flex-row items-center px-3 ml-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200"
          >
            View Analytics
          </Link>
        </div>
        }



        {pdfData && (
          <div className={(fullScreen==0?"relative":" absolute w-screen h-screen top-0 left-0 flex items-center justify-center bg-black/75")}>

            <canvas ref={canvasRef} className={ "max-w-full border rounded-md " + (fullScreen==0?"h-[90%]":"h-[98%]")}></canvas>
            {/* <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 transition duration-200"
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              >
                &#8592; Previous
              </button>
              <span className="text-xl font-semibold text-gray-800">Slide {pageNumber}</span>
              <button
                className="px-4 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 transition duration-200"
                onClick={() => setPageNumber((prev) => prev + 1)}
              >
                Next &#8594;
              </button>
            </div> */}
          </div>
        )}
      </div>
      {pdfData && <input className="absolute right-5 bottom-5 opacity-25 hover:opacity-100 hover:scale-125 transition-all" type="checkbox" value={fullScreen} onChange={()=>setFullScreen( 1-fullScreen)} />}
    </div>
  );
}
