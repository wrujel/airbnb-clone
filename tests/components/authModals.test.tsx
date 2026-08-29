import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginModal from "@/app/components/modals/LoginModal";
import RegisterModal from "@/app/components/modals/RegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import { routerMock } from "../helpers/mocks";

const signIn = vi.hoisted(() => vi.fn());
vi.mock("next-auth/react", () => ({ signIn, signOut: vi.fn() }));

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast, default: toast }));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  useLoginModal.setState({ isOpen: false });
  useRegisterModal.setState({ isOpen: false });
  signIn.mockReset();
  mockedAxios.post.mockReset();
});

// `Input` renders a floating label that is not associated with the field, so
// tests address the input by its id instead.
async function fill(id: string, value: string) {
  await userEvent.type(document.querySelector(`#${id}`) as HTMLElement, value);
}

describe("LoginModal", () => {
  beforeEach(() => {
    useLoginModal.setState({ isOpen: true });
  });

  it("stays hidden while its store is closed", () => {
    useLoginModal.setState({ isOpen: false });
    const { container } = render(<LoginModal />);

    expect(container).toBeEmptyDOMElement();
  });

  it("signs the user in and closes", async () => {
    signIn.mockResolvedValue({ ok: true });
    render(<LoginModal />);

    await fill("email", "ada@example.com");
    await fill("password", "secret");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "ada@example.com",
        password: "secret",
        redirect: false,
      });
    });
    expect(toast.success).toHaveBeenCalledWith("Logged in successfully");
    expect(routerMock.refresh).toHaveBeenCalled();
    expect(useLoginModal.getState().isOpen).toBe(false);
  });

  it("surfaces a rejected sign in", async () => {
    signIn.mockResolvedValue({ ok: false, error: "Invalid credentials" });
    render(<LoginModal />);

    await fill("email", "ada@example.com");
    await fill("password", "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(useLoginModal.getState().isOpen).toBe(true);
  });

  it("offers the social providers", async () => {
    render(<LoginModal />);

    await userEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    expect(signIn).toHaveBeenCalledWith("google");

    await userEvent.click(
      screen.getByRole("button", { name: "Continue with Github" }),
    );
    expect(signIn).toHaveBeenCalledWith("github");
  });

  it("hands over to the register modal", async () => {
    render(<LoginModal />);

    await userEvent.click(screen.getByText("Create an account"));

    expect(useLoginModal.getState().isOpen).toBe(false);
    expect(useRegisterModal.getState().isOpen).toBe(true);
  });
});

describe("RegisterModal", () => {
  beforeEach(() => {
    useRegisterModal.setState({ isOpen: true });
  });

  it("registers the account and opens the login modal", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    render(<RegisterModal />);

    await fill("email", "ada@example.com");
    await fill("name", "Ada");
    await fill("password", "secret");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/register", {
        email: "ada@example.com",
        name: "Ada",
        password: "secret",
      });
    });
    expect(toast.success).toHaveBeenCalledWith("Account created successfully");
    expect(useRegisterModal.getState().isOpen).toBe(false);
    expect(useLoginModal.getState().isOpen).toBe(true);
  });

  it("reports a failed registration", async () => {
    mockedAxios.post.mockRejectedValue(new Error("nope"));
    render(<RegisterModal />);

    await fill("email", "ada@example.com");
    await fill("name", "Ada");
    await fill("password", "secret");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong, please try again later",
      );
    });
    expect(useRegisterModal.getState().isOpen).toBe(true);
  });

  it("offers the social providers", async () => {
    render(<RegisterModal />);

    await userEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    expect(signIn).toHaveBeenCalledWith("google");

    await userEvent.click(
      screen.getByRole("button", { name: "Continue with Github" }),
    );
    expect(signIn).toHaveBeenCalledWith("github");
  });

  it("hands over to the login modal", async () => {
    render(<RegisterModal />);

    await userEvent.click(screen.getByText("Log in"));

    expect(useRegisterModal.getState().isOpen).toBe(false);
    expect(useLoginModal.getState().isOpen).toBe(true);
  });
});
