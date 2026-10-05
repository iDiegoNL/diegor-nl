// Content ported from the Claude Design project "Redesign C - Bright" (its renderVals data).

export type Project = { name: string; description: string };
export type FeatureGroup = { title: string; items: string[] };
export type Job = { company: string; title: string; start: string; end: string; anchor?: string };
export type ArchiveGroup = { title: string; items: { name: string; note: string; year: string }[] };

export const duties: { label: string; text: string }[] = [
  {
    label: "Architecture",
    text: "Lead architecture decisions and the monitoring tooling we run on."
  },
  {
    label: "On-call",
    text: "First responder when production goes down."
  },
  {
    label: "Enterprise",
    text: "Direct technical contact for enterprise customers."
  },
  {
    label: "Hiring",
    text: "Review test tasks and run final technical interviews."
  }
];

export const resume: Job[] = [
  {
    company: "Fans Holdings",
    title: "Head of Engineering",
    start: "04/2025",
    end: "Present",
    anchor: "#fansapi"
  },
  {
    company: "Awoostria",
    title: "Head of Technology",
    start: "07/2023",
    end: "09/2025",
    anchor: "#awoostria"
  },
  {
    company: "Piggy / Leat",
    title: "Software Engineer",
    start: "11/2023",
    end: "04/2025"
  },
  {
    company: "Digital Impact",
    title: "Back-end Developer",
    start: "02/2023",
    end: "11/2023"
  },
  {
    company: "The Dev Squad",
    title: "Back-end Developer",
    start: "06/2022",
    end: "12/2022"
  },
  {
    company: "This is Development",
    title: "Back-end Developer",
    start: "01/2020",
    end: "05/2022"
  }
];

export const fansapiOwned: Project[] = [
  {
    name: "Developer documentation site",
    description: "Built the public docs site from scratch, replacing the original hosted docs. Includes the API reference, guides, integration pages, FAQ, AI chatbot, search, social preview images, LLM-friendly docs, and a docs MCP server. Maintained it for over a year."
  },
  {
    name: "n8n integration",
    description: "A published community node for the n8n automation platform that covers the full API. Took it from first commit to version 1.1."
  },
  {
    name: "FansAPI Auth+ (iOS app)",
    description: "An iOS companion app for connecting creator accounts: QR and deep-link handoff, in-app sign-in, and secure session handoff to the backend. Also built its backend, error tracking, in-app bug reporting, and an automated TestFlight release pipeline."
  },
  {
    name: "Credit calculator",
    description: "A small pricing tool, embedded in the docs, that estimates usage cost."
  },
  {
    name: "Fansly platform integration",
    description: "Led the addition of a second creator platform: account connection and 2FA, the public API, media uploads and CDN, webhooks, data exports, AI tooling, and documentation."
  },
  {
    name: "Data Exports",
    description: "A no-code bulk export product. Designed and built the UI, credit pricing, large archive generation, retries and recovery, and webhooks, then extended it to a second platform."
  },
  {
    name: "Webhooks system",
    description: "Built the original webhook system, then added delivery history, redelivery, dedicated retry queues, a circuit breaker, per-account scoping, and many new event types."
  },
  {
    name: "Crypto payments",
    description: "Crypto top-ups and subscriptions, billing details and VAT validation, and renewal reminders."
  },
  {
    name: "AI fan summaries & analytics",
    description: "AI fan profile summaries and AI-powered analytics."
  },
  {
    name: "Partner Deals",
    description: "A partner and perks marketplace page, managed from the admin panel."
  },
  {
    name: "Internal admin panel",
    description: "Introduced the internal admin panel and carried it through two major framework upgrades."
  }
];

