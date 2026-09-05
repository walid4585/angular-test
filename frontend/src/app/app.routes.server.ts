import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Routes contain customer/worker IDs, so render them on request instead
    // of trying to prerender unknown parameter values at build time.
    renderMode: RenderMode.Server
  }
];
