import React, { useState } from 'react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          toast.error(error.message || 'Erro ao fazer login');
          console.error('Erro de login:', error);
        } else if (data?.user) {
          toast.success('Login realizado com sucesso!');
          console.log('Login bem-sucedido:', data);
        }
      } catch (err) {
        console.error('Erro ao processar login:', err);
        toast.error('Erro ao processar o login');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Endereço de e-mail"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={<Mail size={16} />}
        placeholder="Seu e-mail"
      />

      <InputField
        label="Senha"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={<Lock size={16} />}
        placeholder="Sua senha"
        showPasswordToggle
      />

      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center text-sm text-[#8b949e]">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-[#238636] focus:ring-[#238636] focus:ring-offset-[#161b22]"
          />
          <span className="ml-2">Lembrar-me</span>
        </label>
        <a href="#" className="text-sm text-[#58a6ff] hover:underline">
          Esqueceu a senha?
        </a>
      </div>

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;