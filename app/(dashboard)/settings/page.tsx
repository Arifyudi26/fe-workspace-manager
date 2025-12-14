"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BillingPage() {
  type BillingData = {
    companyProfile: { companyName: string; email: string; phone: string };
    billingAddress: {
      country: string;
      city: string;
      address: string;
      postalCode: string;
    };
    paymentMethods: Array<{
      id: string;
      cardNumber: string;
      cardHolder: string;
      expiryDate: string;
      cvv: string;
      isDefault: boolean;
    }>;
  };

  const [data, setData] = useState<BillingData[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing");
      const json = await res.json();
      setData(
        Array.isArray(json.data) ? json.data : json.data ? [json.data] : null
      );
    } catch (err) {
      console.error("Failed to fetch billing settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removePayment = async (id: string) => {
    try {
      const res = await fetch("/api/billing", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to remove payment method:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
        <p className="text-gray-600 mt-1">
          Company profile, billing address and payment methods
        </p>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardBody>
        </Card>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-gray-500">No billing settings found.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {data.map((entry, idx) => (
            <Card key={idx} className="mb-4">
              <CardBody>
                <div className="mb-6">
                  <Card className="mb-4">
                    <CardBody>
                      <h3 className="text-sm font-semibold">Company Profile</h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <div>
                          <strong>Company:</strong>{" "}
                          {entry.companyProfile.companyName}
                        </div>
                        <div>
                          <strong>Email:</strong> {entry.companyProfile.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {entry.companyProfile.phone}
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="mb-4">
                    <CardBody>
                      <h3 className="text-sm font-semibold">Billing Address</h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <div>{entry.billingAddress.address}</div>
                        <div>
                          {entry.billingAddress.city},{" "}
                          {entry.billingAddress.country}{" "}
                          {entry.billingAddress.postalCode}
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h3 className="text-sm font-semibold mb-4">
                        Payment Methods
                      </h3>
                      <div className="space-y-3">
                        {entry.paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                •••• {String(pm.cardNumber).slice(-4)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {pm.cardHolder} • {pm.expiryDate}{" "}
                                {pm.isDefault ? "• Default" : ""}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removePayment(pm.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </CardBody>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
