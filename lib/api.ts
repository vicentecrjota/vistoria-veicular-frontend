import axios from "axios";
import { getToken, clearAuth } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Types ──────────────────────────────────────────────────────────────────

export type VistoriaStatus =
  | "pendente"
  | "em_analise"
  | "concluida"
  | "cancelada";

export interface Vistoria {
  id: string;
  placa: string;
  chassi: string;
  modelo: string;
  ano: number;
  cor: string;
  km: number;
  status: VistoriaStatus;
  created_at: string;
  funcionario_nome?: string;
  funcionario_id?: string;
}

export interface Dano {
  descricao: string;
  severidade: "leve" | "moderado" | "grave";
  localizacao?: string;
}

export interface ItemNaoIdentificado {
  item: string;
  motivo: string;
}

export interface Laudo {
  pontuacao_geral: number;
  resumo: string;
  pontos_positivos: string[];
  danos: Dano[];
  itens_nao_identificados: ItemNaoIdentificado[];
  recomendacoes?: string[];
}

export interface VistoriaDetalhada extends Vistoria {
  fotos?: string[];
  laudo?: Laudo;
}

export type FuncionarioRole = "admin" | "vistoriador";

export interface Funcionario {
  id: string;
  name: string;
  email: string;
  role: FuncionarioRole;
  ativo: boolean;
  created_at: string;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data as { access_token: string; user: { id: string; name: string; email: string; role: FuncionarioRole } };
}

// ── Vistorias ──────────────────────────────────────────────────────────────

export async function getVistorias(): Promise<Vistoria[]> {
  const { data } = await api.get("/vistorias");
  return data;
}

export async function getVistoria(id: string): Promise<VistoriaDetalhada> {
  const { data } = await api.get(`/vistorias/${id}`);
  return data;
}

export async function criarVistoria(payload: {
  placa: string;
  chassi: string;
  modelo: string;
  ano: number;
  cor: string;
  km: number;
}): Promise<Vistoria> {
  const { data } = await api.post("/vistorias", payload);
  return data;
}

export async function uploadFotos(id: string, files: File[]): Promise<void> {
  const form = new FormData();
  files.forEach((file) => form.append("fotos", file));
  await api.post(`/vistorias/${id}/fotos`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function analisarVistoria(id: string): Promise<void> {
  await api.post(`/vistorias/${id}/analisar`);
}

export async function getLaudo(id: string): Promise<Laudo> {
  const { data } = await api.get(`/vistorias/${id}/laudo`);
  return data;
}

export async function deleteVistoria(id: string): Promise<void> {
  await api.delete(`/vistorias/${id}`);
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function getFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get("/admin/funcionarios");
  return data;
}

export async function criarFuncionario(payload: {
  name: string;
  email: string;
  password: string;
  role: FuncionarioRole;
}): Promise<Funcionario> {
  const { data } = await api.post("/admin/funcionarios", payload);
  return data;
}

export async function deletarFuncionario(id: string): Promise<void> {
  await api.delete(`/admin/funcionarios/${id}`);
}

export default api;