export const fansapiFeatures: FeatureGroup[] = [
  {
    title: "Account connection and authentication",
    items: [
      "Face ID and OTP verification flows",
      "The browser automation service behind account sign-in",
      "App-based 2FA support",
      "Alerts when an account connection needs attention"
    ]
  },
  {
    title: "Public API",
    items: [
      "Built a large share of the API endpoints: messaging, mass messaging, posts, stories, media vault, statistics, payouts, banking, user lists, promotions, and bundles",
      "Maintained the API reference and its example responses"
    ]
  },
  {
    title: "Media infrastructure",
    items: [
      "Media upload and download pipelines",
      "Edge CDN caching for media",
      "Server-side rendering of story overlays"
    ]
  },
  {
    title: "Billing and monetization",
    items: [
      "Usage-based credit system and subscription credit grants",
      "Credit top-ups, including automatic top-ups",
      "Tax and VAT automation",
      "Subscription cancellation flow with retention offers",
      "Low-credit and out-of-credit alerts",
      "Referral and affiliate program"
    ]
  },
  {
    title: "Growth and analytics",
    items: [
      "Onboarding flows for developers and for no-code users",
      "Interactive product tour",
      "Signup-to-paid funnel tracking",
      "CRM and lifecycle email integrations",
      "Bot protection at signup"
    ]
  },
  {
    title: "Team and platform",
    items: [
      "Team roles and permissions",
      "Per-API-key permissions, IP allowlists, and account scoping",
      "Per-user timezone preferences",
      "Credit usage API"
    ]
  },
  {
    title: "Reliability and scale",
    items: [
      "Request-log storage tiering and pruning at scale",
      "Queue separation and tuning for a high-throughput job system",
      "Proxy rotation and retry handling",
      "Idempotency keys for safe retries",
      "Error monitoring and automated release tracking"
    ]
  }
];

export const fansapiStack: string[] = [
  "Laravel",
  "React",
  "Inertia.js",
  "TypeScript",
  "PostgreSQL",
  "Redis",
  "Laravel Horizon",
  "Filament",
  "Stripe",
  "Node.js (Fastify)",
  "Expo / React Native",
  "Next.js (Fumadocs)",
  "S3-compatible storage",
  "n8n"
];

export const awoostriaOwned: Project[] = [
  {
    name: "Registration & ticketing",
    description: "The convention's own registration system, built from scratch: a guided checkout, order history, \"my tickets\", and an attendee home page. It supports multiple ticket tiers, day tickets, add-ons, stock limits, access codes for early orders, ticket transfers, and ticket upgrades."
  },
  {
    name: "Payments & order lifecycle",
    description: "Stripe-powered payments with a full order lifecycle: approval, payment deadlines, automatic reminders, overdue handling, and cancellations. Webhooks keep payment status in sync, including delayed bank payments."
  },
  {
    name: "Admin back office",
    description: "A multi-panel back office for staff, split into administration, event management, website management, and on-site ticket scanning. It includes role-based permissions, staff single sign-on, two-factor authentication, audit history, dashboards, and data exports."
  },
  {
    name: "Badge generation",
    description: "Generates print-ready badges from configurable templates per ticket type, including avatars, country flags, and scannable codes. Badges are produced in large queued batches. Includes paid fursuit badges, from ordering to printing."
  },
  {
    name: "On-site check-in",
    description: "A scanning interface for registration desk staff that validates tickets (including day tickets), shows attendee details, and tracks goodies handed out at check-in."
  },
  {
    name: "Event program & schedule",
    description: "A public program with rooms, hosts, content labels, and an interactive calendar view, plus \"add to calendar\" support and per-session detail pages. Attendees can mark which sessions they plan to attend."
  },
  {
    name: "Main website & CMS",
    description: "The public convention website. Nearly every page can be edited from the back office: home, about, team and volunteers, open positions, news, FAQ, policies, venue and travel info, guests of honour, and more."
  },
  {
    name: "Community & story features",
    description: "An opt-in public attendee and fursuiter directory, attendee questionnaires, and the interactive story for the 2025 theme, where attendees pick a faction, earn achievements, and climb a leaderboard. An OAuth sign-in and a story API let companion apps use Awoostria accounts."
  }
];

