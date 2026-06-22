import { expect, test } from "vitest";
import {
  chunk,
  omit,
  pick,
} from "~/utility";

test("chunk", () => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  expect([...chunk(alphabet, 2)].length).toBe(Math.ceil(alphabet.length / 2));
  expect([...chunk(alphabet, 3)].length).toBe(Math.ceil(alphabet.length / 3));
  expect([...chunk(alphabet, 4)]).toStrictEqual([
    "abcd".split(""),
    "efgh".split(""),
    "ijkl".split(""),
    "mnop".split(""),
    "qrst".split(""),
    "uvwx".split(""),
    "yz".split(""),
  ]);
});

test("omit", () => {
  const object = { a: 1, b: 2, c: 3 };
  expect(omit(object, "a")).toMatchObject({ b: 2, c: 3 });
  expect(omit(object, ["a", "b"])).toMatchObject({ c: 3 });
});

test("pick", () => {
  const object = { a: 1, b: 2, c: 3 };
  expect(pick(object, "a")).toMatchObject({ a: 1 });
  expect(pick(object, ["a", "b"])).toMatchObject({ a: 1, b: 2 });
});
