import assert from "node:assert/strict";
import test from "node:test";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "../lib/validation";

test("password reset requests normalize email addresses", () => {
  assert.deepEqual(
    passwordResetRequestSchema.parse({ email: "  Customer@Example.com " }),
    { email: "customer@example.com" },
  );
});

test("password reset requires a valid code and matching strong passwords", () => {
  const valid = {
    email: "customer@example.com",
    code: "123456",
    newPassword: "password123",
    confirmPassword: "password123",
  };
  assert.equal(passwordResetSchema.safeParse(valid).success, true);

  const mismatch = passwordResetSchema.safeParse({
    ...valid,
    confirmPassword: "different123",
  });
  assert.equal(mismatch.success, false);
  if (!mismatch.success) {
    assert.deepEqual(mismatch.error.issues[0]?.path, ["confirmPassword"]);
  }

  assert.equal(
    passwordResetSchema.safeParse({ ...valid, code: "12345" }).success,
    false,
  );
  assert.equal(
    passwordResetSchema.safeParse({ ...valid, newPassword: "weak" }).success,
    false,
  );
});
