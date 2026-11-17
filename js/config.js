/* CUT. PASTE. PLAY. · configurarea cursului (se poate edita fără a atinge player-ul).
   - Textele și pozițiile slide-urilor sunt în js/slides.js (generat din PowerPoint);
     vocea și subtitrarea în audio/vo.js; interacțiunile adăugate în js/extras.js. */
window.CPP_CONFIG = {
  id: 'Atelier_CutPastePlay_RO',
  title: 'CUT. PASTE. PLAY. · Atelier de creație digitală',
  version: '0.5',
  storageKey: 'Atelier_CutPastePlay_RO_v05',

  media: {
    intro: 'media/brand/cp-logo-animat.mp4',
    clip: 'media/video/clip-exemplu.mp4',            // clipul-exemplu de pe 1.30 (15 s, 9:16, fără sunet)
    clipPoster: 'media/video/clip-exemplu-afis.jpg',
    kit: 'media/docs/CutPastePlay_kit-clip-exemplu.zip'  // fundalurile și decupajele clipului-exemplu
  },

  // Lucrările lui Picasso, Höch și Bearden (1.5–1.7) sunt protejate de drepturi de autor.
  // false = în locul imaginii apare un card cu autorul, titlul și linkul spre muzeu (de folosit pe un site public).
  arataLucrarile: false,
  lucrari: {
    '1.5': { autor: 'Pablo Picasso', titlu: 'Still Life with Chair Caning', an: '1912', muzeu: 'Musée national Picasso-Paris',
      url: 'https://www.museepicassoparis.fr/sites/default/files/2020-01/Fiche_oeuvre_Nature_morte_chaise_cannee_web.pdf' },
    '1.6': { autor: 'Hannah Höch', titlu: 'Cut with the Kitchen Knife', an: '1919–20', muzeu: 'German History in Documents and Images',
      url: 'https://germanhistorydocs.org/en/weimar-germany-1918-1933/ghdi:image-4209' },
    '1.7': { autor: 'Romare Bearden', titlu: 'The Block', an: '1971', muzeu: 'The Metropolitan Museum of Art',
      url: 'https://www.metmuseum.org/en/art/collection/search/481891' }
  },

  // Registrul de variabile (ca în Storyline): nume → valoare implicită
  vars: {
    tCuvant: '',                                   // 1.16 · răspunsul într-un cuvânt
    tPlan_Emotie: '', tPlan_Primul: '', tPlan_Ultimul: '', tPlan_Element: '',   // 1.31 · planul tău
    bVerif1: false, bVerif2: false, bVerif3: false, bVerif4: false,          // 1.30 · cele patru întrebări
    nSensuri: 0                                    // 1.9 · sensurile găsite în atelierul rapid
  },

  credits: {
    made: 'E-learning realizat de LEETUCATION SRL',
    lines: [
      'Atelierul de creație digitală „CUT. PASTE. PLAY.”, din programul Imagine Sunet ’89 · Clasa a XII-a',
      'Colajele și schemele editorului: din prezentarea originală a atelierului (CUT_PASTE_PLAY.pdf). Zece colaje au fost mărite 2× în Magnific (Precision), fără să li se schimbe conținutul.',
      'Exemplele din editor folosesc numele din CapCut; pașii sunt aceiași în orice editor video cu piste și keyframes.',
      'Vocea: generată cu inteligență artificială în Magnific (ElevenLabs v4, vocea „Alexandra Stoica”).'
    ]
  }
};
