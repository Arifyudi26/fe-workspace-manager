import { NextResponse } from "next/server";

export async function GET() {
  // Mock billing data
  return NextResponse.json({
    companyProfile: {
      companyName: "Example Corp",
      email: "billing@example.com",
      phone: "+1234567890",
    },
    billingAddress: {
      country: "United States",
      city: "San Francisco",
      address: "123 Main St",
      postalCode: "94102",
    },
    paymentMethods: [
      {
        id: "1",
        cardNumber: "4242424242424242",
        cardHolder: "John Doe",
        expiryDate: "12/25",
        cvv: "123",
        isDefault: true,
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // In real app, save to database here
  console.log("Saving billing data:", body);

  return NextResponse.json({
    message: "Billing settings saved successfully",
    data: body,
  });
}
