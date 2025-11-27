import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: "Denúncia Fácil",
      description: "Registre problemas ambientais em poucos minutos, com ou sem identificação.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Localização GPS",
      description: "Capture automaticamente a localização ou insira manualmente o endereço.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Fotos e Evidências",
      description: "Anexe até 2 imagens da ocorrência ou tire fotos diretamente pelo app.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: "Mapa Interativo",
      description: "Visualize todas as denúncias em um mapa com filtros por categoria e data.",
    },
  ];

  const categories = [
    { name: "Queimadas", color: "bg-orange-500" },
    { name: "Desmatamento", color: "bg-red-600" },
    { name: "Despejo de Lixo", color: "bg-amber-600" },
    { name: "Mato Alto", color: "bg-lime-600" },
    { name: "Poluição Sonora", color: "bg-purple-500" },
    { name: "Maus-tratos a Animais", color: "bg-pink-500" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white -mt-4 -mx-4 px-4 py-20 md:py-28">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Proteja o Meio Ambiente<br />
            <span className="text-green-200">da Sua Cidade</span>
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
            Faça a diferença! Registre denúncias de crimes ambientais de forma rápida e segura. 
            Sua participação ajuda a preservar o nosso planeta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/denunciar"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:bg-green-50 hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fazer Denúncia
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Ver Mapa
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Como Funciona
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Nossa plataforma foi desenvolvida para facilitar o registro de denúncias ambientais 
            e ajudar na preservação do meio ambiente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Categorias de Denúncia
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Selecione a categoria que melhor descreve o problema ambiental que você identificou.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <span
                key={index}
                className={`${category.color} text-white px-5 py-2 rounded-full text-sm font-medium shadow-md`}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para fazer a diferença?
            </h2>
            <p className="text-green-100 max-w-xl mx-auto mb-8">
              Sua denúncia pode salvar vidas, proteger animais e preservar o meio ambiente 
              para as próximas gerações.
            </p>
            <Link
              href="/denunciar"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 font-bold rounded-xl shadow-lg hover:bg-green-50 hover:scale-105 transition-all duration-200"
            >
              Registrar Denúncia Agora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
