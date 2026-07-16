import { describe, it, expect } from "vitest";
import { normalizePhone } from "../src/lib/phone.js";

describe("normalizePhone", () => {
  it("adds a leading 0 to a bare 10-digit number", () => {
    expect(normalizePhone("5551112233")).toBe("05551112233");
  });

  it("strips the +90 country code", () => {
    expect(normalizePhone("+905551112233")).toBe("05551112233");
  });

  it("strips spaces and formatting", () => {
    expect(normalizePhone("0555 111 22 33")).toBe("05551112233");
  });

  it("leaves an already-normalized number unchanged", () => {
    expect(normalizePhone("05551112233")).toBe("05551112233");
  });
});
