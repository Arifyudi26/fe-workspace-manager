"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState("");

  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      router.push("/projects");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Workspace Manager
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Sign in to your account
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {serverError}
              </div>
            )}

            <div>
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                {...register("email")}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email?.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
