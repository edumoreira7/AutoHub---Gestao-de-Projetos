export function dataLocalHoje(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataBrasileira(dataIso: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : dataIso;
}

export function converterDataBrasileiraParaIso(data: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!partes) return null;

  const [, dia, mes, ano] = partes;
  const dataIso = `${ano}-${mes}-${dia}`;
  const dataValidada = new Date(`${dataIso}T00:00:00.000Z`);
  return !Number.isNaN(dataValidada.getTime()) &&
    dataValidada.toISOString().slice(0, 10) === dataIso
    ? dataIso
    : null;
}

export function aplicarMascaraDataBrasileira(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}
