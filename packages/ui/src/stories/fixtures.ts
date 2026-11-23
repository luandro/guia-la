/**
 * Story fixture copy (phase 03, task 7). Stories are dev review surfaces,
 * not shipped UI, so their sample strings live here rather than inline in
 * each *.stories.tsx (D-14 keeps the *app* strings in the i18n catalogs;
 * these are story-only). Every locale the matrix renders — en, pt-BR and
 * de — carries its own copy so the review URL exercises real text width.
 *
 * `de` is the long-text locale the phase calls out for overflow: German
 * compounds and longer function words are what break a fixed-width chip,
 * a truncating row or a wrapping heading. Portuguese covers the Romance
 * branch the app's default locale uses; English is the compact baseline.
 */

/** Locales the state matrix renders. `de` is the long-text/overflow locale. */
export const STORY_LOCALES = ["en", "pt-BR", "de"] as const;
export type StoryLocale = (typeof STORY_LOCALES)[number];

/** BCP-47 tags for the rendered locale, for the canvas's lang attribute. */
export const STORY_LOCALE_LABELS: Record<StoryLocale, string> = {
  en: "English (compact baseline)",
  "pt-BR": "Português (Romance branch, default locale)",
  de: "Deutsch (long-text, overflow)",
};

/** One locale's copy for the whole primitive set. */
export type StoryCopy = {
  heading: { level1: string; level2: string; level3: string };
  text: {
    display: string;
    title: string;
    heading: string;
    body: string;
    bodySmall: string;
    label: string;
    caption: string;
  };
  button: {
    primary: string;
    secondary: string;
    ghost: string;
    loading: string;
    disabled: string;
  };
  card: { heading: string; note: string; body: string; action: string };
  chip: {
    neutral: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    pressable: string;
  };
  listRow: { title: string; description: string; trailingTitle: string };
  textInput: {
    label: string;
    hint: string;
    error: string;
    emailLabel: string;
    emailHint: string;
    emailError: string;
    emailValue: string;
    placeholder: string;
    readOnlyLabel: string;
    readOnlyHint: string;
    readOnlyValue: string;
  };
  emptyState: { title: string; description: string; action: string };
  errorState: { title: string; description: string; retry: string };
  mapPlaceholder: { label: string; hint: string };
  offlineBanner: { message: string };
};

