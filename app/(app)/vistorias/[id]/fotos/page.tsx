"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadFotos, analisarVistoria, getVistoria, type VistoriaDetalhada } from "@/lib/api";
import UploadZone from "@/components/vistorias/UploadZone";

type Props = { params: Promise<{ id: string }> };

type Step = "upload" | "analyzing" | "done";

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const ANALYSIS_STEPS = [
  "Preparando imagens...",
  "Identificando estrutura do veículo...",
  "Analisando lataria e pintura...",
  "Verificando vidros e faróis...",
  "Identificando danos...",
  "Gerando laudo completo...",
];

export default function FotosPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [vistoria, setVistoria] = useState<VistoriaDetalhada | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<Step>("upload");
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVistoria(id)
      .then(setVistoria)
      .catch(() => {
        /* chip de veículo é apenas informativo — upload segue mesmo sem esses dados */
      });
  }, [id]);

  async function handleAnalisar() {
    if (files.length === 0) {
      setError("Adicione pelo menos uma foto antes de analisar.");
      return;
    }
    setError(null);
    setStep("analyzing");

    // Simulate step progression while waiting
    let idx = 0;
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, ANALYSIS_STEPS.length - 1);
      setStepIdx(idx);
    }, 2200);

    try {
      await uploadFotos(id, files);
      await analisarVistoria(id);

      // Poll until status is concluida or cancelada
      let attempts = 0;
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 3000));
        const v = await getVistoria(id);
        if (v.status === "concluida" || v.status === "cancelada") break;
        attempts++;
      }

      clearInterval(interval);
      setStep("done");
      setTimeout(() => router.push(`/vistorias/${id}/laudo`), 800);
    } catch {
      clearInterval(interval);
      setStep("upload");
      setError("Erro ao processar análise. Tente novamente.");
    }
  }

  if (step === "analyzing" || step === "done") {
    return (
      <div
        style={{
          margin: "-2rem",
          padding: "2rem",
          minHeight: "100vh",
          backgroundColor: "#16181d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            backgroundColor: "#1c1f26",
            border: "1px solid #24272e",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          {step === "done" ? (
            <>
              <div
                className="mx-auto mb-4 flex items-center justify-center"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(22,163,74,0.12)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ color: "#fafafa", fontWeight: 500, fontSize: "15px" }}>Análise concluída!</p>
              <p style={{ color: "#71717a", fontSize: "13px", marginTop: "4px" }}>
                Redirecionando para o laudo...
              </p>
            </>
          ) : (
            <>
              <div className="relative mx-auto mb-6" style={{ width: "72px", height: "72px" }}>
                <svg
                  className="animate-spin absolute inset-0"
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "#24272e" }}
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
                <svg
                  className="animate-spin absolute inset-0"
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "#dc2626", animationDuration: "1.2s" }}
                >
                  <path strokeLinecap="round" strokeWidth="2" stroke="currentColor" d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>

              <p style={{ color: "#fafafa", fontWeight: 500, fontSize: "15px", marginBottom: "6px" }}>
                IA analisando veículo
              </p>
              <p style={{ color: "#71717a", fontSize: "13px", marginBottom: "20px" }}>
                {ANALYSIS_STEPS[stepIdx]}
              </p>

              {/* Progress bar */}
              <div style={{ width: "100%", backgroundColor: "#24272e", borderRadius: "9999px", height: "6px" }}>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: "#dc2626",
                    transition: "width 1s ease",
                    width: `${((stepIdx + 1) / ANALYSIS_STEPS.length) * 100}%`,
                  }}
                />
              </div>
              <p style={{ color: "#52525b", fontSize: "11px", marginTop: "8px" }}>
                {stepIdx + 1} / {ANALYSIS_STEPS.length}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "-2rem",
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#16181d",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6" style={{ fontSize: "13px" }}>
        <Link href="/dashboard" className="text-[#71717a] hover:text-[#fafafa] transition-colors">
          Dashboard
        </Link>
        <span style={{ color: "#52525b" }}>&gt;</span>
        <Link href="/vistorias/nova" className="text-[#71717a] hover:text-[#fafafa] transition-colors">
          Nova Vistoria
        </Link>
        <span style={{ color: "#52525b" }}>&gt;</span>
        <span style={{ color: "#a1a1aa", fontWeight: 500 }}>Fotos</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa" }}>
          Upload de Fotos
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", marginTop: "4px" }}>
          Adicione todas as fotos do veículo recebidas do cliente
        </p>
      </div>

      {/* Chip do veículo */}
      {vistoria && (
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-3"
            style={{
              backgroundColor: "#1c1f26",
              border: "1px solid #24272e",
              borderRadius: "8px",
              padding: "10px 16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14M6 17l1.5-5.5A2 2 0 019.4 10h5.2a2 2 0 011.9 1.5L18 17M6 17a2 2 0 104 0m8 0a2 2 0 11-4 0" />
            </svg>
            <span
              style={{
                fontFamily: MONO_FONT,
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: "0.03em",
                fontSize: "14px",
              }}
            >
              {vistoria.placa}
            </span>
            <span style={{ width: "1px", height: "16px", backgroundColor: "#24272e" }} />
            <span style={{ color: "#a1a1aa", fontSize: "13px" }}>
              {vistoria.modelo} · {vistoria.ano} · {vistoria.cor}
            </span>
          </div>
        </div>
      )}

      {/* Card de upload */}
      <div
        style={{
          maxWidth: "720px",
          backgroundColor: "#1c1f26",
          border: "1px solid #24272e",
          borderRadius: "12px",
        }}
      >
        <div style={{ padding: "32px" }}>
          <UploadZone files={files} onChange={setFiles} />

          {error && (
            <div
              className="mt-4"
              style={{
                borderRadius: "6px",
                padding: "10px 12px",
                backgroundColor: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div
          className="flex flex-wrap items-center justify-end gap-3"
          style={{ borderTop: "1px solid #24272e", padding: "20px 32px" }}
        >
          <Link href="/dashboard" className="nova-btn-cancel">
            Voltar
          </Link>
          <button
            type="button"
            onClick={handleAnalisar}
            disabled={files.length === 0}
            className="dash-btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Iniciar Análise IA
          </button>
        </div>
      </div>
    </div>
  );
}
