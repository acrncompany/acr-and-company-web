import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // The admin panel is a logged-in tool: it is never rendered on the server (the browser builds it).
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Every other request is rendered on the server (not prerendered), because the content comes from the API
  // and is edited in the admin panel at any time.
  { path: '**', renderMode: RenderMode.Server },
];
