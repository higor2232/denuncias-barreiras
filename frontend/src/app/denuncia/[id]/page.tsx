"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import type { Report, ReportStatus } from "@/types";

const StatusBadge: React.FC<{ status?: ReportStatus }> = ({ status }) => {
  const normalized = status || "pendente";
  const map: Record<string, { label: string; classes: string }> = {
    pendente: { label: "Pendente", classes: "bg-yellow-100 text-yellow-800" },
    em_analise: { label: "Em Análise", classes: "bg-blue-100 text-blue-800" },
    aprovada: { label: "Aprovada", classes: "bg-green-100 text-green-800" },
    resolvida: { label: "Resolvida", classes: "bg-emerald-100 text-emerald-800" },
    rejeitada: { label: "Rejeitada", classes: "bg-red-100 text-red-800" },
  };
  const { label, classes } = map[normalized] || {
    label: normalized,
    classes: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
};

const DenunciaDetalhePage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "denuncias", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Nenhuma denúncia encontrada com este código.");
          setReport(null);
        } else {
          const data = snap.data() as any;
          const reportData: Report = {
            id: snap.id,
            description: data.description || "Sem descrição",
            category: data.category || "Categoria não informada",
            location: data.location || "",
            imageUrls: data.imageUrls || [],
            timestamp:
              data.createdAt?.toDate?.() != null
                ? data.createdAt.toDate().toLocaleString()
                : "Data não disponível",
            createdAt: data.createdAt,
            userInfo: data.userInfo,
            status: data.status,
          };
          setReport(reportData);
        }
      } catch (err) {
        console.error("Erro ao carregar denúncia:", err);
        setError("Ocorreu um erro ao carregar os dados da denúncia.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Acompanhamento da Denúncia
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Código da denúncia: <span className="font-mono font-semibold">{id}</span>
        </p>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
            Carregando dados da denúncia...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <p className="text-sm text-gray-600">
              Verifique se o código foi digitado corretamente ou tente novamente mais tarde.
            </p>
          </div>
        ) : report ? (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Status atual
                </p>
                <StatusBadge status={report.status} />
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Data de registro
                </p>
                <p className="text-sm text-gray-800">{report.timestamp}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Categoria
              </p>
              <p className="text-sm font-medium text-gray-900">{report.category}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Descrição
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line">{report.description}</p>
            </div>

            {typeof report.location === "object" && report.location && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Latitude
                  </p>
                  <p className="text-sm text-gray-800">{report.location.latitude}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Longitude
                  </p>
                  <p className="text-sm text-gray-800">{report.location.longitude}</p>
                </div>
              </div>
            )}

            {report.imageUrls && report.imageUrls.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Imagens enviadas
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.imageUrls.map((url, index) => (
                    <div key={index} className="relative w-full pt-[75%] overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Imagem ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Este painel é apenas para acompanhamento. Os dados pessoais eventualmente informados
              não serão exibidos publicamente.
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Entenda o status da sua denúncia
              </h3>
              <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
                <li><span className="font-semibold">Pendente:</span> denúncia recebida e aguardando análise pela equipe responsável.</li>
                <li><span className="font-semibold">Em Análise:</span> a denúncia está sendo avaliada e podem ser solicitadas verificações adicionais.</li>
                <li><span className="font-semibold">Aprovada:</span> a denúncia foi validada e passou a compor os indicadores públicos e o mapa.</li>
                <li><span className="font-semibold">Resolvida:</span> a administração tomou alguma ação para tratar o problema relatado.</li>
                <li><span className="font-semibold">Rejeitada:</span> a denúncia não pôde ser atendida (por exemplo, por falta de informações, duplicidade ou não se enquadrar no escopo ambiental).</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DenunciaDetalhePage;
