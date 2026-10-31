import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TituloPagina from '../components/TituloPagina';
import { adicionarServicoOrdem, consultarOrdensServico, consultarServicos, type OrdemServico, type Servico } from '../services/api';
import { moeda } from '../utils/moeda';

export default function ServicosOrdem() {
  const [params] = useSearchParams();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [ordemId, setOrdemId] = useState(params.get('ordem') ?? '');
  const [servicoId, setServicoId] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; mensagem: string } | null>(null);
  const ordem = ordens.find(item => item._id === ordemId);
  const disponiveis = servicos.filter(item => item.ativo && !ordem?.servicos?.some(adicionado => adicionado.servicoId === item._id));
  const servico = disponiveis.find(item => item._id === servicoId);

  useEffect(() => {
    let ativo = true;
    Promise.all([consultarOrdensServico({}), consultarServicos()]).then(([os, lista]) => {
      if (ativo) { setOrdens(os); setServicos(lista); }
    }).catch(error => { if (ativo) setErroCarga(error instanceof Error ? error.message : 'Não foi possível carregar os dados.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  async function adicionar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando.current) return;
    if (!ordem) { setAviso({ tipo: 'error', mensagem: 'Selecione uma ordem de serviço cadastrada' }); return; }
    if (!servico) { setAviso({ tipo: 'error', mensagem: 'Serviço não encontrado no sistema' }); return; }
    enviando.current = true;
    setSalvando(true);
    setAviso(null);
    try {
      const atualizada = await adicionarServicoOrdem(ordem._id, servico._id);
      setOrdens(lista => lista.map(item => item._id === atualizada._id ? { ...item, ...atualizada } : item));
      setServicoId('');
      setAviso({ tipo: 'success', mensagem: 'Serviço adicionado à ordem com sucesso' });
    } catch (error) {
      setAviso({ tipo: 'error', mensagem: error instanceof Error ? error.message : 'Não foi possível adicionar o serviço.' });
      // Refresh after a conflicting or uncertain response; the server remains authoritative.
      recarregar();
    } finally { enviando.current = false; setSalvando(false); }
  }

  function recarregar() {
    setCarregando(true);
    setErroCarga('');
    setTentativa(valor => valor + 1);
  }

  return <div className="tela-operacional">
    <TituloPagina grupo="Ordens de serviço" titulo="Serviços da ordem" descricao="Selecione a ordem e confira o serviço antes de confirmar a inclusão." />
    <section className="form-card" aria-labelledby="order-services-title">
      <div className="card-heading"><div><h2 id="order-services-title">Adicionar serviço</h2><p>O total será atualizado após a confirmação.</p></div></div>
      {erroCarga && <div className="service-summary"><p role="alert" className="notice-error">{erroCarga}</p><button type="button" className="secondary-action" onClick={recarregar}>Tentar novamente</button></div>}
      {carregando && <p className="service-summary" role="status">Carregando ordens e serviços...</p>}
      <form onSubmit={adicionar}>
        <fieldset disabled={carregando || salvando || !!erroCarga} className="form-fields-reset">
          <div className="fields">
            <label className="full">Ordem de serviço <span className="required">*</span><select required value={ordemId} onChange={event => { setOrdemId(event.target.value); setServicoId(''); setAviso(null); }}>
              <option value="">Selecione uma ordem</option>{ordens.map(item => <option key={item._id} value={item._id}>{item.descricao} · {item.veiculo} · {item.data}</option>)}
            </select></label>
            <label className="full">Serviço ativo <span className="required">*</span><select required value={servicoId} disabled={!ordem} onChange={event => { setServicoId(event.target.value); setAviso(null); }}>
              <option value="">Selecione um serviço</option>{disponiveis.map(item => <option key={item._id} value={item._id}>{item.nome} · {moeda(Math.round(item.precoPadrao * 100))}</option>)}
            </select></label>
          </div>
          {!carregando && !erroCarga && ordens.length === 0 && <p className="service-summary">Nenhuma ordem cadastrada. <Link to="/ordens-servico/nova">Criar ordem</Link></p>}
          {!carregando && !erroCarga && ordem && disponiveis.length === 0 && <p className="service-summary">Nenhum serviço ativo disponível para inclusão. <Link to="/servicos/novo">Cadastrar serviço</Link></p>}
          {ordem && <div className="service-summary"><p>Ordem: <strong>{ordem.descricao}</strong></p><p>Total atual: <strong>{moeda(ordem.totalCentavos ?? 0)}</strong></p>
            {servico && <><p>Serviço selecionado: <strong>{servico.nome}</strong> · {moeda(Math.round(servico.precoPadrao * 100))}</p><p>Total previsto: <strong>{moeda((ordem.totalCentavos ?? 0) + Math.round(servico.precoPadrao * 100))}</strong></p></>}
          </div>}
          <div className="form-footer"><span>Cada serviço pode ser incluído uma vez por ordem.</span><button type="submit" disabled={!ordem || !servico}>{salvando ? 'Adicionando...' : 'Confirmar adição'}</button></div>
        </fieldset>
        {aviso && <p className={`notice notice-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.mensagem}</p>}
      </form>
    </section>
    {ordem && <section className="results" aria-label="Serviços incluídos" aria-live="polite"><h2>Serviços incluídos</h2>
      {ordem.servicos?.length ? <div className="table-wrap"><table><thead><tr><th scope="col">Serviço</th><th scope="col">Preço</th></tr></thead><tbody>{ordem.servicos.map(item => <tr key={item.servicoId}><td>{item.nome}</td><td>{moeda(item.precoCentavos)}</td></tr>)}</tbody></table></div> : <p className="empty-state">Esta ordem ainda não possui serviços incluídos.</p>}
      <p className="order-total">Total da ordem: <strong>{moeda(ordem.totalCentavos ?? 0)}</strong></p>
    </section>}
  </div>;
}
