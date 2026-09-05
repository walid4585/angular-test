import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICONS: Record<string, string> = {
  'brand-sew': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 5h7l3 3v4H9a3 3 0 0 0-3 3v2H4a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3z" />
      <path d="M13 8V4h3l2 2" />
      <path d="M16 11h3a2 2 0 0 1 2 2v5H7" />
      <path d="M11.5 12.5 13 11l2 2" />
      <circle cx="8" cy="18" r="1.4" />
      <circle cx="17" cy="18" r="1.4" />
      <path d="M18 5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
    </svg>
  `,
  menu: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="5" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  `,
  bell: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M15 17H5c1-1 1.5-2.5 1.5-4.5V10a5 5 0 0 1 10 0v2.5c0 2 .5 3.5 1.5 4.5z" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  `,
  moon: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </svg>
  `,
  sun: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M4.2 4.2l2.1 2.1" />
      <path d="M17.7 17.7l2.1 2.1" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M4.2 19.8l2.1-2.1" />
      <path d="M17.7 6.3l2.1-2.1" />
    </svg>
  `,
  dashboard: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5V20H4z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  `,
  chart: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 19h16" />
      <path d="M7 15l3-3 3 2 5-6" />
      <path d="M18 8v4h-4" />
    </svg>
  `,
  dollar: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.4 1 2.1 3 2.6 3 1.2 3 2.6-1.4 2.4-3 2.4-3-1-3-2.5" />
    </svg>
  `,
  cart: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 6h2l2 9h9l2-6H8" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  `,
  card: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  `,
  users: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M13.5 20a4.5 4.5 0 0 1 7 0" />
    </svg>
  `,
  'trend-up': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 16l6-6 4 4 6-8" />
      <path d="M14 6h6v6" />
    </svg>
  `,
  'plus-circle': `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  `,
  edit: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M14 6l4 4" />
    </svg>
  `,
  trash: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M10 7V5h4v2" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  `,
  box: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 8l9-4 9 4-9 4z" />
      <path d="M3 8v8l9 4 9-4V8" />
      <path d="M12 12v8" />
    </svg>
  `,
  clock: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5 10.8 15 16 9.5" />
    </svg>
  `,
  tag: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 13l-7 7-9-9V4h7z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  `,
  list: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h14" />
    </svg>
  `,
  ban: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M7 7l10 10" />
    </svg>
  `,
  exchange: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 7h10l-2-2" />
      <path d="M17 7l-2 2" />
      <path d="M17 17H7l2 2" />
      <path d="M7 17l2-2" />
    </svg>
  `,
  undo: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 7H5v4" />
      <path d="M5 11c0-3.3 2.7-6 6-6h4.5" />
      <path d="M5 11l3-3" />
      <path d="M5 11l3 3" />
    </svg>
  `,
  trophy: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 5h8v3a4 4 0 0 1-8 0z" />
      <path d="M12 12v4" />
      <path d="M8 19h8" />
      <path d="M6 7H4a3 3 0 0 0 3 3" />
      <path d="M18 7h2a3 3 0 0 1-3 3" />
    </svg>
  `,
  store: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 9h18l-1.5-4h-15z" />
      <path d="M4 9v10h16V9" />
      <path d="M9 19v-6h6v6" />
    </svg>
  `,
  gear: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a7.8 7.8 0 0 0 .1-6l-2 1.2a7 7 0 0 0-1.7-1.7l1.2-2a7.8 7.8 0 0 0-6-.1l.1 2.3a7 7 0 0 0-2.2 0L7 6.5a7.8 7.8 0 0 0-4.1 4.1l2 1.2a7 7 0 0 0 0 2.2l-2 1.2a7.8 7.8 0 0 0 4.1 4.1l1.2-2a7 7 0 0 0 2.2 0l.1 2.3a7.8 7.8 0 0 0 6-.1l-1.2-2a7 7 0 0 0 1.7-1.7z" />
    </svg>
  `,
  truck: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  `,
  logout: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10 4H5v16h5" />
      <path d="M14 12H4" />
      <path d="M11 9l3 3-3 3" />
    </svg>
  `,
  spark: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l1.7 4.9L19 10l-5.3 2.1L12 17l-1.7-4.9L5 10l5.3-2.1z" />
    </svg>
  `,
};

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.html',
  styleUrl: './svg-icon.css',
})
export class SvgIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() name = 'brand-sew';

  get svgHtml(): SafeHtml {
    const markup = ICONS[this.name] ?? ICONS['brand-sew'];
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  }
}
