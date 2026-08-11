"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getVistoria, getLaudo, type VistoriaDetalhada, type Laudo } from "@/lib/api";
import Header from "@/components/layout/Header";
import LaudoView from "@/components/vistorias/LaudoView";

type Props = { params: Promise<{ id: string }> };

export default function LaudoPage({ params }: Props) {
  const { id } = use(params);
  const [vistoria, setVistoria] = useState<VistoriaDetalhada | null>(null);
  const [laudo, setLaudo] = useState<Laudo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getVistoria(id), getLaudo(id)])
      .then(([v, l]) => {
        setVistoria(v);
        setLaudo(l);
      })
      .catch(() => setError("Erro ao carregar o laudo."))
      .finally(() => setLoading(false));
  }, [id]);

  function handleExportPDF() {
    window.print();
  }

  if (loading) {
    return (
      <>
        <Header title="Laudo da Vistoria" />
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </>
    );
  }

  if (error || !vistoria || !laudo) {
    return (
      <>
        <Header title="Laudo da Vistoria" />
        <div className="card p-8 text-center max-w-md">
          <p className="text-red-500 mb-4">{error ?? "Laudo não disponível."}</p>
          <Link href="/dashboard" className="btn-secondary">
            Voltar ao dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Laudo da Vistoria"
        actions={
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-secondary">
              ← Dashboard
            </Link>
            <button onClick={handleExportPDF} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </button>
          </div>
        }
      />

      <LaudoView vistoria={vistoria} laudo={laudo} />
    </>
  );
}
