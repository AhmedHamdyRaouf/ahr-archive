/**
 * Implements: Packages Specification Package 03 §19 — "Invalid/missing
 * slug → proper localized 404 page," generalized here as the app-wide
 * not-found boundary. Next.js's not-found.tsx must live at app/ (outside
 * [locale]) to catch routes that don't even match the locale segment; it
 * intentionally can't read `params.locale` reliably at this level, so it
 * stays language-neutral rather than guessing a locale.
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>404 — Not Found</h1>
            <p>
              <a href="/ar">العربية</a> · <a href="/en">English</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
