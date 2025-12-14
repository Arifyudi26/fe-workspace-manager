import { render } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";

jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter-font-class",
  }),
}));

jest.mock("@/providers/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock("@/app/globals.css", () => ({}));

describe("RootLayout", () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("wraps children with AuthProvider", () => {
    const { getByTestId } = render(<RootLayout>{mockChildren}</RootLayout>);
    expect(getByTestId("auth-provider")).toBeInTheDocument();
    expect(getByTestId("auth-provider")).toContainElement(
      getByTestId("test-children")
    );
  });

  it("renders multiple children", () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    const { getByTestId } = render(<RootLayout>{multipleChildren}</RootLayout>);

    expect(getByTestId("child-1")).toBeInTheDocument();
    expect(getByTestId("child-2")).toBeInTheDocument();
  });

  it("passes children to AuthProvider", () => {
    const testContent = <span data-testid="nested-content">Nested</span>;
    const { getByTestId } = render(<RootLayout>{testContent}</RootLayout>);

    const authProvider = getByTestId("auth-provider");
    expect(authProvider).toContainElement(getByTestId("nested-content"));
  });

  it("renders text content in children", () => {
    const textChild = <p>Test paragraph content</p>;
    const { getByText } = render(<RootLayout>{textChild}</RootLayout>);
    expect(getByText("Test paragraph content")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    const { getByTestId } = render(<RootLayout>{null}</RootLayout>);
    expect(getByTestId("auth-provider")).toBeInTheDocument();
  });
});

describe("metadata", () => {
  it("has correct title", () => {
    expect(metadata.title).toBe("Workspace Manager");
  });

  it("has correct description", () => {
    expect(metadata.description).toBe("Manage your projects efficiently");
  });

  it("exports metadata object", () => {
    expect(metadata).toBeDefined();
    expect(typeof metadata).toBe("object");
  });

  it("has required metadata properties", () => {
    expect(metadata).toHaveProperty("title");
    expect(metadata).toHaveProperty("description");
  });
});
