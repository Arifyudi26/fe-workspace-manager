"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Project, Member, Activity, ProjectStatus } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PROJECT_STATUSES } from "@/lib/constants";

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const projectId = pathname.split("/").pop();

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId]);

  const fetchProjectDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      setProject(data.project);
      setMembers(data.members);
      setActivities(data.activities);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !projectId) return;

    setUpdating(true);

    // Optimistic update
    const oldStatus = project.status;
    setProject({ ...project, status: newStatus });

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Update failed");

      // Refresh data
      await fetchProjectDetail(projectId);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on error
      setProject({ ...project, status: oldStatus });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-16 mb-4" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-10 w-1/3 mb-2" />
              <Skeleton className="h-6 w-2/3 mt-2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardBody>
                <dl className="grid grid-cols-1 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>

            {/* Activity Log Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <p className="text-gray-500">Project not found</p>
            <Button
              onClick={() => router.push("/projects")}
              className="mt-4 cursor-pointer"
            >
              Back
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="cursor-pointer"
        >
          Back
        </Button>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <Badge status={project.status as ProjectStatus}>
            {project.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Project Information</h2>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {project.owner}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <select
                      value={project.status}
                      onChange={(e) =>
                        handleStatusChange(e.target.value as ProjectStatus)
                      }
                      disabled={updating}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(project.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(project.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Activity Log</h2>
            </CardHeader>
            <CardBody>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activities yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {activity.user[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.user} • {formatDateTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Team Members</h2>
            </CardHeader>
            <CardBody>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
