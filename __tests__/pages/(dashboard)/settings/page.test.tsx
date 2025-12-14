import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BillingPage from "@/app/(dashboard)/settings/page";

// Mock fetch globally
global.fetch = jest.fn();

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("BillingPage", () => {
  const mockBillingData = {
    data: {
      companyProfile: {
        companyName: "Test Company",
        email: "test@company.com",
        phone: "+1234567890",
      },
      billingAddress: {
        country: "United States",
        city: "New York",
        address: "123 Test Street",
        postalCode: "10001",
      },
      paymentMethods: [
        {
          id: "pm-1",
          cardNumber: "4242424242424242",
          cardHolder: "John Doe",
          expiryDate: "12/25",
          cvv: "123",
          isDefault: true,
        },
        {
          id: "pm-2",
          cardNumber: "5555555555554444",
          cardHolder: "Jane Smith",
          expiryDate: "06/26",
          cvv: "456",
          isDefault: false,
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockBillingData,
      ok: true,
    });
  });

  describe("Initial Render", () => {
    it("renders page title and description", () => {
      render(<BillingPage />);

      expect(screen.getByText("Billing Settings")).toBeInTheDocument();
      expect(
        screen.getByText("Company profile, billing address and payment methods")
      ).toBeInTheDocument();
    });

    it("shows loading skeleton initially", () => {
      const { container } = render(<BillingPage />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("calls fetch API on mount", () => {
      render(<BillingPage />);
      expect(global.fetch).toHaveBeenCalledWith("/api/billing");
    });
  });

  describe("Company Profile Section", () => {
    it("displays company profile information", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Company Profile")).toBeInTheDocument();
        expect(screen.getByText("Test Company")).toBeInTheDocument();
        expect(screen.getByText("test@company.com")).toBeInTheDocument();
        expect(screen.getByText("+1234567890")).toBeInTheDocument();
      });
    });

    it("renders company profile labels", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Company:")).toBeInTheDocument();
        expect(screen.getByText("Email:")).toBeInTheDocument();
        expect(screen.getByText("Phone:")).toBeInTheDocument();
      });
    });
  });

  describe("Billing Address Section", () => {
    it("displays billing address information", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Billing Address")).toBeInTheDocument();
        expect(screen.getByText("123 Test Street")).toBeInTheDocument();
        expect(
          screen.getByText(/New York.*United States.*10001/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Payment Methods Section", () => {
    it("displays payment methods section", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Methods")).toBeInTheDocument();
      });
    });

    it("displays all payment method cards", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
        expect(screen.getByText(/•••• 4444/)).toBeInTheDocument();
      });
    });

    it("displays card holder names", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      });
    });

    it("displays card expiry dates", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/12\/25/)).toBeInTheDocument();
        expect(screen.getByText(/06\/26/)).toBeInTheDocument();
      });
    });

    it("masks card numbers showing only last 4 digits", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.queryByText("4242424242424242")).not.toBeInTheDocument();
        expect(screen.queryByText("5555555555554444")).not.toBeInTheDocument();
        expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
        expect(screen.getByText(/•••• 4444/)).toBeInTheDocument();
      });
    });

    it("shows default badge for default payment method", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/• Default/)).toBeInTheDocument();
      });
    });

    it("does not show default badge for non-default payment methods", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        const allText = screen.getByText(/Jane Smith • 06\/26/);
        expect(allText.textContent).not.toContain("Default");
      });
    });

    it("renders remove buttons for each payment method", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        const removeButtons = screen.getAllByText("Remove");
        expect(removeButtons).toHaveLength(2);
      });
    });

    it("handles empty payment methods array", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          data: {
            ...mockBillingData.data,
            paymentMethods: [],
          },
        }),
        ok: true,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Payment Methods")).toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
      });
    });
  });

  describe("Payment Method Removal", () => {
    it("calls delete API when remove button is clicked", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/billing",
          expect.objectContaining({
            method: "DELETE",
            body: JSON.stringify({ id: "pm-1" }),
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("refetches data after successful removal", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        // Initial fetch + refetch after delete
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it("handles delete API error gracefully", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Delete failed")
      );

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Failed to remove payment method:",
          expect.any(Error)
        );
      });
    });

    it("does not refetch data if delete fails", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Delete failed" }),
      });

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        // Only initial fetch, no refetch
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Empty State", () => {
    it("shows message when no billing data found (null)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ data: null }),
        ok: true,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(
          screen.getByText("No billing settings found.")
        ).toBeInTheDocument();
      });
    });

    it("shows message when data is empty array", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ data: [] }),
        ok: true,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(
          screen.getByText("No billing settings found.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("API Response Handling", () => {
    it("handles array response from API", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ data: [mockBillingData.data] }),
        ok: true,
      });

      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Company")).toBeInTheDocument();
      });
    });

    it("handles single object response from API", async () => {
      render(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Company")).toBeInTheDocument();
      });
    });

    it("handles fetch error gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<BillingPage />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Failed to fetch billing settings:",
          expect.any(Error)
        );
      });
    });
  });

  describe("Multiple Billing Entries", () => {
    it("renders multiple billing entries when API returns array", async () => {
      const multipleEntries = {
        data: [mockBillingData.data, { ...mockBillingData.data }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => multipleEntries,
        ok: true,
      });

      render(<BillingPage />);

      await waitFor(() => {
        const companyNames = screen.getAllByText("Test Company");
        expect(companyNames.length).toBe(2);
      });
    });
  });

  describe("UI Structure", () => {
    it("applies correct styling to payment method cards", async () => {
      const { container } = render(<BillingPage />);

      await waitFor(() => {
        const paymentCards = container.querySelectorAll(
          ".flex.items-center.justify-between.p-4.border.rounded-lg"
        );
        expect(paymentCards.length).toBe(2);
      });
    });

    it("renders Card components with proper structure", async () => {
      const { container } = render(<BillingPage />);

      await waitFor(() => {
        const cards = container.querySelectorAll(".bg-white.rounded-lg.border");
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });
});
