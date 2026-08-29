import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Avatar from "@/app/components/Avatar";
import Button from "@/app/components/Button";
import ClientOnly from "@/app/components/ClientOnly";
import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import Heading from "@/app/components/Heading";
import Loader from "@/app/components/Loader";
import MenuItem from "@/app/components/navbar/MenuItem";
import { routerMock } from "../helpers/mocks";

describe("Avatar", () => {
  it("renders the provided source", () => {
    render(<Avatar src="https://example.com/a.png" />);

    expect(screen.getByAltText("avatar")).toHaveAttribute(
      "src",
      "https://example.com/a.png"
    );
  });

  it("falls back to the placeholder when no source is given", () => {
    render(<Avatar />);

    expect(screen.getByAltText("avatar")).toHaveAttribute(
      "src",
      "/images/placeholder.jpg"
    );
  });
});

describe("Button", () => {
  it("calls onClick and renders the label", async () => {
    const onClick = vi.fn();
    render(<Button label="Reserve" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire while disabled", async () => {
    const onClick = vi.fn();
    render(<Button label="Reserve" onClick={onClick} disabled />);

    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the outline/small variant with an icon", () => {
    const Icon = () => <span data-testid="icon" />;
    render(
      <Button label="Continue" onClick={vi.fn()} outline small icon={Icon} />
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.className).toContain("bg-white");
    expect(button.className).toContain("py-1");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("ClientOnly", () => {
  it("renders its children once mounted", () => {
    render(
      <ClientOnly>
        <span>mounted</span>
      </ClientOnly>
    );

    expect(screen.getByText("mounted")).toBeInTheDocument();
  });
});

describe("Container", () => {
  it("wraps its children", () => {
    render(
      <Container>
        <span>inside</span>
      </Container>
    );

    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});

describe("Heading", () => {
  it("renders the title and subtitle left aligned by default", () => {
    const { container } = render(<Heading title="Trips" subtitle="Upcoming" />);

    expect(screen.getByText("Trips")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-start");
  });

  it("centers when asked to", () => {
    const { container } = render(<Heading title="Trips" center />);

    expect(container.firstChild).toHaveClass("text-center");
  });
});

describe("EmptyState", () => {
  it("renders the default copy without a reset button", () => {
    render(<EmptyState />);

    expect(screen.getByText("No exact matches")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("navigates home from the reset button", async () => {
    render(<EmptyState title="Nothing" subtitle="Here" showReset />);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove all filters" })
    );

    expect(routerMock.push).toHaveBeenCalledWith("/");
  });
});

describe("Loader", () => {
  it("renders a spinner", () => {
    const { container } = render(<Loader />);

    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

describe("MenuItem", () => {
  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<MenuItem label="My trips" onClick={onClick} />);

    await userEvent.click(screen.getByText("My trips"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
