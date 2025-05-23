import React from 'react';
import { Hash, User, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

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
  status: 'active' | 'blocked' | 'cancelled' | 'pending'; // Status original do cliente
  contacts: Contact[];
}

interface ClientApproval {
  id: string;
  client_id: string;
  approval_status: 'cancelled' | 'blocked' | 'pending' | 'active';
  approved_by?: string;
  approved_at?: string;
  client: Client;
}

interface KanbanClientCardProps {
  approval: ClientApproval;
  onLiberar?: (approvalId: string) => void;
  onLiberado?: (approvalId: string) => void;
  onRestaurar?: (approvalId: string) => void;
  onLimpar?: (approvalId: string) => void;
}

const KanbanClientCard: React.FC<KanbanClientCardProps> = ({
  approval,
  onLiberar,
  onLiberado,
  onRestaurar,
  onLimpar
}) => {
  const { client } = approval;
  const formatDocument = (document: string, type: 'cpf' | 'cnpj') => {
    if (type === 'cpf') {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled': return 'bg-gray-500/10 text-gray-500';
      case 'blocked': return 'bg-red-500/10 text-red-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'active': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'cancelled': return 'Cancelado';
      case 'blocked': return 'Bloqueado';
      case 'pending': return 'Pendente';
      case 'active': return 'Liberado';
      default: return status;
    }
  };

  return (
    <div className="bg-[#21262d] rounded-lg p-3 hover:bg-[#2d333b] transition-colors">
      {/* Header com nome e código */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white truncate">{client.nome_fantasia}</h3>
          <div className="flex items-center text-[#8b949e] mt-1">
            <Hash size={12} className="mr-1" />
            <span className="text-xs">{client.code}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(approval.approval_status)}`}>
          {getStatusLabel(approval.approval_status)}
        </span>
      </div>

      {/* Documento */}
      <div className="flex items-center text-[#8b949e] mb-3">
        <User size={12} className="mr-1" />
        <span className="text-xs">
          {client.document_type.toUpperCase()}: {formatDocument(client.document, client.document_type)}
        </span>
      </div>

      {/* Contato principal (primeiro da lista) */}
      {client.contacts && client.contacts.length > 0 && (
        <div className="text-xs text-[#8b949e] mb-3">
          <span className="font-medium">{client.contacts[0].name}</span>
          <span className="ml-2 text-[#58a6ff]">
            {client.contacts[0].whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
          </span>
        </div>
      )}

      {/* Informação de aprovação para clientes liberados */}
      {approval.approval_status === 'active' && approval.approved_by && (
        <div className="flex items-center text-xs text-[#8b949e] mb-3 p-2 bg-[#0d1117] rounded">
          <CheckCircle size={12} className="mr-1 text-green-500" />
          <span>Liberado por: <span className="text-white font-medium">{approval.approved_by}</span></span>
        </div>
      )}

      {/* Botões de ação */}
      <div className="space-y-2 mt-3">
        {/* Botão principal baseado no status */}
        <div className="flex gap-2">
          {/* Botão Liberar - para clientes cancelados e bloqueados */}
          {(approval.approval_status === 'cancelled' || approval.approval_status === 'blocked') && onLiberar && (
            <Button
              onClick={() => onLiberar(approval.id)}
              variant="primary"
              size="sm"
              fullWidth
            >
              Liberar
            </Button>
          )}

          {approval.approval_status === 'pending' && onLiberado && (
            <Button
              onClick={() => onLiberado(approval.id)}
              variant="primary"
              size="sm"
              fullWidth
            >
              Liberado
            </Button>
          )}

          {approval.approval_status === 'active' && onLimpar && (
            <Button
              onClick={() => onLimpar(approval.id)}
              variant="outline"
              size="sm"
              fullWidth
            >
              <Trash2 size={14} className="mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Botão Restaurar - disponível para bloqueados, pendentes e liberados */}
        {(approval.approval_status === 'blocked' || approval.approval_status === 'pending' || approval.approval_status === 'active') && onRestaurar && (
          <Button
            onClick={() => onRestaurar(approval.id)}
            variant="secondary"
            size="sm"
            fullWidth
          >
            <RotateCcw size={14} className="mr-1" />
            Restaurar
          </Button>
        )}
      </div>
    </div>
  );
};

export default KanbanClientCard;
