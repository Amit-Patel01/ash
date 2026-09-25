export default async function sitemap() {
  const baseUrl = 'https://www.ashnexasystems.com';

  const routes = [
    '',
    '/about',
    '/courses',
    '/projects',
    '/services',
    '/contact',
    '/custom-project',
    '/infrastructure',
    '/help',
    '/legal/privacy-policy',
    '/legal/terms',
    '/legal/refund-policy',
    '/legal/grievance',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}
