import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Modal from "@/app/components/modals/Modal";

afterEach(() => {
  vi.useRealTimers();
});

const baseProps = {
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  actionLabel: "Continue",
  title: "Login",
};

describe("Modal", () => {
  it("renders nothing while closed", () => {
    const { container } = render(<Modal {...baseProps} isOpen={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title, body and footer when open", () => {
    render(
      <Modal
        {...baseProps}
        isOpen
        body={<p>body content</p>}
        footer={<p>footer content</p>}
      />,
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("body content")).toBeInTheDocument();
    expect(screen.getByText("footer content")).toBeInTheDocument();
  });

  it("submits", async () => {
    const onSubmit = vi.fn();
    render(<Modal {...baseProps} isOpen onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("closes after the exit animation", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<Modal {...baseProps} isOpen onClose={onClose} />);

    const [close] = screen.getAllByRole("button");
    // fireEvent rather than userEvent: its internal delays fight fake timers.
    fireEvent.click(close);

    // The panel slides out first; onClose only fires once the animation ends.
    expect(document.querySelector(".translate-y-full")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("runs the secondary action", async () => {
    const secondaryAction = vi.fn();
    render(
      <Modal
        {...baseProps}
        isOpen
        secondaryAction={secondaryAction}
        secondaryActionLabel="Back"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(secondaryAction).toHaveBeenCalledTimes(1);
  });

  it("hides the secondary button without a label", () => {
    render(<Modal {...baseProps} isOpen secondaryAction={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("ignores every action while disabled", async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const secondaryAction = vi.fn();

    render(
      <Modal
        {...baseProps}
        isOpen
        disabled
        onClose={onClose}
        onSubmit={onSubmit}
        secondaryAction={secondaryAction}
        secondaryActionLabel="Back"
      />,
    );

    const [close] = screen.getAllByRole("button");
    await userEvent.click(close);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(secondaryAction).not.toHaveBeenCalled();
  });
});
