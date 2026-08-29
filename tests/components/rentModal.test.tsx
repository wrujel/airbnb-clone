import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RentModal from "@/app/components/modals/RentModal";
import useRentModal from "@/app/hooks/useRentModal";
import { routerMock } from "../helpers/mocks";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast, default: toast }));

vi.mock("@/app/components/Map", () => ({
  default: () => <div data-testid="map" />,
}));

vi.mock("@/app/components/Inputs/ImageUpload", () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange("https://cdn/loft.png")}>
      upload
    </button>
  ),
}));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  useRentModal.setState({ isOpen: true });
  mockedAxios.post.mockReset();
});

const next = () =>
  userEvent.click(screen.getByRole("button", { name: "Next" }));

async function walkToPrice() {
  await userEvent.click(screen.getByText("Beach"));
  await next(); // -> location
  await next(); // -> info
  await next(); // -> images
  await userEvent.click(screen.getByRole("button", { name: "upload" }));
  await next(); // -> description
  await userEvent.type(
    document.querySelector("#title") as HTMLElement,
    "Sunny loft",
  );
  await userEvent.type(
    document.querySelector("#description") as HTMLElement,
    "Very sunny",
  );
  await next(); // -> price
  const price = document.querySelector("#price") as HTMLElement;
  await userEvent.clear(price);
  await userEvent.type(price, "120");
}

describe("RentModal", () => {
  it("stays hidden while its store is closed", () => {
    useRentModal.setState({ isOpen: false });
    const { container } = render(<RentModal />);

    expect(container).toBeEmptyDOMElement();
  });

  it("starts on the category step with no way back", () => {
    render(<RentModal />);

    expect(
      screen.getByText("Which category best describes your place?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("walks forwards and backwards through every step", async () => {
    render(<RentModal />);

    await next();
    expect(screen.getByText("Where's your place located?")).toBeInTheDocument();

    const country = screen.getByRole("combobox");
    await userEvent.click(country);
    await userEvent.type(country, "Peru");
    await userEvent.keyboard("{Enter}");

    await next();
    expect(
      screen.getByText("Share some details about your place"),
    ).toBeInTheDocument();

    await next();
    expect(
      screen.getByText("Upload some photos of your place"),
    ).toBeInTheDocument();

    await next();
    expect(
      screen.getByText("Describe your place to guests"),
    ).toBeInTheDocument();

    // Title and description are required, so the step will not advance until
    // they are filled in.
    await next();
    expect(
      screen.getByText("Describe your place to guests"),
    ).toBeInTheDocument();

    await userEvent.type(
      document.querySelector("#title") as HTMLElement,
      "Sunny loft",
    );
    await userEvent.type(
      document.querySelector("#description") as HTMLElement,
      "Very sunny",
    );

    await next();
    expect(screen.getByText("Now let's set up your price")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByText("Describe your place to guests"),
    ).toBeInTheDocument();
  });

  it("edits the counters on the info step", async () => {
    render(<RentModal />);

    await next();
    await next();

    // [guest -, guest +, room -, room +, bathroom -, bathroom +]
    const steppers = Array.from(
      document.querySelectorAll<HTMLElement>(".cursor-pointer"),
    );
    await userEvent.click(steppers[1]);
    await userEvent.click(steppers[3]);
    await userEvent.click(steppers[5]);

    expect(screen.getAllByText("2")).toHaveLength(3);
  });

  it("publishes the listing and resets", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    render(<RentModal />);

    await walkToPrice();
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/listings",
        expect.objectContaining({
          category: "Beach",
          imageSrc: "https://cdn/loft.png",
          title: "Sunny loft",
          description: "Very sunny",
          price: "120",
        }),
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Listing created successfully");
    expect(routerMock.refresh).toHaveBeenCalled();
    expect(useRentModal.getState().isOpen).toBe(false);
  });

  it("reports a failed publish", async () => {
    mockedAxios.post.mockRejectedValue(new Error("nope"));
    render(<RentModal />);

    await walkToPrice();
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
    expect(useRentModal.getState().isOpen).toBe(true);
  });
});
