"use client";

import React from "react";
import {
  ExternalLink,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { API_BASE_URL, SWAGGER_URL } from "@/lib/api";

interface HeaderProps {
  activeTitle: string;
  isBackendOnline: boolean;
  isChecking: boolean;
  onRefreshCheck: () => void;
}

export function Header({
  activeTitle,
  isBackendOnline,
  isChecking,
  onRefreshCheck,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {activeTitle}
        </h1>
        <span className="text-slate-300">|</span>
        <span className="text-xs font-mono text-slate-500">Toyota Interview Test</span>
      </div>

      {/* Backend API & Swagger Controls */}
      <div className="flex items-center gap-3">
        {/* API URL Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span>{API_BASE_URL || "/api (Proxy)"}</span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
              isBackendOnline
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isBackendOnline ? (
              <>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                ONLINE
              </>
            ) : (
              <>
                <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                OFFLINE
              </>
            )}
          </span>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={onRefreshCheck}
          disabled={isChecking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          title="ทดสอบการเชื่อมต่อ Backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin text-slate-700" : "text-slate-500"}`} />
          <span>{isChecking ? "กำลังทดสอบ..." : "ทดสอบ API"}</span>
        </button>

        {/* Swagger Link */}
        <a
          href={SWAGGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
        >
          <span>เปิด Swagger</span>
          <ExternalLink className="w-3 h-3 text-slate-300" />
        </a>
      </div>
    </header>
  );
}
