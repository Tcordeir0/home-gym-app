// Camada de ÊNFASE dos exercícios: deriva a região/cabeça específica do músculo pelo NOME
// (sem tabela por exercício), pra (a) mostrar no card, (b) refinar o "Trocar" por região,
// (c) no futuro acender a sub-região certa no boneco masculino (vulovix tem as cabeças).
//
// `bases` = sub-regiões da vulovix (sem lado) que o exercício realmente enfatiza.

export interface Emphasis {
  label: string; // rótulo curto PT-BR (ex.: "superior", "cabeça longa", "lateral")
  bases: string[]; // sub-regiões vulovix enfatizadas (ex.: ['chest-upper'])
}

const RULES: { re: RegExp; label: string; bases: string[] }[] = [
  // ---- Peito ----
  { re: /supino inclinad|pe(i)?to superior|pés elevados|pes elevados|incline (press|bench)/, label: 'superior', bases: ['chest-upper'] },
  { re: /flexão inclinada|inclinada \(mãos|mãos elevadas|maos elevadas|supino declinad|peito inferior|paralelas \(peito|mergulho nas paralelas \(peito/, label: 'inferior', bases: ['chest-lower'] },
  { re: /crucifixo|fly|pullover|voador/, label: 'abertura', bases: ['chest-upper', 'chest-lower'] },
  { re: /flexão diamante|diamante|flexão fechada|fechada \(tríceps/, label: 'tríceps + peito interno', bases: ['triceps-lateral', 'chest-lower'] },
  // ---- Tríceps ----
  { re: /testa|francês|frances|overhead|extensão de tríceps|tríceps na polia alta/, label: 'cabeça longa', bases: ['triceps-long'] },
  { re: /coice|kickback|mergulho|paralel|corda|tríceps na polia|fechada/, label: 'cabeça lateral', bases: ['triceps-lateral'] },
  // ---- Ombro ----
  { re: /elevação lateral|lateral raise/, label: 'deltoide lateral', bases: ['shoulder-side'] },
  { re: /elevação frontal|frontal raise|front raise/, label: 'deltoide frontal', bases: ['shoulder-front'] },
  { re: /crucifixo invers|rear delt|reverso|posterior|face pull|cubano/, label: 'deltoide posterior', bases: ['deltoid-rear'] },
  { re: /desenvolvimento|arnold|militar|overhead press|pike/, label: 'deltoide (geral)', bases: ['shoulder-front', 'shoulder-side'] },
  { re: /remada alta|upright/, label: 'lateral + trapézio', bases: ['shoulder-side', 'traps-upper'] },
  // ---- Costas / trapézio / lombar ----
  { re: /barra fixa|pull-?up|chin-?up|pulldown|puxada/, label: 'dorsal superior', bases: ['lats-upper'] },
  { re: /remada/, label: 'dorsal médio', bases: ['lats-mid'] },
  { re: /encolhimento|shrug/, label: 'trapézio superior', bases: ['traps-upper'] },
  { re: /y-raise|y no chão|trapézio inferior/, label: 'trapézio inferior', bases: ['traps-lower'] },
  { re: /superman|hiperexten|lombar|good morning/, label: 'lombar', bases: ['lower-back-erectors'] },
  // ---- Bíceps / antebraço ----
  { re: /rosca martelo|hammer/, label: 'braquial / braquiorradial', bases: ['biceps', 'forearm-flexors'] },
  { re: /concentrada|scott|spider|aranha/, label: 'pico do bíceps', bases: ['biceps'] },
  { re: /punho|inversa|invertida|wrist|pendura|dead hang/, label: 'antebraço', bases: ['forearm-flexors', 'forearm-extensors'] },
  { re: /rosca/, label: 'bíceps', bases: ['biceps'] },
  // ---- Pernas ----
  { re: /panturrilha sentad|sóleo|soleo/, label: 'sóleo', bases: ['calves-soleus'] },
  { re: /panturrilha/, label: 'gastrocnêmio', bases: ['calves-gastroc-lateral', 'calves-gastroc-medial'] },
  { re: /stiff|terra romeno|rdl|flexora|leg curl|mesa flexora/, label: 'posterior de coxa', bases: ['hamstrings-lateral', 'hamstrings-medial'] },
  { re: /sumô|sumo|adução|adutor/, label: 'adutores', bases: ['adductors'] },
  { re: /afundo|búlgaro|bulgaro|passada|lunge|avanço/, label: 'quadríceps + glúteo', bases: ['quads', 'gluteus-maximus'] },
  { re: /agachamento|leg press|hack|cadeira extensora|wall sit|parede/, label: 'quadríceps', bases: ['quads'] },
  { re: /hip thrust|ponte|elevação pélvica|coice de glúteo|kickback de glúteo/, label: 'glúteo máximo', bases: ['gluteus-maximus'] },
  { re: /abdução|abductor/, label: 'glúteo médio', bases: ['gluteus-medius'] },
  // ---- Core ----
  { re: /oblíqu|obliqu|russian|woodchopper|inclinação lateral|prancha lateral|twist|suitcase/, label: 'oblíquos', bases: ['obliques'] },
  { re: /elevação de pernas|leg raise|reverse crunch|flutter|canivete|v-up/, label: 'abdômen inferior', bases: ['abs-lower'] },
  { re: /abdominal|crunch|prancha|hollow|sit-?up/, label: 'abdômen superior', bases: ['abs-upper'] },
];

/** Ênfase/região específica de um exercício (pelo nome). null se não houver refinamento. */
export function emphasisOf(nome: string): Emphasis | null {
  const s = (nome || '').toLowerCase();
  for (const r of RULES) if (r.re.test(s)) return { label: r.label, bases: r.bases };
  return null;
}
