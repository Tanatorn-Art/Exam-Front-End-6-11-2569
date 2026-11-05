"use client";

import React from "react";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Award,
  FileCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Car
} from "lucide-react";
import { SWAGGER_URL, API_BASE_URL } from "@/lib/api";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeId: string;
  onSelect: (id: string) => void;
  isBackendOnline?: boolean;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeId,
  onSelect,
  isBackendOnline = false,
}: SidebarProps) {
  const menuGroups: MenuGroup[] = [
    {
      group: "OPERATIONS (POST / GET)",
      items: [
        { id: "employees", label: "รายการพนักงาน (List)", icon: Users, badge: "GET" },
        { id: "add-employee", label: "เพิ่มพนักงาน (Add Employee)", icon: UserPlus, badge: "POST" },
        { id: "import-excel", label: "นำเข้าไฟล์ Excel (Import)", icon: FileSpreadsheet, badge: "POST" },
      ],
    },
    {
      group: "REPORTS & EXPORT",
      items: [
        { id: "high-salary", label: "เงินเดือนสูงสุด (High Salary)", icon: Award, badge: "GET" },
        { id: "export", label: "ส่งออกข้อมูล (Export Excel)", icon: Download, badge: "GET" },
      ],
    },
    {
      group: "DEVELOPER TOOLS",
      items: [
        { id: "api-test", label: "ทดสอบ API & Swagger", icon: FileCode },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 select-none transition-all duration-300 ease-in-out z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-xs shrink-0">
            <Car className="w-4 h-4 text-slate-100" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-slate-900 truncate flex items-center gap-1.5">
                TOYOTA EXAM
              </span>
              <span className="text-[10px] font-mono text-slate-600">
                .NET API System
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isCollapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Groups */}
      <div className="flex-1 py-4 px-2 space-y-4 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold font-mono tracking-wider text-slate-600 uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                            isActive
                              ? "bg-slate-800 text-slate-200 border-slate-700"
                              : item.badge === "POST"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* External Swagger Link */}
        <div className="pt-2 border-t border-slate-100">
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิด Swagger UI"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <Database className="w-4 h-4 shrink-0 text-slate-600" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">Swagger UI</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              </>
            )}
          </a>
        </div>
      </div>

      {/* Backend Status Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBackendOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                .NET Backend
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isBackendOnline
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {isBackendOnline ? "ONLINE" : "STANDBY"}
              </span>
            </div>
            <div className="text-[10px] text-slate-600 font-mono truncate">
              {API_BASE_URL || "/api (Proxy)"}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
              title={isBackendOnline ? "Backend Online" : "Backend Standby"}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
