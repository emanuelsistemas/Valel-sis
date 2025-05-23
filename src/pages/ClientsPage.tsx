import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ClientCard from '../components/clients/ClientCard';
import ClientFilters from '../components/clients/ClientFilters';
import ClientForm from '../components/clients/ClientForm';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

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

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      const clientsWithContacts = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { data: contacts, error: contactsError } = await supabase
            .from('client_contacts')
            .select('*')
            .eq('client_id', client.id);

          if (contactsError) throw contactsError;

          return {
            ...client,
            contacts: contacts || []
          };
        })
      );

      setClients(clientsWithContacts);
    } catch (error: any) {
      toast.error('Erro ao carregar clientes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
    fetchClients();
  };

  const filteredClients = clients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      client.nome_fantasia.toLowerCase().includes(searchTermLower) ||
      client.code.toLowerCase().includes(searchTermLower) ||
      client.document.toLowerCase().includes(searchTermLower) ||
      (client.razao_social && client.razao_social.toLowerCase().includes(searchTermLower))
    );
    const matchesStatus = !selectedStatus || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Clientes</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {loading ? (
        <div className="text-center py-8 text-[#8b949e]">
          Carregando clientes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onUpdate={fetchClients}
            />
          ))}
        </div>
      )}

      {!loading && filteredClients.length === 0 && (
        <div className="text-center py-8 text-[#8b949e]">
          Nenhum cliente encontrado com os filtros selecionados.
        </div>
      )}

      <ClientForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsPage;