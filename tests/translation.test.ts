import { test, expect } from "vitest";
import { translate } from "~/translation";

const english = {
  "test-plain": "A plain test",
  "test-count": {
    "one": "{count} object",
    "other": "{count} objects"
  }
}

test("translate", () => {
  expect(translate("en", english, "test-plain")).toBe("A plain test");
  expect(translate("en", english, "test-count", {count: 1})).toBe("1 object");
  expect(translate("en", english, "test-count", {count: 0})).toBe("0 objects");
  expect(translate("en", english, "test-count", {count: 2})).toBe("2 objects");
  expect(() => translate("en", english, "test-count")).toThrow("requires a finite numeric count");
});
