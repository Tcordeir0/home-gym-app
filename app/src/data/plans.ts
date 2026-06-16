// Portado do v1 — dados de treino + demos. NÃO editar à mão (gerado do index.html v1).
import type { Exercise, PlanMap } from "./types";

export const AQUECIMENTO: Exercise[] = [
  {
    "nome": "Polichinelo",
    "musculo": "Cardio / Geral",
    "series": 2,
    "reps": "30s",
    "dica": "Eleva os batimentos e aquece o corpo todo. Ritmo constante."
  },
  {
    "nome": "Mobilidade de quadril",
    "musculo": "Quadril",
    "series": 1,
    "reps": "10/lado",
    "dica": "Círculos amplos com o joelho elevado, abrindo e fechando o quadril."
  },
  {
    "nome": "Rotação de ombros",
    "musculo": "Ombro",
    "series": 1,
    "reps": "15/sentido",
    "dica": "Braços estendidos, círculos pequenos crescendo até amplos. Solta a articulação."
  },
  {
    "nome": "Agachamento livre (sem carga)",
    "musculo": "Pernas",
    "series": 2,
    "reps": "12",
    "dica": "Aquece o padrão de movimento. Desça devagar explorando a amplitude."
  },
  {
    "nome": "Cat-camel (gato-camelo)",
    "musculo": "Coluna",
    "series": 1,
    "reps": "10",
    "dica": "Em quatro apoios, alterne arquear e arredondar a coluna. Mobiliza a lombar."
  },
  {
    "nome": "Alongamento dinâmico de posterior",
    "musculo": "Posterior",
    "series": 1,
    "reps": "10/perna",
    "dica": "Chute controlado tocando a mão oposta. Prepara a cadeia posterior."
  }
];

