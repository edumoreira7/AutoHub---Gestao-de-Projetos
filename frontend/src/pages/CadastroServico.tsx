import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import TituloPagina from '../components/TituloPagina';
import { cadastrarServico } from '../services/api';
import { lerPreco, PRECO_INVALIDO } from '../utils/moeda';

export default function CadastroServico() {
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; mensagem: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);
  const [erroPreco, setErroPreco] = useState(false);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando.current) return;
    const form = event.currentTarget;
    const dados = new FormData(form);
    const nome = String(dados.get('nome') ?? '').trim();
    const precoPadrao = lerPreco(String(dados.get('precoPadrao') ?? ''));
    setErroPreco(precoPadrao === undefined);
    if (precoPadrao === undefined) {
      setAviso({ tipo: 'error', mensagem: PRECO_INVALIDO });
      (form.elements.namedItem('precoPadrao') as HTMLInputElement).focus();
      return;
    }
    if (!nome) {
      setAviso({ tipo: 'error', mensagem: 'Nome do serviço é obrigatório' });
      (form.elements.namedItem('nome') as HTMLInputElement).focus();
      return;
    }
    enviando.current = true;
    setSalvando(true);
    setAviso(null);
    try {
      const resposta = await cadastrarServico({ nome, precoPadrao });
      form.reset();
      setAviso({ tipo: 'success', mensagem: resposta.message ?? 'Serviço cadastrado com sucesso' });
    } catch (error) {
      setAviso({ tipo: 'error', mensagem: error instanceof Error ? error.message : 'Não foi possível cadastrar o serviço.' });
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }

  return <div className="tela-operacional">
    <TituloPagina grupo="Serviços" titulo="Novo serviço" descricao="Cadastre os serviços oferecidos pela oficina para utilizá-los nas ordens." />
    <section className="form-card" aria-labelledby="service-title">
      <div className="card-heading"><div><h2 id="service-title">Dados do serviço</h2><p>Nome e preço padrão são obrigatórios. Novos serviços ficam ativos.</p></div></div>
      <form onSubmit={cadastrar} noValidate onInput={() => { setAviso(null); setErroPreco(false); }}>
        <fieldset disabled={salvando} className="form-fields-reset">
          <div className="fields">
            <label className="full">Nome do serviço <span className="required">*</span><input name="nome" required maxLength={100} placeholder="Ex.: Troca de óleo" /></label>
            <label className="full">Preço padrão (R$) <span className="required">*</span><input name="precoPadrao" required inputMode="decimal" placeholder="Ex.: 150,00" aria-invalid={erroPreco} aria-describedby="preco-hint" />
              <span className="field-hint" id="preco-hint">Informe um valor maior que zero, com até duas casas decimais. Use vírgula ou ponto, sem separador de milhares.</span>
            </label>
          </div>
          <div className="form-footer"><span>O preço padrão será usado ao adicionar este serviço a uma ordem.</span><button type="submit">{salvando ? 'Salvando...' : 'Cadastrar serviço'} <span aria-hidden="true">→</span></button></div>
        </fieldset>
        {aviso && <p className={`notice notice-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.mensagem}</p>}
      </form>
    </section>
  </div>;
}
