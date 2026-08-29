// @vitest-environment node
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/register/route";
import { makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

vi.mock("bcrypt", () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

const mockedBcrypt = vi.mocked(bcrypt);

beforeEach(() => {
  prismaMock.user.create.mockReset();
});

describe("POST /api/register", () => {
  it("hashes the password and stores the user", async () => {
    const user = makeUser();
    mockedBcrypt.hash.mockImplementation((() =>
      Promise.resolve("hashed-pw")) as unknown as typeof bcrypt.hash);
    prismaMock.user.create.mockResolvedValue(user);

    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "ada@example.com",
          password: "secret",
          name: "Ada Lovelace",
        }),
      }),
    );

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("secret", 12);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "ada@example.com",
        hashedPassword: "hashed-pw",
        name: "Ada Lovelace",
      },
    });
    await expect(response.json()).resolves.toMatchObject({ id: user.id });
  });
});
