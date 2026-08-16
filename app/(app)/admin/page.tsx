"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getFuncionarios,
  criarFuncionario,
  desativarFuncionario,
  type Funcionario,
} from "@/lib/api";
import Header from "@/components/layout/Header";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function AdminPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function loadFuncionarios() {
    setLoading(true);
    try {
      const data = await getFuncionarios();
      setFuncionarios(data);
    } catch (err) {
      // Endpoint indisponível (404/500/rede): não derruba a página, só
      // mostra a lista vazia — o usuário já vê "Nenhum funcionário cadastrado."
      console.error("Erro ao carregar funcionários:", err);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFuncionarios();
  }, []);

  async function onSubmit(data: FormData) {
    setApiError(null);
    try {
      await criarFuncionario(data);
      reset();
      setShowForm(false);
      await loadFuncionarios();
    } catch {
      setApiError("Erro ao criar funcionário. Tente novamente.");
    }
  }

  async function handleDesativar(id: string) {
    if (!confirm("Desativar este funcionário?")) return;
    setDeactivating(id);
    try {
      await desativarFuncionario(id);
      await loadFuncionarios();
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <>
      <Header
        title="Funcionários"
        subtitle="Gerencie os usuários do sistema"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Cancelar" : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Funcionário
              </>
            )}
          </button>
        }
      />

      {/* New employee form */}
      {showForm && (
        <div className="card p-6 mb-6 max-w-lg">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Novo Funcionário</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input
                type="text"
                placeholder="João Silva"
                className={`input-field ${errors.name ? "error" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">E-mail *</label>
              <input
                type="email"
                placeholder="joao@empresa.com"
                className={`input-field ${errors.email ? "error" : ""}`}
                {...register("email")}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Senha *</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className={`input-field ${errors.password ? "error" : ""}`}
                {...register("password")}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Criando..." : "Criar Funcionário"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : funcionarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Nenhum funcionário cadastrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  Nome
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  E-mail
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  Perfil
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {funcionarios.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
                  <td className="px-4 py-3 text-slate-600">{f.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-slate-100 text-slate-600 capitalize">
                      {f.role === "admin" ? "Admin" : "Funcionário"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {f.ativo ? (
                      <span className="badge bg-green-50 text-green-700">Ativo</span>
                    ) : (
                      <span className="badge bg-red-50 text-red-600">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {f.ativo && (
                      <button
                        onClick={() => handleDesativar(f.id)}
                        disabled={deactivating === f.id}
                        className="btn-danger text-xs px-3 py-1.5"
                      >
                        {deactivating === f.id ? "..." : "Desativar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
