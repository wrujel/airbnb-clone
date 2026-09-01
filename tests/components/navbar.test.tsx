import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CategoryBox from "@/app/components/CategoryBox";
import Categories from "@/app/components/navbar/Categories";
import Logo from "@/app/components/navbar/Logo";
import Navbar from "@/app/components/navbar/Navbar";
import Search from "@/app/components/navbar/Search";
import UserMenu from "@/app/components/navbar/UserMenu";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useRentModal";
import useSearchModal from "@/app/hooks/useSearchModal";
import { makeUser } from "../helpers/factories";
import { navigationState, routerMock, setSearchParams } from "../helpers/mocks";

const signOut = vi.hoisted(() => vi.fn());
vi.mock("next-auth/react", () => ({ signOut, signIn: vi.fn() }));

beforeEach(() => {
  [useLoginModal, useRegisterModal, useRentModal, useSearchModal].forEach(
    (store) => store.setState({ isOpen: false }),
  );
});

describe("Logo", () => {
  it("goes home on click", async () => {
    render(<Logo />);

    await userEvent.click(screen.getByAltText("logo"));

    expect(routerMock.push).toHaveBeenCalledWith("/");
  });
});

describe("CategoryBox", () => {
  const Icon = () => <span data-testid="icon" />;

  it("adds the category to the query string", async () => {
    render(<CategoryBox label="Beach" icon={Icon} />);

    await userEvent.click(screen.getByText("Beach"));

    expect(routerMock.push).toHaveBeenCalledWith("/?category=Beach");
  });

  it("keeps the other filters when adding a category", async () => {
    setSearchParams({ guestCount: "2" });
    render(<CategoryBox label="Beach" icon={Icon} />);

    await userEvent.click(screen.getByText("Beach"));

    expect(routerMock.push).toHaveBeenCalledWith(
      "/?category=Beach&guestCount=2",
    );
  });

  it("toggles the category off when it is already selected", async () => {
    setSearchParams({ category: "Beach" });
    render(<CategoryBox label="Beach" icon={Icon} selected />);

    await userEvent.click(screen.getByText("Beach"));

    expect(routerMock.push).toHaveBeenCalledWith("/");
  });

  it("copes with no search params at all", async () => {
    navigationState.searchParams = null;
    render(<CategoryBox label="Beach" icon={Icon} />);

    await userEvent.click(screen.getByText("Beach"));

    expect(routerMock.push).toHaveBeenCalledWith("/?category=Beach");
  });

  it("marks the selected box", () => {
    const { container } = render(
      <CategoryBox label="Beach" icon={Icon} selected />,
    );

    expect(container.firstChild).toHaveClass("border-b-neutral-800");
  });
});

