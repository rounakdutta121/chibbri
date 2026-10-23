export type SceneDef = {
  id: number;
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
};

export const SCENES: SceneDef[] = [
  {
    id: 0,
    start: 0,
    end: 150,
    eyebrow: 'Why PanelVerse',
    title: 'One studio for',
    titleAccent: 'web · landings · AI',
    subtitle: 'Websites, landing pages & automation — one growth partner.',
  },
  {
    id: 1,
    start: 150,
    end: 300,
    eyebrow: 'Website creation',
    title: 'Modern sites that',
    titleAccent: 'build trust',
    subtitle: 'Fast, mobile-first, SEO-ready — corporate, SaaS & e‑commerce.',
  },
  {
    id: 2,
    start: 300,
    end: 450,
    eyebrow: 'Landing pages',
    title: 'Built to',
    titleAccent: 'convert ads',
    subtitle: 'Google Ads · Meta Ads · funnels with analytics built in.',
  },
  {
    id: 3,
    start: 450,
    end: 600,
    eyebrow: 'AI automations',
    title: 'Leads routed',
    titleAccent: '24 / 7',
    subtitle: 'n8n workflows — CRM sync, alerts, zero manual chase.',
  },
  {
    id: 4,
    start: 600,
    end: 750,
    eyebrow: 'Proven delivery',
    title: 'Design + code +',
    titleAccent: 'smart systems',
    subtitle: '25+ projects · 1000+ hours automated · fast turnaround.',
  },
  {
    id: 5,
    start: 750,
    end: 900,
    eyebrow: 'Start now',
    title: 'PanelVerse',
    titleAccent: 'Create · Convert · Automate',
    subtitle: 'panelverse.onrender.com',
  },
];

export function getScene(frame: number): SceneDef {
  return SCENES.find((s) => frame >= s.start && frame < s.end) ?? SCENES[SCENES.length - 1];
}

export function sceneProgress(frame: number, scene: SceneDef): number {
  const local = frame - scene.start;
  const len = scene.end - scene.start;
  return Math.min(1, Math.max(0, local / len));
}