export const PLANS: PlanMap = {
  "u1": {
    "focus": "Peito",
    "labels": {
      "A": "Peito + Empurrar",
      "B": "Puxar + Pernas",
      "C": "Pernas completo",
      "warm": "Prepara o corpo"
    },
    "treinos": {
      "A": [
        {
          "nome": "Supino no chão com halteres",
          "musculo": "Peito",
          "series": 4,
          "reps": "10",
          "dica": "Deitado no chão, um halter em cada mão. Empurre até esticar os braços e desça até o cotovelo tocar o chão."
        },
        {
          "nome": "Flexão (push-up)",
          "musculo": "Peito",
          "series": 4,
          "reps": "máx",
          "dica": "Corpo reto, desça até o peito quase tocar o chão. Quanto mais lento, mais difícil."
        },
        {
          "nome": "Crucifixo no chão com halteres",
          "musculo": "Peito",
          "series": 3,
          "reps": "12",
          "dica": "Deitado no chão, cotovelos levemente flexionados. Abra os braços até os cotovelos tocarem o chão e volte apertando o peito."
        },
        {
          "nome": "Flexão com pés elevados",
          "musculo": "Peito superior / Ombro",
          "series": 3,
          "reps": "12",
          "dica": "Pés apoiados no sofá ou na cama. Quanto mais alto, mais foco na parte de cima do peito e ombro."
        },
        {
          "nome": "Desenvolvimento com halteres",
          "musculo": "Ombro",
          "series": 3,
          "reps": "10",
          "dica": "Em pé, abdômen firme, não arqueie as costas. Suba até quase encostar os halteres no topo."
        },
        {
          "nome": "Tríceps testa com halteres",
          "musculo": "Tríceps",
          "series": 3,
          "reps": "12",
          "dica": "Deitado, cotovelos apontando pro teto. Desça os halteres perto da testa, só o antebraço se move."
        },
        {
          "nome": "Prancha",
          "musculo": "Core",
          "series": 3,
          "reps": "40s",
          "dica": "Corpo numa linha reta. Glúteo e abdômen contraídos, não deixe o quadril cair."
        }
      ],
      "B": [
        {
          "nome": "Stiff com halteres",
          "musculo": "Posterior / Glúteo",
          "series": 4,
          "reps": "12",
          "dica": "Empurre o quadril pra trás com as pernas quase retas. Costas neutras, halteres rentes às coxas."
        },
        {
          "nome": "Remada curvada com halteres",
          "musculo": "Costas",
          "series": 4,
          "reps": "10",
          "dica": "Tronco inclinado a ~45°, puxe os halteres em direção ao umbigo apertando as escápulas."
        },
        {
          "nome": "Remada unilateral (apoio na cadeira)",
          "musculo": "Costas",
          "series": 3,
          "reps": "10/lado",
          "dica": "Apoie mão e joelho numa cadeira firme. Puxe o halter junto ao quadril, sem girar o tronco."
        },
        {
          "nome": "Agachamento goblet",
          "musculo": "Quadríceps / Glúteo",
          "series": 4,
          "reps": "12",
          "dica": "Segure um halter colado ao peito. Peito erguido, joelhos alinhados aos pés."
        },
        {
          "nome": "Afundo com halteres",
          "musculo": "Quadríceps / Glúteo",
          "series": 3,
          "reps": "10/perna",
          "dica": "Um halter em cada mão. Passo largo, tronco vertical, joelho de trás desce em direção ao chão."
        },
        {
          "nome": "Rosca direta com halteres",
          "musculo": "Bíceps",
          "series": 3,
          "reps": "12",
          "dica": "Cotovelos fixos ao lado do corpo. Suba sem usar impulso dos ombros."
        },
        {
          "nome": "Elevação de pernas",
          "musculo": "Core",
          "series": 3,
          "reps": "15",
          "dica": "Lombar colada no chão. Suba as pernas controlando, sem dar impulso."
        }
      ],
      "C": [
        {
          "nome": "Agachamento goblet",
          "musculo": "Quadríceps / Glúteo",
          "series": 4,
          "reps": "12",
          "dica": "Halter colado ao peito, peito erguido. Desça até as coxas ficarem paralelas ao chão."
        },
        {
          "nome": "Búlgaro com halteres",
          "musculo": "Quadríceps / Glúteo",
          "series": 3,
          "reps": "10/perna",
          "dica": "Pé de trás apoiado no sofá/cadeira. Desça reto, foco na perna da frente."
        },
        {
          "nome": "Stiff com halteres",
          "musculo": "Posterior",
          "series": 4,
          "reps": "12",
          "dica": "Quadril pra trás, pernas quase retas, costas neutras. Sinta o posterior alongar."
        },
        {
          "nome": "Agachamento sumô com halter",
          "musculo": "Adutor / Glúteo",
          "series": 3,
          "reps": "15",
          "dica": "Pés afastados e pontas pra fora, segurando um halter entre as pernas."
        },
        {
          "nome": "Panturrilha em pé com halteres",
          "musculo": "Panturrilha",
          "series": 4,
          "reps": "20",
          "dica": "Em pé, suba na ponta dos pés o máximo possível e desça controlando."
        },
        {
          "nome": "Prancha",
          "musculo": "Core",
          "series": 3,
          "reps": "40s",
          "dica": "Corpo numa linha reta, glúteo e abdômen contraídos."
        },
        {
          "nome": "Abdominal bicicleta",
          "musculo": "Core",
          "series": 3,
          "reps": "20",
          "dica": "Cotovelo em direção ao joelho oposto, movimento controlado."
        }
      ]
    }
  },
  "u2": {
    "focus": "Glúteos",
    "labels": {
      "A": "Glúteos + Posterior",
      "B": "Superior + Core",
      "C": "Glúteo + Core",
      "warm": "Prepara o corpo"
    },
    "treinos": {
      "A": [
        {
          "nome": "Hip thrust (apoio no sofá)",
          "musculo": "Glúteo",
          "series": 4,
          "reps": "15",
          "dica": "Costas apoiadas na beira do sofá, um halter sobre o quadril. Suba e aperte o glúteo no topo por 1s."
        },
        {
          "nome": "Agachamento sumô com halter",
          "musculo": "Glúteo / Adutor",
          "series": 4,
          "reps": "15",
          "dica": "Pés afastados e pontas pra fora, segurando um halter entre as pernas. Desça mantendo os joelhos abertos."
        },
        {
          "nome": "Búlgaro com halteres",
          "musculo": "Glúteo / Quadríceps",
          "series": 3,
          "reps": "10/perna",
          "dica": "Pé de trás apoiado no sofá ou numa cadeira. Desça reto focando o glúteo da perna da frente."
        },
        {
          "nome": "Stiff com halteres",
          "musculo": "Posterior / Glúteo",
          "series": 3,
          "reps": "12",
          "dica": "Quadril pra trás, pernas quase retas, halteres descendo rente às pernas. Sinta o posterior alongar."
        },
        {
          "nome": "Abdução de quadril",
          "musculo": "Glúteo médio",
          "series": 3,
          "reps": "20",
          "dica": "Deitada de lado, abra a perna de cima controlando. Pode apoiar um halter na coxa pra dificultar."
        },
        {
          "nome": "Coice de glúteo (kickback)",
          "musculo": "Glúteo",
          "series": 3,
          "reps": "15/perna",
          "dica": "Em quatro apoios, empurre o calcanhar pro teto contraindo o glúteo no topo."
        },
        {
          "nome": "Prancha lateral",
          "musculo": "Core",
          "series": 3,
          "reps": "30s/lado",
          "dica": "Corpo alinhado, quadril elevado, sem deixar cair."
        }
      ],
      "B": [
        {
          "nome": "Flexão (push-up)",
          "musculo": "Peito",
          "series": 3,
          "reps": "12",
          "dica": "Pode apoiar os joelhos no início. Desça controlando até o peito perto do chão."
        },
        {
          "nome": "Remada unilateral (apoio na cadeira)",
          "musculo": "Costas",
          "series": 3,
          "reps": "12",
          "dica": "Apoie mão e joelho numa cadeira. Puxe o halter junto ao quadril apertando as costas."
        },
        {
          "nome": "Desenvolvimento com halteres",
          "musculo": "Ombro",
          "series": 3,
          "reps": "12",
          "dica": "Suba os halteres acima da cabeça sem arquear as costas."
        },
        {
          "nome": "Rosca direta com halteres",
          "musculo": "Bíceps",
          "series": 3,
          "reps": "12",
          "dica": "Cotovelos fixos ao lado do corpo, suba sem impulso."
        },
        {
          "nome": "Elevação pélvica unilateral",
          "musculo": "Glúteo",
          "series": 3,
          "reps": "12/perna",
          "dica": "Deitada, uma perna estendida. Suba o quadril com a outra perna apertando o glúteo."
        },
        {
          "nome": "Abdominal bicicleta",
          "musculo": "Core",
          "series": 3,
          "reps": "20",
          "dica": "Cotovelo em direção ao joelho oposto, movimento controlado."
        },
        {
          "nome": "Prancha",
          "musculo": "Core",
          "series": 3,
          "reps": "40s",
          "dica": "Linha reta da cabeça aos pés, abdômen firme."
        }
      ],
      "C": [
        {
          "nome": "Agachamento sumô com halter",
          "musculo": "Glúteo / Adutor",
          "series": 4,
          "reps": "15",
          "dica": "Pés afastados e pontas pra fora, halter entre as pernas. Desça com os joelhos abertos."
        },
        {
          "nome": "Hip thrust (apoio no sofá)",
          "musculo": "Glúteo",
          "series": 4,
          "reps": "15",
          "dica": "Costas na beira do sofá, halter sobre o quadril. Aperte o glúteo no topo por 1s."
        },
        {
          "nome": "Coice de glúteo (kickback)",
          "musculo": "Glúteo",
          "series": 3,
          "reps": "15/perna",
          "dica": "Em quatro apoios, empurre o calcanhar pro teto contraindo o glúteo no topo."
        },
        {
          "nome": "Abdução de quadril",
          "musculo": "Glúteo médio",
          "series": 3,
          "reps": "20",
          "dica": "Deitada de lado, abra a perna de cima controlando. Pode apoiar um halter na coxa."
        },
        {
          "nome": "Panturrilha em pé",
          "musculo": "Panturrilha",
          "series": 4,
          "reps": "20",
          "dica": "Na ponta dos pés, suba o máximo e desça devagar. Segure halteres pra dificultar."
        },
        {
          "nome": "Prancha",
          "musculo": "Core",
          "series": 3,
          "reps": "40s",
          "dica": "Linha reta da cabeça aos pés, abdômen firme."
        },
        {
          "nome": "Abdominal bicicleta",
          "musculo": "Core",
          "series": 3,
          "reps": "20",
          "dica": "Cotovelo em direção ao joelho oposto, movimento controlado."
        }
      ]
    }
  }
};
