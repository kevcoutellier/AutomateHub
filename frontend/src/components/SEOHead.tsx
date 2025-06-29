import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'AutomateHub - Plateforme de mise en relation avec des experts',
  description = 'Trouvez et collaborez avec les meilleurs experts pour vos projets. AutomateHub connecte les entreprises avec des professionnels qualifiés dans tous les domaines.',
  keywords = [
    'experts', 'freelance', 'consultation', 'projets', 'automatisation', 
    'développement', 'marketing', 'design', 'data science', 'intelligence artificielle'
  ],
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  siteName = 'AutomateHub',
  locale = 'fr_FR',
  alternateLocales = ['en_US'],
  noIndex = false,
  noFollow = false,
  canonical,
  structuredData
}) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
  const canonicalUrl = canonical || currentUrl;

  // Génération des meta tags robots
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={author || siteName} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Language and Locale */}
      <html lang={locale.split('_')[0]} />
      <meta name="language" content={locale.split('_')[0]} />
      
      {/* Alternate Languages */}
      {alternateLocales.map(altLocale => (
        <link
          key={altLocale}
          rel="alternate"
          hrefLang={altLocale.split('_')[0]}
          href={currentUrl.replace(`/${locale.split('_')[0]}/`, `/${altLocale.split('_')[0]}/`)}
        />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {alternateLocales.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}

      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {keywords.map(keyword => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@AutomateHub" />
      <meta name="twitter:creator" content="@AutomateHub" />

      {/* Additional Meta Tags for SEO */}
      <meta name="theme-color" content="#1d4ed8" />
      <meta name="msapplication-TileColor" content="#1d4ed8" />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.automatehub.com" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
