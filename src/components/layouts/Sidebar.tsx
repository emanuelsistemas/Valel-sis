import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  KanbanSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import Logo from '../ui/Logo';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.');
    }
  };

  return (
    <div 
      className={`bg-[#161b22] text-white transition-all duration-300 flex flex-col
      ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-[#30363d]">
        <Logo isExpanded={isExpanded} className="transition-all duration-300" />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors
                ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
              }
            >
              <KanbanSquare size={20} />
              {isExpanded && <span className="ml-3">Gestor</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/clients"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors
                ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
              }
            >
              <Users size={20} />
              {isExpanded && <span className="ml-3">Clientes</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors
                ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
              }
            >
              <Settings size={20} />
              {isExpanded && <span className="ml-3">Configurações</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-[#30363d]">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full p-3 text-[#8b949e] hover:bg-[#21262d] hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {isExpanded && <span className="ml-3">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;