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

export interface PreviewProps {
  pages: PreviewPage[];
  loading?: boolean;
  onDeploy?: () => void;
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
 * Generate full HTML document for iframe
 */
function generatePreviewDocument(html: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
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

export function Preview({ pages, loading = false, onDeploy }: PreviewProps) {
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
  const previewDocument = generatePreviewDocument(previewHtml);

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
