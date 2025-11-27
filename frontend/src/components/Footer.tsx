// src/components/Footer.tsx
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Sobre o Projeto</h3>
            <p className="text-sm leading-relaxed">
              Plataforma cidadã para registro de denúncias ambientais.
              Ajude a proteger o meio ambiente da sua cidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/denunciar" className="hover:text-green-400 transition-colors">
                  Fazer Denúncia
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="hover:text-green-400 transition-colors">
                  Ver Mapa
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-green-400 transition-colors">
                  Área Administrativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Tipos de Denúncia</h3>
            <ul className="space-y-1 text-sm">
              <li>• Queimadas</li>
              <li>• Desmatamento</li>
              <li>• Despejo de Lixo</li>
              <li>• Poluição Sonora</li>
              <li>• Maus-tratos a Animais</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {currentYear} Denúncias Ambientais. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
