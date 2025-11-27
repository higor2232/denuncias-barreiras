"use client";

import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/config'; // Ensure this path is correct
import { useRouter } from 'next/navigation';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResetMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin'); // Redirect to admin dashboard on successful login
    } catch (err) {
      console.error("Login failed: ", err);
      const error = err as { code?: string };
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        setError('Email ou senha inválidos.');
      } else {
        setError('Falha ao fazer login. Verifique o console para mais detalhes.');
      }
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      setError('Informe o email para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Se este email estiver cadastrado, um link de redefinição foi enviado.');
    } catch (err) {
      console.error('Erro ao enviar email de redefinição de senha:', err);
      setError('Não foi possível enviar o email de redefinição. Verifique o email informado ou tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Login Administrativo</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-gray-900">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {resetMessage && !error && (
            <p className="text-sm text-green-600 text-center">{resetMessage}</p>
          )}
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
