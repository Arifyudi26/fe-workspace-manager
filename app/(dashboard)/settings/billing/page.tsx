"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BillingData, PaymentMethod } from "@/types";

const STEPS = ["Company Profile", "Billing Address", "Payment Methods"];

export default function BillingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BillingData>({
    companyProfile: {
      companyName: "",
      email: "",
      phone: "",
    },
    billingAddress: {
      country: "",
      city: "",
      address: "",
      postalCode: "",
    },
    paymentMethods: [],
  });

  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.companyProfile.companyName) {
        newErrors.companyName = "Company name is required";
      }
      if (!formData.companyProfile.email) {
        newErrors.email = "Email is required";
      }
      if (!formData.companyProfile.phone) {
        newErrors.phone = "Phone is required";
      }
    }

    if (currentStep === 1) {
      if (!formData.billingAddress.country) {
        newErrors.country = "Country is required";
      }
      if (!formData.billingAddress.city) {
        newErrors.city = "City is required";
      }
      if (!formData.billingAddress.address) {
        newErrors.address = "Address is required";
      }
      if (!formData.billingAddress.postalCode) {
        newErrors.postalCode = "Postal code is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addPaymentMethod = () => {
    if (!paymentForm.cardNumber || !paymentForm.cardHolder) {
      alert("Please fill in all payment details");
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      cardNumber: paymentForm.cardNumber || "",
      cardHolder: paymentForm.cardHolder || "",
      expiryDate: paymentForm.expiryDate || "",
      cvv: paymentForm.cvv || "",
      isDefault:
        formData.paymentMethods.length === 0 || paymentForm.isDefault || false,
    };

    setFormData({
      ...formData,
      paymentMethods: [...formData.paymentMethods, newMethod],
    });

    setPaymentForm({
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
      isDefault: false,
    });
  };

  const removePaymentMethod = (id: string) => {
    setFormData({
      ...formData,
      paymentMethods: formData.paymentMethods.filter((m) => m.id !== id),
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Billing settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save billing:", error);
      alert("Failed to save billing settings");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
        <p className="text-gray-600 mt-1">Manage your billing information</p>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-medium ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    index <= currentStep ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{STEPS[currentStep]}</h2>
        </CardHeader>
        <CardBody>
          {currentStep === 0 && (
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={formData.companyProfile.companyName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyProfile: {
                      ...formData.companyProfile,
                      companyName: e.target.value,
                    },
                  })
                }
                error={errors.companyName}
              />
              <Input
                label="Email"
                type="email"
                value={formData.companyProfile.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyProfile: {
                      ...formData.companyProfile,
                      email: e.target.value,
                    },
                  })
                }
                error={errors.email}
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.companyProfile.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyProfile: {
                      ...formData.companyProfile,
                      phone: e.target.value,
                    },
                  })
                }
                error={errors.phone}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Country"
                value={formData.billingAddress.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: {
                      ...formData.billingAddress,
                      country: e.target.value,
                    },
                  })
                }
                error={errors.country}
              />
              <Input
                label="City"
                value={formData.billingAddress.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: {
                      ...formData.billingAddress,
                      city: e.target.value,
                    },
                  })
                }
                error={errors.city}
              />
              <Input
                label="Address"
                value={formData.billingAddress.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: {
                      ...formData.billingAddress,
                      address: e.target.value,
                    },
                  })
                }
                error={errors.address}
              />
              <Input
                label="Postal Code"
                value={formData.billingAddress.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingAddress: {
                      ...formData.billingAddress,
                      postalCode: e.target.value,
                    },
                  })
                }
                error={errors.postalCode}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Existing Payment Methods */}
              {formData.paymentMethods.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Saved Payment Methods
                  </h3>
                  {formData.paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          •••• {method.cardNumber.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method.cardHolder}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => removePaymentMethod(method.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Payment Method */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Add New Payment Method
                </h3>
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      cardNumber: e.target.value,
                    })
                  }
                />
                <Input
                  label="Card Holder"
                  placeholder="John Doe"
                  value={paymentForm.cardHolder}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      cardHolder: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={paymentForm.expiryDate}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, cvv: e.target.value })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addPaymentMethod}
                  className="cursor-pointer"
                >
                  Add Payment Method
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} className="cursor-pointer">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="cursor-pointer">
            Save Billing Settings
          </Button>
        )}
      </div>
    </div>
  );
}
