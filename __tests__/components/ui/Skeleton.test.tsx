import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/Skeleton";

describe("Skeleton Component", () => {
  it("renders skeleton element", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
  });

  it("applies default animation and styling", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("animate-pulse", "rounded-md", "bg-gray-200");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-4", "w-full");
  });

  it("combines default and custom classNames", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass(
      "animate-pulse",
      "rounded-md",
      "bg-gray-200",
      "custom-class"
    );
  });

  it("renders as div element", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.tagName).toBe("DIV");
  });

  it("accepts and applies HTML div attributes", () => {
    const { container } = render(
      <Skeleton data-testid="skeleton-element" aria-label="Loading" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("data-testid", "skeleton-element");
    expect(skeleton).toHaveAttribute("aria-label", "Loading");
  });

  it("applies inline styles", () => {
    const { container } = render(
      <Skeleton style={{ width: "200px", height: "100px" }} />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ width: "200px", height: "100px" });
  });

  it("renders with custom dimensions via className", () => {
    const { container } = render(<Skeleton className="h-20 w-40" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-20", "w-40");
  });

  it("can be used for text loading placeholder", () => {
    const { container } = render(<Skeleton className="h-4 w-3/4 mb-2" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-4", "w-3/4", "mb-2");
  });

  it("can be used for image loading placeholder", () => {
    const { container } = render(
      <Skeleton className="h-48 w-full rounded-lg" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-48", "w-full", "rounded-lg");
  });

  it("can be used for circle avatar placeholder", () => {
    const { container } = render(
      <Skeleton className="h-12 w-12 rounded-full" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("h-12", "w-12", "rounded-full");
  });

  it("renders multiple skeletons independently", () => {
    const { container } = render(
      <>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </>
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(3);
  });

  it("applies empty string className gracefully", () => {
    const { container } = render(<Skeleton className="" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass("animate-pulse", "rounded-md", "bg-gray-200");
  });

  it("accepts onClick handler", () => {
    const handleClick = jest.fn();
    const { container } = render(<Skeleton onClick={handleClick} />);
    const skeleton = container.firstChild as HTMLElement;
    skeleton.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("spreads additional props correctly", () => {
    const { container } = render(
      <Skeleton id="skeleton-id" role="status" aria-busy="true" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute("id", "skeleton-id");
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });
});
