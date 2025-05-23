import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import KanbanClientCard from '../components/kanban/KanbanClientCard';
import { useIsMobile } from '../hooks/useIsMobile';

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
  status: 'active' | 'blocked' | 'cancelled' | 'pending';
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

interface Column {
  id: string;
  title: string;
  status: 'cancelled' | 'blocked' | 'pending' | 'active';
}

const columns: Column[] = [
  { id: 'cancelled', title: 'Cancelados', status: 'cancelled' },
  { id: 'blocked', title: 'Bloqueados', status: 'blocked' },
  { id: 'pending', title: 'Liberar', status: 'pending' },
  { id: 'active', title: 'Liberados', status: 'active' }
];

const KanbanPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ClientApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile(600);

  useEffect(() => {
    fetchData();
    getCurrentUser();
  }, []);

  // Filtrar aprovações baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApprovals(approvals);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = approvals.filter(approval => {
        const client = approval.client;
        return (
          client.nome_fantasia.toLowerCase().includes(searchTermLower) ||
          client.code.toLowerCase().includes(searchTermLower) ||
          client.document.replace(/\D/g, '').includes(searchTermLower.replace(/\D/g, '')) ||
          (client.razao_social && client.razao_social.toLowerCase().includes(searchTermLower))
        );
      });
      setFilteredApprovals(filtered);
    }
  }, [approvals, searchTerm]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        setCurrentUser(profile?.username || user.email || 'Usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const fetchData = async () => {
    try {
      const { data: approvalsData, error } = await supabase
        .from('client_approvals')
        .select(`
          *,
          client:clients(
            *,
            client_contacts(*)
          )
        `);

      if (error) throw error;

      const formattedApprovals = approvalsData?.map(approval => ({
        ...approval,
        client: {
          ...approval.client,
          contacts: approval.client.client_contacts || []
        }
      })) || [];

      setApprovals(formattedApprovals);
      setFilteredApprovals(formattedApprovals);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiberar = async (approvalId: string) => {
    try {
      const { error } = await supabase
        .from('client_approvals')
        .update({
          approval_status: 'pending',
          approved_by: null,
          approved_at: null
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast.success('Cliente movido para liberação');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao mover cliente');
      console.error('Error:', error);
    }
  };

  const handleLiberado = async (approvalId: string) => {
    try {
      const { error } = await supabase
        .from('client_approvals')
        .update({
          approval_status: 'active',
          approved_by: currentUser,
          approved_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast.success('Cliente liberado com sucesso');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao liberar cliente');
      console.error('Error:', error);
    }
  };

  const handleRestaurar = async (approvalId: string) => {
    try {
      // Buscar o registro atual para determinar o estado anterior
      const { data: currentApproval, error: fetchError } = await supabase
        .from('client_approvals')
        .select('approval_status')
        .eq('id', approvalId)
        .single();

      if (fetchError) throw fetchError;

      // Definir o estado anterior baseado no status atual
      let previousStatus: string;
      switch (currentApproval.approval_status) {
        case 'pending':
          previousStatus = 'blocked';
          break;
        case 'active':
          previousStatus = 'pending';
          break;
        case 'blocked':
          previousStatus = 'cancelled';
          break;
        default:
          previousStatus = 'cancelled';
      }

      const { error } = await supabase
        .from('client_approvals')
        .update({
          approval_status: previousStatus,
          approved_by: previousStatus === 'active' ? currentUser : null,
          approved_at: previousStatus === 'active' ? new Date().toISOString() : null
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast.success('Cliente restaurado ao estado anterior');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao restaurar cliente');
      console.error('Error:', error);
    }
  };

  const handleLimpar = async (approvalId: string) => {
    try {
      const { error } = await supabase
        .from('client_approvals')
        .delete()
        .eq('id', approvalId);

      if (error) throw error;

      toast.success('Cliente removido do gestor de status');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao limpar cliente');
      console.error('Error:', error);
    }
  };




  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8b949e]">Carregando...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-white">Gestor de Status</h1>

        {/* Campo de busca */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Buscar por nome, código, CNPJ/CPF ou razão social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        {/* Kanban horizontal com scroll */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map(column => (
              <div key={column.id} className="bg-[#161b22] rounded-lg p-4 w-72 flex-shrink-0">
                <h2 className="text-lg font-medium text-white mb-4">{column.title}</h2>

                <div className="space-y-3 min-h-[300px]">
                  {filteredApprovals
                    .filter(approval => approval.approval_status === column.status)
                    .map((approval) => (
                      <KanbanClientCard
                        key={approval.id}
                        approval={approval}
                        onLiberar={handleLiberar}
                        onLiberado={handleLiberado}
                        onRestaurar={handleRestaurar}
                        onLimpar={handleLimpar}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Gestor de Status</h1>

      {/* Campo de busca */}
      <div className="relative max-w-md">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" />
        <input
          type="text"
          placeholder="Buscar por nome, código, CNPJ/CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.id} className="bg-[#161b22] rounded-lg p-4">
            <h2 className="text-lg font-medium text-white mb-4">{column.title}</h2>

            <div className="space-y-3 min-h-[200px]">
              {filteredApprovals
                .filter(approval => approval.approval_status === column.status)
                .map((approval) => (
                  <KanbanClientCard
                    key={approval.id}
                    approval={approval}
                    onLiberar={handleLiberar}
                    onLiberado={handleLiberado}
                    onRestaurar={handleRestaurar}
                    onLimpar={handleLimpar}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;