export const awoostriaFeatures: FeatureGroup[] = [
  {
    title: "Registration & attendee management",
    items: [
      "Multi-step checkout with country-aware address, phone, and postal-code validation",
      "Ticket tiers with features, required add-ons, per-ticket and event-wide stock limits",
      "Day tickets with date-aware availability and stock rules",
      "Early-order and access codes, including codes that bypass sold-out stock",
      "Registration pre-fill so attendees can prepare their details before sales open",
      "Ticket transfers between attendees and admin-driven ticket upgrades",
      "Ticket statuses, with downloads and QR codes disabled for invalidated tickets",
      "Attendee questionnaires targeted at specific ticket types, with automatic reminders",
      "Hotel and room booking information for attendees with a ticket",
      "Optional voluntary sponsorship amount added to orders"
    ]
  },
  {
    title: "Payments",
    items: [
      "Stripe checkout and billing portal integration",
      "Order state machine covering approval, awaiting payment, paid, overdue, and cancelled",
      "Per-order payment deadlines with automatic reminder and overdue emails",
      "Webhook handling for asynchronous payment success and failure"
    ]
  },
  {
    title: "Accounts, privacy & trust",
    items: [
      "Account settings with profile, pronouns, avatar, and contact details",
      "Self-service GDPR personal data export and account deletion",
      "Email-change and password-change notifications, session invalidation on password reset",
      "Login tracking, user bans, and attendance-visibility opt-in",
      "Spam protection on public forms"
    ]
  },
  {
    title: "Admin back office",
    items: [
      "Separate staff accounts with Google Workspace sign-in and two-factor authentication",
      "Fine-grained roles and permissions, with automatic permission syncing",
      "Audit history on key records, viewable from each admin page",
      "Dashboards: order trends, order statuses, attendee countries, faction distribution",
      "Bulk order status changes, global search, and filtered order/ticket/user views",
      "CSV exports for orders and tickets, plus bulk profile-picture exports",
      "Badge template designer with live previews and batch generation runs",
      "Ticket scanning panel for the registration desk"
    ]
  },
  {
    title: "Public website",
    items: [
      "CMS-style editable pages, navigation, header images, and alert banners",
      "News, policies, FAQ, open positions, and contact pages",
      "Venue pages with travel guide, hotel rooms and amenities, and breakfast times",
      "Guests of honour, Voices of Awoostria, volunteers, contribute, and conbook pages",
      "Event program with calendar view, content labels, and \"add to calendar\"",
      "Public attendee and fursuiter directories with search, flags, and country stats",
      "Banner exchange for partner conventions",
      "Seasonal and theme takeovers (2025 theme reveal, winter snow, Pride, Halloween)",
      "SEO: auto-updating sitemap, structured data, social previews, custom error pages"
    ]
  },
  {
    title: "Email & notifications",
    items: [
      "Transactional emails across the full order and ticket lifecycle",
      "Ticket emails with QR codes and PDF tickets",
      "Hotel booking and questionnaire reminder emails",
      "Rate-limited, queued email delivery",
      "Contact form routed to the team's helpdesk"
    ]
  },
  {
    title: "Infrastructure & reliability",
    items: [
      "CI pipeline: automated tests, static analysis, type coverage, architecture tests, and auto-formatting",
      "Release-based deployments with semantic versioning and error-tracking releases",
      "Error and job monitoring, with user feedback on error pages",
      "Background queues for badges, emails, and sitemap generation",
      "Database anonymization tooling for safe local development",
      "Framework upgrades across two major Laravel versions and PHP 8.2 → 8.3",
      "Image optimization via a CDN resizing layer"
    ]
  }
];

export const awoostriaStack: string[] = [
  "PHP 8.3",
  "Laravel 12",
  "Livewire 3",
  "Alpine.js",
  "Tailwind CSS",
  "Filament 3",
  "MySQL",
  "Redis",
  "Laravel Horizon",
  "Stripe (Laravel Cashier)",
  "Laravel Passport (OAuth2)",
  "AWS SES & S3",
  "Cloudflare (Image Resizing, Turnstile)",
  "Sentry",
  "Umami Analytics",
  "Pest",
  "PHPStan",
  "Vite",
  "Bun",
  "Docker",
  "GitHub Actions"
];

