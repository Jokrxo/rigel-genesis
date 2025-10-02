/**
 * Skip to main content link for keyboard navigation accessibility
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="skip-to-main"
      onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if (main) {
          main.focus();
          main.scrollIntoView();
        }
      }}
    >
      Skip to main content
    </a>
  );
}
