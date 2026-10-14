/**
 * Deep-link utility to seamlessly open the Instagram App on mobile devices (iOS & Android)
 * with graceful fallback to web browser on desktop or if the app is not installed.
 */
export function openInstagram(username: string = "bylumenia") {
  if (typeof window === "undefined") return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const webUrl = `https://www.instagram.com/${username}`;

  if (isMobile) {
    const appUrl = `instagram://user?username=${username}`;
    const start = Date.now();

    // Trigger app intent/scheme
    window.location.href = appUrl;

    // Fallback to web browser if app does not intercept within 1.2s
    setTimeout(() => {
      if (document.hidden) return; // App opened successfully
      if (Date.now() - start < 2500) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 1200);
  } else {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}
