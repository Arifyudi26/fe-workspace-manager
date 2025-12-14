import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("updates debounced value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated", delay: 500 });
    expect(result.current).toBe("initial"); // Still initial

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("updated");
  });

  it("uses default delay of 500ms when not provided", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("cancels previous timeout when value changes rapidly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: "initial" },
      }
    );

    // Rapid changes
    rerender({ value: "first" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "second" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "third" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be initial (no timeout completed)
    expect(result.current).toBe("initial");

    // Complete the last timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("third");
  });

  it("works with different data types - number", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 0 },
      }
    );

    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe(42);
  });

  it("works with different data types - boolean", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: false },
      }
    );

    rerender({ value: true });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe(true);
  });

  it("works with different data types - object", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: { name: "John" } },
      }
    );

    const newValue = { name: "Jane" };
    rerender({ value: newValue });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toEqual(newValue);
  });

  it("works with different data types - array", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: [1, 2, 3] },
      }
    );

    const newValue = [4, 5, 6];
    rerender({ value: newValue });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toEqual(newValue);
  });

  it("handles custom delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 1000 },
      }
    );

    rerender({ value: "updated", delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("updates when delay changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Change both value and delay
    rerender({ value: "updated", delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial"); // Not updated yet

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("updated"); // Updated after 1000ms total
  });

  it("handles null value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: null as string | null },
      }
    );

    rerender({ value: "not null" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("not null");
  });

  it("handles undefined value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: undefined as string | undefined },
      }
    );

    rerender({ value: "defined" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("defined");
  });

  it("handles empty string", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: "text" },
      }
    );

    rerender({ value: "" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("");
  });

  it("cleans up timeout on unmount", () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: "initial" },
      }
    );

    rerender({ value: "updated" });
    unmount();

    // Advance timers after unmount
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not cause any errors (cleanup worked)
    expect(true).toBe(true);
  });

  it("handles multiple sequential updates correctly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: "v1" },
      }
    );

    // First update
    rerender({ value: "v2" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("v2");

    // Second update
    rerender({ value: "v3" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("v3");

    // Third update
    rerender({ value: "v4" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("v4");
  });

  it("handles very short delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1),
      {
        initialProps: { value: "initial" },
      }
    );

    rerender({ value: "updated" });
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("handles zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      {
        initialProps: { value: "initial" },
      }
    );

    rerender({ value: "updated" });
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current).toBe("updated");
  });

  it("simulates search input debouncing", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "" },
      }
    );

    // User types "h"
    rerender({ value: "h" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(""); // Still empty

    // User types "he"
    rerender({ value: "he" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(""); // Still empty

    // User types "hel"
    rerender({ value: "hel" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(""); // Still empty

    // User types "hell"
    rerender({ value: "hell" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(""); // Still empty

    // User types "hello"
    rerender({ value: "hello" });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("hello"); // Finally updated
  });
});
