import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  KanbanSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.');
    }
    setShowLogoutConfirmation(false);
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

      <div className="p-4 border-t border-[#30363d] space-y-3">
        {/* Informações do usuário */}
        <div className="flex items-center p-3 bg-[#0d1117] rounded-lg">
          <User size={20} className="text-[#8b949e]" />
          {isExpanded && (
            <span className="ml-3 text-sm text-white truncate">{currentUser}</span>
          )}
        </div>

        {/* Botão de sair */}
        <button
          onClick={() => setShowLogoutConfirmation(true)}
          className="flex items-center w-full p-3 text-[#8b949e] hover:bg-[#21262d] hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {isExpanded && <span className="ml-3">Sair</span>}
        </button>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-2">
              Confirmar saída
            </h3>
            <p className="text-[#8b949e] mb-4">
              Tem certeza que deseja sair do sistema?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSignOut}
                variant="outline"
                fullWidth
              >
                Confirmar
              </Button>
              <Button
                onClick={() => setShowLogoutConfirmation(false)}
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

export default Sidebar;