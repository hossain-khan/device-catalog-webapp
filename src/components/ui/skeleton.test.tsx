import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render with the correct default classes", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toHaveClass("bg-muted animate-pulse rounded-md");
  });

  it("should accept and apply additional classes", () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-1/2" />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toHaveClass("bg-muted animate-pulse rounded-md h-4 w-1/2");
  });
});
