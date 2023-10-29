// cSpell:disable
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, it, test } from "vitest";

import { eldr } from "./index.js";

interface LanguageFixtures {
  languageFixtures: string[][];
}

const languageTuples: string[][] = [];

const bigTest = test.extend<LanguageFixtures>({
  // eslint-disable-next-line no-empty-pattern
  languageFixtures: async ({}, use) => {
    const bigTestFile = await readFile(
      resolve("benchmarks/big-test.txt"),
      "utf8"
    );
    const tuples = bigTestFile.split("\n").map((lines) => lines.split("\t"));
    languageTuples.push(...tuples);
    await use(languageTuples);
    languageTuples.length = 0;
  },
});

describe("eldr", () => {
  it("loads successfully", ({ expect }) => {
    expect(eldr).toBeTypeOf("object");
  });

  it("uses the medium size ngram file by default", ({ expect }) => {
    expect(eldr.info()).toHaveProperty("Data type", "M60");
  });

  describe("detect", () => {
    it("detects a test sentence as spanish", ({ expect }) => {
      expect(eldr.detect("Hola, cómo te llamas?")).toHaveProperty(
        "iso639_1",
        "es"
      );
    });

    describe("getScores", () => {
      it("returns more than one language result for a test sentence", ({
        expect,
      }) => {
        const scores = eldr.detect("Hola, cómo te llamas?").getScores();
        expect(Object.keys(scores)).to.have.lengthOf.greaterThan(1);
      });
    });

    describe("small text", () => {
      it("detects the word `to` as english", ({ expect }) => {
        expect(eldr.detect("To")).toHaveProperty("iso639_1", "en");
      });
    });

    describe("isReliable()", () => {
      it("returns true for a known good string", ({ expect }) => {
        expect(eldr.detect("Hola, cómo te llamas?").isReliable()).toBeTruthy();
      });
      it("returns false for a known bad string", ({ expect }) => {
        expect(
          eldr
            .detect("zxz zcz zvz zbz znz zmz zlz zsz zdz zkz zjz pelo")
            .isReliable()
        ).toBeFalsy();
      });
    });
  });

  describe("result", () => {
    it("contains the language name", ({ expect }) => {
      const languageResult = eldr.detect("Hola, cómo te llamas?");
      expect(languageResult).toHaveProperty("languageName");
      expect(languageResult.languageName).toBe("Spanish");
      const detected = eldr.detect("Hola, cómo te llamas?");
      console.log(
        detected.isReliable(),
        detected.iso639_1,
        detected.languageName,
        detected.getScores()
      );
    });
  });
});

bigTest("accuracy is >= 99.4%", ({ languageFixtures, expect }) => {
  let successCount = 0;
  let failCount = 0;
  for (const [iso639_1, text] of languageFixtures) {
    if (eldr.detect(text).iso639_1 === iso639_1) {
      successCount++;
    } else {
      failCount++;
    }
  }
  expect(successCount + failCount).toBeGreaterThan(60_000);
  expect((successCount / (successCount + failCount)) * 100).toBeGreaterThan(
    99.4
  );
});
