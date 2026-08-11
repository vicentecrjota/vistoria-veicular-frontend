"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadFotos, analisarVistoria, getVistoria } from "@/lib/api";
import Header from "@/components/layout/Header";
import UploadZone from "@/components/vistorias/UploadZone";

type Props = { params: Promise<{ id: string }> };

type Step = "upload" | "analyzing" | "done";

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
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<Step>("upload");
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        const vistoria = await getVistoria(id);
        if (vistoria.status === "concluida" || vistoria.status === "cancelada") break;
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
      <>
        <Header title="Análise em Progresso" />
        <div className="max-w-lg mx-auto mt-12 text-center">
          <div className="card p-10">
            {step === "done" ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-700 font-medium">Análise concluída!</p>
                <p className="text-sm text-slate-500 mt-1">Redirecionando para o laudo...</p>
              </>
            ) : (
              <>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <svg className="animate-spin w-20 h-20 text-blue-100" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <svg
                    className="animate-spin w-20 h-20 text-blue-500 absolute inset-0"
                    style={{ animationDuration: "1.2s" }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M12 2a10 10 0 0 1 10 10"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8" style={{ color: "var(--color-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>

                <p className="text-slate-700 font-medium text-lg mb-2">IA analisando veículo</p>
                <p className="text-slate-500 text-sm mb-6">{ANALYSIS_STEPS[stepIdx]}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-1000"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      width: `${((stepIdx + 1) / ANALYSIS_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {stepIdx + 1} / {ANALYSIS_STEPS.length}
                </p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Upload de Fotos"
        subtitle="Adicione todas as fotos do veículo"
        actions={
          <Link href="/dashboard" className="btn-secondary">
            Cancelar
          </Link>
        }
      />

      <div className="max-w-2xl">
        <div className="card p-6">
          <UploadZone files={files} onChange={setFiles} />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {files.length === 0
                ? "Nenhuma foto adicionada"
                : `${files.length} foto${files.length > 1 ? "s" : ""} selecionada${files.length > 1 ? "s" : ""}`}
            </p>
            <button
              onClick={handleAnalisar}
              disabled={files.length === 0}
              className="btn-primary px-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Iniciar Análise IA
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          Formatos aceitos: JPG, PNG, WEBP · Máx. 10MB por foto
        </p>
      </div>
    </>
  );
}
