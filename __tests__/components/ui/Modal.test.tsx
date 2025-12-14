import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/Modal";

describe("Modal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <Modal {...defaultProps} isOpen={false} title="Test Modal">
        Content
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when isOpen is true", () => {
    render(
      <Modal {...defaultProps} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Modal {...defaultProps} title="Modal Title" />);
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <Modal {...defaultProps}>
        <p>Custom Content</p>
      </Modal>
    );
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("renders primary button with default label", () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("renders primary button with custom label", () => {
    render(<Modal {...defaultProps} primaryLabel="Confirm" />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("renders secondary button when label provided", () => {
    render(<Modal {...defaultProps} secondaryLabel="Cancel" />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("does not render secondary button when label not provided", () => {
    render(<Modal {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { container } = render(<Modal {...defaultProps} onClose={onClose} />);

    const backdrop = container.querySelector(".absolute.inset-0");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when secondary button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal {...defaultProps} onClose={onClose} secondaryLabel="Cancel" />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when primary button is clicked and onConfirm provided", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(<Modal {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when primary button is clicked and onConfirm not provided", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has correct backdrop styling", () => {
    const { container } = render(<Modal {...defaultProps} />);
    const backdrop = container.querySelector(".absolute.inset-0");
    expect(backdrop).toHaveClass("bg-black/40");
  });

  it("has correct modal container styling", () => {
    const { container } = render(<Modal {...defaultProps} />);
    const modalContainer = container.querySelector(".relative.w-full");
    expect(modalContainer).toHaveClass(
      "max-w-lg",
      "mx-4",
      "bg-white",
      "rounded-lg",
      "shadow-lg"
    );
  });

  it("has correct z-index for overlay", () => {
    const { container } = render(<Modal {...defaultProps} />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toHaveClass("z-50");
  });

  it("primary button has correct styling", () => {
    render(<Modal {...defaultProps} />);
    const primaryButton = screen.getByRole("button", { name: "OK" });
    expect(primaryButton).toHaveClass(
      "px-4",
      "py-2",
      "rounded-md",
      "bg-blue-600",
      "text-white",
      "hover:bg-blue-700"
    );
  });

  it("secondary button has correct styling", () => {
    render(<Modal {...defaultProps} secondaryLabel="Cancel" />);
    const secondaryButton = screen.getByRole("button", { name: "Cancel" });
    expect(secondaryButton).toHaveClass(
      "px-4",
      "py-2",
      "rounded-md",
      "bg-gray-100",
      "hover:bg-gray-200"
    );
  });

  it("renders complex children content", () => {
    render(
      <Modal {...defaultProps} title="Complex Modal">
        <div>
          <h4>Subtitle</h4>
          <p>Paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </Modal>
    );

    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("handles both onConfirm and custom labels", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    render(
      <Modal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        primaryLabel="Save"
        secondaryLabel="Cancel"
        title="Confirmation"
      >
        Are you sure?
      </Modal>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
