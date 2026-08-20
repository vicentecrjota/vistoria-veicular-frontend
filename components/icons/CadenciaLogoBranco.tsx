import type { SVGProps } from "react";

// Logo Cadência (versão branca, para fundos escuros).
// Fonte: public/cadencia-branco.svg — mantida como componente inline para
// ficar nítida em qualquer tamanho e ser estilizável via props.
export default function CadenciaLogoBranco(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Cadência"
      {...props}
    >
      <g transform="translate(11,0) skewX(-13)">
        <rect x="20" y="8" width="66" height="14" rx="1" fill="#fafafa" />
        <rect x="8" y="30" width="48" height="14" rx="1" fill="#fafafa" />
        <rect x="26" y="52" width="72" height="14" rx="1" fill="#dc2626" />
        <rect x="14" y="74" width="32" height="14" rx="1" fill="#fafafa" />
      </g>
    </svg>
  );
}
