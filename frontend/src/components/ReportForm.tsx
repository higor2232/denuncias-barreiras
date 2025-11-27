// src/components/ReportForm.tsx
"use client"; 

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// Firebase imports
import { db, storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

interface Category {
  id: string;
  name: string;
}

const ReportForm = () => {
  // Estados para os campos do formulário
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<'anonymous' | 'identified'>('anonymous');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For capturing image

  // State for categories fetched from Firestore
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Novos estados para submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  // States for manual timestamp
  const [enableManualTimestamp, setEnableManualTimestamp] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');

  useEffect(() => {
    const fetchCategoriesList = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesCollectionRef = collection(db, 'report_categories');
        const q = query(categoriesCollectionRef, orderBy('name'));
        const categoriesSnapshot = await getDocs(q);
        const fetchedCategories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name as string,
        })) as Category[];
        setCategoriesList(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories for form: ", error);
        // Optionally set an error state for categories loading, e.g., setCategoriesError('Failed to load categories');
      }
      setIsLoadingCategories(false);
    };

    fetchCategoriesList();
  }, []); // Empty dependency array to run once on mount

  const resetForm = () => {
    setDescription('');
    setReportType('anonymous');
    setName('');
    setEmail('');
    setCategory('');
    setOtherCategory('');
    setImages([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url)); // Revoke old previews
    setImagePreviews([]);
    setImageErrors([]);
    setLatitude('');
    setLongitude('');
    setLocationStatus('');
    setEnableManualTimestamp(false);
    setManualDate('');
    setManualTime('');
    // Consider not clearing submitMessage here, or clearing it after a delay
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Basic validation checks
    if (description.trim() === '') {
        setSubmitMessage('A descrição do problema é obrigatória.');
        setIsSubmitting(false);
        return;
    }
    if (reportType === 'identified' && (name.trim() === '' || email.trim() === '')) {
        setSubmitMessage('Nome e email são obrigatórios para denúncia identificada.');
        setIsSubmitting(false);
        return;
    }
    if (category === '') {
        setSubmitMessage('A categoria da denúncia é obrigatória.');
        setIsSubmitting(false);
        return;
    }
    if (category === 'Outros' && otherCategory.trim() === '') {
        setSubmitMessage('Por favor, especifique a categoria "Outros".');
        setIsSubmitting(false);
      return;
  }

  // Validation for manual timestamp
  if (enableManualTimestamp && (!manualDate || !manualTime)) {
    setSubmitMessage('Data e Hora do ocorrido são obrigatórios quando a opção manual está habilitada.');
    setIsSubmitting(false);
    return;
  }

    try {
      const imageUrls: string[] = [];
      if (images.length > 0) {
        const uploadPromises: Promise<string>[] = images.map(async (imageFile): Promise<string> => {
          const imagePath = `denuncias_imagens/${Date.now()}_${imageFile.name}`;
          console.log('Firebase Storage imagePath:', imagePath);
          const imageRef = ref(storage, imagePath);
          const snapshot = await uploadBytesResumable(imageRef, imageFile);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          return downloadUrl;
        });
        // Wait for all image uploads to complete
        const resolvedUrls: string[] = await Promise.all(uploadPromises);
        imageUrls.push(...resolvedUrls);
      }

      // Prepare data for Firestore
      const reportData = {
        reportType,
        name: reportType === 'identified' ? name : '',
        email: reportType === 'identified' ? email : '',
        description,
        category: category === 'Outros' ? otherCategory.trim() : category,
        location: {
          latitude: latitude ? parseFloat(latitude) : null, // Convert to number, handle empty string
          longitude: longitude ? parseFloat(longitude) : null, // Convert to number, handle empty string
        },
        // locationStatus, // Storing raw locationStatus might not be ideal. Consider storing a boolean for success or the error code.
        imageUrls,
      status: 'pendente', // Default status
      createdAt: enableManualTimestamp 
        ? Timestamp.fromDate(new Date(`${manualDate}T${manualTime}`)) 
        : Timestamp.now(),
    };

      // Add document to Firestore
      await addDoc(collection(db, 'denuncias'), reportData);

      setSubmitMessage('Denúncia enviada com sucesso!');
      resetForm();

    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      let errorMessage = 'Falha ao enviar denúncia.';
      if (error instanceof Error) {
        errorMessage += ` Detalhes: ${error.message}`;
      }
      // Check for specific Firebase errors (e.g., permissions)
      if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: string }).code === 'string') {
        const typedError = error as { code?: string; message?: string };
        const errorCode = typedError.code as string;
        const firebaseMessage: string | undefined = typedError.message;

        if (errorCode === 'storage/unauthorized') {
          errorMessage = 'Erro de permissão ao enviar imagem. Verifique as regras do Firebase Storage.';
          if (firebaseMessage) errorMessage += ` (Detalhes: ${firebaseMessage})`;
        } else if (errorCode === 'permission-denied' && firebaseMessage && firebaseMessage.toLowerCase().includes('firestore')) {
          errorMessage = 'Erro de permissão ao salvar dados. Verifique as regras do Firestore.';
          if (firebaseMessage) errorMessage += ` (Detalhes: ${firebaseMessage})`;
        } else if (firebaseMessage) {
          // Generic Firebase error with a message not specifically handled above
          errorMessage = `Erro do Firebase: ${firebaseMessage} (código: ${errorCode})`;
        } else {
          // Firebase error with a code but no message, or message not a string
          errorMessage = `Erro do Firebase (código: ${errorCode})`;
        }
      }
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const MAX_IMAGES = 2;
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: File[] = [...images];
    const newPreviews: string[] = [...imagePreviews];
    const currentErrors: string[] = []; // Reset errors for current batch

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (newImages.length >= MAX_IMAGES) {
        currentErrors.push(`Você pode enviar no máximo ${MAX_IMAGES} imagens.`);
        break; 
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        currentErrors.push(`Formato de arquivo inválido: ${file.name}. Use .jpg ou .png.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        currentErrors.push(`Arquivo muito grande: ${file.name}. Máximo ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      // Compress image
      const options = {
        maxSizeMB: MAX_FILE_SIZE_MB, // From project rules
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        newImages.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        currentErrors.push(`Erro ao processar imagem ${file.name}. Tente novamente ou use outra imagem.`);
        // Optionally, push the original file if compression fails and it's within limits
        // newImages.push(file);
        // newPreviews.push(URL.createObjectURL(file));
      }
    }

    setImages(newImages);
    setImagePreviews(newPreviews);
    setImageErrors(currentErrors); // Set only new errors from this batch
    event.target.value = ''; 
  };

  const handleGetCurrentLocation = () => {
    setLocationStatus('');
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setLocationStatus('Localização GPS obtida com sucesso!');
          setIsFetchingLocation(false);
        },
        (error) => {
          let message = 'Erro ao obter localização GPS: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message += 'Permissão para acessar a localização foi negada. Verifique as configurações do seu navegador/dispositivo.';
              break;
            case error.POSITION_UNAVAILABLE:
              message += 'Não foi possível determinar sua localização atual. Tente novamente ou insira manualmente.';
              break;
            case error.TIMEOUT:
              message += 'A solicitação de localização demorou muito para responder. Tente novamente.';
              break;
            default:
              message += `Ocorreu um erro desconhecido (código: ${error.code}).`;
              break;
          }
          setLocationStatus(message);
          console.error("Geolocation error:", error);
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('Geolocalização não é suportada por este navegador.');
      setIsFetchingLocation(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (imagePreviews[indexToRemove]) {
        URL.revokeObjectURL(imagePreviews[indexToRemove]);
    }
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(updatedImagePreviews);
    
    // Clear general "max images" error if we are now below the limit
    if (updatedImages.length < MAX_IMAGES) {
        setImageErrors(prevErrors => prevErrors.filter(err => !err.includes("máximo ${MAX_IMAGES} imagens")));
    }
    // If all images are removed, clear all errors.
    if (updatedImages.length === 0) { 
        setImageErrors([]);
    }
  };

  const handleOpenCamera = async () => {
    setCameraError('');
    if (images.length >= MAX_IMAGES) {
      setImageErrors([`Você já atingiu o limite de ${MAX_IMAGES} imagens.`]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCameraModal(true);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      if (err instanceof Error) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("Nenhuma câmera encontrada. Verifique se uma câmera está conectada e habilitada.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Permissão para acessar a câmera foi negada. Verifique as configurações do seu navegador.");
        } else {
          setCameraError(`Erro ao acessar a câmera: ${err.message}`);
        }
      } else {
        setCameraError("Ocorreu um erro desconhecido ao tentar acessar a câmera.");
      }
      setShowCameraModal(false);
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
    // Cleanup function to stop the stream when the modal is closed or component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => { // Make callback async
          if (blob) {
            if (images.length < MAX_IMAGES) {
              const fileName = `captured_image_${Date.now()}.jpg`;
              const newImageFile = new File([blob], fileName, { type: 'image/jpeg' });

              // Compress image
              const options = {
                maxSizeMB: MAX_FILE_SIZE_MB, 
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              };

              try {
                console.log(`Captured original file size: ${(newImageFile.size / 1024 / 1024).toFixed(2)} MB`);
                const compressedFile = await imageCompression(newImageFile, options);
                console.log(`Captured compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                setImages(prevImages => [...prevImages, compressedFile]);
                setImagePreviews(prevPreviews => [...prevPreviews, URL.createObjectURL(compressedFile)]);
                setImageErrors([]); // Clear previous image errors on successful capture and compression
              } catch (error) {
                console.error('Erro ao comprimir imagem capturada:', error);
                setImageErrors(prev => [...prev, `Erro ao processar imagem capturada. Tente novamente.`]);
              }
            } else {
              setImageErrors([`Você pode enviar no máximo ${MAX_IMAGES} imagens.`]);
            }
          } else {
            setCameraError('Falha ao converter imagem capturada.');
          }
        }, 'image/jpeg', 0.9); 
      } else {
        setCameraError('Falha ao obter contexto do canvas para captura.');
      }

      // Stop camera stream and close modal regardless of capture success/failure
      if (cameraStream && typeof cameraStream.getTracks === 'function') {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null); 
      }
      setShowCameraModal(false);
    } else {
      setCameraError('Referências da câmera ou stream não estão disponíveis para captura.');
      setShowCameraModal(false); 
    }
  };


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-xl rounded-2xl">
      {/* Tipo de Denúncia */}
      <fieldset className="border border-gray-200 p-4 rounded-xl">
        <legend className="text-md font-semibold text-gray-700 px-2">Tipo de Denúncia:</legend>
        <div className="flex items-center space-x-6 pt-2">
          <div className="flex items-center">
            <input
              id="anonymous"
              name="reportType"
              type="radio"
              value="anonymous"
              checked={reportType === 'anonymous'}
              onChange={() => setReportType('anonymous')}
              className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
              disabled={isSubmitting}
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm font-medium text-gray-700">
              Anônima
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="identified"
              name="reportType"
              type="radio"
              value="identified"
              checked={reportType === 'identified'}
              onChange={() => setReportType('identified')}
              className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
              disabled={isSubmitting}
            />
            <label htmlFor="identified" className="ml-2 block text-sm font-medium text-gray-700">
              Identificada
            </label>
          </div>
        </div>
      </fieldset>

      {reportType === 'identified' && (
        <fieldset className="border p-4 rounded-md">
          <legend className="text-md font-semibold text-gray-700 px-2">Identificação (Obrigatório)</legend>
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={reportType === 'identified'}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email: <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={reportType === 'identified'}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="border p-4 rounded-md">
        <legend className="text-md font-semibold text-gray-700 px-2">Detalhes da Denúncia</legend>
        <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria da Denúncia: <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isSubmitting || isLoadingCategories} // Disable while loading categories
              >
                <option value="" disabled>
                  {isLoadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
                </option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {/* Ensure 'Outros' is handled: if it's always available and not from DB, add static option here */}
                {/* <option value="Outros">Outros</option> */}
              </select>
            </div>

            {category === 'Outros' && (
              <div>
                <label htmlFor="otherCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Especifique a Categoria (Outros): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="otherCategory"
                  id="otherCategory"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  required={category === 'Outros'}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Problema: <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
        </div>
      </fieldset>

      {/* Manual Timestamp Override Section */}
      <fieldset className="mt-6 border p-4 rounded-md">
        <legend className="text-md font-semibold text-gray-700 px-2">Data/Hora da Ocorrência</legend>
        <div className="pt-2">
          <div className="flex items-center mb-4">
            <input
              id="enableManualTimestamp"
              name="enableManualTimestamp"
              type="checkbox"
              checked={enableManualTimestamp}
              onChange={(e) => setEnableManualTimestamp(e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={isSubmitting}
            />
            <label htmlFor="enableManualTimestamp" className="ml-2 block text-sm font-medium text-gray-700">
              Informar data/hora do ocorrido manualmente?
            </label>
          </div>

          {enableManualTimestamp && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="manualDate" className="block text-sm font-medium text-gray-700">
                  Data do Ocorrido <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="manualDate"
                    id="manualDate"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 bg-white text-gray-900"
                    disabled={isSubmitting}
                    required={enableManualTimestamp}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="manualTime" className="block text-sm font-medium text-gray-700">
                  Hora do Ocorrido (aproximada) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="manualTime"
                    id="manualTime"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 bg-white text-gray-900"
                    disabled={isSubmitting}
                    required={enableManualTimestamp}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </fieldset>

      {/* Localização da Ocorrência Section */}
      <fieldset className="mt-6 border p-4 rounded-md">
        <legend className="text-md font-semibold text-gray-700 px-2">Localização da Ocorrência</legend>
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || isFetchingLocation}
          >
            {isFetchingLocation ? 'Buscando...' : 'Obter Localização Atual (GPS)'}
          </button>
          {locationStatus && <p className={`text-sm ${locationStatus.includes('sucesso') ? 'text-green-600' : locationStatus.includes('negada') || locationStatus.includes('Erro') || locationStatus.includes('indisponível') ? 'text-red-600' : 'text-yellow-600'}`}>{locationStatus}</p>}
          
          <p className="text-xs text-gray-500 text-center sm:text-left my-2">Ou preencha manualmente:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude:
              </label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ex: -23.5505200"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude:
              </label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm text-gray-900 bg-white p-2"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ex: -46.6333080"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* Evidências (Imagens) Section */}
      <fieldset className="mt-6 border p-4 rounded-md">
        <legend className="text-md font-semibold text-gray-700 px-2">Evidências (Imagens)</legend>
        <div className="pt-2">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            Imagens (até {MAX_IMAGES}, .jpg ou .png, máx {MAX_FILE_SIZE_MB}MB cada):
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 disabled:opacity-50"
            disabled={isSubmitting || images.length >= MAX_IMAGES}
          />
          <button
            type="button"
            onClick={handleOpenCamera}
            className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={isSubmitting || images.length >= MAX_IMAGES}
          >
            Tirar Foto
          </button>
          {imageErrors.length > 0 && (
            <div className="mt-2 text-sm text-red-600 space-y-1">
              {imageErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={400}
                    height={300}
                    unoptimized
                    className="w-full h-32 object-cover rounded-md shadow-md"
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-75 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    aria-label="Remover imagem"
                    disabled={isSubmitting}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
        </button>
        {submitMessage && (
          <p className={`mt-4 text-sm text-center font-medium ${submitMessage.includes('sucesso') ? 'text-green-700' : 'text-red-700'}`}>
            {submitMessage}
          </p>
        )}
      </div>
    </form>

    {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4" style={{zIndex: 1000}}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Câmera</h3>
            {cameraError && <p className="text-red-500 text-sm mb-2">{cameraError}</p>}
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto bg-gray-200 rounded mb-4 aspect-video"></video>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                  }
                  setCameraStream(null);
                  setShowCameraModal(false);
                  setCameraError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Fechar Câmera
              </button>
              <button 
                type="button" 
                onClick={handleCaptureImage} // To be implemented
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!cameraStream || !!cameraError || images.length >= MAX_IMAGES}
              >
                Capturar Imagem
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </>
  );
};

export default ReportForm;
