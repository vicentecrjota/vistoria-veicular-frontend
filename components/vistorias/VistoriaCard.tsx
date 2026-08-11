import Link from "next/link";
import { type Vistoria, type VistoriaStatus } from "@/lib/api";

const STATUS_CONFIG: Record<
  VistoriaStatus,
  { label: string; bg: string; text: string }
> = {
  pendente: { label: "Pendente", bg: "bg-amber-50", text: "text-amber-700" },
  em_analise: { label: "Em Análise", bg: "bg-blue-50", text: "text-blue-700" },
  concluida: { label: "Concluída", bg: "bg-green-50", text: "text-green-700" },
  cancelada: { label: "Cancelada", bg: "bg-red-50", text: "text-red-600" },
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

export default function VistoriaCard({ vistoria }: { vistoria: Vistoria }) {
  const statusCfg = STATUS_CONFIG[vistoria.status] ?? STATUS_CONFIG.pendente;

  const href =
    vistoria.status === "concluida"
      ? `/vistorias/${vistoria.id}/laudo`
      : vistoria.status === "pendente"
      ? `/vistorias/${vistoria.id}/fotos`
      : `/vistorias/${vistoria.id}/laudo`;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-5 py-4">
        {/* Left: placa + details */}
        <div className="flex items-center gap-5">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {vistoria.placa.slice(0, 3)}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-800 text-sm tracking-wider">
                {vistoria.placa}
              </span>
              <span className={`badge ${statusCfg.bg} ${statusCfg.text}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {vistoria.modelo} · {vistoria.ano} · {vistoria.cor}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {vistoria.km.toLocaleString("pt-BR")} km ·{" "}
              {vistoria.funcionario_nome ?? "—"} ·{" "}
              {formatDate(vistoria.created_at)}
            </p>
          </div>
        </div>

        {/* Right: action */}
        <Link
          href={href}
          className="btn-secondary text-sm"
        >
          {vistoria.status === "concluida" ? "Ver Laudo" : "Continuar →"}
        </Link>
      </div>
    </div>
  );
}
