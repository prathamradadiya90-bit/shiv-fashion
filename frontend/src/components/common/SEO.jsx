import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_DOMAIN = 'https://shreejifashion.vercel.app';
const DEFAULT_SITE_NAME = 'Shreeji Fashion';
const DEFAULT_TITLE = 'Shreeji Fashion | Designer Chaniya Choli & Navratri Ethnic Wear Surat';
const DEFAULT_DESCRIPTION = 'Shop authentic designer Chaniya Choli, Navratri ghagra, bridal lehenga, and traditional Gujarati ethnic wear online with worldwide shipping from Surat.';
const DEFAULT_KEYWORDS = 'chaniya choli, designer chaniya choli, navratri lehenga, ethnic wear surat, bridal chaniya choli, traditional gujarati dress, gamthi work lehenga, kutch work choli';
const DEFAULT_OG_IMAGE = `${DEFAULT_DOMAIN}/og-image.jpg`;

/**
 * Enterprise SEO & Structured Data Helmet Component
 */
const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  schema = null,
  noindex = false,
}) => {
  const location = useLocation();
  const canonicalUrl = canonical || `${DEFAULT_DOMAIN}${location.pathname}`;

  return (
    <Helmet>
      {/* ── Standard Meta Tags ── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang="en" />

      {/* ── Robots Directive ── */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* ── Open Graph / Facebook / WhatsApp ── */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={DEFAULT_SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Cards ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@shreejifashion" />

      {/* ── JSON-LD Structured Data / Schema Markup ── */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
