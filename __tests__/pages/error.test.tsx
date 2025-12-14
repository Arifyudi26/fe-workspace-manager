import { render, screen, fireEvent } from "@testing-library/react";
import Error from "@/app/error";

// Mock console.error to avoid cluttering test output
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("Error Component", () => {
  const mockReset = jest.fn();

  // Create mock error with proper typing
  const mockError = {
    name: "Error",
    message: "Test error message",
    stack: "",
  } as Error & { digest?: string };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("renders error heading", () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("displays default message when error message is empty", () => {
    const emptyError = {
      name: "Error",
      message: "",
      stack: "",
    } as Error & { digest?: string };

    render(<Error error={emptyError} reset={mockReset} />);
    expect(
      screen.getByText("An unexpected error occurred")
    ).toBeInTheDocument();
  });

  it("renders try again button", () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("calls reset function when button is clicked", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /try again/i });

    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("logs error to console on mount", () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  it("logs error to console when error changes", () => {
    const { rerender } = render(<Error error={mockError} reset={mockReset} />);

    const newError = {
      name: "Error",
      message: "New error message",
      stack: "",
    } as Error & { digest?: string };

    rerender(<Error error={newError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(newError);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("handles error with digest property", () => {
    const errorWithDigest = {
      name: "Error",
      message: "Error with digest",
      stack: "",
      digest: "abc123",
    } as Error & { digest?: string };

    render(<Error error={errorWithDigest} reset={mockReset} />);
    expect(screen.getByText("Error with digest")).toBeInTheDocument();
  });

  it("has correct container styling", () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    const mainDiv = container.firstChild;

    expect(mainDiv).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center",
      "bg-gray-50"
    );
  });

  it("has correct content wrapper styling", () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    const contentDiv = container.querySelector(".text-center");

    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveClass("text-center");
  });

  it("has correct heading styling", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const heading = screen.getByText("Something went wrong!");

    expect(heading).toHaveClass(
      "text-2xl",
      "font-bold",
      "text-gray-900",
      "mb-4"
    );
  });

  it("has correct error message styling", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const message = screen.getByText("Test error message");

    expect(message).toHaveClass("text-gray-600", "mb-6");
  });

  it("renders as client component", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("handles multiple button clicks", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /try again/i });

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(3);
  });

  it("renders Button component correctly", () => {
    render(<Error error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /try again/i });

    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe("Try again");
  });

  it("handles long error messages", () => {
    const longError = {
      name: "Error",
      message:
        "This is a very long error message that should still be displayed correctly in the UI without breaking the layout or causing any rendering issues",
      stack: "",
    } as Error & { digest?: string };

    render(<Error error={longError} reset={mockReset} />);
    expect(
      screen.getByText(/This is a very long error message/)
    ).toBeInTheDocument();
  });

  it("handles error with special characters in message", () => {
    const specialError = {
      name: "Error",
      message: "Error: <script>alert('test')</script>",
      stack: "",
    } as Error & { digest?: string };

    render(<Error error={specialError} reset={mockReset} />);
    expect(
      screen.getByText("Error: <script>alert('test')</script>")
    ).toBeInTheDocument();
  });

  it("does not re-log error when reset is called without error change", () => {
    const { rerender } = render(<Error error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledTimes(1);

    const newReset = jest.fn();
    rerender(<Error error={mockError} reset={newReset} />);

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
