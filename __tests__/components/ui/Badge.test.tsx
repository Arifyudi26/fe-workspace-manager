import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

// Mock the constants module
jest.mock("@/lib/constants", () => ({
  STATUS_COLORS: {
    Active: "bg-green-100 text-green-800 border-green-200",
    Paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Archived: "bg-gray-100 text-gray-800 border-gray-200",
  },
}));

describe("Badge Component", () => {
  it("renders badge with children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies default gray styles when no status is provided", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
  });

  it("applies active status styles", () => {
    render(<Badge status="Active">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toHaveClass(
      "bg-green-100",
      "text-green-800",
      "border-green-200"
    );
  });

  it("applies paused status styles", () => {
    render(<Badge status="Paused">Paused</Badge>);
    const badge = screen.getByText("Paused");
    expect(badge).toHaveClass(
      "bg-yellow-100",
      "text-yellow-800",
      "border-yellow-200"
    );
  });

  it("applies archived status styles", () => {
    render(<Badge status="Archived">Archived</Badge>);
    const badge = screen.getByText("Archived");
    expect(badge).toHaveClass(
      "bg-gray-100",
      "text-gray-800",
      "border-gray-200"
    );
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-class");
  });

  it("combines status styles with custom className", () => {
    render(
      <Badge status="Active" className="ml-2">
        Active with Custom
      </Badge>
    );
    const badge = screen.getByText("Active with Custom");
    expect(badge).toHaveClass("bg-green-100", "text-green-800", "ml-2");
  });

  it("has correct base styles", () => {
    render(<Badge>Base Styles</Badge>);
    const badge = screen.getByText("Base Styles");
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "px-2.5",
      "py-0.5",
      "rounded-full",
      "text-xs",
      "font-medium",
      "border"
    );
  });

  it("renders as span element", () => {
    const { container } = render(<Badge>Span Element</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toBeInTheDocument();
    expect(badge?.tagName).toBe("SPAN");
  });

  it("renders complex children content", () => {
    render(
      <Badge>
        <span>Icon</span> Complex Content
      </Badge>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText(/Complex Content/)).toBeInTheDocument();
  });
});
