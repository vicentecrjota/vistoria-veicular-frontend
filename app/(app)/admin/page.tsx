"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import axios from "axios";
import {
  getFuncionarios,
  criarFuncionario,
  deletarFuncionario,
  type Funcionario,
  type FuncionarioRole,
} from "@/lib/api";
import { getUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["admin", "vistoriador"]),
});

type FormData = z.infer<typeof schema>;

const ROLE_CONFIG: Record<FuncionarioRole, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
  vistoriador: { label: "Vistoriador", color: "#a1a1aa", bg: "rgba(161,161,170,0.12)" },
};

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
      {error && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{error}</p>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Funcionario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "vistoriador" } });

  async function loadFuncionarios() {
    // Sem setLoading(true) no topo: no mount `loading` já começa true, e nas
    // recargas após criar/excluir a tabela permanece visível sem piscar.
    try {
      const data = await getFuncionarios();
      setFuncionarios(data);
    } catch (err) {
      console.error("Erro ao carregar funcionários:", err);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }

  // Guarda de rota: essa tela é admin-only. A sidebar já esconde o link para
  // quem não é admin, mas isso não impede acesso direto pela URL.
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
    loadFuncionarios();
  }, [router]);

  async function onSubmit(data: FormData) {
    setApiError(null);
    try {
      await criarFuncionario(data);
      reset({ name: "", email: "", password: "", role: "vistoriador" });
      await loadFuncionarios();
    } catch {
      setApiError("Erro ao criar funcionário. Tente novamente.");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletarFuncionario(toDelete.id);
      setFuncionarios((prev) => prev.filter((f) => f.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setDeleteError("Você não pode excluir seu próprio usuário.");
        } else if (err.response?.status === 409) {
          setDeleteError(
            err.response.data?.detail ??
              "Este funcionário já tem vistorias registradas e não pode ser excluído."
          );
        } else {
          setDeleteError("Não foi possível excluir o funcionário. Tente novamente.");
        }
      } else {
        setDeleteError("Não foi possível excluir o funcionário. Tente novamente.");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!authorized) return null;

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
        <span style={{ color: "#a1a1aa", fontWeight: 500 }}>Funcionários</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa" }}>
          Funcionários
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", marginTop: "4px" }}>
          Gerencie quem tem acesso ao sistema
        </p>
      </div>

      {/* Formulário inline de cadastro */}
      <div
        className="mb-6"
        style={{ backgroundColor: "#1c1f26", border: "1px solid #24272e", borderRadius: "12px", padding: "24px" }}
      >
        <SectionTitle>Adicionar Funcionário</SectionTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Nome *" error={errors.name?.message}>
              <input
                type="text"
                placeholder="João Silva"
                className="nova-input"
                style={errors.name ? { borderColor: "#dc2626" } : undefined}
                {...register("name")}
              />
            </Field>

            <Field label="E-mail *" error={errors.email?.message}>
              <input
                type="email"
                placeholder="joao@empresa.com"
                className="nova-input"
                style={errors.email ? { borderColor: "#dc2626" } : undefined}
                {...register("email")}
              />
            </Field>

            <Field label="Senha *" error={errors.password?.message}>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="nova-input"
                style={errors.password ? { borderColor: "#dc2626" } : undefined}
                {...register("password")}
              />
            </Field>

            <Field label="Cargo *" error={errors.role?.message}>
              <div className="relative">
                <select
                  className="nova-input"
                  style={{ appearance: "none", paddingRight: "32px", cursor: "pointer" }}
                  {...register("role")}
                >
                  <option value="vistoriador">Vistoriador</option>
                  <option value="admin">Admin</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </Field>
          </div>

          {apiError && (
            <div
              className="mt-4"
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

          <div className="flex justify-end mt-5">
            <button type="submit" disabled={isSubmitting} className="dash-btn-primary">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adicionando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de funcionários */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "#52525b" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : funcionarios.length === 0 ? (
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p style={{ color: "#71717a", fontSize: "14px" }}>Nenhum funcionário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="dash-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table" style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th style={{ width: "48px" }}>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => {
                  const roleCfg = ROLE_CONFIG[f.role] ?? ROLE_CONFIG.vistoriador;
                  return (
                    <tr key={f.id} style={{ cursor: "default" }}>
                      <td style={{ color: "#fafafa", fontWeight: 500, fontSize: "14px" }}>{f.name}</td>
                      <td style={{ color: "#a1a1aa", fontSize: "14px" }}>{f.email}</td>
                      <td>
                        <span className="dash-badge" style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="row-delete-btn"
                          style={{ opacity: 1 }}
                          aria-label={`Excluir funcionário ${f.name}`}
                          onClick={() => {
                            setDeleteError(null);
                            setToDelete(f);
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
              Excluir funcionário {toDelete.name}?
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
