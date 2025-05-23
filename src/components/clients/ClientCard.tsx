import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Building2, Hash, Phone, User, Edit, Trash2, CheckCircle, XCircle, Ban, Copy } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface Contact {
  name: string;
  whatsapp: string;
  type: string;
}

interface ClientCardProps {
  client: {
    id: string;
    code: string;
    document_type: 'cpf' | 'cnpj';
    document: string;
    razao_social: string | null;
    nome_fantasia: string;
    status: 'active' | 'blocked' | 'cancelled' | 'pending';
    contacts: Contact[];
  };
  onEdit: (client: ClientCardProps['client']) => void;
  onUpdate: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<{
    action: 'delete' | 'changeStatus';
    newStatus?: 'active' | 'blocked' | 'cancelled';
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Função para copiar apenas números (remove formatação)
  const copyToClipboard = async (text: string, type: string) => {
    try {
      // Remove todos os caracteres que não são números
      const numbersOnly = text.replace(/\D/g, '');
      await navigator.clipboard.writeText(numbersOnly);
      toast.success(`${type} copiado: ${numbersOnly}`);
    } catch (error) {
      toast.error(`Erro ao copiar ${type}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusColors = {
    active: 'bg-green-500/10 text-green-500',
    blocked: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-gray-500/10 text-gray-500',
    pending: 'bg-yellow-500/10 text-yellow-500'
  };

  const statusLabels = {
    active: 'Ativo',
    blocked: 'Bloqueado',
    cancelled: 'Cancelado',
    pending: 'Pendente'
  };

  const typeLabels = {
    proprietario: 'Proprietário',
    socio: 'Sócio',
    funcionario: 'Funcionário'
  };

  const formatDocument = (document: string, type: 'cpf' | 'cnpj') => {
    if (type === 'cpf') {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatWhatsApp = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleAction = async () => {
    if (!showConfirmation) return;

    try {
      if (showConfirmation.action === 'delete') {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', client.id);

        if (error) throw error;
        toast.success('Cliente excluído com sucesso');
      } else if (showConfirmation.action === 'changeStatus' && showConfirmation.newStatus) {
        // Para status 'blocked' e 'cancelled', criar/atualizar registro na tabela de aprovação
        if (showConfirmation.newStatus === 'blocked' || showConfirmation.newStatus === 'cancelled') {
          const { error: approvalError } = await supabase
            .from('client_approvals')
            .upsert({
              client_id: client.id,
              approval_status: showConfirmation.newStatus,
              approved_by: null,
              approved_at: null
            });

          if (approvalError) throw approvalError;
        }

        const statusLabels = {
          active: 'ativado',
          blocked: 'bloqueado',
          cancelled: 'cancelado'
        };

        toast.success(`Cliente ${statusLabels[showConfirmation.newStatus]} com sucesso`);
      }
      onUpdate();
    } catch (error: any) {
      toast.error('Erro ao realizar ação');
    }
    setShowConfirmation(null);
    setShowMenu(false);
  };

  const getAvailableStatuses = () => {
    const allStatuses = [
      { key: 'active', label: 'Ativo', icon: CheckCircle },
      { key: 'blocked', label: 'Bloqueado', icon: Ban },
      { key: 'cancelled', label: 'Cancelado', icon: XCircle }
    ];

    return allStatuses.filter(status => status.key !== client.status);
  };

  return (
    <div className="bg-[#21262d] rounded-lg p-4 hover:bg-[#2d333b] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white">{client.nome_fantasia}</h3>
          <div className="flex items-center text-[#8b949e] mt-1 mr-4">
            <Hash size={14} className="mr-1" />
            <span className="text-xs">{client.code}</span>
            {client.code && (
              <button
                onClick={() => copyToClipboard(client.code, 'Código')}
                className="ml-1 p-1 hover:bg-[#30363d] rounded transition-colors"
                title="Copiar código"
              >
                <Copy size={10} className="text-[#8b949e] hover:text-white" />
              </button>
            )}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-[#30363d] rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-[#8b949e]" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#161b22] rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(client);
                }}
                className="w-full px-4 py-2 text-left text-[#c9d1d9] hover:bg-[#21262d] flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </button>

              {/* Opções de status disponíveis */}
              {getAvailableStatuses().map((status) => {
                const IconComponent = status.icon;
                return (
                  <button
                    key={status.key}
                    onClick={() => setShowConfirmation({
                      action: 'changeStatus',
                      newStatus: status.key as 'active' | 'blocked' | 'cancelled'
                    })}
                    className="w-full px-4 py-2 text-left text-[#c9d1d9] hover:bg-[#21262d] flex items-center"
                  >
                    <IconComponent size={16} className="mr-2" />
                    {status.label}
                  </button>
                );
              })}

              <button
                onClick={() => setShowConfirmation({ action: 'delete' })}
                className="w-full px-4 py-2 text-left text-[#f85149] hover:bg-[#21262d] flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </button>
            </div>
          )}

          {showConfirmation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="bg-[#161b22] p-6 rounded-lg max-w-sm w-full mx-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  {showConfirmation.action === 'delete'
                    ? 'Excluir Cliente'
                    : `Alterar Status`}
                </h3>
                <p className="text-[#8b949e] mb-4">
                  {showConfirmation.action === 'delete'
                    ? 'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.'
                    : `Tem certeza que deseja alterar o status deste cliente?`}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAction}
                    variant={showConfirmation.action === 'delete' ? 'outline' : 'primary'}
                    fullWidth
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => setShowConfirmation(null)}
                    variant="secondary"
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {client.razao_social && (
          <div className="flex items-center text-[#8b949e]">
            <Building2 size={16} className="mr-2" />
            <span className="text-sm">{client.razao_social}</span>
          </div>
        )}
        <div className="flex items-center text-[#8b949e]">
          <User size={16} className="mr-2" />
          <span className="text-sm">
            {client.document_type.toUpperCase()}: {formatDocument(client.document, client.document_type)}
          </span>
          {client.document && (
            <button
              onClick={() => copyToClipboard(client.document, client.document_type === 'cpf' ? 'CPF' : 'CNPJ')}
              className="ml-1 p-1 hover:bg-[#30363d] rounded transition-colors"
              title={`Copiar ${client.document_type === 'cpf' ? 'CPF' : 'CNPJ'}`}
            >
              <Copy size={10} className="text-[#8b949e] hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {client.contacts && client.contacts.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-[#c9d1d9]">Contatos:</h4>
          {client.contacts.map((contact, index) => (
            <div key={index} className="flex items-center text-[#8b949e] space-x-2">
              <Phone size={14} />
              <span className="text-sm">{contact.name}</span>
              <span className="text-sm text-[#58a6ff]">{formatWhatsApp(contact.whatsapp)}</span>
              <span className="text-xs px-2 py-0.5 bg-[#30363d] rounded-full">
                {typeLabels[contact.type as keyof typeof typeLabels]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[client.status]}`}>
          {statusLabels[client.status]}
        </span>
      </div>
    </div>
  );
};

export default ClientCard;