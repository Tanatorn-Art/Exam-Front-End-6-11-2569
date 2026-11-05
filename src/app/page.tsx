"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BlankCanvas } from "@/components/blank-canvas";
import { apiClient } from "@/lib/api";

const TAB_TITLES: Record<string, string> = {
  employees: "รายการพนักงาน (Employees)",
  "add-employee": "เพิ่มพนักงานใหม่ (POST /api/Employee)",
  "import-excel": "นำเข้าไฟล์ Excel (POST /api/Employee/import-excel)",
  "high-salary": "พนักงานเงินเดือนสูงสุด (Highest Salary)",
  export: "ส่งออกข้อมูล Excel (Export)",
  "api-test": "ทดสอบ API & Swagger Connection",
};

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // ตรวจสอบสถานะการเชื่อมต่อกับ .NET Backend
  const checkBackendHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await apiClient.checkConnection();
      setIsBackendOnline(res.ok);
    } catch {
      setIsBackendOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar ซ้าย (สไตล์ Automotive Gray / White) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id)}
        isBackendOnline={isBackendOnline}
      />

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header แถบด้านบน */}
        <Header
          activeTitle={TAB_TITLES[activeTab] || "Workspace"}
          isBackendOnline={isBackendOnline}
          isChecking={isChecking}
          onRefreshCheck={checkBackendHealth}
        />

        {/* หน้าจอแสดงผลตามแท็บที่เลือก */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <BlankCanvas activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
}
