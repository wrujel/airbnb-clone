// @vitest-environment node
import bcrypt from "bcrypt";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

vi.mock("bcrypt", () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));

vi.mock("next-auth/next", () => ({ default: vi.fn(() => vi.fn()) }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

const mockedBcrypt = vi.mocked(bcrypt);

// next-auth v4 keeps the caller's provider config under `options` and merges it
// in later, so the `authorize` defined in the app lives one level down.
const credentialsProvider = authOptions.providers.find(
  (provider) => provider.id === "credentials",
) as CredentialsConfig & { options: CredentialsConfig };

const authorize = (credentials?: Record<string, string>) =>
  Promise.resolve(
    credentialsProvider.options.authorize(credentials as never, {} as never),
  );

beforeEach(() => {
  prismaMock.user.findUnique.mockReset();
  mockedBcrypt.compare.mockReset();
});

describe("authOptions", () => {
  it("signs in from the home page with a JWT session", () => {
    expect(authOptions.pages).toEqual({ signIn: "/" });
    expect(authOptions.session).toEqual({ strategy: "jwt" });
  });

  it("registers the github, google and credentials providers", () => {
    expect(authOptions.providers.map((provider) => provider.id)).toEqual([
      "github",
      "google",
      "credentials",
    ]);
  });
});

describe("credentials authorize", () => {
  it("rejects a missing email", async () => {
    await expect(authorize({ password: "secret" })).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("rejects a missing password", async () => {
    await expect(authorize({ email: "ada@example.com" })).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("rejects missing credentials altogether", async () => {
    await expect(authorize(undefined)).rejects.toThrow("Invalid credentials");
  });

  it("rejects an unknown user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authorize({ email: "ada@example.com", password: "secret" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("rejects a user that has no password set", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ hashedPassword: null }),
    );

    await expect(
      authorize({ email: "ada@example.com", password: "secret" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("rejects a wrong password", async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser());
    mockedBcrypt.compare.mockImplementation((() =>
      Promise.resolve(false)) as unknown as typeof bcrypt.compare);

    await expect(
      authorize({ email: "ada@example.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("returns the user on a correct password", async () => {
    const user = makeUser();
    prismaMock.user.findUnique.mockResolvedValue(user);
    mockedBcrypt.compare.mockImplementation((() =>
      Promise.resolve(true)) as unknown as typeof bcrypt.compare);

    await expect(
      authorize({ email: "ada@example.com", password: "secret" }),
    ).resolves.toEqual(user);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "ada@example.com" },
    });
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      "secret",
      user.hashedPassword,
    );
  });
});
