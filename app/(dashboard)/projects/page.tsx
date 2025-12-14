"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Project, ProjectStatus } from "@/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUSES } from "@/lib/constants";
import { DataTable, Column } from "@/components/table/DataTable";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  type Filters = { search: string; statusFilter: string };

  const { register, watch } = useForm<Filters>({
    defaultValues: { search: "", statusFilter: "all" },
  });

  const watchedSearch = watch("search");
  const watchedStatusFilter = watch("statusFilter");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(watchedSearch, 500);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          ...(watchedStatusFilter !== "all" && { status: watchedStatusFilter }),
          ...(debouncedSearch && { search: debouncedSearch }),
        });

        const response = await fetch(`/api/projects?${params}`);
        const data = await response.json();

        setProjects(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [debouncedSearch, watchedStatusFilter, currentPage]);

  // Define table columns
  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Project Name",
      render: (project: Project) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {project.name}
          </div>
          <div className="text-sm text-gray-500">{project.description}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project: Project) => (
        <Badge status={project.status as ProjectStatus}>{project.status}</Badge>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (project: Project) => (
        <span className="text-sm text-gray-500">{project.owner}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated At",
      render: (project: Project) => (
        <span className="text-sm text-gray-500">
          {formatDate(project.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
      className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
      render: (project: Project) => (
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/projects/${project.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">Manage your workspace projects</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search projects..." {...register("search")} />
            </div>
            <div className="flex gap-2">
              <select
                {...register("statusFilter")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Projects Table */}
      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        emptyMessage="No projects found"
        skeletonRows={5}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
