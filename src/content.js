// Texto idêntico ao Figma (ver COPY.md — fonte da verdade).
export const content = {
  brand: { name: 'alurea', tagline: 'hotels & stays' },

  hero: {
    title: 'A porta de entrada para os hotéis de luxo mais exclusivos do mundo',
    subtitle:
      'Descubra experiências inesquecíveis em destinos icônicos. Reserve com confiança e viva o extraordinário dentro dos Hotéis mais chiques e luxuosos que você pode encontrar em todo o mundo, nosso trabalho é garantir que sua estadia seja a mais inacreditável que já viveu em toda a sua vida.',
    ctaPrimary: 'Reserve Agora',
    ctaSecondary: 'Explore os Hotéis',
  },

  sobre: {
    title: 'Especialistas em hospitalidade de luxo',
    text: 'Há anos conectamos viajantes exigentes aos hotéis mais sofisticados do mundo. Cada detalhe da sua estadia é cuidadosamente selecionado...',
    list: [
      'Curadoria de hotéis 5 estrelas',
      'Experiências personalizadas',
      'Suporte 24/7',
      'Melhor preço garantido em luxo',
    ],
    stats: [
      { value: 500, suffix: '+', label: 'Hoteis de luxo', icon: 'stat-hoteis' },
      { value: 50, suffix: 'K+', label: 'Clientes felizes', icon: 'stat-clientes' },
      { value: 120, suffix: '+', label: 'Agencias ao redor do mundo', icon: 'stat-agencias' },
      { value: 100, suffix: '%', label: 'Profissionais competentes', icon: 'stat-profissionais' },
    ],
  },

  hoteis: {
    title: 'Coleção Exclusiva de Destinos',
    subtitle: 'Experiencie o pináculo da luxuosidade oferecido por nossos Hotéis parceiros.',
    cards: [
      { city: 'Paris', hotel: 'Hôtel Ritz', img: 'paris' },
      { city: 'Dubai', hotel: 'Burj Al Arab', img: 'dubai' },
      { city: 'Maldivas', hotel: 'Soneva Jani', img: 'maldivas' },
    ],
    cta: 'Reserve agora',
  },

  beneficios: {
    title: 'Por que reservar conosco?',
    items: [
      { title: 'Exclusividade', text: 'Acesso as propriedades exclusivas de membros', icon: 'exclusividade' },
      { title: 'Personalização', text: 'Experiências personalizadas em sua preferência', icon: 'personalizacao' },
      { title: 'Confiança', text: 'Reservas seguras com nossa garantía satisfatória', icon: 'confianca' },
      { title: 'Facilidade', text: 'Esforço mínimo no planejamento da sua viagem luxuosa', icon: 'facilidade' },
    ],
    mapTitle: 'Estamos em todo brasil!!',
    // Posições relativas ao mapa (875 x 479) conforme o Figma.
    pins: [
      { label: 'Canada', x: 134.6, y: 110.7 },
      { label: 'EUA', x: 188.6, y: 187.7 },
      { label: 'Rússia', x: 594.6, y: 94.7 },
      { label: 'Egito', x: 455.6, y: 228.7 },
      { label: 'China', x: 639.6, y: 196.7 },
      { label: 'Austrália', x: 738.6, y: 351.7 },
      { label: 'Brasil', x: 274.6, y: 313.7, main: true },
    ],
  },

  depoimentos: {
    title: 'Histórias de quem já viveu essa experiência',
    items: [
      { quote: '"Minha viagem para Dubai foi impecável. Cada detalhe superou minhas expectativas."', author: '– Mariana S.', avatar: 'avatar-1' },
      { quote: '“Nunca tive uma estadia tão personalizada. Atendimento impecável do começo ao fim.”', author: '– Roberto L.', avatar: 'avatar-2' },
      { quote: '“Reservar aqui é ter certeza de que vou viver momentos únicos em cada destino.”', author: '– Camila P.', avatar: 'avatar-3' },
    ],
  },

  experiencia: {
    title: 'Mais que hospedagem: experiências inesquecíveis',
    subtitle: 'Eleve sua jornada com acesso exclusivo às melhores experiências do mundo',
    items: [
      'Jantar privado com chefs renomados',
      'Passeios exclusivos de iate',
      'Acesso VIP à eventos culturais',
      'Spa e bem-estar internacional',
    ],
    cta: 'Descubra Experiências VIP',
  },

  parceria: {
    title: 'Confiança garantida pelas maiores redes de luxo do mundo',
    text: 'Somos parceiros oficiais de algumas das marcas mais prestigiadas da hotelaria e do turismo internacional.',
    partners: [
      { name: 'Four Seasons Hotels and Resorts', photo: 'four-seasons', logo: 'logo-four-seasons', logoBox: [9.9, 40.8, 317.9, 317.9] },
      { name: 'The Ritz-Carlton', photo: 'ritz-carlton', logo: 'logo-ritz-carlton', logoBox: [10.5, 41.3, 316.3, 316.3] },
      { name: 'Mandarin Oriental — The Hotel Group', photo: 'mandarin', logo: 'logo-mandarin', logoBox: [46.3, 95.7, 244.7, 208.1] },
    ],
  },

  cta: {
    title: 'Sua próxima experiência de luxo começa agora',
    text: 'Junte-se a milhares de viajantes exigentes que confiam em nós para cuidar dos seus momentos mais preciosos.',
    button: 'Reserve Agora',
  },

  footer: {
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'Twitter/ X', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
    copyright: '© 2025 Alurea. Todos os direitos reservados - Desenvolvido por ASX Design',
  },
};
