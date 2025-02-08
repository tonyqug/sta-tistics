'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set the workerSrc to the path of the pdf.worker.min.js file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfViewer() {
  const [pdfData, setPdfData] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [code, setCode] = useState("");
  const canvasRef = useRef(null);

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setPdfData(pdf);
      renderPage(pageNumber, pdf);
    }
  };

  const renderPage = (num: any, pdf: any) => {
    pdf.getPage(num).then((page: any) => {
      const viewport = page.getViewport({ scale: 1 });
      const canvas: any = canvasRef.current;
      if (canvas){
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        page.render(renderContext);
      }
      
    });
  };

  useEffect(() => {
    if (pdfData) {
      renderPage(pageNumber, pdfData);
    }
  }, [pageNumber, pdfData]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 rounded-lg w-full items-center flex flex-col justify-center">
      <div className="mb-4">
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
   
        </div>


        {pdfData && (
          <div className="relative">
            <canvas ref={canvasRef} className="h-full max-w-full border rounded-md"></canvas>
            <div className="flex justify-between items-center mt-4">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
