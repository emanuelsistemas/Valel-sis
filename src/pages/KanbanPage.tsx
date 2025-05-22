import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { MoreVertical, Building2, Hash, Phone, User, Ban, X, Check, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

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
  status: 'cancelled' | 'blocked' | 'pending' | 'active';
  contacts: Contact[];
}

interface Column {
  id: string;
  title: string;
  status: 'cancelled' | 'blocked' | 'pending' | 'active';
}

interface StatusWorkflow {
  current_status: Client['status'];
  next_status: Client['status'];
}

const columns: Column[] = [
  { id: 'cancelled', title: 'Cancelados', status: 'cancelled' },
  { id: 'blocked', title: 'Bloqueados', status: 'blocked' },
  { id: 'pending', title: 'Liberar', status: 'pending' },
  { id: 'active', title: 'Liberados', status: 'active' }
];

const KanbanPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [workflow, setWorkflow] = useState<StatusWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    clientId: string;
    newStatus: Client['status'] | null;
  }>({ clientId: '', newStatus: null });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.client-menu')) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [clientsResponse, workflowResponse] = await Promise.all([
        supabase
          .from('clients')
          .select('*, client_contacts(*)'),
        supabase
          .from('status_workflow')
          .select('*')
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (workflowResponse.error) throw workflowResponse.error;

      setClients(clientsResponse.data.map(client => ({
        ...client,
        contacts: client.client_contacts || []
      })));
      setWorkflow(workflowResponse.data);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatuses = (currentStatus: Client['status']) => {
    return workflow
      .filter(w => w.current_status === currentStatus)
      .map(w => w.next_status);
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = columns.find(col => col.id === destination.droppableId)?.status;
    if (!newStatus) return;

    const client = clients.find(c => c.id === draggableId);
    if (!client) return;

    const availableStatuses = getAvailableStatuses(client.status);
    if (!availableStatuses.includes(newStatus)) {
      toast.error('Transição de status não permitida');
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      const updatedClients = clients.map(client => 
        client.id === draggableId 
          ? { ...client, status: newStatus }
          : client
      );
      setClients(updatedClients);

      toast.success('Status do cliente atualizado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao atualizar status do cliente');
      fetchData();
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: Client['status']) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      const updatedClients = clients.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus }
          : client
      );
      setClients(updatedClients);

      toast.success('Status do cliente atualizado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao atualizar status do cliente');
    }
    setShowConfirmation({ clientId: '', newStatus: null });
    setShowMenu(null);
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'cancelled': return <X size={16} />;
      case 'blocked': return <Ban size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'active': return <Check size={16} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case 'cancelled': return 'Cancelar';
      case 'blocked': return 'Bloquear';
      case 'pending': return 'Liberar';
      case 'active': return 'Ativar';
      default: return '';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8b949e]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Gestor de Status</h1>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className="bg-[#161b22] rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4">{column.title}</h2>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-[#21262d]' : ''
                    }`}
                  >
                    {clients
                      .filter(client => client.status === column.status)
                      .map((client, index) => (
                        <Draggable
                          key={client.id}
                          draggableId={client.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 transition-transform ${
                                snapshot.isDragging ? 'scale-105' : ''
                              }`}
                            >
                              <div className="bg-[#21262d] rounded-lg p-4 hover:bg-[#2d333b] transition-colors">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-white">{client.nome_fantasia}</h3>
                                    <div className="flex items-center text-[#8b949e] mt-1">
                                      <Hash size={14} className="mr-1" />
                                      <span className="text-xs">{client.code}</span>
                                    </div>
                                  </div>
                                  <div className="relative client-menu">
                                    <button 
                                      onClick={() => setShowMenu(showMenu === client.id ? null : client.id)}
                                      className="p-1 hover:bg-[#30363d] rounded-lg transition-colors"
                                    >
                                      <MoreVertical size={20} className="text-[#8b949e]" />
                                    </button>
                                    
                                    {showMenu === client.id && (
                                      <div className="absolute right-0 mt-2 w-48 bg-[#161b22] rounded-lg shadow-lg z-10 py-1">
                                        {getAvailableStatuses(client.status).map(status => (
                                          <button
                                            key={status}
                                            onClick={() => setShowConfirmation({
                                              clientId: client.id,
                                              newStatus: status
                                            })}
                                            className="w-full px-4 py-2 text-left text-[#c9d1d9] hover:bg-[#21262d] flex items-center"
                                          >
                                            {getStatusIcon(status)}
                                            <span className="ml-2">{getStatusLabel(status)}</span>
                                          </button>
                                        ))}
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
                                          {contact.type}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showConfirmation.newStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-[#161b22] p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-2">
              Confirmar alteração de status
            </h3>
            <p className="text-[#8b949e] mb-4">
              Tem certeza que deseja alterar o status deste cliente para {getStatusLabel(showConfirmation.newStatus)}?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusChange(showConfirmation.clientId, showConfirmation.newStatus!)}
                variant="primary"
                fullWidth
              >
                Confirmar
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation({ clientId: '', newStatus: null });
                  setShowMenu(null);
                }}
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
  );
};

export default KanbanPage;