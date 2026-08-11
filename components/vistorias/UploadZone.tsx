"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = { "image/jpeg": [], "image/png": [], "image/webp": [] };

export default function UploadZone({ files, onChange }: UploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange([...files, ...accepted]);
    },
    [files, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
      multiple: true,
    });

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className={`w-10 h-10 mx-auto mb-3 ${
            isDragActive ? "text-blue-400" : "text-slate-300"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {isDragActive ? (
          <p className="text-blue-500 font-medium">Solte as fotos aqui</p>
        ) : (
          <>
            <p className="text-slate-600 font-medium">
              Arraste e solte as fotos aqui
            </p>
            <p className="text-slate-400 text-sm mt-1">
              ou <span className="text-blue-500 underline">clique para selecionar</span>
            </p>
          </>
        )}
      </div>

      {/* Rejection errors */}
      {fileRejections.length > 0 && (
        <div className="mt-2">
          {fileRejections.map(({ file, errors: errs }) => (
            <p key={file.name} className="text-red-500 text-xs">
              {file.name}: {errs.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">
              {files.length} foto{files.length > 1 ? "s" : ""} selecionada{files.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Remover todas
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {files.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{file.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
