import { describe, expect, it } from "vitest";

import { createT } from "@/i18n";

import { placeRowAccessibilityLabel } from "./place-row-accessibility";

/**
 * The places-list row's accessible-name contract (PR #19 review round 4):
 * the expo-router Link wrapping each row carries an explicit
 * accessibilityLabel, which replaces the name a screen reader would
 * otherwise compose from the row's children — so the label must say
 * everything the row shows, in sight order: the place name, the category,
 * then the content-trust markers ("Showing original (...)" /
 * "Machine translated") the journey requires to be announced (D-14). The
 * marker strings below come from the real catalogs via createT — the same
 * strings the visible Chips render.
 */

describe("placeRowAccessibilityLabel", () => {
  it("composes name, category and both trust markers in sight order", () => {
    const t = createT("en");
    const label = placeRowAccessibilityLabel({
      title: "Praia do Farol",
      category: "Beach",
      markers: [
        t("common.showingOriginal", { locale: "pt-BR" }),
        t("common.machineTranslated"),
      ],
    });
    expect(label).toBe(
      "Praia do Farol, Beach, Showing original (Português), Machine translated",
    );
  });

  it("carries whichever markers the row shows", () => {
    const t = createT("en");
    expect(
      placeRowAccessibilityLabel({
        title: "Praia do Farol",
        category: "Beach",
        markers: [t("common.machineTranslated")],
      }),
    ).toBe("Praia do Farol, Beach, Machine translated");
    expect(
      placeRowAccessibilityLabel({
        title: "Praia do Farol",
        category: "Beach",
        markers: [t("common.showingOriginal", { locale: "de" })],
      }),
    ).toBe("Praia do Farol, Beach, Showing original (Deutsch)");
  });

  it("composes the markers from the reader's own catalog, not always English", () => {
    const t = createT("pt-BR");
    const label = placeRowAccessibilityLabel({
      title: "Praia do Farol",
      category: "Praia",
      markers: [t("common.showingOriginal", { locale: "pt-BR" })],
    });
    expect(label).toBe("Praia do Farol, Praia, Mostrando original (Português)");
  });

  it("skips absent parts (no category, no markers)", () => {
    expect(
      placeRowAccessibilityLabel({ title: "Praia do Farol", markers: [] }),
    ).toBe("Praia do Farol");
    const t = createT("en");
    expect(
      placeRowAccessibilityLabel({
        title: "Praia do Farol",
        markers: [t("common.machineTranslated")],
      }),
    ).toBe("Praia do Farol, Machine translated");
  });
});
