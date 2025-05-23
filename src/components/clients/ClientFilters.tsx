import React from 'react';
import { Search } from 'lucide-react';

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-[#161b22] p-4 rounded-lg">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" />
        <input
          type="text"
          placeholder="Buscar por nome, código, CNPJ/CPF ou razão social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
        />
      </div>
      {/* Filtro de status temporariamente oculto */}
      {/*
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#58a6ff]"
      >
        <option value="">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="blocked">Bloqueado</option>
        <option value="cancelled">Cancelado</option>
        <option value="pending">Pendente</option>
      </select>
      */}
    </div>
  );
};

export default ClientFilters;