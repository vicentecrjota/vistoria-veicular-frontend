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
        style={{
          borderRadius: "8px",
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
          border: `1px dashed ${isDragActive ? "#dc2626" : "#2d323b"}`,
          backgroundColor: isDragActive ? "rgba(220,38,38,0.05)" : "#1a1d24",
        }}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto mb-3"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {isDragActive ? (
          <p style={{ color: "#dc2626", fontWeight: 500, fontSize: "14px" }}>
            Solte as fotos aqui
          </p>
        ) : (
          <>
            <p style={{ color: "#fafafa", fontWeight: 500, fontSize: "14px" }}>
              Arraste as fotos aqui
            </p>
            <p style={{ color: "#71717a", fontSize: "13px", marginTop: "4px" }}>
              ou{" "}
              <span style={{ color: "#dc2626", textDecoration: "underline" }}>
                clique para selecionar
              </span>
            </p>
            <p style={{ color: "#52525b", fontSize: "12px", marginTop: "10px" }}>
              Selecione várias de uma vez · JPG, PNG, WEBP · máx 10MB cada
            </p>
          </>
        )}
      </div>

      {/* Rejection errors */}
      {fileRejections.length > 0 && (
        <div className="mt-2">
          {fileRejections.map(({ file, errors: errs }) => (
            <p key={file.name} style={{ color: "#dc2626", fontSize: "12px" }}>
              {file.name}: {errs.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#a1a1aa" }}>
              {files.length} foto{files.length > 1 ? "s" : ""} selecionada
              {files.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={clearAll}
              style={{
                fontSize: "12px",
                color: "#71717a",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
            >
              Remover todas
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {files.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative group aspect-square overflow-hidden"
                  style={{ borderRadius: "6px", border: "1px solid #24272e" }}
                >
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
                    aria-label={`Remover ${file.name}`}
                    className="absolute top-1.5 right-1.5 flex items-center justify-center transition-colors"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(22,24,29,0.85)",
                      border: "1px solid #24272e",
                      color: "#fafafa",
                      fontSize: "12px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
