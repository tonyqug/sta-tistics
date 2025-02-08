'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set the workerSrc to the path of the pdf.worker.min.js file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfViewer() {
  const [pdfData, setPdfData] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
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
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {pdfData && (
        <div>
          <canvas ref={canvasRef}></canvas>
          <div>
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>Page {pageNumber}</span>
            <button
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
