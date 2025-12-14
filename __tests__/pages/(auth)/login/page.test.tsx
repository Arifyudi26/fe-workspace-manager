import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    });
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Workspace Manager")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders password input", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("calls login with correct credentials", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("redirects to projects after successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/projects");
    });
  });

  it("shows error message on login failure", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrong-password");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows generic error message for non-Error failures", async () => {
    mockLogin.mockRejectedValue("String error");

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("disables submit button when loading", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });

    render(<LoginPage />);
    const submitButton = screen.getByRole("button");

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Signing in...");
  });

  it("shows loading state during submission", async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });
  });

  it("clears server error on new submission", async () => {
    mockLogin.mockRejectedValueOnce(new Error("First error"));

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    mockLogin.mockResolvedValueOnce(undefined);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });

  it("has correct form structure", () => {
    render(<LoginPage />);
    const form = screen
      .getByRole("button", { name: /sign in/i })
      .closest("form");

    expect(form).toBeInTheDocument();
  });

  it("email input has correct type", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");

    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("password input has correct type", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText("Password");

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("renders Card components", () => {
    const { container } = render(<LoginPage />);
    expect(container.querySelector(".w-full.max-w-md")).toBeInTheDocument();
  });

  it("has proper page layout styling", () => {
    const { container } = render(<LoginPage />);
    const mainDiv = container.firstChild;

    expect(mainDiv).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center"
    );
  });

  it("does not show server error initially", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });

  it("submit button has full width", () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    expect(submitButton).toHaveClass("w-full");
  });

  it("email input is required", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");

    expect(emailInput).toHaveAttribute("required");
  });

  it("handles form submission with Enter key", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123{enter}");

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it("button is disabled during submission", async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
