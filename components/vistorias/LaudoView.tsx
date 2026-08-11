import { type VistoriaDetalhada, type Laudo } from "@/lib/api";

interface Props {
  vistoria: VistoriaDetalhada;
  laudo: Laudo;
}

const SEVERITY_CONFIG = {
  leve: { label: "Leve", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  moderado: { label: "Moderado", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  grave: { label: "Grave", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = score >= 7 ? "#22c55e" : score >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="text-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="block text-xs text-slate-400">/10</span>
      </div>
    </div>
  );
}

export default function LaudoView({ vistoria, laudo }: Props) {
  return (
    <div className="max-w-3xl space-y-4 print:max-w-full print:space-y-6">
      {/* Vehicle identity */}
      <div
        className="card p-6 flex items-center gap-6"
        style={{ borderTop: "3px solid var(--color-primary)" }}
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-xl text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {vistoria.placa.slice(0, 3)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2
              className="text-2xl font-bold tracking-widest"
              style={{ color: "var(--color-primary)" }}
            >
              {vistoria.placa}
            </h2>
            <span className="text-slate-400 text-sm font-mono">{vistoria.chassi}</span>
          </div>
          <p className="text-slate-600 mt-0.5">
            {vistoria.modelo} · {vistoria.ano} · {vistoria.cor} · {vistoria.km.toLocaleString("pt-BR")} km
          </p>
          {vistoria.funcionario_nome && (
            <p className="text-xs text-slate-400 mt-1">Vistoriado por: {vistoria.funcionario_nome}</p>
          )}
        </div>
        <ScoreRing score={laudo.pontuacao_geral} />
      </div>

      {/* Summary */}
      {laudo.resumo && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Resumo da Análise</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{laudo.resumo}</p>
        </div>
      )}

      {/* Positive points */}
      {laudo.pontos_positivos?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
            Pontos Positivos
          </h3>
          <ul className="space-y-1.5">
            {laudo.pontos_positivos.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Damages */}
      {laudo.danos?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs">!</span>
            Danos Encontrados ({laudo.danos.length})
          </h3>
          <div className="space-y-2">
            {laudo.danos.map((dano, i) => {
              const cfg = SEVERITY_CONFIG[dano.severidade] ?? SEVERITY_CONFIG.leve;
              return (
                <div
                  key={i}
                  className={`flex items-start justify-between gap-4 p-3 rounded-md border ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${cfg.text}`}>{dano.descricao}</p>
                    {dano.localizacao && (
                      <p className="text-xs text-slate-500 mt-0.5">{dano.localizacao}</p>
                    )}
                  </div>
                  <span className={`badge ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unidentified items */}
      {laudo.itens_nao_identificados?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">?</span>
            Itens Não Identificados
          </h3>
          <div className="space-y-2">
            {laudo.itens_nao_identificados.map((item, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm font-medium text-amber-800">{item.item}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.motivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {laudo.recomendacoes && laudo.recomendacoes.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recomendações</h3>
          <ul className="space-y-1.5">
            {laudo.recomendacoes.map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-slate-300 mt-1">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
