import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import TituloPagina from '../components/TituloPagina';
import { request } from '../services/api';

type Peca = { _id: string; nome: string; codigo: string; quantidade: number };
export default function Estoque() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('0');
  const [pecaId, setPecaId] = useState('');
  const [movimento, setMovimento] = useState('');
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const enviando = useRef(false);
  async function carregar(termo = '') {
    setCarregando(true);
    try { const resposta = await request<Peca[]>(`/pecas?busca=${encodeURIComponent(termo)}`); setPecas(resposta.data ?? []); }
    finally { setCarregando(false); }
  }
  useEffect(() => {
    let ativo = true;
    request<Peca[]>('/pecas').then(resposta => { if (ativo) setPecas(resposta.data ?? []); })
      .catch(error => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);
  async function salvar(event: FormEvent, tipo: 'cadastro' | 'movimento') {
    event.preventDefault();
    if (enviando.current) return;
    setErro(''); setAviso('');
    const valor = Number(tipo === 'cadastro' ? quantidade : movimento);
    if (!(tipo === 'cadastro' ? quantidade : movimento).trim() || !Number.isSafeInteger(valor) || (tipo === 'cadastro' ? valor < 0 : valor === 0)) { setErro('Informe uma quantidade inteira válida. Movimentações devem ser diferentes de zero.'); return; }
    enviando.current = true; setOcupado(true);
    try {
      const resposta = await request(tipo === 'cadastro' ? '/pecas' : `/pecas/${pecaId}/movimentacoes`, {
        method: tipo === 'cadastro' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipo === 'cadastro' ? { nome, codigo, quantidade: valor } : { quantidade: valor }),
      });
      if (tipo === 'cadastro') { setNome(''); setCodigo(''); setQuantidade('0'); } else setMovimento('');
      await carregar(busca); setAviso(resposta.message ?? 'Operação concluída');
    } catch (error) { setErro(error instanceof Error ? error.message : 'Não foi possível salvar'); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <section className="tela-operacional">
    <TituloPagina grupo="Materiais" titulo="Estoque de peças" descricao="Cadastre materiais, acompanhe saldos e registre entradas e saídas." />
    <div className="erp-two-columns">
      <form className="form-card" onSubmit={event => salvar(event, 'cadastro')}>
        <div className="card-heading"><div><h2>Nova peça</h2><p>Identificação e saldo inicial</p></div><span className="module-tag">CADASTRO</span></div>
        <fieldset className="form-fields-reset" disabled={ocupado}><div className="fields">
          <label className="full">Nome da peça<input required maxLength={100} value={nome} onChange={event => setNome(event.target.value)} placeholder="Ex.: Filtro de óleo" /></label>
          <label>Código<input required maxLength={40} value={codigo} onChange={event => setCodigo(event.target.value)} placeholder="FLT-001" /></label>
          <label>Quantidade inicial<input required type="number" min="0" step="1" value={quantidade} onChange={event => setQuantidade(event.target.value)} /></label>
        </div><div className="form-footer"><span>Todos os campos são obrigatórios</span><button disabled={ocupado}>Cadastrar peça</button></div></fieldset>
      </form>
      <form className="form-card" onSubmit={event => salvar(event, 'movimento')}>
        <div className="card-heading"><div><h2>Movimentar estoque</h2><p>Saldo atualizado em cada confirmação</p></div><span className="module-tag">MOVIMENTAÇÃO</span></div>
        <fieldset className="form-fields-reset" disabled={ocupado}><div className="fields">
          <label className="full">Peça<select required value={pecaId} onChange={event => setPecaId(event.target.value)}><option value="">Selecione uma peça</option>{pecas.map(peca => <option key={peca._id} value={peca._id}>{peca.codigo} · {peca.nome} ({peca.quantidade} un.)</option>)}</select></label>
          <label className="full">Movimentação (unidades)<input required type="number" step="1" value={movimento} onChange={event => setMovimento(event.target.value)} placeholder="10 para entrada ou -2 para saída" /><span className="field-hint">Positivo: entrada. Negativo: saída. O saldo nunca pode ficar negativo.</span></label>
        </div><div className="form-footer"><span>Confira a peça antes de confirmar</span><button disabled={ocupado || !pecaId}>Confirmar movimentação</button></div></fieldset>
      </form>
    </div>
    {erro && <p className="notice notice-error" role="alert">{erro}</p>}{aviso && <p className="notice notice-success" role="status">{aviso}</p>}
    <div className="results"><div className="heading-actions"><h2>Posição do estoque <span className="result-count">{pecas.length} peças</span></h2>
      <form className="inventory-search" onSubmit={event => { event.preventDefault(); setErro(''); carregar(busca).catch(error => setErro(error.message)); }}><input aria-label="Pesquisar peças" placeholder="Nome ou código da peça" value={busca} onChange={event => setBusca(event.target.value)} /><button disabled={carregando}>Pesquisar estoque</button></form></div>
      {carregando ? <p role="status">Carregando estoque…</p> : pecas.length ? <div className="table-wrap"><table><thead><tr><th>Código</th><th>Descrição da peça</th><th>Disponível</th><th>Situação</th></tr></thead><tbody>{pecas.map(peca => <tr key={peca._id}><td><code>{peca.codigo}</code></td><td>{peca.nome}</td><td><strong>{peca.quantidade}</strong> un.</td><td><span className={`stock-badge ${peca.quantidade ? '' : 'stock-empty'}`}>{peca.quantidade ? 'Disponível' : 'Sem estoque'}</span></td></tr>)}</tbody></table></div> : <p className="empty-state">Nenhuma peça encontrada.</p>}
    </div>
  </section>;
}
