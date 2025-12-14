"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Modal from "@/components/ui/Modal";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BillingData, PaymentMethod } from "@/types";

const STEPS = ["Company Profile", "Billing Address", "Payment Methods"];

const generateId = (): string => {
  return Date.now().toString();
};

// Format card number with spaces (1234 5678 9012 3456)
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(" ") : cleaned;
};

// Format expiry date (MM/YY)
const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
};

// Format phone number
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
    6,
    10
  )}`;
};

// Format postal code
const formatPostalCode = (value: string): string => {
  return value.replace(/[^0-9-]/g, "").slice(0, 10);
};

export default function BillingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    isDefault: false,
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<BillingData>({
    defaultValues: {
      companyProfile: { companyName: "", email: "", phone: "" },
      billingAddress: { country: "", city: "", address: "", postalCode: "" },
      paymentMethods: [],
    },
  });

  const {
    fields: paymentMethods,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "paymentMethods",
  });

  const validateStep = async () => {
    if (currentStep === 0) {
      return await trigger([
        "companyProfile.companyName",
        "companyProfile.email",
        "companyProfile.phone",
      ]);
    }

    if (currentStep === 1) {
      return await trigger([
        "billingAddress.country",
        "billingAddress.city",
        "billingAddress.address",
        "billingAddress.postalCode",
      ]);
    }

    return true;
  };

  const handleNext = () => {
    validateStep().then((ok) => {
      if (ok) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    });
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addPaymentMethod = () => {
    if (!paymentForm.cardNumber || !paymentForm.cardHolder) {
      setModal({
        isOpen: true,
        title: "Missing payment details",
        message: "Please fill in all payment details",
      });
      return;
    }

    // Validate expiry date
    if (paymentForm.expiryDate) {
      const [month, year] = paymentForm.expiryDate.split("/");
      const monthNum = parseInt(month);
      if (monthNum < 1 || monthNum > 12) {
        setModal({
          isOpen: true,
          title: "Invalid expiry date",
          message: "Month must be between 01 and 12",
        });
        return;
      }
    }

    const newMethod: PaymentMethod = {
      id: generateId(),
      cardNumber: paymentForm.cardNumber || "",
      cardHolder: paymentForm.cardHolder || "",
      expiryDate: paymentForm.expiryDate || "",
      cvv: paymentForm.cvv || "",
      isDefault: paymentForm.isDefault || false,
    };

    // If this is the first payment method, mark default
    if (paymentMethods.length === 0) {
      newMethod.isDefault = true;
    }

    append(newMethod);

    setPaymentForm({
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
      isDefault: false,
    });
  };

  const removePaymentMethod = (index: number) => {
    remove(index);
  };

  const onSubmit = async (data: BillingData) => {
    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          title: "Success",
          message: "Billing settings saved successfully!",
        });
      }
    } catch (error) {
      console.error("Failed to save billing:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to save billing settings",
      });
    }
  };

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const closeModal = () => setModal({ isOpen: false, title: "", message: "" });

  return (
    <>
      <Modal
        title={modal.title}
        isOpen={modal.isOpen}
        onClose={closeModal}
        primaryLabel="OK"
      >
        <p>{modal.message}</p>
      </Modal>

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
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-3 text-sm font-medium transition-colors ${
                    index <= currentStep ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
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
                placeholder="Acme Corporation"
                {...register("companyProfile.companyName", {
                  required: "Company name is required",
                  minLength: {
                    value: 2,
                    message: "Company name must be at least 2 characters",
                  },
                })}
                error={errors.companyProfile?.companyName?.message}
              />
              <Input
                label="Email"
                type="email"
                placeholder="company@example.com"
                {...register("companyProfile.email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.companyProfile?.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(123) 456-7890"
                {...register("companyProfile.phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^[\d\s\-\(\)]+$/,
                    message: "Invalid phone number",
                  },
                })}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setValue("companyProfile.phone", formatted);
                }}
                error={errors.companyProfile?.phone?.message}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  {...register("billingAddress.country", {
                    required: "Country is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="ID">Indonesia</option>
                  <option value="SG">Singapore</option>
                  <option value="MY">Malaysia</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.billingAddress?.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.billingAddress.country.message}
                  </p>
                )}
              </div>

              <Input
                label="City"
                placeholder="New York"
                {...register("billingAddress.city", {
                  required: "City is required",
                  minLength: {
                    value: 2,
                    message: "City must be at least 2 characters",
                  },
                })}
                error={errors.billingAddress?.city?.message}
              />
              <Input
                label="Street Address"
                placeholder="123 Main Street, Apt 4B"
                {...register("billingAddress.address", {
                  required: "Address is required",
                  minLength: {
                    value: 5,
                    message: "Address must be at least 5 characters",
                  },
                })}
                error={errors.billingAddress?.address?.message}
              />
              <Input
                label="Postal Code / ZIP"
                placeholder="10001"
                {...register("billingAddress.postalCode", {
                  required: "Postal code is required",
                  pattern: {
                    value: /^[0-9-]+$/,
                    message: "Invalid postal code format",
                  },
                })}
                onChange={(e) => {
                  const formatted = formatPostalCode(e.target.value);
                  setValue("billingAddress.postalCode", formatted);
                }}
                error={errors.billingAddress?.postalCode?.message}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Existing Payment Methods */}
              {paymentMethods.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Saved Payment Methods
                  </h3>
                  {paymentMethods.map((method, idx) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">
                            •••• {String(method.cardNumber).slice(-4)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.cardHolder}
                          </p>
                          <p className="text-xs text-gray-400">
                            Expires: {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => removePaymentMethod(idx)}
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
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={paymentForm.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    if (formatted.replace(/\s/g, "").length <= 16) {
                      setPaymentForm({
                        ...paymentForm,
                        cardNumber: formatted,
                      });
                    }
                  }}
                />
                <Input
                  label="Card Holder Name"
                  type="text"
                  placeholder="JOHN DOE"
                  value={paymentForm.cardHolder}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      cardHolder: e.target.value.toUpperCase(),
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentForm.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        expiryDate: formatted,
                      });
                    }}
                  />
                  <Input
                    label="CVV"
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    value={paymentForm.cvv}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setPaymentForm({ ...paymentForm, cvv: cleaned });
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addPaymentMethod}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  Add Payment Method
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
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
          <Button onClick={handleSubmit(onSubmit)} className="cursor-pointer">
            Save Billing Settings
          </Button>
        )}
      </div>
    </>
  );
}
