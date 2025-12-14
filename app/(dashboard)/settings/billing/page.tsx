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
                {...register("companyProfile.companyName", {
                  required: "Company name is required",
                })}
                error={errors.companyProfile?.companyName?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register("companyProfile.email", {
                  required: "Email is required",
                })}
                error={errors.companyProfile?.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register("companyProfile.phone", {
                  required: "Phone is required",
                })}
                error={errors.companyProfile?.phone?.message}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Country"
                {...register("billingAddress.country", {
                  required: "Country is required",
                })}
                error={errors.billingAddress?.country?.message}
              />
              <Input
                label="City"
                {...register("billingAddress.city", {
                  required: "City is required",
                })}
                error={errors.billingAddress?.city?.message}
              />
              <Input
                label="Address"
                {...register("billingAddress.address", {
                  required: "Address is required",
                })}
                error={errors.billingAddress?.address?.message}
              />
              <Input
                label="Postal Code"
                {...register("billingAddress.postalCode", {
                  required: "Postal code is required",
                })}
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
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          •••• {String(method.cardNumber).slice(-4)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method.cardHolder}
                        </p>
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
          <Button onClick={handleSubmit(onSubmit)} className="cursor-pointer">
            Save Billing Settings
          </Button>
        )}
      </div>
    </>
  );
}
