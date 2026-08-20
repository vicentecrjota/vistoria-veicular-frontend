"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getVistorias, deleteVistoria, type Vistoria, type VistoriaStatus } from "@/lib/api";

const STATUS_CONFIG: Record<
  VistoriaStatus,
  { label: string; color: string; bg: string }
> = {
  pendente: { label: "Pendente", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  em_analise: { label: "Em Análise", color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
  concluida: { label: "Concluída", color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
  cancelada: { label: "Cancelada", color: "#a1a1aa", bg: "rgba(113,113,122,0.12)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hrefFor(v: Vistoria) {
  return v.status === "concluida"
    ? `/vistorias/${v.id}/laudo`
    : `/vistorias/${v.id}/fotos`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Vistoria | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: vistorias.length,
      pendentes: vistorias.filter((v) => v.status === "pendente").length,
      em_analise: vistorias.filter((v) => v.status === "em_analise").length,
      concluidas_hoje: vistorias.filter(
        (v) => v.status === "concluida" && new Date(v.created_at).toDateString() === today
      ).length,
    };
  }, [vistorias]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteVistoria(toDelete.id);
      setVistorias((prev) => prev.filter((v) => v.id !== toDelete.id));
      setToDelete(null);
    } catch {
      setDeleteError("Não foi possível excluir a vistoria. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  const METRICS = [
    { label: "Total", value: stats.total, color: "#fafafa" },
    { label: "Pendentes", value: stats.pendentes, color: "#d97706" },
    { label: "Em análise", value: stats.em_analise, color: "#2563eb" },
    { label: "Concluídas hoje", value: stats.concluidas_hoje, color: "#16a34a" },
  ];

  return (
    <div
      style={{
        margin: "-2rem",
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#16181d",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa" }}>
            Vistorias
          </h1>
          <p style={{ fontSize: "14px", color: "#71717a", marginTop: "4px" }}>
            Acompanhe todas as análises da sua equipe
          </p>
        </div>
        <Link href="/vistorias/nova" className="dash-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Vistoria
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {METRICS.map((m) => (
          <div key={m.label} className="dash-card" style={{ padding: "16px" }}>
            <p style={{ fontSize: "12px", color: "#71717a", marginBottom: "6px" }}>{m.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 600, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div className="relative max-w-sm mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#52525b"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dash-input"
        />
      </div>

      {/* Tabela / estados */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "#52525b" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="dash-card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#dc2626", fontSize: "14px" }}>{error}</p>
          <button onClick={() => window.location.reload()} className="dash-btn-secondary mt-4" style={{ margin: "16px auto 0" }}>
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-card" style={{ padding: "56px 24px", textAlign: "center" }}>
          <svg
            className="mx-auto mb-3"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3f4148"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p style={{ color: "#71717a", fontSize: "14px" }}>
            {search ? "Nenhuma vistoria encontrada para essa placa." : "Nenhuma vistoria ainda"}
          </p>
          {!search && (
            <Link href="/vistorias/nova" className="dash-btn-primary mt-4" style={{ display: "inline-flex", marginTop: "16px" }}>
              Criar primeira vistoria
            </Link>
          )}
        </div>
      ) : (
        <div className="dash-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table" style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Veículo</th>
                  <th>Funcionário</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ width: "48px" }}>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const statusCfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.pendente;
                  return (
                    <tr key={v.id} onClick={() => router.push(hrefFor(v))}>
                      <td>
                        <span
                          style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontWeight: 700,
                            color: "#fafafa",
                            letterSpacing: "0.03em",
                            fontSize: "13px",
                          }}
                        >
                          {v.placa}
                        </span>
                      </td>
                      <td style={{ color: "#a1a1aa", fontSize: "14px" }}>
                        {v.modelo} · {v.ano} · {v.cor}
                      </td>
                      <td style={{ color: "#a1a1aa", fontSize: "14px" }}>
                        {v.funcionario_nome ?? "—"}
                      </td>
                      <td>
                        <span className="dash-badge" style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={{ color: "#71717a", fontSize: "13px" }}>
                        {formatDate(v.created_at)}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="row-delete-btn"
                          aria-label={`Excluir vistoria ${v.placa}`}
                          onClick={() => {
                            setDeleteError(null);
                            setToDelete(v);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m3 0-.867 12.142A2 2 0 0115.138 21H8.862a2 2 0 01-1.995-1.858L6 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {toDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 50 }}
          onClick={() => !deleting && setToDelete(null)}
        >
          <div
            className="dash-card w-full max-w-sm"
            style={{ padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fafafa" }}>
              Excluir vistoria {toDelete.placa}?
            </h2>
            <p style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "8px" }}>
              Esta ação não pode ser desfeita.
            </p>
            {deleteError && (
              <p style={{ fontSize: "13px", color: "#dc2626", marginTop: "12px" }}>{deleteError}</p>
            )}
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                className="dash-btn-secondary"
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="dash-btn-primary"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
