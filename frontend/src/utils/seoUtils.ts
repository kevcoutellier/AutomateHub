/**
 * Utilitaires SEO pour AutomateHub
 * Génération de métadonnées, données structurées et optimisations
 */

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: object;
}

/**
 * Génère les métadonnées SEO pour la page d'accueil
 */
export const getHomePageSEO = (): SEOData => ({
  title: 'AutomateHub - Trouvez les meilleurs experts pour vos projets',
  description: 'Plateforme de mise en relation avec des experts qualifiés. Développement, marketing, design, data science et plus. Démarrez votre projet dès aujourd\'hui.',
  keywords: [
    'experts freelance',
    'consultation professionnelle',
    'développement web',
    'marketing digital',
    'design UI/UX',
    'data science',
    'intelligence artificielle',
    'automatisation',
    'projets sur mesure',
    'freelancers qualifiés'
  ],
  type: 'website',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AutomateHub',
    description: 'Plateforme de mise en relation avec des experts pour tous vos projets',
    url: 'https://automatehub.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://automatehub.com/experts?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AutomateHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://automatehub.com/images/logo.png'
      }
    }
  }
});

/**
 * Génère les métadonnées SEO pour la page des experts
 */
export const getExpertsPageSEO = (filters?: any): SEOData => {
  const specialty = filters?.specialties?.[0];
  const location = filters?.location;
  
  let title = 'Découvrez nos experts qualifiés - AutomateHub';
  let description = 'Parcourez notre sélection d\'experts dans tous les domaines. Développement, marketing, design, data science et plus.';
  
  if (specialty) {
    title = `Experts en ${specialty} - AutomateHub`;
    description = `Trouvez les meilleurs experts en ${specialty}. Profils vérifiés, évaluations clients et tarifs transparents.`;
  }
  
  if (location) {
    title += ` à ${location}`;
    description += ` Experts localisés à ${location}.`;
  }

  return {
    title,
    description,
    keywords: [
      'experts freelance',
      'consultants professionnels',
      specialty || 'développement',
      location || 'France',
      'projets sur mesure',
      'tarifs transparents',
      'évaluations clients',
      'profils vérifiés'
    ],
    type: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: 'https://automatehub.com/experts',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Liste des experts',
        description: 'Experts qualifiés disponibles sur AutomateHub'
      }
    }
  };
};

/**
 * Génère les métadonnées SEO pour le profil d'un expert
 */
