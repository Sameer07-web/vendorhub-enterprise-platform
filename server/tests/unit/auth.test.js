const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Auth Utilities & Cryptography", () => {
  const password = "Password123!";
  let hashedPassword = "";
  const jwtSecret = "supersecretkeyfortestingourplatform";
  const userPayload = { id: "user123", email: "test@example.com", role: "Employee" };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(password, 10);
  });

  describe("Password Hashing & Matching", () => {
    it("should successfully hash a plain password", () => {
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });

    it("should match password with correct hash", async () => {
      const match = await bcrypt.compare(password, hashedPassword);
      expect(match).toBe(true);
    });

    it("should reject password mismatch", async () => {
      const match = await bcrypt.compare("WrongPassword123!", hashedPassword);
      expect(match).toBe(false);
    });
  });

  describe("JWT Signature and Validation", () => {
    let token = "";

    it("should sign user payload into JWT token", () => {
      token = jwt.sign(userPayload, jwtSecret, { expiresIn: "1h" });
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should successfully verify signed token", () => {
      const decoded = jwt.verify(token, jwtSecret);
      expect(decoded.id).toBe(userPayload.id);
      expect(decoded.email).toBe(userPayload.email);
      expect(decoded.role).toBe(userPayload.role);
    });

    it("should fail verification for tampered token", () => {
      const tamperedToken = token + "modified";
      expect(() => {
        jwt.verify(tamperedToken, jwtSecret);
      }).toThrow();
    });
  });
});
