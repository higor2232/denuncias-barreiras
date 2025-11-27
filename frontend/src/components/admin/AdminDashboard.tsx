"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from './ReportDocument';
import ImageModal from './ImageModal';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, writeBatch, limit, startAfter, endBefore, getCountFromServer, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { Report, Category } from '@/types';



const PAGE_SIZE = 15;

// const initialCategoriesList = [...] // Removed as it's unused

const AdminDashboard: React.FC = () => {
  const { currentUser, isLoading: isLoadingAuth, logout } = useAuth();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // State for report filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' or category id/name
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Pendente', 'Em Análise', 'Resolvido'
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfFilteredReports, setPdfFilteredReports] = useState<Report[]>([]);
  const [currentFiltersForPdf, setCurrentFiltersForPdf] = useState({});

  // State for pagination
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // State for image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const buildFilteredQuery = () => {
    const reportsCollectionRef = collection(db, 'denuncias');
    const queryConstraints: any[] = [orderBy('createdAt', 'desc')];

    if (filterStartDate) {
      queryConstraints.push(where('createdAt', '>=', Timestamp.fromDate(new Date(filterStartDate))));
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      queryConstraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }
    if (filterCategory !== 'all') {
      queryConstraints.push(where('category', '==', filterCategory));
    }
    if (filterStatus !== 'all') {
      queryConstraints.push(where('status', '==', filterStatus));
    }

    return query(reportsCollectionRef, ...queryConstraints);
  };

  const fetchReports = useCallback(async (direction?: 'next' | 'prev') => {
    if (!currentUser) return;
    setIsLoadingReports(true);
    setReportsError(null);
    try {
      const reportsCollectionRef = collection(db, 'denuncias');
      let q;

      if (direction === 'next' && lastVisible) {
        q = query(reportsCollectionRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE));
      } else if (direction === 'prev' && firstVisible) {
        // Note: Firestore doesn't have a simple `endBefore` for descending queries that works like `startAfter`.
        // A common workaround is to reverse the query and the results, which can be complex.
        // For now, we'll simplify and just go back to the first page on 'prev'. A more robust implementation might be needed for true back-and-forth pagination.
        q = query(reportsCollectionRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        setCurrentPage(1); // Reset to page 1
      } else {
        // First page load
        const totalCountSnapshot = await getCountFromServer(collection(db, 'denuncias'));
        setTotalReports(totalCountSnapshot.data().count);
        q = query(reportsCollectionRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        setCurrentPage(1);
      }

      const reportSnapshot = await getDocs(q);
      const reportList = reportSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Data inválida',
      })) as Report[];
      
      setReports(reportList);

      if (!reportSnapshot.empty) {
        setFirstVisible(reportSnapshot.docs[0]);
        setLastVisible(reportSnapshot.docs[reportSnapshot.docs.length - 1]);
      }

      if (direction === 'next') {
        setCurrentPage(prev => prev + 1);
      }

    } catch (err) {
      console.error("Error fetching reports: ", err);
      setReportsError('Falha ao carregar denúncias.');
    }
    setIsLoadingReports(false);
  }, [currentUser, lastVisible, firstVisible]);

  const fetchCategories = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      const categoriesCollectionRef = collection(db, 'report_categories');
      const categoriesSnapshot = await getDocs(query(categoriesCollectionRef, orderBy('name')));
      
      const fetchedCategories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Error fetching categories: ", err);
      setCategoriesError('Falha ao carregar categorias.');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchReports();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // We intentionally leave fetchReports and fetchCategories out to prevent an infinite loop

  const handleGenerateCsvReport = async () => {
    setIsGeneratingCsv(true);
    try {
      const q = buildFilteredQuery();
      const reportSnapshot = await getDocs(q);
      const filteredReports = reportSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Data inválida',
      })) as Report[];

      if (filteredReports.length === 0) {
        alert('Nenhuma denúncia encontrada com os filtros selecionados.');
        return;
      }

      // Generate CSV content
      const headers = [
        'ID',
        'Data/Hora',
        'Categoria',
        'Status',
        'Descrição',
        'Latitude',
        'Longitude',
        'Nome do Usuário',
        'Email do Usuário',
        'URLs das Imagens'
      ];

      const csvRows = [headers.join(',')];

      const escapeCsvCell = (cellData: any): string => {
        if (cellData === null || cellData === undefined) return '';
        const stringData = String(cellData);
        // If data contains comma, newline, or double quote, enclose in double quotes and escape existing double quotes
        if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
          return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
      };

      filteredReports.forEach(report => {
        const row = [
          escapeCsvCell(report.id),
          escapeCsvCell(report.timestamp), // Display timestamp
          escapeCsvCell(report.category),
          escapeCsvCell(report.status || 'N/A'),
          escapeCsvCell(report.description),
          escapeCsvCell(typeof report.location === 'object' ? report.location.latitude : 'N/A'),
          escapeCsvCell(typeof report.location === 'object' ? report.location.longitude : 'N/A'),
          escapeCsvCell(report.userInfo?.name || 'N/A'),
          escapeCsvCell(report.userInfo?.email || 'N/A'),
          escapeCsvCell(report.imageUrls?.join('; ') || 'N/A')
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const dateStr = new Date().toISOString().slice(0,10);
      link.setAttribute('download', `relatorio_denuncias_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Generated CSV for ${filteredReports.length} reports.`);
    } catch (error) {
      console.error("Error generating CSV report: ", error);
      alert('Falha ao gerar o relatório CSV.');
    } finally {
      setIsGeneratingCsv(false);
    }
  };

  const handlePreparePdfReport = async () => {
    setIsGeneratingPdf(true);
    try {
      const q = buildFilteredQuery();
      const reportSnapshot = await getDocs(q);
      const filteredReports = reportSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Data inválida',
      })) as Report[];

      if (filteredReports.length === 0) {
        alert('Nenhuma denúncia encontrada para gerar o PDF com os filtros selecionados.');
        setIsGeneratingPdf(false);
        return;
      }
    
      setPdfFilteredReports(filteredReports);
      setCurrentFiltersForPdf({ startDate: filterStartDate, endDate: filterEndDate, category: filterCategory, status: filterStatus });
    } catch (error) {
      console.error("Error preparing PDF report: ", error);
      alert('Ocorreu um erro ao preparar o relatório PDF.');
      setIsGeneratingPdf(false);
    }
  };

  const handleViewImages = (imageUrls: string[] | undefined) => {
    if (imageUrls && imageUrls.length > 0) {
      setSelectedImages(imageUrls);
      setIsImageModalOpen(true);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoriesError('Por favor, insira um nome para a categoria.');
      return;
    }
    if (!currentUser) {
      setCategoriesError('Você precisa estar logado para adicionar categorias.');
      return;
    }
    if (!newCategoryName.trim()) {
      setCategoriesError('O nome da categoria não pode estar vazio.');
      return;
    }
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase());
    if (existingCategory) {
      setCategoriesError(`Categoria "${newCategoryName.trim()}" já existe.`);
      return;
    }
    setIsAddingCategory(true); // Use isAddingCategory for the add operation specifically
    setCategoriesError(null);
    try {
      const docRef = await addDoc(collection(db, 'report_categories'), { name: newCategoryName.trim() });
      setCategories(prev => [...prev, { id: docRef.id, name: newCategoryName.trim() }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      await fetchCategories(); // Refresh categories list
    } catch (err) {
      console.error("Error adding category: ", err);
      setCategoriesError('Falha ao adicionar categoria. Verifique as permissões e se está autenticado.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!currentUser) {
      setCategoriesError('Você precisa estar logado para excluir categorias.');
      return;
    }
    if (!window.confirm("Tem certeza que deseja remover esta categoria?")) return;
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      await deleteDoc(doc(db, 'report_categories', categoryId));
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error("Error deleting category: ", error);
      setCategoriesError('Falha ao excluir categoria.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando autenticação...</p></div>;
  }

  if (!currentUser) {
    // AuthProvider should handle redirection, but this is a fallback.
    return <div className="min-h-screen flex items-center justify-center"><p>Redirecionando para login...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
        >
          Sair (Logout)
        </button>
      </div>

      {/* Section for Reports */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Denúncias Recebidas</h2>
        {/* Combined loading message logic - show if loading and no reports yet, or more simply, just when loading */}
        {isLoadingReports && reports.length === 0 && <p className="text-center my-4">Carregando denúncias...</p>}
        {isLoadingReports ? (
          <div className="text-center p-10">Carregando denúncias...</div>
        ) : reportsError ? (
          <div className="text-center p-10 text-red-500">{reportsError}</div>
        ) : reports.length === 0 ? (
          <div className="text-center p-10 bg-white shadow-md rounded-lg">Nenhuma denúncia encontrada.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full table-auto text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Data</th>
                  <th scope="col" className="px-6 py-3">Categoria</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Descrição (início)</th>
                  <th scope="col" className="px-6 py-3">Tipo</th>
                  <th scope="col" className="px-6 py-3">Identificação</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{report.timestamp}</td>
                    <td className="px-6 py-4">{report.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${report.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                          report.status === 'resolvido' ? 'bg-green-100 text-green-800' : 
                          report.status === 'em_analise' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {report.status || 'Não definido'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{report.description.substring(0, 50)}{report.description.length > 50 ? '...' : ''}</td>
                    <td className="px-6 py-4">{report.userInfo?.name || report.userInfo?.email ? 'Identificada' : 'Anônima'}</td>
                    <td className="px-6 py-4">
                      {report.userInfo?.name || report.userInfo?.email ? `${report.userInfo.name || ''} (${report.userInfo.email || ''})` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewImages(report.imageUrls)}
                        disabled={!report.imageUrls || report.imageUrls.length === 0}
                        className="font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        Ver Imagens
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => fetchReports('prev')}
            disabled={currentPage === 1 || isLoadingReports}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            onClick={() => fetchReports('next')}
            disabled={reports.length < PAGE_SIZE || isLoadingReports}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
          >
            Próxima
          </button>
          <button 
            onClick={() => fetchReports()} // Ensure it calls without 'prev' or 'next' for refresh
            disabled={isLoadingReports}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Section for Category Management */}
      <div className="mt-10 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Gerenciar Categorias de Denúncia</h2>
        {isLoadingCategories ? (
          <p>Carregando categorias...</p>
        ) : categoriesError && !isLoadingCategories ? (
          // Only show general fetch error if not in the middle of an add attempt
          <p className="text-red-500 text-sm mb-2">{categoriesError}</p>
        ) : null}
        
        <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value);
              if (categoriesError) setCategoriesError(null); // Clear error on input change
            }}
            placeholder="Nome da nova categoria"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isAddingCategory || isLoadingCategories} // Input disabled if adding OR general categories loading
          />
          <button 
            type="button"
            onClick={handleAddCategory}
            disabled={isAddingCategory || isLoadingCategories || !newCategoryName.trim()} // Button disabled if adding OR general categories loading OR name is empty
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 disabled:opacity-50"
          >
            {isAddingCategory ? 'Adicionando...' : (isLoadingCategories ? 'Aguarde...' : 'Adicionar')} {/* Refined loading text */}
          </button>
        </form>
        {/* Display error specific to add operation */}
        {/* Display error specific to add operation or general category loading */}
        {categoriesError && <p className="text-red-500 text-sm mb-2">{categoriesError}</p>}

        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id} className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50 rounded-md">
              <span className="text-gray-700">{category.name}</span>
              <button 
                onClick={() => handleDeleteCategory(category.id)}
                disabled={isLoadingCategories || isAddingCategory} // Delete button disabled if general categories loading OR if an add operation is in progress
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition duration-150 disabled:opacity-50"
              >
                {(isLoadingCategories && !isAddingCategory) ? 'Aguarde...' : 'Excluir'} {/* Show 'Aguarde...' if general loading (and not during an add) */}
              </button>
            </li>
          ))}
        </ul>
        {categories.length === 0 && !isLoadingCategories && !categoriesError && <p className="text-gray-500">Nenhuma categoria cadastrada.</p>}
      </div>

      {/* Section for Report Generation */}
      <div className="mt-10 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Gerar Relatórios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700 mb-1">Data Inicial:</label>
            <input 
              type="date" 
              id="filterStartDate"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700 mb-1">Data Final:</label>
            <input 
              type="date" 
              id="filterEndDate"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoria:</label>
            <select 
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
            <select 
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Resolvido">Resolvido</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleGenerateCsvReport}
            disabled={isLoadingReports || isGeneratingCsv}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
          >
            {isGeneratingCsv ? 'Gerando CSV...' : 'Gerar Relatório CSV'}
          </button>
          <button 
            onClick={handlePreparePdfReport}
            disabled={isLoadingReports || isGeneratingPdf || isGeneratingCsv}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isGeneratingPdf ? 'Preparando PDF...' : (isLoadingReports ? 'Aguarde...' : 'Gerar PDF para Download')}
          </button>
          {pdfFilteredReports.length > 0 && !isGeneratingPdf ? (
            <PDFDownloadLink 
              document={<ReportDocument reports={pdfFilteredReports} filters={currentFiltersForPdf} />}
              fileName={`relatorio_denuncias_${new Date().toISOString().slice(0,10)}.pdf`}
              className="ml-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              {({ blob, url, loading, error }) => 
                loading ? 'Gerando PDF...' : 'Baixar PDF'
              }
            </PDFDownloadLink>
          ) : null}
        </div>
      </div>

      {isImageModalOpen && <ImageModal imageUrls={selectedImages} onClose={() => setIsImageModalOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;


