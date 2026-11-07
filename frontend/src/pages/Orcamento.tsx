import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import TituloPagina from '../components/TituloPagina';
import { consultarOrdensServico, request, type OrdemServico } from '../services/api';
import { moeda } from '../utils/moeda';
type Documento = { ordemId: string; descricao: string; data: string; emitidoEm: string; veiculo?: { placa: string; marca: string; modelo: string }; itens: { servicoId: string; nome: string; precoCentavos: number }[]; totalCentavos: number };
export default function Orcamento() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [id, setId] = useState('');
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const enviando = useRef(false);
  async function carregar() { setErro(''); try { setOrdens(await consultarOrdensServico({})); } catch (error) { setErro(error instanceof Error ? error.message : 'Falha ao carregar ordens'); } }
  useEffect(() => {
    let ativo = true;
    consultarOrdensServico({}).then(lista => { if (ativo) setOrdens(lista); })
      .catch(error => { if (ativo) setErro(error.message); });
    return () => { ativo = false; };
  }, []);
  async function gerar(event: FormEvent) {
    event.preventDefault(); if (enviando.current) return;
    enviando.current = true; setOcupado(true); setErro(''); setDocumento(null);
    try { const resposta = await request<Documento>(`/ordens-servico/${id}/orcamento`); setDocumento(resposta.data ?? null); }
    catch (error) { setErro(error instanceof Error ? error.message : 'Falha ao gerar orçamento'); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <section className="tela-operacional"><TituloPagina grupo="Atendimento" titulo="Orçamentos" descricao="Apresente os serviços previstos e os valores ao cliente." />
    <form className="form-card no-print" onSubmit={gerar}><div className="card-heading"><div><h2>Gerar orçamento</h2><p>Selecione uma ordem com serviços adicionados</p></div><span className="module-tag">COMERCIAL</span></div><div className="fields"><label className="full">Ordem de serviço<select required value={id} onChange={event => { setId(event.target.value); setDocumento(null); setErro(''); }}><option value="">Selecione uma ordem</option>{ordens.map(ordem => <option key={ordem._id} value={ordem._id}>{ordem.descricao} · {ordem.veiculo}</option>)}</select></label></div><div className="form-footer"><span>Valores dos serviços registrados na OS</span><button disabled={!id || ocupado}>{ocupado ? 'Gerando…' : 'Gerar orçamento'}</button></div></form>
    {erro && <div className="notice notice-error" role="alert">{erro} <button type="button" onClick={() => void carregar()}>Recarregar ordens</button></div>}
    {documento && <article className="quote-document"><div className="heading-actions"><div><span className="eyebrow">AUTOHUB · PROPOSTA DE SERVIÇOS</span><h2>Orçamento</h2></div><button className="no-print" onClick={() => window.print()}>Imprimir / Salvar PDF</button></div><p><strong>{documento.descricao}</strong><br />{documento.veiculo?.placa} · {documento.veiculo?.marca} {documento.veiculo?.modelo}</p><p className="field-hint">OS {documento.ordemId}<br />Emitido em {new Date(documento.emitidoEm).toLocaleString('pt-BR')}</p><div className="table-wrap"><table><thead><tr><th>Serviço previsto</th><th>Valor</th></tr></thead><tbody>{documento.itens.map(item => <tr key={item.servicoId}><td>{item.nome}</td><td>{moeda(item.precoCentavos)}</td></tr>)}</tbody></table></div><p className="quote-total">Total estimado <strong>{moeda(documento.totalCentavos)}</strong></p><p className="field-hint">Estimativa baseada nos serviços desta ordem. A execução depende da aprovação do cliente.</p></article>}
  </section>;
}