describe("Categories", () => {
  it("renders every category on the home page", () => {
    render(<Categories />);

    expect(screen.getByText("Beach")).toBeInTheDocument();
    expect(screen.getByText("Lux")).toBeInTheDocument();
  });

  it("highlights the active category", () => {
    setSearchParams({ category: "Beach" });
    render(<Categories />);

    expect(screen.getByText("Beach").parentElement).toHaveClass(
      "border-b-neutral-800",
    );
  });

  it("renders nothing away from the home page", () => {
    navigationState.pathname = "/trips";
    const { container } = render(<Categories />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("Search", () => {
  it("shows the default labels", async () => {
    render(<Search />);

    expect(screen.getByText("Anywhere")).toBeInTheDocument();
    expect(screen.getByText("Any Week")).toBeInTheDocument();
    expect(screen.getByText("Add Guests")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Anywhere"));

    expect(useSearchModal.getState().isOpen).toBe(true);
  });

  it("summarises the active filters", () => {
    setSearchParams({
      locationValue: "PE",
      startDate: "2024-05-01T00:00:00.000Z",
      endDate: "2024-05-05T00:00:00.000Z",
      guestCount: "3",
    });
    render(<Search />);

    expect(screen.getByText("Peru")).toBeInTheDocument();
    expect(screen.getByText("4 Days")).toBeInTheDocument();
    expect(screen.getByText("3 Guests")).toBeInTheDocument();
  });

  it("counts a same-day stay as one day", () => {
    setSearchParams({
      startDate: "2024-05-01T00:00:00.000Z",
      endDate: "2024-05-01T00:00:00.000Z",
    });
    render(<Search />);

    expect(screen.getByText("1 Days")).toBeInTheDocument();
  });

  it("copes with no search params at all", () => {
    navigationState.searchParams = null;
    render(<Search />);

    expect(screen.getByText("Anywhere")).toBeInTheDocument();
  });
});

describe("UserMenu", () => {
  it("offers login and sign up when signed out", async () => {
    render(<UserMenu />);

    await userEvent.click(screen.getByText("Airbnb your home"));
    expect(useLoginModal.getState().isOpen).toBe(true);
    expect(useRentModal.getState().isOpen).toBe(false);

    const toggle = screen.getByRole("img", { hidden: true });

    await userEvent.click(toggle);
    await userEvent.click(screen.getByText("Login"));
    expect(useLoginModal.getState().isOpen).toBe(true);

    await userEvent.click(toggle);
    await userEvent.click(screen.getByText("Sign up"));
    expect(useRegisterModal.getState().isOpen).toBe(true);
  });

  it("opens the rent modal for a signed-in user", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    await userEvent.click(screen.getByText("Airbnb your home"));

    expect(useRentModal.getState().isOpen).toBe(true);
  });

  it("links to the signed-in areas and can sign out", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    const toggle = screen.getByRole("img", { hidden: true });
    // Picking an entry closes the menu, so each one needs it reopened first.
    const pick = async (label: string) => {
      await userEvent.click(toggle);
      await userEvent.click(screen.getByText(label));
    };

    await pick("My trips");
    expect(routerMock.push).toHaveBeenCalledWith("/trips");

    await pick("My favorites");
    expect(routerMock.push).toHaveBeenCalledWith("/favorites");

    await pick("My reservations");
    expect(routerMock.push).toHaveBeenCalledWith("/reservations");

    await pick("My properties");
    expect(routerMock.push).toHaveBeenCalledWith("/properties");

    await pick("Airbnb my home");
    expect(useRentModal.getState().isOpen).toBe(true);

    await pick("Logout");
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("dismisses the menu once an entry is picked", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    await userEvent.click(screen.getByRole("img", { hidden: true }));
    await userEvent.click(screen.getByText("My trips"));

    expect(screen.queryByText("My trips")).not.toBeInTheDocument();
  });

  it("closes the menu again", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    const toggle = screen.getByRole("img", { hidden: true });
    await userEvent.click(toggle);
    expect(screen.getByText("My trips")).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(screen.queryByText("My trips")).not.toBeInTheDocument();
  });

  it("closes the menu on Escape", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    await userEvent.click(screen.getByRole("img", { hidden: true }));
    expect(screen.getByText("My trips")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("My trips")).not.toBeInTheDocument();
  });

  it("leaves the menu open on every other key", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    await userEvent.click(screen.getByRole("img", { hidden: true }));

    fireEvent.keyDown(document, { key: "Enter" });

    expect(screen.getByText("My trips")).toBeInTheDocument();
  });

  it("closes the menu when the press lands outside it", async () => {
    render(<UserMenu currentUser={makeUser()} />);

    await userEvent.click(screen.getByRole("img", { hidden: true }));
    expect(screen.getByText("My trips")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("My trips")).not.toBeInTheDocument();
  });
});

describe("Navbar", () => {
  it("renders the logo, search and user menu", () => {
    render(<Navbar currentUser={makeUser()} />);

    expect(screen.getByAltText("logo")).toBeInTheDocument();
    expect(screen.getByText("Anywhere")).toBeInTheDocument();
    expect(screen.getByText("Airbnb your home")).toBeInTheDocument();
  });
});