export const archive: ArchiveGroup[] = [
  {
    title: "Client work",
    items: [
      {
        name: "Piggy / Leat Business Dashboard",
        note: "Loyalty and engagement platform",
        year: "leat.com"
      },
      {
        name: "Piggy / Leat API & SDK",
        note: "Public API and PHP SDK",
        year: "github"
      },
      {
        name: "Cusweb",
        note: "Employee, customer and project management",
        year: "cusweb.nl"
      },
      {
        name: "Independent Waiver Service",
        note: "Waiver documents for 25 countries",
        year: "waiver-service.com"
      },
      {
        name: "Weetwatjezegt",
        note: "Compliance e-learning platform",
        year: "weetwatjezegt.nl"
      },
      {
        name: "Hartje Wonen",
        note: "Real estate CRM dashboard",
        year: "hartjewonen.nl"
      },
      {
        name: "LiDRS Online",
        note: "Leadership development platform",
        year: "lidrsonline.nl"
      },
      {
        name: "FrieslandCampina",
        note: "Xpress platform and deployment dashboard",
        year: ""
      },
      {
        name: "This Is Development CMS",
        note: "Agency website on Twill.io",
        year: "thisisdevelopment.nl"
      }
    ]
  },
  {
    title: "Personal",
    items: [
      {
        name: "ArtisticAnthro",
        note: "Commission management for artists",
        year: "2022–23"
      },
      {
        name: "TruckersMP",
        note: "Main website and PHP API client",
        year: "2022"
      },
      {
        name: "PhoenixBase, CMS & Tracker",
        note: "Driver dashboard, CMS and Electron tracker",
        year: "2020–22"
      },
      {
        name: "Viva Trucking DriversHub",
        note: "Driver dashboard",
        year: "2020"
      },
      {
        name: "UpCheck",
        note: "Uptime monitoring",
        year: "2019"
      },
      {
        name: "Nieuwjaarsduik IJburg",
        note: "Event registration and QR tickets, my first Laravel project",
        year: "2016"
      }
    ]
  }
];

export type Stat = [value: string, label: string];

export const fansapiStats: Stat[] = [
  ["10M+", "API requests per day"],
  ["100k+", "queue jobs per minute"],
  ["10k+", "unique visitors per day"],
  ["~2,000", "commits: 1,650 core platform + 330 across 6 supporting repos"]
];

export const awoostriaStats: Stat[] = [
  ["1,057", "attendees"],
  ["151k", "peak API requests per hour"],
  ["~1,700", "commits"],
  ["~98%", "of human-authored commits"],
  ["~99%", "of application code"]
];

// Stack label → icon slug (symbol `si-<slug>` in src/assets/stack-icons.svg). Mostly the design's
// Simple Icons mapping, plus aws, awss3, pest and phpstan. Labels without an entry render as text only.
export const stackIcons: Record<string, string> = {
  "PHP 8.3": "php",
  "Laravel": "laravel",
  "Laravel 12": "laravel",
  "Laravel Horizon": "laravel",
  "Laravel Passport (OAuth2)": "laravel",
  "React": "react",
  "Inertia.js": "inertia",
  "TypeScript": "typescript",
  "PostgreSQL": "postgresql",
  "Redis": "redis",
  "Stripe": "stripe",
  "Stripe (Laravel Cashier)": "stripe",
  "Node.js (Fastify)": "nodedotjs",
  "Expo / React Native": "expo",
  "Next.js (Fumadocs)": "nextdotjs",
  "n8n": "n8n",
  "Livewire 3": "livewire",
  "Alpine.js": "alpinedotjs",
  "Tailwind CSS": "tailwindcss",
  "MySQL": "mysql",
  "Cloudflare (Image Resizing, Turnstile)": "cloudflare",
  "Sentry": "sentry",
  "Umami Analytics": "umami",
  "Vite": "vite",
  "Bun": "bun",
  "Docker": "docker",
  "GitHub Actions": "githubactions",
  "Filament": "filament",
  "Filament 3": "filament",
  "AWS SES & S3": "aws",
  "S3-compatible storage": "awss3",
  "Pest": "pest",
  "PHPStan": "phpstan"
};

// Symbols that aren't square; their chip slot is widened to keep them legible.
export const wideStackIcons = new Set(["aws"]);
