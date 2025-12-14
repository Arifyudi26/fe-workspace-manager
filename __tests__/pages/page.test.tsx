import { redirect } from "next/navigation";
import Home from "@/app/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls redirect to /projects", () => {
    Home();
    expect(redirect).toHaveBeenCalledWith("/projects");
  });

  it("calls redirect exactly once", () => {
    Home();
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it("redirects to the correct path", () => {
    Home();
    expect(redirect).toHaveBeenCalledWith("/projects");
    expect(redirect).not.toHaveBeenCalledWith("/");
    expect(redirect).not.toHaveBeenCalledWith("/home");
  });

  it("does not return any value", () => {
    const result = Home();
    expect(result).toBeUndefined();
  });

  it("is a function", () => {
    expect(typeof Home).toBe("function");
  });

  it("can be called multiple times", () => {
    Home();
    Home();
    Home();
    expect(redirect).toHaveBeenCalledTimes(3);
  });
});
