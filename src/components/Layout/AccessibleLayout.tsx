import { ReactNode } from "react";
import { SkipToMain } from "@/components/Shared/SkipToMain";

interface AccessibleLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

/**
 * Layout wrapper with accessibility features
 * - Skip to main content link
 * - Proper semantic HTML structure
 * - ARIA landmarks
 */
export function AccessibleLayout({ children, header, sidebar, footer }: AccessibleLayoutProps) {
  return (
    <>
      <SkipToMain />
      
      {header && (
        <header role="banner">
          {header}
        </header>
      )}

      <div className="flex min-h-screen">
        {sidebar && (
          <aside role="complementary" aria-label="Sidebar navigation">
            {sidebar}
          </aside>
        )}

        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>

      {footer && (
        <footer role="contentinfo">
          {footer}
        </footer>
      )}
    </>
  );
}
