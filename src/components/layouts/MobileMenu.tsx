import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  KanbanSquare, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão do menu hambúrguer */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 bg-[#238636] text-white rounded-full shadow-lg hover:bg-[#2ea043] transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={closeMenu}
        />
      )}

      {/* Menu lateral */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-[#161b22] text-white z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
          <div className="flex items-center">
            <KanbanSquare className="h-8 w-8 text-white mr-2" />
            <span className="text-xl font-semibold">Vale-sis</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informações do usuário */}
        <div className="p-4 border-b border-[#30363d]">
          <div className="flex items-center p-3 bg-[#0d1117] rounded-lg">
            <User size={20} className="text-[#8b949e] mr-3" />
            <span className="text-sm text-white truncate">{currentUser}</span>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
                }
              >
                <KanbanSquare size={20} />
                <span className="ml-3">Gestor</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/clients"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
                }
              >
                <Users size={20} />
                <span className="ml-3">Clientes</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/settings"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#21262d] hover:text-white'}`
                }
              >
                <Settings size={20} />
                <span className="ml-3">Configurações</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Botão de sair */}
        <div className="p-4 border-t border-[#30363d]">
          <button
            onClick={() => setShowLogoutConfirmation(true)}
            className="flex items-center w-full p-3 text-[#8b949e] hover:bg-[#21262d] hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
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
    </>
  );
};

export default MobileMenu;