export const getExpertProfileSEO = (expert: any): SEOData => ({
  title: `${expert.name} - Expert ${expert.title} - AutomateHub`,
  description: `Découvrez le profil de ${expert.name}, expert en ${expert.specialties?.join(', ')}. ${expert.averageRating}/5 étoiles, ${expert.projectsCompleted} projets réalisés.`,
  keywords: [
    expert.name,
    expert.title,
    ...expert.specialties || [],
    ...expert.industries || [],
    'expert freelance',
    'consultant professionnel',
    expert.location
  ].filter(Boolean),
  type: 'profile',
  image: expert.profileImage,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: expert.name,
    jobTitle: expert.title,
    description: expert.bio,
    image: expert.profileImage,
    url: `https://automatehub.com/experts/${expert._id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: expert.location
    },
    knowsAbout: expert.specialties,
    worksFor: {
      '@type': 'Organization',
      name: 'AutomateHub'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: expert.averageRating,
      reviewCount: expert.totalReviews,
      bestRating: 5,
      worstRating: 1
    },
    offers: {
      '@type': 'Offer',
      price: expert.hourlyRate?.amount || expert.hourlyRate?.min,
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: expert.hourlyRate?.amount || expert.hourlyRate?.min,
        priceCurrency: 'EUR',
        unitText: 'heure'
      }
    }
  }
});

/**
 * Génère les métadonnées SEO pour la page "Comment ça marche"
 */
export const getHowItWorksPageSEO = (): SEOData => ({
  title: 'Comment ça marche - Guide complet AutomateHub',
  description: 'Découvrez comment utiliser AutomateHub pour trouver des experts, gérer vos projets et collaborer efficacement. Guide étape par étape.',
  keywords: [
    'comment utiliser automatehub',
    'guide utilisateur',
    'trouver des experts',
    'gérer des projets',
    'collaboration en ligne',
    'plateforme freelance',
    'mode d\'emploi',
    'tutoriel'
  ],
  type: 'article',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment utiliser AutomateHub',
    description: 'Guide complet pour utiliser la plateforme AutomateHub',
    image: 'https://automatehub.com/images/how-it-works.jpg',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Créer votre compte',
        text: 'Inscrivez-vous gratuitement en quelques clics',
        image: 'https://automatehub.com/images/step-1.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Décrire votre projet',
        text: 'Détaillez vos besoins et votre budget',
        image: 'https://automatehub.com/images/step-2.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Choisir votre expert',
        text: 'Parcourez les profils et sélectionnez le meilleur expert',
        image: 'https://automatehub.com/images/step-3.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Collaborer et suivre',
        text: 'Travaillez ensemble et suivez l\'avancement en temps réel',
        image: 'https://automatehub.com/images/step-4.jpg'
      }
    ]
  }
});

/**
 * Génère les métadonnées SEO pour une page de catégorie
 */
export const getCategoryPageSEO = (category: string): SEOData => {
  const categoryInfo = {
    'développement-web': {
      title: 'Experts en Développement Web',
      description: 'Trouvez les meilleurs développeurs web pour vos projets. React, Vue, Angular, Node.js, PHP et plus.',
      keywords: ['développement web', 'développeur frontend', 'développeur backend', 'full stack', 'react', 'vue', 'angular', 'node.js']
    },
    'marketing-digital': {
      title: 'Experts en Marketing Digital',
      description: 'Spécialistes en marketing digital, SEO, publicité en ligne, réseaux sociaux et growth hacking.',
      keywords: ['marketing digital', 'SEO', 'publicité en ligne', 'réseaux sociaux', 'growth hacking', 'content marketing']
    },
    'design-ui-ux': {
      title: 'Designers UI/UX Professionnels',
      description: 'Designers expérimentés pour vos interfaces utilisateur, expérience utilisateur et identité visuelle.',
      keywords: ['design UI/UX', 'interface utilisateur', 'expérience utilisateur', 'design graphique', 'identité visuelle']
    },
    'data-science': {
      title: 'Experts en Data Science et IA',
      description: 'Data scientists et experts en intelligence artificielle pour vos projets d\'analyse de données.',
      keywords: ['data science', 'intelligence artificielle', 'machine learning', 'analyse de données', 'big data']
    }
  };

  const info = categoryInfo[category as keyof typeof categoryInfo] || {
    title: `Experts en ${category}`,
    description: `Trouvez les meilleurs experts en ${category} pour vos projets.`,
    keywords: [category, 'experts', 'freelance', 'consultation']
  };

  return {
    title: `${info.title} - AutomateHub`,
    description: info.description,
    keywords: info.keywords,
    type: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: info.title,
      description: info.description,
      url: `https://automatehub.com/experts/category/${category}`,
      mainEntity: {
        '@type': 'ItemList',
        name: `Experts en ${category}`,
        description: info.description
      }
    }
  };
};

/**
 * Génère un sitemap XML
 */
export const generateSitemap = (experts: any[], categories: string[]): string => {
  const baseUrl = 'https://automatehub.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
    { url: '/experts', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/how-it-works', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/contact', priority: '0.6', changefreq: 'monthly', lastmod: currentDate }
  ];

  const expertPages = experts.map(expert => ({
    url: `/experts/${expert._id}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: expert.updatedAt?.split('T')[0] || currentDate
  }));

  const categoryPages = categories.map(category => ({
    url: `/experts/category/${category}`,
    priority: '0.7',
    changefreq: 'daily',
    lastmod: currentDate
  }));

  const allPages = [...staticPages, ...expertPages, ...categoryPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};

/**
 * Génère un fichier robots.txt
 */
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://automatehub.com';
  
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /settings/
Disallow: /messages/
Disallow: /*?*
Disallow: /search?*

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Specific bots
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1`;
};

/**
 * Génère les données structurées pour l'organisation
 */
export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AutomateHub',
  description: 'Plateforme de mise en relation avec des experts pour tous vos projets',
  url: 'https://automatehub.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://automatehub.com/images/logo.png',
    width: 200,
    height: 60
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+33-1-23-45-67-89',
    contactType: 'Customer Service',
    availableLanguage: ['French', 'English']
  },
  sameAs: [
    'https://www.facebook.com/automatehub',
    'https://www.twitter.com/automatehub',
    'https://www.linkedin.com/company/automatehub'
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Rue de la Tech',
    addressLocality: 'Paris',
    postalCode: '75001',
    addressCountry: 'FR'
  }
});

/**
 * Optimise le titre pour le SEO
 */
export const optimizeTitle = (title: string, maxLength = 60): string => {
  if (title.length <= maxLength) return title;
  
  const truncated = title.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

/**
 * Optimise la description pour le SEO
 */
export const optimizeDescription = (description: string, maxLength = 160): string => {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

/**
 * Génère des mots-clés pertinents
 */
export const generateKeywords = (content: string, baseKeywords: string[] = []): string[] => {
  const commonWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'ou', 'un', 'une', 'pour', 'avec', 'dans', 'sur', 'par'];
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  return [...new Set([...baseKeywords, ...topWords])];
};
