"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

// ─── Spinner shown during auth check ─────────────────────────
function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

// ─── Requires login ───────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return null;

  return children;
}

// ─── Requires Admin role ──────────────────────────────────────
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) router.replace("/auth/login");
      else if (!isAdmin) router.replace("/");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) return <AuthLoader />;
  if (!isAuthenticated || !isAdmin) return null;

  return children;
}

// ─── Redirects away if already logged in (for /auth pages) ───
export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <AuthLoader />;
  if (isAuthenticated) return null;

  return children;
}