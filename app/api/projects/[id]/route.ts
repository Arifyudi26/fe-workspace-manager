import { NextResponse } from "next/server";
import projectsData from "@/data/projects.json";
import membersData from "@/data/members.json";
import activitiesData from "@/data/activities.json";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = projectsData.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const members = membersData[id as keyof typeof membersData] || [];
  const activities = activitiesData[id as keyof typeof activitiesData] || [];

  return NextResponse.json({
    project,
    members,
    activities,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const project = projectsData.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updatedProject = {
    ...project,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  // Try to persist the updated project back to data/projects.json.
  // NOTE: This works in local/dev or writable Node environments. Many
  // serverless platforms (like Vercel) have a read-only filesystem for
  // the deployed app and this write will fail there.
  try {
    const filePath = path.join(process.cwd(), "data", "projects.json");
    const projects = Array.isArray(projectsData) ? [...projectsData] : [];
    const idx = projects.findIndex((p) => p.id === id);

    if (idx !== -1) {
      projects[idx] = updatedProject;
    } else {
      projects.push(updatedProject);
    }

    await fs.writeFile(filePath, JSON.stringify(projects, null, 2), "utf8");
  } catch (err) {
    // Log for local debugging and return 500 so the client knows persistence failed.

    console.error("Failed to write projects.json", err);
    return NextResponse.json(
      { error: "Failed to persist project" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    project: updatedProject,
    message: "Project updated successfully",
  });
}
