import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input Component", () => {
  it("renders input without label", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders input with label", () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("generates correct id from label", () => {
    render(<Input label="First Name" />);
    const input = screen.getByLabelText("First Name");
    expect(input).toHaveAttribute("id", "first-name");
  });

  it("uses custom id when provided", () => {
    render(<Input label="Email" id="custom-email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "custom-email");
  });

  it("displays error message", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("applies error styles when error exists", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("border-red-500");
  });

  it("applies default styles", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(
      "w-full",
      "px-3",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-lg",
      "shadow-sm"
    );
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");

    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("calls onChange handler", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("disables input when disabled prop is true", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("applies disabled styles", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(
      "disabled:bg-gray-50",
      "disabled:cursor-not-allowed"
    );
  });

  it("renders with different input types", () => {
    const { rerender } = render(<Input type="email" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    input = screen.getByDisplayValue("");
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input type="number" />);
    input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("renders with default value", () => {
    render(<Input defaultValue="Default text" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Default text");
  });

  it("renders with controlled value", () => {
    render(<Input value="Controlled value" onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Controlled value");
  });

  it("renders readonly input", () => {
    render(<Input readOnly value="Read only" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
  });

  it("renders required input", () => {
    render(<Input required label="Required Field" />);
    const input = screen.getByLabelText("Required Field");
    expect(input).toBeRequired();
  });

  it("applies maxLength attribute", () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("label associates correctly with input", () => {
    render(<Input label="Email Address" />);
    const label = screen.getByText("Email Address");
    const input = screen.getByLabelText("Email Address");

    expect(label).toHaveAttribute("for", "email-address");
    expect(input).toHaveAttribute("id", "email-address");
  });

  it("error message has correct styling", () => {
    render(<Input error="Error message" />);
    const error = screen.getByText("Error message");
    expect(error).toHaveClass("mt-1", "text-sm", "text-red-600");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
