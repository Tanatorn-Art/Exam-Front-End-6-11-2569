"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  Database,
  Download,
  Play,
  FileText,
  Copy,
  Check,
  Users,
  Award,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { API_BASE_URL, SWAGGER_URL } from "@/lib/api";
import { employeeService } from "@/services/employeeService";
import { Employee } from "@/types/employee";
import { AddEmployeeForm } from "./add-employee-form";
import { ExcelUpload } from "./excel-upload";

interface BlankCanvasProps {
  activeTab: string;
}

export function BlankCanvas({ activeTab }: BlankCanvasProps) {
  // State สำหรับเก็บข้อมูลพนักงานสำหรับแท็บ List / High Salary
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [highSalaryList, setHighSalaryList] = useState<Employee[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // State สำหรับการทดสอบเรียก API ในหน้า Test
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ดึงข้อมูลพนักงานตามแผนก
  const fetchEmployees = async (dept?: string) => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await employeeService.getByDepartment(dept || undefined);
      setEmployees(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setListError(msg);
    } finally {
      setIsLoadingList(false);
    }
  };

  // ดึงข้อมูลพนักงานเงินเดือนสูงสุด
  const fetchHighSalary = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await employeeService.getHighestSalary();
      setHighSalaryList(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setListError(msg);
    } finally {
      setIsLoadingList(false);
    }
  };

  // โหลดข้อมูลอัตโนมัติเมื่อเข้าสู่แท็บ
  useEffect(() => {
    if (activeTab === "employees") {
      fetchEmployees(selectedDept);
    } else if (activeTab === "high-salary") {
      fetchHighSalary();
    }
  }, [activeTab, selectedDept]);

  const copyCodeSnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const samplePostCode = `// 1. เพิ่มพนักงานใหม่ (POST /api/Employee)
await employeeService.create({
  empCode: "TYT-001",
  fullName: "สมชาย สายฟ้า",
  department: "Engineering",
  salary: 45000
});

// 2. นำเข้าไฟล์ Excel (POST /api/Employee/import-excel)
const file = event.target.files[0];
const report = await employeeService.importExcel(file);
console.log("นำเข้าสำเร็จ:", report.successCount);`;

  return (
    <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
      {/* ============================================================== */}
      {/* 1. แท็บ: เพิ่มพนักงาน (POST /api/Employee)                      */}
      {/* ============================================================== */}
      {activeTab === "add-employee" && (
        <div className="space-y-6 animate-in fade-in">
          <AddEmployeeForm
            onSuccess={() => {
              // ดึงรายการพนักงานใหม่เมื่อเพิ่มสำเร็จ
              fetchEmployees(selectedDept);
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. แท็บ: นำเข้าไฟล์ Excel (POST /api/Employee/import-excel)      */}
      {/* ============================================================== */}
      {activeTab === "import-excel" && (
        <div className="space-y-6 animate-in fade-in">
          <ExcelUpload />
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. แท็บ: รายการพนักงาน (GET /api/Employee/by-department)       */}
      {/* ============================================================== */}
      {activeTab === "employees" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <span>รายชื่อพนักงานในระบบ (GET /api/Employee/by-department)</span>
              </h2>
              <p className="text-xs text-slate-500">
                ดึงข้อมูลผ่าน Stored Procedure: <code className="font-mono text-slate-700">sp_GetEmployeesByDept</code>
              </p>
            </div>

            {/* แผนก Filter & รีเฟรช */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="">ทุกแผนก (All)</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Production">Production</option>
                  <option value="IT">IT</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <button
                onClick={() => fetchEmployees(selectedDept)}
                disabled={isLoadingList}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-colors cursor-pointer"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {listError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-mono">
              Error: {listError}
            </div>
          )}

          {/* ตารางแสดงผลข้อมูล */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">รหัสพนักงาน</th>
                  <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                  <th className="py-2.5 px-3">แผนก</th>
                  <th className="py-2.5 px-3 text-right">เงินเดือน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-slate-500" />
                      กำลังโหลดข้อมูลจาก SQL Server...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลพนักงาน (สามารถเพิ่มพนักงานใหม่ที่แท็บ "เพิ่มพนักงาน" หรือนำเข้าจาก Excel ได้)
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr key={emp.empCode || `emp-${emp.id}-${index}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{emp.id || index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{emp.empCode}</td>
                      <td className="py-2.5 px-3">{emp.fullName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono">
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        ฿{Number(emp.salary).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. แท็บ: เงินเดือนสูงสุด (GET /api/Employee/highest-salary)     */}
      {/* ============================================================== */}
      {activeTab === "high-salary" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>พนักงานที่ได้รับเงินเดือนสูงสุด (vw_HighSalaryEmployee)</span>
              </h2>
              <p className="text-xs text-slate-500">
                ดึงข้อมูลจาก SQL Server View: <code className="font-mono text-slate-700">vw_HighSalaryEmployee</code>
              </p>
            </div>

            <button
              onClick={fetchHighSalary}
              disabled={isLoadingList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">รหัสพนักงาน</th>
                  <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                  <th className="py-2.5 px-3">แผนก</th>
                  <th className="py-2.5 px-3 text-right">เงินเดือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : highSalaryList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลพนักงาน
                    </td>
                  </tr>
                ) : (
                  highSalaryList.map((emp, index) => (
                    <tr key={emp.empCode ? `high-${emp.empCode}` : `high-${emp.id}-${index}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{emp.empCode}</td>
                      <td className="py-2.5 px-3">{emp.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{emp.department}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        ฿{Number(emp.salary).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. แท็บ: ส่งออก Excel (GET /api/Employee/export-excel)          */}
      {/* ============================================================== */}
      {activeTab === "export" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-xl mx-auto text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <Download className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              ส่งออกข้อมูลพนักงานเป็นไฟล์ Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              สร้างไฟล์และส่งออกผ่าน ClosedXML จาก Endpoint <code className="font-mono text-slate-700">/api/Employee/export-excel</code>
            </p>
          </div>

          <button
            onClick={() => employeeService.exportExcel()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer mx-auto"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>ดาวน์โหลดไฟล์ Employees.xlsx ตอนนี้</span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. แท็บ: API & Swagger Test                                   */}
      {/* ============================================================== */}
      {activeTab === "api-test" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in">
          {/* Post Snippet Reference */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  POST Methods (.NET & Next.js)
                </h3>
              </div>
              <button
                onClick={() => copyCodeSnippet(samplePostCode)}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <span className="text-amber-800 font-bold">POST</span>
                <span className="text-slate-800">/api/Employee</span>
                <span className="text-slate-600 text-[10px]">JSON Body</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <span className="text-amber-800 font-bold">POST</span>
                <span className="text-slate-800">/api/Employee/import-excel</span>
                <span className="text-slate-600 text-[10px]">multipart/form-data</span>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
              {samplePostCode}
            </pre>
          </div>

          {/* Quick Swagger Link & Direct Trigger */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Swagger UI Integration
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                สามารถเปิดทดสอบ Request ทุกรูปแบบบนหน้า Swagger ของ .NET ได้โดยตรง
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 break-all">
                {SWAGGER_URL}
              </div>
            </div>

            <a
              href={SWAGGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2.5 rounded-lg shadow-xs transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>เปิดดู Swagger UI บนแท็บใหม่</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
