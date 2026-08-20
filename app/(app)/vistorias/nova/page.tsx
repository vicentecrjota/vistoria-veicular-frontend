"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { criarVistoria } from "@/lib/api";

const schema = z.object({
  placa: z
    .string()
    .min(7, "Placa inválida")
    .max(8, "Placa inválida")
    .regex(/^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$|^[A-Z]{3}[0-9]{4}$/, {
      message: "Formato inválido (ex: ABC1234 ou ABC1D23)",
    })
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "")),
  chassi: z
    .string()
    .min(17, "Chassi deve ter 17 caracteres")
    .max(17, "Chassi deve ter 17 caracteres")
    .transform((v) => v.toUpperCase()),
  modelo: z.string().min(2, "Informe o modelo"),
  ano: z
    .number({ invalid_type_error: "Ano inválido" })
    .min(1950, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido"),
  cor: z.string().min(2, "Informe a cor"),
  km: z.number({ invalid_type_error: "KM inválido" }).min(0, "KM inválido"),
});

type FormData = z.infer<typeof schema>;

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#dc2626",
        marginBottom: "16px",
      }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#71717a", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{error}</p>
      )}
    </div>
  );
}

export default function NovaVistoriaPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setApiError(null);
    try {
      const vistoria = await criarVistoria(data);
      router.push(`/vistorias/${vistoria.id}/fotos`);
    } catch {
      setApiError("Erro ao criar vistoria. Tente novamente.");
    }
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
        <span style={{ color: "#a1a1aa", fontWeight: 500 }}>Nova Vistoria</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa" }}>
          Nova Vistoria
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", marginTop: "4px" }}>
          Preencha os dados do veículo para iniciar
        </p>
      </div>

      {/* Card do formulário */}
      <div
        style={{
          maxWidth: "620px",
          backgroundColor: "#1c1f26",
          border: "1px solid #24272e",
          borderRadius: "12px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: "32px" }}>
            {/* Identificação */}
            <SectionTitle>Identificação</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Field label="Placa *" error={errors.placa?.message}>
                <input
                  type="text"
                  placeholder="ABC-1D23"
                  maxLength={8}
                  className={`nova-input ${errors.placa ? "error" : ""}`}
                  style={{ fontFamily: MONO_FONT, letterSpacing: "0.04em" }}
                  {...register("placa")}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register("placa").onChange(e);
                  }}
                />
              </Field>

              <Field label="Chassi *" error={errors.chassi?.message}>
                <input
                  type="text"
                  placeholder="9BWZZZ..."
                  maxLength={17}
                  className={`nova-input ${errors.chassi ? "error" : ""}`}
                  style={{ fontFamily: MONO_FONT, letterSpacing: "0.04em" }}
                  {...register("chassi")}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register("chassi").onChange(e);
                  }}
                />
              </Field>
            </div>

            {/* Dados do veículo */}
            <SectionTitle>Dados do veículo</SectionTitle>
            <div className="space-y-4">
              <Field label="Modelo *" error={errors.modelo?.message}>
                <input
                  type="text"
                  placeholder="Ex: Fiat Strada"
                  className={`nova-input ${errors.modelo ? "error" : ""}`}
                  {...register("modelo")}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Ano *" error={errors.ano?.message}>
                  <input
                    type="number"
                    placeholder="2022"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    className={`nova-input ${errors.ano ? "error" : ""}`}
                    {...register("ano", { valueAsNumber: true })}
                  />
                </Field>

                <Field label="Cor *" error={errors.cor?.message}>
                  <input
                    type="text"
                    placeholder="Prata"
                    className={`nova-input ${errors.cor ? "error" : ""}`}
                    {...register("cor")}
                  />
                </Field>

                <Field label="Quilometragem *" error={errors.km?.message}>
                  <input
                    type="number"
                    placeholder="50000"
                    min={0}
                    className={`nova-input ${errors.km ? "error" : ""}`}
                    {...register("km", { valueAsNumber: true })}
                  />
                </Field>
              </div>
            </div>

            {apiError && (
              <div
                className="mt-6"
                style={{
                  borderRadius: "6px",
                  padding: "10px 12px",
                  backgroundColor: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.3)",
                }}
              >
                <p style={{ color: "#dc2626", fontSize: "13px" }}>{apiError}</p>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div
            className="flex flex-wrap items-center justify-end gap-3"
            style={{ borderTop: "1px solid #24272e", padding: "20px 32px" }}
          >
            <Link href="/dashboard" className="nova-btn-cancel">
              Cancelar
            </Link>
            <button type="submit" disabled={isSubmitting} className="dash-btn-primary">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando...
                </>
              ) : (
                <>
                  Criar e adicionar fotos
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
