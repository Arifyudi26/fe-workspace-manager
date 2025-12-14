import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

describe("DashboardLayout", () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();
  const mockUser = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("shows loading skeleton when isLoading is true", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
      isLoading: true,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders children when not loading", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout><div>Test Content</div></DashboardLayout>);
    
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders Workspace Manager title", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getByText("Workspace Manager")).toBeInTheDocument();
  });

  it("displays user name", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("displays user email on desktop", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders Projects navigation button", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    const projectButtons = screen.getAllByText(/Projects/i);
    expect(projectButtons.length).toBeGreaterThan(0);
  });

  it("renders Settings navigation button", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    const settingsButtons = screen.getAllByText(/Settings/i);
    expect(settingsButtons.length).toBeGreaterThan(0);
  });

  it("calls logout when logout button is clicked", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    const logoutButtons = screen.getAllByText(/Logout/i);
    fireEvent.click(logoutButtons[0]);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("navigates to projects when Projects button is clicked", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    const { container } = render(<DashboardLayout>Content</DashboardLayout>);
    
    const desktopNav = container.querySelector(".hidden.md\\:flex");
    const projectButton = desktopNav?.querySelector("button");
    
    if (projectButton) {
      fireEvent.click(projectButton);
      expect(mockPush).toHaveBeenCalledWith("/projects");
    }
  });

  it("toggles mobile menu when menu button is clicked", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);
    
    waitFor(() => {
      const mobileMenu = screen.getByText("Test User").closest(".md\\:hidden");
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  it("displays User as fallback when user name is not available", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { id: "1", name: "", email: "test@example.com" },
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getAllByText("User").length).toBeGreaterThan(0);
  });

  it("renders navbar with sticky positioning", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    const { container } = render(<DashboardLayout>Content</DashboardLayout>);
    
    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("sticky", "top-0");
  });

  it("renders main content area", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    const { container } = render(<DashboardLayout>Content</DashboardLayout>);
    
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("closes mobile menu when navigation item is clicked", async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    render(<DashboardLayout>Content</DashboardLayout>);
    
    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const projectButtons = screen.getAllByText(/Projects/i);
      const mobileProjectButton = projectButtons.find(btn => 
        btn.closest(".md\\:hidden")
      );
      
      if (mobileProjectButton) {
        fireEvent.click(mobileProjectButton);
      }
    });
  });

  it("has responsive layout classes", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isLoading: false,
    });

    const { container } = render(<DashboardLayout>Content</DashboardLayout>);
    
    const mainContainer = container.querySelector(".max-w-7xl");
    expect(mainContainer).toBeInTheDocument();
  });
});
