import Script from "next/script";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tiojohnny.cl/#organization",
      name: "TioJohnny.cl",
      url: "https://tiojohnny.cl",
      logo: "https://tiojohnny.cl/favicon.svg",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://tiojohnny.cl/#website",
      url: "https://tiojohnny.cl",
      name: "TioJohnny.cl",
      description: "Directorio de modelos, animadoras y talentos para eventos en Chile",
      publisher: { "@id": "https://tiojohnny.cl/#organization" },
      inLanguage: "es-CL",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://tiojohnny.cl/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://tiojohnny.cl/#business",
      name: "TioJohnny.cl",
      description:
        "Directorio de modelos, animadoras y talentos para eventos corporativos, fiestas privadas, desfiles y sesiones fotográficas en Chile.",
      url: "https://tiojohnny.cl",
      areaServed: { "@type": "Country", name: "Chile" },
      serviceType: [
        "Modelos para eventos",
        "Animadoras para fiestas",
        "Talentos para eventos corporativos",
        "Modelos para desfiles",
        "Modelos para sesiones fotográficas",
      ],
      inLanguage: "es-CL",
    },
  ],
};

export const metadata = {
  metadataBase: new URL("https://tiojohnny.cl"),
  title: "TioJohnny.cl — Modelos y Talentos para Eventos en Chile",
  description:
    "Directorio de modelos, animadoras y talentos para eventos corporativos, fiestas privadas, despedidas de soltero y soltera, desfiles y sesiones fotográficas en Chile. Contrata fácil y rápido.",
  keywords:
    "modelos para eventos Chile, animadoras fiestas Santiago, talentos eventos corporativos, modelos Santiago, contratar modelos Chile, despedidas de soltero animadoras, modelos desfiles Chile, sesiones fotográficas modelos",
  robots: "index, follow",
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: "https://tiojohnny.cl/",
    languages: {
      "es-CL": "https://tiojohnny.cl/",
      es: "https://tiojohnny.cl/",
    },
  },
  openGraph: {
    title: "TioJohnny.cl — Modelos y Talentos para Eventos en Chile",
    description:
      "Directorio de modelos, animadoras y talentos para eventos corporativos, fiestas privadas, despedidas de soltero y soltera, desfiles y sesiones fotográficas en Chile.",
    type: "website",
    url: "https://tiojohnny.cl/",
    siteName: "TioJohnny.cl",
    locale: "es_CL",
    images: [
      {
        url: "https://tiojohnny.cl/og-image.png",
        width: 1200,
        height: 630,
        alt: "TioJohnny.cl — Modelos y Talentos para Eventos en Chile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TioJohnny.cl — Modelos y Talentos para Eventos en Chile",
    description:
      "Directorio de modelos, animadoras y talentos para eventos corporativos, fiestas privadas, despedidas de soltero y soltera en Chile. Contrata fácil y rápido.",
    images: ["https://tiojohnny.cl/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#12122a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://ktnuedojmitfwoeugefx.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QPYGWR83Q0"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-QPYGWR83Q0');`}
        </Script>
        {children}
        <noscript>
          <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "40px auto", padding: "0 20px", color: "#333" }}>
            <h1>TioJohnny.cl — Modelos y Talentos para Eventos en Chile</h1>
            <p>
              Directorio de modelos, animadoras y talentos para eventos corporativos, fiestas privadas,
              despedidas de soltero/a, desfiles y sesiones fotográficas en Chile.
            </p>
            <p>Para usar el sitio necesitas activar JavaScript en tu navegador.</p>
            <p>
              <strong>
                Visita <a href="https://tiojohnny.cl">tiojohnny.cl</a> para ver todos los perfiles.
              </strong>
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