export const STORY_COPY: Record<StoryLocale, StoryCopy> = {
  en: {
    heading: {
      level1: "Sphinx of black quartz",
      level2: "Travaillez-vous ce soir?",
      level3: "How vexingly quick daft zebras jump",
    },
    text: {
      display: "Sphinx of black quartz, judge my vow",
      title: "Travaillez-vous ce soir?",
      heading: "How vexingly quick daft zebras jump",
      body: "The quick brown fox jumps over the lazy dog — 0123456789 — journeys end quickly with fierce travel pace.",
      bodySmall: "Pchnąć w tę łódź jeża lub ośm skrzyń fig",
      label: "label role",
      caption: "Fixture copy, not shipped UI.",
    },
    button: {
      primary: "Continue",
      secondary: "Save changes",
      ghost: "Cancel",
      loading: "Loading",
      disabled: "Unavailable",
    },
    card: {
      heading: "Praia do Farol",
      note: "Lighthouse beach",
      body: "Cards compose with the other primitives — a paragraph and an action.",
      action: "Open place",
    },
    chip: {
      neutral: "neutral",
      accent: "accent",
      success: "verified",
      warning: "machine translated",
      danger: "closed",
      pressable: "pressable chip (44pt target)",
    },
    listRow: {
      title: "Praia do Farol",
      description: "Lighthouse beach on the island's north shore",
      trailingTitle: "Trilha do Farol",
    },
    textInput: {
      label: "Search places",
      hint: "Name, category or village",
      error: "This address is missing an @ sign",
      emailLabel: "Email",
      emailHint: "We never share it",
      emailError: "This address is missing an @ sign",
      emailValue: "reader-at-example",
      placeholder: "Anything the guide should know",
      readOnlyLabel: "Village",
      readOnlyHint: "Draft saved while offline",
      readOnlyValue: "Vila do Farol",
    },
    emptyState: {
      title: "No places here yet",
      description: "This destination has no published places so far.",
      action: "Suggest a place",
    },
    errorState: {
      title: "Something went wrong",
      description: "The places could not be loaded.",
      retry: "Try again",
    },
    mapPlaceholder: {
      label: "Map of the destination",
      hint: "Interactive maps arrive with the guide widgets.",
    },
    offlineBanner: {
      message: "You appear to be offline. Showing saved information.",
    },
  },
  "pt-BR": {
    heading: {
      level1: "Atenção: jôzes gáuchos",
      level2: "Travaillez-vous ce soir?",
      level3: "Como rápida e velozmente os zangões saltam",
    },
    text: {
      display: "Atenção: jôzes gáuchos, julguem meu voto",
      title: "Travaillez-vous ce soir?",
      heading: "Como rápida e velozmente os zangões saltam",
      body: "A rápida raposa marrom salta sobre o cão preguiçoso — 0123456789 — as jornadas terminam rápido com um ritmo de viagem feroz e constante.",
      bodySmall: "Pchnąć w tę łódź jeża lub ośm skrzyń fig",
      label: "função de rótulo",
      caption: "Texto de exemplo, não é a interface final.",
    },
    button: {
      primary: "Continuar",
      secondary: "Salvar alterações",
      ghost: "Cancelar",
      loading: "Carregando",
      disabled: "Indisponível",
    },
    card: {
      heading: "Praia do Farol",
      note: "Praia do farol",
      body: "Os cartões se compõem com os outros primitivos — um parágrafo e uma ação.",
      action: "Abrir lugar",
    },
    chip: {
      neutral: "neutro",
      accent: "destaque",
      success: "verificado",
      warning: "traduzido por máquina",
      danger: "fechado",
      pressable: "etiqueta pressionável (alvo de 44pt)",
    },
    listRow: {
      title: "Praia do Farol",
      description: "Praia do farol na costa norte da ilha",
      trailingTitle: "Trilha do Farol",
    },
    textInput: {
      label: "Buscar lugares",
      hint: "Nome, categoria ou vila",
      error: "Este endereço está sem o sinal @",
      emailLabel: "E-mail",
      emailHint: "Nunca compartilhamos",
      emailError: "Este endereço está sem o sinal @",
      emailValue: "leitor-ate-exemplo",
      placeholder: "Qualquer coisa que o guia deva saber",
      readOnlyLabel: "Vila",
      readOnlyHint: "Rascunho salvo enquanto offline",
      readOnlyValue: "Vila do Farol",
    },
    emptyState: {
      title: "Nenhum lugar aqui ainda",
      description: "Este destino ainda não tem lugares publicados.",
      action: "Sugerir um lugar",
    },
    errorState: {
      title: "Algo deu errado",
      description: "Não foi possível carregar os lugares.",
      retry: "Tentar novamente",
    },
    mapPlaceholder: {
      label: "Mapa do destino",
      hint: "Os mapas interativos chegam com os widgets do guia.",
    },
    offlineBanner: {
      message: "Parece que você está sem conexão. Exibindo informações salvas.",
    },
  },
  de: {
    heading: {
      level1: "Achtung: jôzes gáuchos",
      level2: "Travaillez-vous ce soir?",
      level3: "Wie verblüffend schnell die frechen Zebras springen",
    },
    text: {
      display: "Achtung: jôzes gáuchos, urteilt über mein Versprechen",
      title: "Travaillez-vous ce soir?",
      heading: "Wie verblüffend schnell die frechen Zebras springen",
      body: "Der schnelle braune Fuchs springt über den faulen Hund — 0123456789 — Reisen enden schnell mit einem unermüdlichen, zügigen Reisestil und reibungslosem Ablauf.",
      bodySmall: "Pchnąć w tę łódź jeża lub ośm skrzyń fig",
      label: "Beschriftungsrolle",
      caption: "Beispieltext, nicht die endgültige Oberfläche.",
    },
    button: {
      primary: "Weiter",
      secondary: "Änderungen speichern",
      ghost: "Abbrechen",
      loading: "Wird geladen",
      disabled: "Nicht verfügbar",
    },
    card: {
      heading: "Praia do Farol",
      note: "Leuchtturmstrand",
      body: "Karten setzen sich aus den anderen Bausteinen zusammen — ein Absatz und eine Aktion.",
      action: "Ort öffnen",
    },
    chip: {
      neutral: "neutral",
      accent: "Hervorhebung",
      success: "verifiziert",
      warning: "maschinell übersetzt",
      danger: "geschlossen",
      pressable: "drückbare Markierung (44pt-Ziel)",
    },
    listRow: {
      title: "Praia do Farol",
      description: "Leuchtturmstrand an der Nordküste der Insel",
      trailingTitle: "Trilha do Farol",
    },
    textInput: {
      label: "Orte suchen",
      hint: "Name, Kategorie oder Dorf",
      error: "Diese Adresse enthält kein @-Zeichen",
      emailLabel: "E-Mail",
      emailHint: "Wir geben sie niemals weiter",
      emailError: "Diese Adresse enthält kein @-Zeichen",
      emailValue: "leser-ohne-at-beispiel",
      placeholder: "Alles, was der Reiseführer wissen sollte",
      readOnlyLabel: "Dorf",
      readOnlyHint: "Entwurf offline gespeichert",
      readOnlyValue: "Vila do Farol",
    },
    emptyState: {
      title: "Hier sind noch keine Orte",
      description:
        "Für dieses Reiseziel wurden noch keine Orte veröffentlicht.",
      action: "Einen Ort vorschlagen",
    },
    errorState: {
      title: "Etwas ist schiefgelaufen",
      description: "Die Orte konnten nicht geladen werden.",
      retry: "Erneut versuchen",
    },
    mapPlaceholder: {
      label: "Karte des Reiseziels",
      hint: "Interaktive Karten kommen mit den Reiseführer-Widgets.",
    },
    offlineBanner: {
      message:
        "Sie scheinen offline zu sein. Gespeicherte Informationen werden angezeigt.",
    },
  },
};

/** Look up one locale's copy (total over STORY_LOCALES). */
export function copyFor(locale: StoryLocale): StoryCopy {
  return STORY_COPY[locale];
}
