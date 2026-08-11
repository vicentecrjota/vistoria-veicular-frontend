"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { criarVistoria } from "@/lib/api";
import Header from "@/components/layout/Header";

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
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
    <>
      <Header
        title="Nova Vistoria"
        subtitle="Preencha os dados do veículo"
        actions={
          <Link href="/dashboard" className="btn-secondary">
            Cancelar
          </Link>
        }
      />

      <div className="max-w-2xl">
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Placa *" error={errors.placa?.message}>
                <input
                  type="text"
                  placeholder="ABC1234"
                  maxLength={8}
                  className={`input-field uppercase ${errors.placa ? "error" : ""}`}
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
                  placeholder="17 caracteres"
                  maxLength={17}
                  className={`input-field uppercase ${errors.chassi ? "error" : ""}`}
                  {...register("chassi")}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register("chassi").onChange(e);
                  }}
                />
              </Field>
            </div>

            <Field label="Modelo *" error={errors.modelo?.message}>
              <input
                type="text"
                placeholder="Ex: Honda Civic EXL"
                className={`input-field ${errors.modelo ? "error" : ""}`}
                {...register("modelo")}
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Ano *" error={errors.ano?.message}>
                <input
                  type="number"
                  placeholder="2022"
                  min={1950}
                  max={new Date().getFullYear() + 1}
                  className={`input-field ${errors.ano ? "error" : ""}`}
                  {...register("ano", { valueAsNumber: true })}
                />
              </Field>

              <Field label="Cor *" error={errors.cor?.message}>
                <input
                  type="text"
                  placeholder="Prata"
                  className={`input-field ${errors.cor ? "error" : ""}`}
                  {...register("cor")}
                />
              </Field>

              <Field label="Quilometragem *" error={errors.km?.message}>
                <input
                  type="number"
                  placeholder="50000"
                  min={0}
                  className={`input-field ${errors.km ? "error" : ""}`}
                  {...register("km", { valueAsNumber: true })}
                />
              </Field>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando...
                  </>
                ) : (
                  "Próximo: Upload de Fotos →"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
