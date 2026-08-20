"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";
import CadenciaLogoBranco from "@/components/icons/CadenciaLogoBranco";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const result = await login(data.email, data.password);
      saveAuth(result.access_token, result.user);
      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Credenciais inválidas. Verifique e-mail e senha.";
      setError(msg);
    }
  }

  return (
    <div
      className="px-6"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "28px",
        backgroundColor: "#16181d",
      }}
    >
      <CadenciaLogoBranco style={{ height: "48px", width: "auto" }} />

      <div className="relative w-[360px]">
        {/* Texto vertical decorativo — posicionado absoluto à esquerda da caixa, não afeta a centralização */}
        <div
          aria-hidden
          className="hidden md:block select-none"
          style={{
            position: "absolute",
            right: "100%",
            marginRight: "2.5rem",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#2d2e33",
              whiteSpace: "nowrap",
            }}
          >
            VISTORIA VEICULAR
          </div>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#fafafa",
          }}
        >
          Entrar na conta
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", marginTop: "6px" }}>
          Acesse o painel de vistorias
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#71717a",
                marginBottom: "6px",
              }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nome@empresa.com"
              className="login-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs" style={{ color: "#dc2626" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#71717a",
                }}
              >
                Senha
              </label>
              <a
                href="#"
                style={{ fontSize: "13px", color: "#dc2626" }}
                className="hover:opacity-80 transition-opacity"
              >
                Esqueceu a senha?
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="login-input"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs" style={{ color: "#dc2626" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div
              className="rounded-md px-3 py-2.5"
              style={{
                backgroundColor: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="login-btn">
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div
          className="mt-8 flex items-center gap-2 justify-center"
          style={{ borderTop: "1px solid #1c1d21", paddingTop: "20px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          <span style={{ fontSize: "12px", color: "#52525b" }}>
            Ambiente seguro · Acesso restrito
          </span>
        </div>
      </div>
    </div>
  );
}
