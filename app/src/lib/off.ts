// Open Food Facts: busca online (via Edge Function off-search, resolve CORS)
// e código de barras (world.openfoodfacts.org direto, tem CORS).
const SUPABASE_URL = 'https://mtbdbahmwbjmmuljvxfn.supabase.co';
const OFF_SEARCH = SUPABASE_URL + '/functions/v1/off-search';

export interface OffHit {
  n: string;
  k: number;
  p: number;
}

interface Nutr {
  'energy-kcal_100g'?: number;
  energy_100g?: number;
  proteins_100g?: number;
}

function offNutr(nm?: Nutr): { k: number; p: number } | null {
  if (!nm) return null;
  let k = nm['energy-kcal_100g'];
  if (k == null && nm.energy_100g != null) k = nm.energy_100g / 4.184;
  if (k == null) return null;
  return { k: Math.round(k * 10) / 10, p: nm.proteins_100g != null ? nm.proteins_100g : 0 };
}

function offName(p: { product_name?: string | string[]; brands?: string | string[] }): string {
  let brand = p.brands as string | string[] | undefined;
  if (Array.isArray(brand)) brand = brand[0];
  else if (typeof brand === 'string') brand = brand.split(',')[0];
  brand = (brand || '').toString().trim();
  let nm = p.product_name as string | string[] | undefined;
  if (Array.isArray(nm)) nm = nm[0];
  nm = (typeof nm === 'string' ? nm : '').trim() || 'Produto';
  return nm + (brand ? ' · ' + brand : '');
}

export async function offSearch(query: string): Promise<OffHit[]> {
  const r = await fetch(OFF_SEARCH + '?q=' + encodeURIComponent(query));
  if (!r.ok) throw new Error('http ' + r.status);
  const j = await r.json();
  const hits = (j.hits || [])
    .map((p: { nutriments?: Nutr; product_name?: string; brands?: string }) => {
      const nutr = offNutr(p.nutriments);
      return nutr ? { n: offName(p), k: nutr.k, p: nutr.p } : null;
    })
    .filter(Boolean) as OffHit[];
  return hits.slice(0, 10);
}

export async function offBarcode(code: string): Promise<OffHit | null> {
  const r = await fetch(
    'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code) + '.json?fields=product_name,brands,nutriments'
  );
  if (!r.ok) throw new Error('http ' + r.status);
  const j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  const nutr = offNutr(j.product.nutriments);
  if (!nutr) return null;
  return { n: offName(j.product), k: nutr.k, p: nutr.p };
}
