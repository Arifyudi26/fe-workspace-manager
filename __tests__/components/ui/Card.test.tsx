import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

describe("Card Component", () => {
  describe("Card", () => {
    it("renders card with children", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(
        "bg-white",
        "rounded-lg",
        "border",
        "border-gray-200",
        "shadow-sm"
      );
    });

    it("applies custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });

    it("renders as div element", () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe("DIV");
    });

    it("renders complex children", () => {
      render(
        <Card>
          <h1>Title</h1>
          <p>Description</p>
        </Card>
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  describe("CardHeader", () => {
    it("renders header with children", () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      const { container } = render(<CardHeader>Content</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("px-6", "py-4", "border-b", "border-gray-200");
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardHeader className="custom-header">Content</CardHeader>
      );
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("custom-header");
    });

    it("renders as div element", () => {
      const { container } = render(<CardHeader>Content</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header.tagName).toBe("DIV");
    });
  });

  describe("CardBody", () => {
    it("renders body with children", () => {
      render(<CardBody>Body Content</CardBody>);
      expect(screen.getByText("Body Content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      const { container } = render(<CardBody>Content</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass("px-6", "py-4");
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardBody className="custom-body">Content</CardBody>
      );
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass("custom-body");
    });

    it("renders as div element", () => {
      const { container } = render(<CardBody>Content</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body.tagName).toBe("DIV");
    });
  });

  describe("CardFooter", () => {
    it("renders footer with children", () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      const { container } = render(<CardFooter>Content</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass("px-6", "py-4", "border-t", "border-gray-200");
    });

    it("applies custom className", () => {
      const { container } = render(
        <CardFooter className="custom-footer">Content</CardFooter>
      );
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass("custom-footer");
    });

    it("renders as div element", () => {
      const { container } = render(<CardFooter>Content</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer.tagName).toBe("DIV");
    });
  });

  describe("Card Composition", () => {
    it("renders complete card with all parts", () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Header")).toBeInTheDocument();
      expect(screen.getByText("Body")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("renders card with only header and body", () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body</CardBody>
        </Card>
      );

      expect(screen.getByText("Header")).toBeInTheDocument();
      expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("combines custom classNames on all parts", () => {
      const { container } = render(
        <Card className="card-custom">
          <CardHeader className="header-custom">Header</CardHeader>
          <CardBody className="body-custom">Body</CardBody>
          <CardFooter className="footer-custom">Footer</CardFooter>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("card-custom");

      const header = screen.getByText("Header");
      expect(header).toHaveClass("header-custom");

      const body = screen.getByText("Body");
      expect(body).toHaveClass("body-custom");

      const footer = screen.getByText("Footer");
      expect(footer).toHaveClass("footer-custom");
    });
  });
});
