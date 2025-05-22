import React, { useState } from 'react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
      isValid = false;
    }
    
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                username: formData.username,
                is_admin: true
              }
            ]);

          if (profileError) throw profileError;

          toast.success('Conta criada com sucesso!');
          // Reset form
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      } catch (error: any) {
        console.error('Erro ao criar conta:', error);
        toast.error(error.message || 'Erro ao criar conta. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Nome de usuário"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        icon={<User size={16} />}
        placeholder="Seu nome de usuário"
        disabled={loading}
      />

      <InputField
        label="Endereço de e-mail"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={<Mail size={16} />}
        placeholder="Seu e-mail"
        disabled={loading}
      />

      <InputField
        label="Senha"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={<Lock size={16} />}
        placeholder="Criar uma senha"
        showPasswordToggle
        disabled={loading}
      />

      <InputField
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        icon={<Lock size={16} />}
        placeholder="Confirmar sua senha"
        showPasswordToggle
        disabled={loading}
      />

      <Button type="submit" fullWidth className="mt-6" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;