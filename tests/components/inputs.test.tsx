import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, type FieldValues } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CategoryInput from "@/app/components/Inputs/CategoryInput";
import Counter from "@/app/components/Inputs/Counter";
import Input from "@/app/components/Inputs/Input";

describe("CategoryInput", () => {
  const Icon = () => <span data-testid="icon" />;

  it("reports the label back on click", async () => {
    const onClick = vi.fn();
    render(
      <CategoryInput
        icon={Icon}
        label="Beach"
        selected={false}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByText("Beach"));

    expect(onClick).toHaveBeenCalledWith("Beach");
  });

  it("highlights the selected category", () => {
    const { container } = render(
      <CategoryInput icon={Icon} label="Beach" selected onClick={vi.fn()} />,
    );

    expect(container.firstChild).toHaveClass("border-neutral-500");
  });

  it("dims an unselected category", () => {
    const { container } = render(
      <CategoryInput
        icon={Icon}
        label="Beach"
        selected={false}
        onClick={vi.fn()}
      />,
    );

    expect(container.firstChild).toHaveClass("border-neutral-200");
  });
});

describe("Counter", () => {
  function setup(value: number) {
    const onChange = vi.fn();
    const { container } = render(
      <Counter
        title="Guests"
        subtitle="How many?"
        value={value}
        onChange={onChange}
      />,
    );

    const [reduce, add] = Array.from(
      container.querySelectorAll<HTMLElement>(".cursor-pointer"),
    );

    return { onChange, reduce, add };
  }

  it("increments", async () => {
    const { onChange, add } = setup(2);

    await userEvent.click(add);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("decrements", async () => {
    const { onChange, reduce } = setup(2);

    await userEvent.click(reduce);

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("never goes below one", async () => {
    const { onChange, reduce } = setup(1);

    await userEvent.click(reduce);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Input", () => {
  function Harness({
    withError = false,
    ...props
  }: {
    withError?: boolean;
    formatPrice?: boolean;
    disabled?: boolean;
    type?: string;
  }) {
    const {
      register,
      formState: { errors },
    } = useForm<FieldValues>();

    return (
      <Input
        id="price"
        label="Price"
        register={register}
        errors={withError ? { price: { type: "required" } } : errors}
        {...props}
      />
    );
  }

  it("registers the field and renders its label", async () => {
    render(<Harness />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "120");

    expect(input).toHaveValue("120");
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(input.className).toContain("border-neutral-300");
    expect(input.className).toContain("pl-4");
  });

  it("shows the currency affordance when formatting a price", () => {
    const { container } = render(<Harness formatPrice />);

    expect(screen.getByRole("textbox").className).toContain("pl-9");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("turns red when the field is in error", () => {
    render(<Harness withError />);

    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
    expect(screen.getByText("Price").className).toContain("text-rose-500");
  });

  it("can be disabled", () => {
    render(<Harness disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("Calendar", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("renders a date range and reports selections", async () => {
    const Calendar = (await import("@/app/components/Inputs/Calendar")).default;

    const { container } = render(
      <Calendar
        value={{
          startDate: new Date("2024-05-01T00:00:00.000Z"),
          endDate: new Date("2024-05-05T00:00:00.000Z"),
          key: "selection",
        }}
        onChange={onChange}
      />,
    );

    expect(container.querySelector(".rdrCalendarWrapper")).toBeInTheDocument();
  });

  it("accepts explicit disabled dates", async () => {
    const Calendar = (await import("@/app/components/Inputs/Calendar")).default;

    const { container } = render(
      <Calendar
        value={{
          startDate: new Date("2024-05-01T00:00:00.000Z"),
          endDate: new Date("2024-05-05T00:00:00.000Z"),
          key: "selection",
        }}
        onChange={onChange}
        disabledDates={[new Date("2024-05-03T00:00:00.000Z")]}
      />,
    );

    expect(container.querySelector(".rdrCalendarWrapper")).toBeInTheDocument();
  });
});
