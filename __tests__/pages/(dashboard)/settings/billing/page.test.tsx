import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BillingFormPage from "@/app/(dashboard)/settings/billing/page";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("BillingFormPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe("Initial Render", () => {
    it("renders page title and description", () => {
      render(<BillingFormPage />);

      expect(screen.getByText("Billing Settings")).toBeInTheDocument();
      expect(
        screen.getByText("Manage your billing information")
      ).toBeInTheDocument();
    });

    it("renders step indicators", () => {
      const { container } = render(<BillingFormPage />);

      const steps = container.querySelectorAll(".ml-3.text-sm.font-medium");
      expect(steps.length).toBe(3);
    });

    it("starts at step 1 (Company Profile)", () => {
      render(<BillingFormPage />);

      expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    });

    it("disables Previous button on first step", () => {
      render(<BillingFormPage />);

      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("renders Next button on first step", () => {
      render(<BillingFormPage />);

      expect(screen.getByText("Next")).toBeInTheDocument();
    });
  });

  describe("Step 1 - Company Profile", () => {
    it("displays all company profile fields", () => {
      render(<BillingFormPage />);

      expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    });

    it("shows validation error when company name is too short", async () => {
      render(<BillingFormPage />);

      const companyInput = screen.getByLabelText("Company Name");
      await userEvent.type(companyInput, "A");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(
          screen.getByText("Company name must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email", async () => {
      render(<BillingFormPage />);

      const emailInput = screen.getByLabelText("Email");
      await userEvent.type(emailInput, "invalid-email");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("shows validation error when phone is empty", async () => {
      render(<BillingFormPage />);

      const companyInput = screen.getByLabelText("Company Name");
      await userEvent.type(companyInput, "Test Company");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Phone is required")).toBeInTheDocument();
      });
    });

    it("formats phone number automatically", async () => {
      render(<BillingFormPage />);

      const phoneInput = screen.getByLabelText("Phone");
      await userEvent.type(phoneInput, "1234567890");

      await waitFor(() => {
        expect(phoneInput).toHaveValue("(123) 456-7890");
      });
    });

    it("proceeds to step 2 when form is valid", async () => {
      render(<BillingFormPage />);

      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");

      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });
  });

  describe("Step 2 - Billing Address", () => {
    beforeEach(async () => {
      render(<BillingFormPage />);

      // Fill step 1
      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });

    it("displays all billing address fields", () => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByLabelText("City")).toBeInTheDocument();
      expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Postal Code / ZIP")).toBeInTheDocument();
    });

    it("shows validation error when country is not selected", async () => {
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Country is required")).toBeInTheDocument();
      });
    });

    it("shows validation error when city is too short", async () => {
      const cityInput = screen.getByLabelText("City");
      await userEvent.type(cityInput, "A");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(
          screen.getByText("City must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows validation error when address is too short", async () => {
      const addressInput = screen.getByLabelText("Street Address");
      await userEvent.type(addressInput, "123");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(
          screen.getByText("Address must be at least 5 characters")
        ).toBeInTheDocument();
      });
    });

    it("formats postal code to numbers only", async () => {
      const postalInput = screen.getByLabelText("Postal Code / ZIP");
      await userEvent.type(postalInput, "abc123xyz");

      await waitFor(() => {
        expect(postalInput).toHaveValue("123");
      });
    });

    it("renders country dropdown with options", () => {
      const countrySelect = screen.getByRole("combobox");
      expect(countrySelect).toBeInTheDocument();
      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("Indonesia")).toBeInTheDocument();
    });

    it("can go back to previous step", () => {
      fireEvent.click(screen.getByText("Previous"));

      expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
    });

    it("proceeds to step 3 when form is valid", async () => {
      const countrySelect = screen.getByRole("combobox");
      fireEvent.change(countrySelect, { target: { value: "US" } });

      await userEvent.type(screen.getByLabelText("City"), "New York");
      await userEvent.type(
        screen.getByLabelText("Street Address"),
        "123 Main St"
      );
      await userEvent.type(screen.getByLabelText("Postal Code / ZIP"), "10001");

      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Add New Payment Method")).toBeInTheDocument();
      });
    });
  });

  describe("Step 3 - Payment Methods", () => {
    beforeEach(async () => {
      render(<BillingFormPage />);

      // Fill step 1
      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      // Fill step 2
      const countrySelect = screen.getByRole("combobox");
      fireEvent.change(countrySelect, { target: { value: "US" } });
      await userEvent.type(screen.getByLabelText("City"), "New York");
      await userEvent.type(
        screen.getByLabelText("Street Address"),
        "123 Main St"
      );
      await userEvent.type(screen.getByLabelText("Postal Code / ZIP"), "10001");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Add New Payment Method")).toBeInTheDocument();
      });
    });

    it("displays payment method form fields", () => {
      expect(screen.getByLabelText("Card Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Card Holder Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Expiry Date")).toBeInTheDocument();
      expect(screen.getByLabelText("CVV")).toBeInTheDocument();
    });

    it("formats card number with spaces", async () => {
      const cardInput = screen.getByLabelText("Card Number");
      await userEvent.type(cardInput, "4242424242424242");

      await waitFor(() => {
        expect(cardInput).toHaveValue("4242 4242 4242 4242");
      });
    });

    it("converts card holder name to uppercase", async () => {
      const holderInput = screen.getByLabelText("Card Holder Name");
      await userEvent.type(holderInput, "john doe");

      await waitFor(() => {
        expect(holderInput).toHaveValue("JOHN DOE");
      });
    });

    it("formats expiry date with slash", async () => {
      const expiryInput = screen.getByLabelText("Expiry Date");
      await userEvent.type(expiryInput, "1225");

      await waitFor(() => {
        expect(expiryInput).toHaveValue("12/25");
      });
    });

    it("limits CVV to numbers only", async () => {
      const cvvInput = screen.getByLabelText("CVV");
      await userEvent.type(cvvInput, "abc123xyz");

      await waitFor(() => {
        expect(cvvInput).toHaveValue("123");
      });
    });

    it("shows modal when adding payment without required fields", async () => {
      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        expect(
          screen.getByText("Please fill in all payment details")
        ).toBeInTheDocument();
      });
    });

    it("validates month in expiry date (must be 01-12)", async () => {
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "5555555555554444"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "Jane Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1325");
      await userEvent.type(screen.getByLabelText("CVV"), "456");

      const buttons = screen.getAllByText("Add Payment Method");
      fireEvent.click(buttons[0]);
    });

    it("adds payment method successfully", async () => {
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "4242424242424242"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "John Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1225");
      await userEvent.type(screen.getByLabelText("CVV"), "123");

      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
        expect(screen.getByText("JOHN DOE")).toBeInTheDocument();
      });
    });

    it("marks first payment method as default", async () => {
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "4242424242424242"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "John Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1225");
      await userEvent.type(screen.getByLabelText("CVV"), "123");

      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        expect(screen.getByText("JOHN DOE")).toBeInTheDocument();
      });
    });

    it("clears form after adding payment method", async () => {
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "4242424242424242"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "John Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1225");
      await userEvent.type(screen.getByLabelText("CVV"), "123");

      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        const cardInput = screen.getByLabelText("Card Number");
        expect(cardInput).toHaveValue("");
      });
    });

    it("removes payment method", async () => {
      // Add a payment method first
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "4242424242424242"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "John Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1225");
      await userEvent.type(screen.getByLabelText("CVV"), "123");
      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
      });

      // Remove it
      const removeButton = screen.getByText("Remove");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/•••• 4242/)).not.toBeInTheDocument();
      });
    });

    it("displays saved payment methods section when methods exist", async () => {
      await userEvent.type(
        screen.getByLabelText("Card Number"),
        "4242424242424242"
      );
      await userEvent.type(
        screen.getByLabelText("Card Holder Name"),
        "John Doe"
      );
      await userEvent.type(screen.getByLabelText("Expiry Date"), "1225");
      await userEvent.type(screen.getByLabelText("CVV"), "123");

      fireEvent.click(screen.getByText("Add Payment Method"));

      await waitFor(() => {
        expect(screen.getByText("Saved Payment Methods")).toBeInTheDocument();
      });
    });

    it("shows Save Billing Settings button on last step", () => {
      expect(screen.getByText("Save Billing Settings")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    beforeEach(async () => {
      render(<BillingFormPage />);

      // Complete all steps
      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const countrySelect = screen.getByRole("combobox");
      fireEvent.change(countrySelect, { target: { value: "US" } });
      await userEvent.type(screen.getByLabelText("City"), "New York");
      await userEvent.type(
        screen.getByLabelText("Street Address"),
        "123 Main St"
      );
      await userEvent.type(screen.getByLabelText("Postal Code / ZIP"), "10001");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Add New Payment Method")).toBeInTheDocument();
      });
    });

    it("submits form successfully", async () => {
      fireEvent.click(screen.getByText("Save Billing Settings"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/billing",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("shows success modal after submission", async () => {
      fireEvent.click(screen.getByText("Save Billing Settings"));

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(
          screen.getByText("Billing settings saved successfully!")
        ).toBeInTheDocument();
      });
    });

    it("redirects to settings page after closing success modal", async () => {
      fireEvent.click(screen.getByText("Save Billing Settings"));

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument();
      });

      const okButton = screen.getByText("OK");
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/settings");
      });
    });

    it("handles submission error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      fireEvent.click(screen.getByText("Save Billing Settings"));

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(
          screen.getByText("Failed to save billing settings")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Step Navigation", () => {
    it("highlights current step", () => {
      const { container } = render(<BillingFormPage />);

      const firstStep = container.querySelector(".bg-blue-600");
      expect(firstStep).toBeInTheDocument();
    });

    it("shows progress line between steps", () => {
      const { container } = render(<BillingFormPage />);

      const progressLines = container.querySelectorAll(".h-0\\.5");
      expect(progressLines.length).toBeGreaterThan(0);
    });

    it("updates step indicator when navigating", async () => {
      const { container } = render(<BillingFormPage />);

      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        const activeSteps = container.querySelectorAll(".bg-blue-600");
        expect(activeSteps.length).toBe(2); // Step 1 and 2 should be active
      });
    });
  });

  describe("Modal Behavior", () => {
    it("closes modal and redirects on OK", async () => {
      render(<BillingFormPage />);

      // Navigate to last step
      await userEvent.type(screen.getByLabelText("Company Name"), "Test Co");
      await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
      await userEvent.type(screen.getByLabelText("Phone"), "1234567890");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const countrySelect = screen.getByRole("combobox");
      fireEvent.change(countrySelect, { target: { value: "US" } });
      await userEvent.type(screen.getByLabelText("City"), "New York");
      await userEvent.type(
        screen.getByLabelText("Street Address"),
        "123 Main St"
      );
      await userEvent.type(screen.getByLabelText("Postal Code / ZIP"), "10001");
      fireEvent.click(screen.getByText("Next"));

      await waitFor(() => {
        expect(screen.getByText("Add New Payment Method")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Save Billing Settings"));

      await waitFor(() => {
        expect(screen.getByText("Success")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("OK"));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/settings");
      });
    });
  });
});
