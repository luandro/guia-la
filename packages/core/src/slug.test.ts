import { describe, expect, it } from "vitest";

import { isSlug } from "./slug.js";

describe("isSlug", () => {
  it.each(["praia-do-farol", "fx-cotijuba-001", "a", "0-1"])(
    "accepts %s",
    (value) => {
      expect(isSlug(value)).toBe(true);
    },
  );

  it.each([
    ["", "empty"],
    ["Praia-do-Farol", "uppercase"],
    ["praia_do_farol", "underscore"],
    ["praia do farol", "space"],
    ["-praia", "leading hyphen"],
    ["praia-", "trailing hyphen"],
    ["praia--do", "consecutive hyphens"],
    ["praia.do", "dot"],
    ["praia/do", "slash"],
    ["praia-do-farol\n", "trailing newline"],
    ["çachoeira", "non-ascii"],
  ])("rejects %s (%s)", (value) => {
    expect(isSlug(value)).toBe(false);
  });
});
