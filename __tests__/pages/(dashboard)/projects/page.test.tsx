import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsPage from "@/app/(dashboard)/projects/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

global.fetch = jest.fn();

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("ProjectsPage", () => {
  const mockPush = jest.fn();
  const mockProjects = {
    data: [
      {
        id: "1",
        name: "Project 1",
        description: "Description 1",
        status: "Active",
        owner: "Owner 1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      },
      {
        id: "2",
        name: "Project 2",
        description: "Description 2",
        status: "Paused",
        owner: "Owner 2",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      },
    ],
    pagination: {
      totalPages: 2,
      currentPage: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockProjects,
    });
  });

  it("renders page title and description", () => {
    render(<ProjectsPage />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your workspace projects")
    ).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<ProjectsPage />);

    expect(
      screen.getByPlaceholderText("Search projects...")
    ).toBeInTheDocument();
  });

  it("renders status filter dropdown", () => {
    render(<ProjectsPage />);

    expect(screen.getByText("All Status")).toBeInTheDocument();
  });

  it("fetches and displays projects", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Project 1")).toBeInTheDocument();
      expect(screen.getByText("Project 2")).toBeInTheDocument();
    });
  });

  it("displays project descriptions", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Description 1")).toBeInTheDocument();
      expect(screen.getByText("Description 2")).toBeInTheDocument();
    });
  });

  it("displays project statuses", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Paused")).toBeInTheDocument();
    });
  });

  it("displays project owners", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Owner 1")).toBeInTheDocument();
      expect(screen.getByText("Owner 2")).toBeInTheDocument();
    });
  });

  it("filters projects by search term", async () => {
    render(<ProjectsPage />);

    const searchInput = screen.getByPlaceholderText("Search projects...");
    await userEvent.type(searchInput, "Project 1");

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("search=Project+1")
        );
      },
      { timeout: 1000 }
    );
  });

  it("filters projects by status", async () => {
    render(<ProjectsPage />);

    const statusFilter = screen.getByRole("combobox");
    fireEvent.change(statusFilter, { target: { value: "Active" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=Active")
      );
    });
  });

  it("shows empty message when no projects", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        data: [],
        pagination: { totalPages: 1, currentPage: 1 },
      }),
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });
  });

  it("renders pagination when multiple pages", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });
  });

  it("disables Previous button on first page", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });
  });

  it("navigates to next page when Next button is clicked", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      );
    });
  });

  it("navigates to project detail when View button is clicked", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      fireEvent.click(viewButtons[0]);
    });

    expect(mockPush).toHaveBeenCalledWith("/projects/1");
  });

  it("renders table headers", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Project Name")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Owner")).toBeInTheDocument();
      expect(screen.getByText("Updated At")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  it("debounces search input", async () => {
    render(<ProjectsPage />);

    const searchInput = screen.getByPlaceholderText("Search projects...");
    await userEvent.type(searchInput, "test");

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("search=test")
        );
      },
      { timeout: 1000 }
    );
  });

  it("does not show pagination when only one page", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        data: mockProjects.data,
        pagination: { totalPages: 1, currentPage: 1 },
      }),
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });
  });
});
