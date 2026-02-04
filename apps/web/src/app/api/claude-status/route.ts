import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

const CLAUDE_STATUS_API = "https://status.claude.com/api/v2/summary.json";
const TARGET_COMPONENT_ID = "yyzkbfz2thpt"; // Claude Code

const StatusPageComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
});

const StatusPageAffectedComponentSchema = z.object({
  code: z.string(),
});

const StatusPageIncidentUpdateSchema = z.object({
  body: z.string(),
  affected_components: z.array(StatusPageAffectedComponentSchema).optional(),
});

const StatusPageIncidentSchema = z.object({
  name: z.string(),
  impact: z.string(),
  components: z.array(StatusPageComponentSchema).optional(),
  incident_updates: z.array(StatusPageIncidentUpdateSchema).optional(),
});

const StatusPageSummarySchema = z.object({
  page: z.object({
    updated_at: z.string(),
  }),
  components: z.array(StatusPageComponentSchema),
  incidents: z.array(StatusPageIncidentSchema),
});

export async function GET() {
  try {
    const response = await fetch(CLAUDE_STATUS_API, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Claude status");
    }

    const rawData = await response.json();
    const data = StatusPageSummarySchema.parse(rawData);

    // Find the Claude Code component
    const claudeCode = data.components.find(
      (c) => c.id === TARGET_COMPONENT_ID
    );

    const isDegraded = claudeCode && claudeCode.status !== "operational";

    // Find relevant incidents
    const relevantIncident = data.incidents.find(
      (incident) =>
        incident.components?.some((c) => c.id === TARGET_COMPONENT_ID) ||
        incident.incident_updates?.some((update) =>
          update.affected_components?.some(
            (ac) => ac.code === TARGET_COMPONENT_ID
          )
        )
    );

    const latestUpdate = relevantIncident?.incident_updates?.[0]?.body;

    return NextResponse.json({
      isDegraded,
      status: claudeCode?.status || "unknown",
      incidentName: relevantIncident?.name || null,
      message:
        latestUpdate ||
        (isDegraded ? "Claude Code is experiencing issues." : null),
      impact: relevantIncident?.impact || null,
      updatedAt: data.page.updated_at,
    });
  } catch (error) {
    console.error("Claude Status Proxy Error:", error);
    return NextResponse.json(
      { isDegraded: false, error: "Status check unavailable" },
      { status: 500 }
    );
  }
}
