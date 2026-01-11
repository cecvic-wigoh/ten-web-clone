'use client';

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface PreviewPage {
  slug: string;
  title: string;
  blocks: string;
}

export interface VarietyTheme {
  config?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      textMuted: string;
      background: string;
      surface: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      headingWeight: string;
      bodyWeight: string;
    };
    style: {
      borderRadius: string;
      shadowStyle: string;
      buttonStyle: string;
    };
    industry: string;
  };
  css?: string;
  fontsUrl?: string;
}

export interface PreviewProps {
  pages: PreviewPage[];
  loading?: boolean;
  onDeploy?: () => void;
  varietyTheme?: VarietyTheme;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

// ============================================================================
// Constants
// ============================================================================

const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert WordPress block markup to preview HTML
 * This is a simplified renderer - in production you'd use the actual WP block parser
 */
function blocksToHtml(blocks: string): string {
  // Simple conversion of common blocks to HTML
  let html = blocks;

  // Convert paragraph blocks
  html = html.replace(
    /<!-- wp:paragraph -->\s*<p>([\s\S]*?)<\/p>\s*<!-- \/wp:paragraph -->/g,
    '<p class="mb-4">$1</p>'
  );

  // Convert heading blocks
  html = html.replace(
    /<!-- wp:heading \{[^}]*"level":(\d)[^}]*\} -->\s*<h\d[^>]*>([\s\S]*?)<\/h\d>\s*<!-- \/wp:heading -->/g,
    '<h$1 class="font-bold mb-2">$2</h$1>'
  );

  // Convert group blocks (just extract content)
  html = html.replace(/<!-- wp:group[^>]*-->/g, '<div class="mb-8">');
  html = html.replace(/<!-- \/wp:group -->/g, '</div>');

  // Convert cover blocks
  html = html.replace(
    /<!-- wp:cover \{[^}]*"url":"([^"]*)"[^}]*\} -->/g,
    '<div class="bg-cover bg-center min-h-[400px] flex items-center justify-center" style="background-image: url($1)">'
  );
  html = html.replace(/<!-- \/wp:cover -->/g, '</div>');

  // Convert columns
  html = html.replace(/<!-- wp:columns -->/g, '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">');
  html = html.replace(/<!-- \/wp:columns -->/g, '</div>');
  html = html.replace(/<!-- wp:column -->/g, '<div>');
  html = html.replace(/<!-- \/wp:column -->/g, '</div>');

  // Convert buttons
  html = html.replace(
    /<!-- wp:button -->\s*<div[^>]*><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/div>\s*<!-- \/wp:button -->/g,
    '<a href="$1" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">$2</a>'
  );

  // Convert spacers
  html = html.replace(
    /<!-- wp:spacer \{[^}]*"height":"([^"]*)"[^}]*\} -->/g,
    '<div style="height: $1"></div>'
  );
  html = html.replace(/<!-- \/wp:spacer -->/g, '');

  // Remove remaining block comments
  html = html.replace(/<!-- \/?wp:[^>]* -->/g, '');

  return html;
}

/**
 * Generate full HTML document for iframe with theme CSS
 */
function generatePreviewDocument(html: string, theme?: VarietyTheme): string {
  const fontsLink = theme?.fontsUrl
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
       <link href="${theme.fontsUrl}" rel="stylesheet">`
    : '';

  const themeCss = theme?.css || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${fontsLink}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${themeCss}

    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    /* Section spacing */
    .wp-block-group {
      padding: 60px 20px;
    }

    /* Constrained layout */
    .wp-block-group > * {
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Cover block (Hero) */
    .wp-block-cover {
      position: relative;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
      padding: 60px 20px;
    }

    .wp-block-cover::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6));
    }

    .wp-block-cover > * {
      position: relative;
      z-index: 1;
      max-width: 800px;
      text-align: center;
    }

    .wp-block-cover h1,
    .wp-block-cover h2 {
      color: white !important;
      font-size: 3rem;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .wp-block-cover p {
      color: white !important;
      font-size: 1.25rem;
      opacity: 0.95;
      margin-bottom: 2rem;
    }

    /* Columns */
    .wp-block-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin: 40px auto;
    }

    .wp-block-column {
      padding: 30px;
      text-align: center;
    }

    /* Headings */
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    h2 { font-size: 2rem; margin-bottom: 1rem; }
    h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    h4 { font-size: 1.25rem; margin-bottom: 0.5rem; }

    /* Paragraphs */
    p {
      margin-bottom: 1rem;
      line-height: 1.7;
    }

    /* Buttons container */
    .wp-block-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }

    .wp-block-buttons.is-content-justification-center {
      justify-content: center;
    }

    /* Button styling */
    .wp-block-button {
      display: inline-block;
    }

    .wp-block-button__link {
      display: inline-block;
      padding: 12px 28px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    /* Spacer */
    .wp-block-spacer {
      display: block;
    }

    /* Separator */
    .wp-block-separator {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 40px auto;
      max-width: 100px;
    }

    /* Quote */
    .wp-block-quote {
      border-left: 4px solid var(--color-primary, #3b82f6);
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
    }

    /* List */
    .wp-block-list {
      list-style: none;
      padding: 0;
    }

    .wp-block-list li {
      padding: 8px 0;
    }

    /* Feature icons */
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .wp-block-cover h1 {
        font-size: 2rem;
      }
      .wp-block-columns {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="min-h-screen">
    ${html}
  </div>
</body>
</html>
`;
}

// ============================================================================
// Component
// ============================================================================

export function Preview({ pages, loading = false, onDeploy, varietyTheme }: PreviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  // Empty state
  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No preview available</p>
      </div>
    );
  }

  const activePage = pages[activeTab];
  const previewHtml = blocksToHtml(activePage.blocks);
  const previewDocument = generatePreviewDocument(previewHtml, varietyTheme);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {/* Page tabs (only show for multi-page) */}
        {pages.length > 1 && (
          <div role="tablist" className="flex space-x-1">
            {pages.map((page, index) => (
              <button
                key={page.slug}
                role="tab"
                aria-selected={index === activeTab}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  index === activeTab
                    ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        )}

        {/* Viewport toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded ${viewport === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Desktop"
          >
            <DesktopIcon />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded ${viewport === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Tablet"
          >
            <TabletIcon />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded ${viewport === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Mobile"
          >
            <MobileIcon />
          </button>
        </div>

        {/* Deploy button */}
        {onDeploy && (
          <button
            onClick={onDeploy}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Deploy
          </button>
        )}
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {loading ? (
          <div
            data-testid="preview-loading"
            className="flex items-center justify-center h-full"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div
            className="mx-auto bg-white shadow-lg transition-all duration-300"
            style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%' }}
          >
            <iframe
              data-testid="preview-iframe"
              srcDoc={previewDocument}
              className={`w-full h-[600px] border-0 ${viewport === 'mobile' ? 'mobile-view' : ''}`}
              title={`Preview of ${activePage.title}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function DesktopIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
