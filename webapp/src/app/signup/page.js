'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signup } from '@/app/actions/auth';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full py-2 text-lg" disabled={pending}>
      {pending ? 'Creating account...' : 'Sign Up'}
    </Button>
  );
}

export default function Signup() {
  const [error, setError] = useState("");

  async function handleSignup(formData) {
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/clothingStore.jpeg"
        alt="Background Image"
        fill
        className="object-cover z-0"
        priority
      />

      <main className="absolute inset-0 flex flex-col items-center justify-center px-4 py-12 z-10 bg-white/0 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Sign Up
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form action={handleSignup} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your Password"
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <SubmitButton />
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
