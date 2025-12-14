import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod } from "@/types";

// Interface for billing data structure
interface BillingData {
  companyProfile: {
    companyName: string;
    email: string;
    phone: string;
  };
  billingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  paymentMethods: PaymentMethod[];
}

// Get billing data
export async function GET() {
  try {
    const billingPath = join(process.cwd(), "data", "billing.json");
    const fileContents = readFileSync(billingPath, "utf8");
    const parsed = JSON.parse(fileContents);
    const billingArray: BillingData[] = Array.isArray(parsed)
      ? parsed
      : [parsed];

    // Return the billing settings array
    return NextResponse.json({ data: billingArray });
  } catch (error) {
    console.error("Error reading billing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}

// Save billing data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const billingPath = join(process.cwd(), "data", "billing.json");

    // Read existing file to merge rather than overwrite blindly
    let existing: Partial<BillingData> = {};
    try {
      const existingContents = readFileSync(billingPath, "utf8");
      existing = (JSON.parse(existingContents) as Partial<BillingData>) || {};
    } catch {
      existing = {};
    }

    // Normalize existing data to an array and append the new entry
    const existingArray: BillingData[] = Array.isArray(existing)
      ? (existing as BillingData[])
      : existing && Object.keys(existing).length
      ? [existing as BillingData]
      : [];

    // Append the incoming body as a new billing record
    existingArray.push(body as BillingData);

    const { writeFileSync } = await import("fs");
    writeFileSync(billingPath, JSON.stringify(existingArray, null, 2), "utf8");

    return NextResponse.json({
      message: "Billing entry added successfully",
      data: existingArray,
    });
  } catch (err) {
    console.error("Failed to save billing:", err);
    return NextResponse.json(
      { error: "Failed to save billing" },
      { status: 500 }
    );
  }
}

// Delete payment method
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const billingPath = join(process.cwd(), "data", "billing.json");
    const fileContents = readFileSync(billingPath, "utf8");
    const parsed = JSON.parse(fileContents);
    const billingArray: BillingData[] = Array.isArray(parsed)
      ? parsed
      : [parsed];

    let removed = false;
    const updated = billingArray.map((entry) => {
      if (!entry.paymentMethods || !Array.isArray(entry.paymentMethods))
        return entry;
      const filtered = entry.paymentMethods.filter(
        (method) => method.id !== id
      );
      if (filtered.length !== entry.paymentMethods.length) removed = true;
      return { ...entry, paymentMethods: filtered };
    });

    if (!removed) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    const { writeFileSync } = await import("fs");
    writeFileSync(billingPath, JSON.stringify(updated, null, 2), "utf8");

    return NextResponse.json({
      message: "Payment method removed",
      data: updated,
    });
  } catch (err) {
    console.error("Failed to delete payment method:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
