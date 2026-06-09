// Reconhecimento de comida por IA NO NAVEGADOR (Transformers.js + Food-101 ONNX).
// Sem conta, sem chave, foto não sai do aparelho. Portado do v1.
import { FOODS, type Food } from "../data/foods";

const FOOD101_PT: Record<string, string> = {
  "apple_pie": "torta de maçã",
  "baby_back_ribs": "costela",
  "baklava": "baklava",
  "beef_carpaccio": "carpaccio",
  "beef_tartare": "carne crua",
  "beet_salad": "salada de beterraba",
  "beignets": "sonho",
  "bibimbap": "bibimbap",
  "bread_pudding": "pudim de pão",
  "breakfast_burrito": "burrito",
  "bruschetta": "bruschetta",
  "caesar_salad": "salada caesar",
  "cannoli": "cannoli",
  "caprese_salad": "salada caprese",
  "carrot_cake": "bolo de cenoura",
  "ceviche": "ceviche",
  "cheesecake": "cheesecake",
  "cheese_plate": "queijo",
  "chicken_curry": "frango ao curry",
  "chicken_quesadilla": "quesadilla de frango",
  "chicken_wings": "asa de frango",
  "chocolate_cake": "bolo de chocolate",
  "chocolate_mousse": "mousse de chocolate",
  "churros": "churros",
  "clam_chowder": "sopa de marisco",
  "club_sandwich": "sanduíche",
  "crab_cakes": "bolinho de caranguejo",
  "creme_brulee": "creme brûlée",
  "croque_madame": "croque madame",
  "cup_cakes": "cupcake",
  "deviled_eggs": "ovo recheado",
  "donuts": "rosquinha",
  "dumplings": "guioza",
  "edamame": "edamame",
  "eggs_benedict": "ovo benedict",
  "escargots": "escargot",
  "falafel": "falafel",
  "filet_mignon": "filé mignon",
  "fish_and_chips": "peixe com batata",
  "foie_gras": "patê",
  "french_fries": "batata frita",
  "french_onion_soup": "sopa de cebola",
  "french_toast": "rabanada",
  "fried_calamari": "lula frita",
  "fried_rice": "arroz",
  "frozen_yogurt": "iogurte",
  "garlic_bread": "pão de alho",
  "gnocchi": "nhoque",
  "greek_salad": "salada grega",
  "grilled_cheese_sandwich": "sanduíche de queijo",
  "grilled_salmon": "salmão grelhado",
  "guacamole": "guacamole",
  "gyoza": "guioza",
  "hamburger": "hambúrguer",
  "hot_and_sour_soup": "sopa",
  "hot_dog": "cachorro-quente",
  "huevos_rancheros": "ovos",
  "hummus": "homus",
  "ice_cream": "sorvete",
  "lasagna": "lasanha",
  "lobster_bisque": "sopa de lagosta",
  "lobster_roll_sandwich": "sanduíche de lagosta",
  "macaroni_and_cheese": "macarrão com queijo",
  "macarons": "macaron",
  "miso_soup": "sopa miso",
  "mussels": "mexilhão",
  "nachos": "nachos",
  "omelette": "omelete",
  "onion_rings": "anéis de cebola",
  "oysters": "ostra",
  "pad_thai": "pad thai",
  "paella": "paella",
  "pancakes": "panqueca",
  "panna_cotta": "panna cotta",
  "peking_duck": "pato",
  "pho": "sopa pho",
  "pizza": "pizza",
  "pork_chop": "costeleta de porco",
  "poutine": "batata frita",
  "prime_rib": "costela",
  "pulled_pork_sandwich": "sanduíche de porco",
  "ramen": "ramen",
  "ravioli": "ravioli",
  "red_velvet_cake": "bolo",
  "risotto": "risoto",
  "samosa": "samosa",
  "sashimi": "sashimi",
  "scallops": "vieira",
  "seaweed_salad": "salada de alga",
  "shrimp_and_grits": "camarão",
  "spaghetti_bolognese": "macarrão à bolonhesa",
  "spaghetti_carbonara": "macarrão carbonara",
  "spring_rolls": "rolinho primavera",
  "steak": "bife",
  "strawberry_shortcake": "bolo de morango",
  "sushi": "sushi",
  "tacos": "tacos",
  "takoyaki": "takoyaki",
  "tiramisu": "tiramisu",
  "tuna_tartare": "atum",
  "waffles": "waffle"
};

function normTxt(s: string) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

export function ptLabel(label: string): string { return FOOD101_PT[label] || label.replace(/_/g, " "); }

/** Casa um termo (ex "salmão grelhado") com um alimento da base, por palavra inteira/maior sobreposição. */
export function food101Local(term: string): Food | null {
  const tw = normTxt(term).split(/\s+/).filter((w) => w.length >= 3);
  if (!tw.length) return null;
  let best: Food | null = null, bestScore = 0;
  FOODS.forEach((f) => {
    const nw = normTxt(f.n).split(/[^a-z0-9]+/).filter(Boolean);
    let s = 0; tw.forEach((w) => { if (nw.indexOf(w) >= 0) s++; });
    if (s > bestScore) { bestScore = s; best = f; }
  });
  return best;
}

let pipe: ((url: string, opts: { top_k: number }) => Promise<{ label: string; score: number }[]>) | null = null;

/** Carrega o modelo (1ª vez baixa ~MB, fica em cache) e reconhece o prato. */
export async function recognizePlate(dataUrl: string): Promise<{ label: string; score: number }[]> {
  if (!pipe) {
    const cdn = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";
    const t = await import(/* @vite-ignore */ cdn);
    t.env.allowLocalModels = false;
    pipe = await t.pipeline("image-classification", "onnx-community/swin-finetuned-food101-ONNX", { dtype: "q8" });
  }
  return await pipe!(dataUrl, { top_k: 5 });
}
