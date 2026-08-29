import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ImageUpload from "@/app/components/Inputs/ImageUpload";

const widget = vi.hoisted(() => ({
  open: undefined as undefined | (() => void),
  onSuccess: undefined as
    | undefined
    | ((results: { info?: unknown }, widget: unknown) => void),
}));

vi.mock("next-cloudinary", () => ({
  CldUploadWidget: ({
    children,
    onSuccess,
  }: {
    children: (props: { open?: () => void }) => React.ReactNode;
    onSuccess?: (results: { info?: unknown }, widget: unknown) => void;
  }) => {
    widget.onSuccess = onSuccess;
    return <>{children({ open: widget.open })}</>;
  },
}));

beforeEach(() => {
  widget.open = undefined;
  widget.onSuccess = undefined;
});

describe("ImageUpload", () => {
  it("opens the Cloudinary widget on click", async () => {
    const open = vi.fn();
    widget.open = open;
    render(<ImageUpload value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Click to upload a photo"));

    expect(open).toHaveBeenCalledTimes(1);
  });

  it("is inert while the widget has not handed back an opener", async () => {
    render(<ImageUpload value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Click to upload a photo"));

    expect(screen.getByText("Click to upload a photo")).toBeInTheDocument();
  });

  it("publishes the uploaded url", () => {
    const onChange = vi.fn();
    render(<ImageUpload value="" onChange={onChange} />);

    widget.onSuccess?.(
      { info: { secure_url: "https://res.cloudinary.com/x.png" } },
      {},
    );

    expect(onChange).toHaveBeenCalledWith("https://res.cloudinary.com/x.png");
  });

  it("ignores a result that carries no upload info", () => {
    const onChange = vi.fn();
    render(<ImageUpload value="" onChange={onChange} />);

    widget.onSuccess?.({ info: undefined }, {});
    widget.onSuccess?.({ info: "just-a-public-id" }, {});

    expect(onChange).not.toHaveBeenCalled();
  });

  it("previews an already uploaded image", () => {
    render(
      <ImageUpload
        value="https://res.cloudinary.com/loft.png"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Uploaded image")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/loft.png",
    );
  });
});
