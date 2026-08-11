"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getVistorias, type Vistoria } from "@/lib/api";
import Header from "@/components/layout/Header";
import VistoriaCard from "@/components/vistorias/VistoriaCard";

export default function DashboardPage() {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVistorias()
      .then(setVistorias)
      .catch(() => setError("Erro ao carregar vistorias."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return vistorias;
    const q = search.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return vistorias.filter((v) =>
      v.placa.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(q)
    );
  }, [vistorias, search]);

  const stats = useMemo(() => ({
    total: vistorias.length,
    concluidas: vistorias.filter((v) => v.status === "concluida").length,
    em_analise: vistorias.filter((v) => v.status === "em_analise").length,
    pendentes: vistorias.filter((v) => v.status === "pendente").length,
  }), [vistorias]);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Histórico de vistorias"
        actions={
          <Link href="/vistorias/nova" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Vistoria
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-slate-700" },
          { label: "Pendentes", value: stats.pendentes, color: "text-amber-600" },
          { label: "Em Análise", value: stats.em_analise, color: "text-blue-600" },
          { label: "Concluídas", value: stats.concluidas, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary mt-3">
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-500 text-sm">
            {search ? "Nenhuma vistoria encontrada para essa placa." : "Nenhuma vistoria cadastrada."}
          </p>
          {!search && (
            <Link href="/vistorias/nova" className="btn-primary mt-4 inline-flex">
              Criar primeira vistoria
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((v) => (
            <VistoriaCard key={v.id} vistoria={v} />
          ))}
        </div>
      )}
    </>
  );
}
