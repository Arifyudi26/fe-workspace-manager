import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

// Mock Next.js Link component
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("NotFound Component", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders descriptive message", () => {
    render(<NotFound />);
    expect(
      screen.getByText(
        "The page you're looking for doesn't exist or has been moved."
      )
    ).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<NotFound />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("has link to projects page", () => {
    render(<NotFound />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("renders Button component inside Link", () => {
    render(<NotFound />);
    const button = screen.getByRole("button", { name: /back/i });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe("Back");
  });

  it("has correct container styling", () => {
    const { container } = render(<NotFound />);
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
    const { container } = render(<NotFound />);
    const contentDiv = container.querySelector(".text-center");

    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveClass("text-center");
  });

  it("has correct 404 heading styling", () => {
    render(<NotFound />);
    const heading = screen.getByText("404");

    expect(heading).toHaveClass(
      "text-6xl",
      "font-bold",
      "text-gray-900",
      "mb-4"
    );
  });

  it("has correct page not found heading styling", () => {
    render(<NotFound />);
    const heading = screen.getByText("Page Not Found");

    expect(heading).toHaveClass(
      "text-2xl",
      "font-bold",
      "text-gray-900",
      "mb-2"
    );
  });

  it("has correct description text styling", () => {
    render(<NotFound />);
    const description = screen.getByText(
      "The page you're looking for doesn't exist or has been moved."
    );

    expect(description).toHaveClass("text-gray-600", "mb-8");
  });

  it("button has cursor pointer class", () => {
    render(<NotFound />);
    const button = screen.getByRole("button", { name: /back/i });

    expect(button).toHaveClass("cursor-pointer");
  });

  it("renders h1 element for 404", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("404");
  });

  it("renders h2 element for page not found", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 2 });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("Page Not Found");
  });

  it("has proper semantic HTML structure", () => {
    const { container } = render(<NotFound />);

    expect(container.querySelector("h1")).toBeInTheDocument();
    expect(container.querySelector("h2")).toBeInTheDocument();
    expect(container.querySelector("p")).toBeInTheDocument();
    expect(container.querySelector("a")).toBeInTheDocument();
  });

  it("link contains button as child", () => {
    const { container } = render(<NotFound />);
    const link = container.querySelector("a");
    const button = container.querySelector("button");

    expect(link).toContainElement(button);
  });

  it("uses apostrophe in description text", () => {
    render(<NotFound />);
    const text = screen.getByText(/you're/i);
    expect(text).toBeInTheDocument();
  });

  it("uses apostrophe in doesn't", () => {
    render(<NotFound />);
    const text = screen.getByText(/doesn't/i);
    expect(text).toBeInTheDocument();
  });

  it("renders all text content", () => {
    const { container } = render(<NotFound />);
    const text = container.textContent;

    expect(text).toContain("404");
    expect(text).toContain("Page Not Found");
    expect(text).toContain("The page you're looking for doesn't exist");
    expect(text).toContain("Back");
  });

  it("renders without crashing", () => {
    const { container } = render(<NotFound />);
    expect(container).toBeInTheDocument();
  });

  it("has exactly one link element", () => {
    const { container } = render(<NotFound />);
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
  });

  it("has exactly one button element", () => {
    const { container } = render(<NotFound />);
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(1);
  });

  it("button is inside centered container", () => {
    const { container } = render(<NotFound />);
    const centerDiv = container.querySelector(".text-center");
    const button = container.querySelector("button");

    expect(centerDiv).toContainElement(button);
  });

  it("maintains layout structure", () => {
    const { container } = render(<NotFound />);

    // Check if elements are in correct order
    const textContent = container.textContent || "";
    const order404 = textContent.indexOf("404");
    const orderPageNotFound = textContent.indexOf("Page Not Found");
    const orderDescription = textContent.indexOf("The page you're looking for");
    const orderBack = textContent.indexOf("Back");

    expect(order404).toBeLessThan(orderPageNotFound);
    expect(orderPageNotFound).toBeLessThan(orderDescription);
    expect(orderDescription).toBeLessThan(orderBack);
  });

  it("renders static content without props", () => {
    // NotFound component doesn't accept props
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("link is clickable", () => {
    render(<NotFound />);
    const link = screen.getByRole("link");

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href");
  });

  it("displays full error message without truncation", () => {
    render(<NotFound />);
    const message = screen.getByText(
      "The page you're looking for doesn't exist or has been moved."
    );

    expect(message).toBeInTheDocument();
    expect(message.textContent).toHaveLength(60);
  });
});
