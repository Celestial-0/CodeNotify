"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import { ForgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/types/auth.types";
import { AuthService } from "@/lib/api/auth.service";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  React.useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

interface ImageQuoteContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

const defaultContent = {
  image: {
    src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
    alt: "Reset your password",
  },
  quote: {
    text: "We'll help you get back on track.",
    author: "CodeNotify Team",
  },
};

export function ForgotPasswordUI({
  image,
  quote,
}: ImageQuoteContentProps = {}) {
  const finalContent = {
    image: { ...defaultContent.image, ...image },
    quote: { ...defaultContent.quote, ...quote },
  };

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <ForgotPasswordForm />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${finalContent.image.src})` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-linear-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center text-foreground">
            <p className="text-lg font-medium">
              &ldquo;
              <Typewriter
                key={finalContent.quote.text}
                text={finalContent.quote.text}
                speed={60}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-light text-muted-foreground not-italic">
              — {finalContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await AuthService.forgotPassword(data);
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success("Password reset link sent!", {
        description: `Check your email at ${data.email}`,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      
      let errorMessage = "Failed to send reset link. Please try again.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("Request failed", {
        description: errorMessage,
      });
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-balance text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>
          </p>
        </div>
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Click the link in the email to reset your password. If you don&apos;t see
            the email, check your spam folder.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Button variant="link" className="pl-1 text-foreground" asChild>
          <Link href="/auth/signin">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
