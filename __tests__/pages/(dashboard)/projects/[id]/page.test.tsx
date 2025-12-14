import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProjectDetailPage from "@/app/(dashboard)/projects/[id]/page";
import { useRouter, usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

global.fetch = jest.fn();

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("ProjectDetailPage", () => {
  const mockPush = jest.fn();
  const mockProjectData = {
    project: {
      id: "123",
      name: "Test Project",
      description: "Test Description",
      status: "Active",
      owner: "Test Owner",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
    },
    members: [
      { id: "1", name: "Member 1", email: "m1@test.com", role: "Developer" },
      { id: "2", name: "Member 2", email: "m2@test.com", role: "Designer" },
    ],
    activities: [
      {
        id: "1",
        type: "status_change",
        description: "Status changed to Active",
        user: "Admin",
        timestamp: "2024-01-02T10:00:00Z",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/projects/123");
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockProjectData,
      ok: true,
    });
  });

  it("shows loading skeleton initially", () => {
    const { container } = render(<ProjectDetailPage />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders project name and description", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });

  it("renders project status badge", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    });
  });

  it("renders Back button", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Back")).toBeInTheDocument();
    });
  });

  it("navigates back when Back button is clicked", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);
    });

    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("renders Project Information section", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Project Information")).toBeInTheDocument();
    });
  });

  it("displays project owner", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Owner")).toBeInTheDocument();
    });
  });

  it("renders status dropdown", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  it("updates status when dropdown is changed", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Paused" } });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/123",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "Paused" }),
        })
      );
    });
  });

  it("renders Activity Log section", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Activity Log")).toBeInTheDocument();
    });
  });

  it("displays activities", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Status changed to Active")).toBeInTheDocument();
      expect(screen.getByText(/Admin/)).toBeInTheDocument();
    });
  });

  it("shows message when no activities", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockProjectData,
        activities: [],
      }),
      ok: true,
    });

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("No activities yet")).toBeInTheDocument();
    });
  });

  it("renders Team Members section", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Team Members")).toBeInTheDocument();
    });
  });

  it("displays team members", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Member 1")).toBeInTheDocument();
      expect(screen.getByText("Member 2")).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Designer")).toBeInTheDocument();
    });
  });

  it("shows message when no members", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        ...mockProjectData,
        members: [],
      }),
      ok: true,
    });

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("No members yet")).toBeInTheDocument();
    });
  });

  it("shows not found message when project does not exist", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        project: null,
        members: [],
        activities: [],
      }),
      ok: true,
    });

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Project not found")).toBeInTheDocument();
    });
  });

  it("reverts status on update failure", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockProjectData,
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    render(<ProjectDetailPage />);

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Paused" } });
    });

    await waitFor(() => {
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("Active");
    });
  });

  it("disables status dropdown while updating", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Paused" } });
      expect(select).toBeDisabled();
    });
  });

  it("displays formatted dates", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });
  });

  it("renders member initials in avatar", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      const avatars = screen.getAllByText("M");
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  it("renders activity user initials", async () => {
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });
});
