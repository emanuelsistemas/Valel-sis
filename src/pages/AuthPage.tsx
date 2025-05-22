import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Logo from '../components/ui/Logo';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
          <Logo />
        </div>
        
        <div className="bg-[#161b22] rounded-md shadow-lg overflow-hidden transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              {isLogin ? 'Entrar' : 'Criar sua conta'}
            </h2>
            
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>
          
          <div className="bg-[#0d1117] p-4 text-center border-t border-[#30363d]">
            <p className="text-sm text-[#8b949e]">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button 
                onClick={toggleForm}
                className="text-[#58a6ff] hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? 'Criar uma conta' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage