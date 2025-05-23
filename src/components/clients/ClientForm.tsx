import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Search } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';

interface Contact {
  name: string;
  whatsapp: string;
  type: string;
}

interface Client {
  id: string;
  code: string;
  document_type: 'cpf' | 'cnpj';
  document: string;
  razao_social: string | null;
  nome_fantasia: string;
  observacao: string;
  status: 'active' | 'blocked' | 'cancelled' | 'pending';
  contacts: Contact[];
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, client }) => {
  const [formData, setFormData] = useState({
    code: '',
    document_type: 'cnpj',
    document: '',
    razao_social: '',
    nome_fantasia: '',
    observacao: ''
  });

  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', whatsapp: '', type: 'funcionario' }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        code: client.code,
        document_type: client.document_type,
        document: client.document,
        razao_social: client.razao_social || '',
        nome_fantasia: client.nome_fantasia,
        observacao: client.observacao || ''
      });
      setContacts(client.contacts.length > 0 ? client.contacts : [{ name: '', whatsapp: '', type: 'funcionario' }]);
    } else {
      setFormData({
        code: '',
        document_type: 'cnpj',
        document: '',
        razao_social: '',
        nome_fantasia: '',
        observacao: ''
      });
      setContacts([{ name: '', whatsapp: '', type: 'funcionario' }]);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'document_type' && value === 'cpf' ? { razao_social: '' } : {})
    }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, document: value }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', whatsapp: '', type: 'funcionario' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      const newContacts = contacts.filter((_, i) => i !== index);
      setContacts(newContacts);
    }
  };

  const searchCNPJ = async () => {
    if (!formData.document || formData.document_type !== 'cnpj') return;

    try {
      setLoading(true);
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${formData.document}`);
      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.message);
      }

      setFormData(prev => ({
        ...prev,
        razao_social: data.razao_social,
        nome_fantasia: data.estabelecimento.nome_fantasia || ''
      }));
    } catch (error: any) {
      toast.error('Erro ao buscar CNPJ. Verifique o número e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        // Update client
        const { error: clientError } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', client.id);

        if (clientError) throw clientError;

        // Delete existing contacts
        const { error: deleteError } = await supabase
          .from('client_contacts')
          .delete()
          .eq('client_id', client.id);

        if (deleteError) throw deleteError;

        // Insert new contacts
        const { error: contactsError } = await supabase
          .from('client_contacts')
          .insert(
            contacts.map(contact => ({
              client_id: client.id,
              ...contact
            }))
          );

        if (contactsError) throw contactsError;

        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Insert client with explicit status
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .insert([{ ...formData, status: 'active' }])
          .select()
          .single();

        if (clientError) throw clientError;

        // Insert contacts
        const { error: contactsError } = await supabase
          .from('client_contacts')
          .insert(
            contacts.map(contact => ({
              client_id: clientData.id,
              ...contact
            }))
          );

        if (contactsError) throw contactsError;

        toast.success('Cliente cadastrado com sucesso!');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-[#161b22] shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
        <h2 className="text-xl font-semibold text-white">
          {client ? 'Editar Cliente' : 'Adicionar Cliente'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
        >
          <X size={20} className="text-[#8b949e]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
        <InputField
          label="Código"
          name="code"
          type="text"
          value={formData.code}
          onChange={handleChange}
          placeholder="Digite o código do cliente"
          disabled={loading}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#c9d1d9]">
            Tipo de Documento
          </label>
          <select
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors disabled:opacity-50"
          >
            <option value="cnpj">CNPJ</option>
            <option value="cpf">CPF</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#c9d1d9]">
            {formData.document_type === 'cnpj' ? 'CNPJ' : 'CPF'}
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <InputMask
                mask={formData.document_type === 'cnpj' ? "99.999.999/9999-99" : "999.999.999-99"}
                value={formData.document}
                onChange={handleDocumentChange}
                disabled={loading}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors disabled:opacity-50"
                placeholder={formData.document_type === 'cnpj' ? "00.000.000/0000-00" : "000.000.000-00"}
              />
            </div>
            {formData.document_type === 'cnpj' && (
              <Button
                type="button"
                variant="secondary"
                onClick={searchCNPJ}
                disabled={loading || !formData.document}
              >
                <Search size={20} />
              </Button>
            )}
          </div>
        </div>

        {formData.document_type === 'cnpj' && (
          <InputField
            label="Razão Social"
            name="razao_social"
            type="text"
            value={formData.razao_social}
            onChange={handleChange}
            placeholder="Digite a razão social"
            disabled={loading}
          />
        )}

        <InputField
          label="Nome Fantasia"
          name="nome_fantasia"
          type="text"
          value={formData.nome_fantasia}
          onChange={handleChange}
          placeholder="Digite o nome fantasia"
          disabled={loading}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#c9d1d9]">
              Contatos
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addContact}
              disabled={loading}
            >
              <Plus size={16} className="mr-1" />
              Adicionar Contato
            </Button>
          </div>

          {contacts.map((contact, index) => (
            <div key={index} className="p-4 bg-[#0d1117] rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8b949e]">Contato {index + 1}</span>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-[#f85149] hover:text-[#ff7b72] p-1 rounded transition-colors"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <InputField
                label="Nome"
                name={`contact-name-${index}`}
                type="text"
                value={contact.name}
                onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                placeholder="Nome do contato"
                disabled={loading}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#c9d1d9]">
                  WhatsApp
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={contact.whatsapp}
                  onChange={(e) => handleContactChange(index, 'whatsapp', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors disabled:opacity-50"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#c9d1d9]">
                  Tipo
                </label>
                <select
                  value={contact.type}
                  onChange={(e) => handleContactChange(index, 'type', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors disabled:opacity-50"
                >
                  <option value="proprietario">Proprietário</option>
                  <option value="socio">Sócio</option>
                  <option value="funcionario">Funcionário</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#c9d1d9]">
            Observação
          </label>
          <textarea
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
            placeholder="Digite uma observação"
            disabled={loading}
            className="w-full h-24 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {client ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              client ? 'Salvar' : 'Criar'
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;