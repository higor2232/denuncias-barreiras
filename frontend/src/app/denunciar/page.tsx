// src/app/denunciar/page.tsx
import React from 'react';
import ReportForm from '@/components/ReportForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fazer Denúncia',
  description: 'Registre uma denúncia ambiental de forma rápida e segura.',
};

const DenunciarPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Registrar Denúncia</h1>
          <p className="text-gray-600 mt-2">
            Preencha o formulário abaixo para reportar um problema ambiental
          </p>
        </div>
        <ReportForm />
      </div>
    </div>
  );
};

export default DenunciarPage;
