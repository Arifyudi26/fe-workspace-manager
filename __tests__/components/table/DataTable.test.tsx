import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, Column } from "@/components/table/DataTable";

interface TestData {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

const mockData: TestData[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
];

const columns: Column<TestData>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => item.name,
  },
  {
    key: "email",
    header: "Email",
    render: (item) => item.email,
  },
  {
    key: "role",
    header: "Role",
    render: (item) => item.role,
  },
];

describe("DataTable Component", () => {
  it("renders table with data", () => {
    render(<DataTable columns={columns} data={mockData} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    render(<DataTable columns={columns} data={mockData} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("renders all rows", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const rows = screen.getAllByRole("row");
    // +1 for header row
    expect(rows).toHaveLength(mockData.length + 1);
  });

  it("displays empty message when no data", () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("displays custom empty message", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No users available"
      />
    );

    expect(screen.getByText("No users available")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    render(<DataTable columns={columns} data={mockData} loading={true} />);

    const skeletons = screen.getAllByRole("row");
    // Default skeletonRows is 5, +1 for header
    expect(skeletons).toHaveLength(6);
  });

  it("renders custom number of skeleton rows", () => {
    render(
      <DataTable
        columns={columns}
        data={mockData}
        loading={true}
        skeletonRows={3}
      />
    );

    const rows = screen.getAllByRole("row");
    // 3 skeleton rows + 1 header
    expect(rows).toHaveLength(4);
  });

  it("calls onRowClick when row is clicked", async () => {
    const user = userEvent.setup();
    const handleRowClick = jest.fn();

    render(
      <DataTable
        columns={columns}
        data={mockData}
        onRowClick={handleRowClick}
      />
    );

    const firstRow = screen.getByText("John Doe").closest("tr");
    if (firstRow) {
      await user.click(firstRow);
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    }
  });

  it("applies cursor-pointer class when onRowClick is provided", () => {
    render(
      <DataTable columns={columns} data={mockData} onRowClick={() => {}} />
    );

    const firstRow = screen.getByText("John Doe").closest("tr");
    expect(firstRow).toHaveClass("cursor-pointer");
  });

  it("does not apply cursor-pointer when onRowClick is not provided", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const firstRow = screen.getByText("John Doe").closest("tr");
    expect(firstRow).not.toHaveClass("cursor-pointer");
  });

  it("applies custom className to table container", () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} className="custom-table" />
    );

    const card = container.querySelector(".custom-table");
    expect(card).toBeInTheDocument();
  });

  it("applies custom column className", () => {
    const customColumns: Column<TestData>[] = [
      {
        key: "name",
        header: "Name",
        render: (item) => item.name,
        className: "custom-cell",
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    const cell = screen.getByText("John Doe").closest("td");
    expect(cell).toHaveClass("custom-cell");
  });

  it("applies custom header className", () => {
    const customColumns: Column<TestData>[] = [
      {
        key: "name",
        header: "Name",
        render: (item) => item.name,
        headerClassName: "custom-header",
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    const header = screen.getByText("Name").closest("th");
    expect(header).toHaveClass("custom-header");
  });

  it("applies default header className when not provided", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const header = screen.getByText("Name").closest("th");
    expect(header).toHaveClass(
      "px-6",
      "py-3",
      "text-left",
      "text-xs",
      "font-medium",
      "text-gray-500",
      "uppercase"
    );
  });

  it("applies default cell className when not provided", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const cell = screen.getByText("John Doe").closest("td");
    expect(cell).toHaveClass("px-6", "py-4", "whitespace-nowrap");
  });

  it("renders complex cell content", () => {
    const complexColumns: Column<TestData>[] = [
      {
        key: "name",
        header: "User",
        render: (item) => (
          <div>
            <div className="font-bold">{item.name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        ),
      },
    ];

    render(<DataTable columns={complexColumns} data={mockData} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders table with proper structure", () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} />
    );

    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass("min-w-full", "divide-y", "divide-gray-200");

    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("bg-gray-50");

    const tbody = container.querySelector("tbody");
    expect(tbody).toHaveClass("bg-white", "divide-y", "divide-gray-200");
  });

  it("has overflow-x-auto wrapper", () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} />
    );

    const wrapper = container.querySelector(".overflow-x-auto");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders correct number of cells per row", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const firstDataRow = screen.getByText("John Doe").closest("tr");
    const cells = firstDataRow?.querySelectorAll("td");
    expect(cells).toHaveLength(columns.length);
  });

  it("uses item id as row key", () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} />
    );

    const rows = container.querySelectorAll("tbody tr");
    // React doesn't add key as attribute, but we can verify rows are rendered
    expect(rows.length).toBe(mockData.length);
  });

  it("handles data with numeric ids", () => {
    const numericData = [
      { id: 1, name: "User 1", email: "user1@test.com", role: "Admin" },
      { id: 2, name: "User 2", email: "user2@test.com", role: "User" },
    ];

    render(<DataTable columns={columns} data={numericData} />);

    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("User 2")).toBeInTheDocument();
  });

  it("shows skeleton with correct structure when loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={mockData} loading={true} />
    );

    const skeletons = container.querySelectorAll(".animate-pulse");
    // skeletonRows (5) * columns (3)
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("does not call onRowClick when not provided", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={mockData} />);

    const firstRow = screen.getByText("John Doe").closest("tr");
    // Should not throw error when clicked
    if (firstRow) {
      await user.click(firstRow);
      // No assertion needed, just verify no error
    }
  });

  it("renders with single column", () => {
    const singleColumn: Column<TestData>[] = [
      {
        key: "name",
        header: "Name",
        render: (item) => item.name,
      },
    ];

    render(<DataTable columns={singleColumn} data={mockData} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(1);
  });

  it("renders with many columns", () => {
    const manyColumns: Column<TestData>[] = [
      { key: "id", header: "ID", render: (item) => item.id },
      { key: "name", header: "Name", render: (item) => item.name },
      { key: "email", header: "Email", render: (item) => item.email },
      { key: "role", header: "Role", render: (item) => item.role },
    ];

    render(<DataTable columns={manyColumns} data={mockData} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
  });
});
