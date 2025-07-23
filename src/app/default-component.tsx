"use client";

import { useState } from "react";
import { generateAppCode } from "./generator/generate-app-code";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Sandpack } from "@codesandbox/sandpack-react";
import { githubLight } from "@codesandbox/sandpack-themes";

export const DefaultComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sandpackFiles, setSandpackFiles] = useState<Record<string, { code: string; active?: boolean }>>({});
  const [entryFile, setEntryFile] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateAppCode(prompt);
    setFiles(result?.files || []);

    const transformedFiles: Record<string, { code: string; active?: boolean }> = {};

    let entrySet = false;
    (result?.files || []).forEach((file: any) => {
      const fullPath = `/${file.path}`;
      const isEntry = !entrySet && (file.path.includes("index") || file.path.includes("App"));
      transformedFiles[fullPath] = {
        code: file.content,
        ...(isEntry && { active: true }),
      };
      if (isEntry && !entrySet) {
        setEntryFile(fullPath);
        entrySet = true;
      }
    });

    if (!entrySet && result?.files?.length > 0) {
      const firstPath = `/${result.files[0].path}`;
      transformedFiles[firstPath].active = true;
      setEntryFile(firstPath);
    }

    setSandpackFiles(transformedFiles);
    setLoading(false);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    files.forEach((file: any) => {
      zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "project.zip");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans">
      {/* Sidebar */}
      <div className="md:w-1/3 bg-gray-100 p-6 overflow-auto border-r border-gray-300">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">✨ Build Beautiful Websites</h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
          placeholder="Describe your app: e.g. Build a beautiful chef portfolio website"
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold px-4 py-2 rounded-md w-full"
        >
          🚀 Generate Code
        </button>

        {files.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mt-6">📁 Generated Files</h2>
            <ul className="mt-3 text-sm max-h-60 overflow-auto bg-white border rounded-md p-2">
              {files.map((file, i) => (
                <li key={i} className="border-b py-1 text-gray-600">
                  <strong>{file.path}</strong>
                </li>
              ))}
            </ul>

            <button
              onClick={handleDownload}
              className="mt-4 bg-green-600 hover:bg-green-700 transition text-white font-semibold px-4 py-2 rounded-md w-full"
            >
              📦 Download ZIP
            </button>
          </>
        )}
      </div>

      {/* Preview Section */}
      <div className="md:w-2/3 p-6 overflow-auto bg-white relative">
        {loading && (
          <div className="flex items-center justify-center text-lg font-semibold text-gray-700 animate-pulse absolute inset-x-0 top-6">
            🔄 Generating Code…
          </div>
        )}

        {/* {!loading && files.length > 0 && ( */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">🌐 Live Preview</h2>
            <div className="border rounded-md shadow overflow-hidden">
              <Sandpack
                template="react"
                theme={githubLight}
                files={sandpackFiles}
                options={{
                  showLineNumbers: true,
                  editorHeight: 500,
                  showNavigator: true,
                  showTabs: true,
                }}
              />
            </div>
          </div>
        {/* )} */}
      </div>
    </div>
  );
};
