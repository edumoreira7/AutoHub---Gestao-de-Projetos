export const PRECO_INVALIDO = 'Insira um valor numérico válido e maior que zero';
export function lerPreco(texto: string): number | undefined {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto.trim())) return;
  const valor = Number(texto.trim().replace(',', '.'));
  if (!Number.isFinite(valor) || valor <= 0 || !Number.isSafeInteger(Math.round(valor * 100))) return;
  return valor;
}
export const moeda = (centavos: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100);
