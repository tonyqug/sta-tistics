'use client';

import { useState } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

export default function DocumentViewer() {
  const [docs, setDocs] = useState<any>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer) {
          const blob = new Blob([arrayBuffer]);
          const url = URL.createObjectURL(blob);
          setDocs([{ uri: url, fileType: file.type }]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".pptx" onChange={handleFileChange} />
      {docs.length > 0 && (
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
        />
      )}
    </div>
  );
}
