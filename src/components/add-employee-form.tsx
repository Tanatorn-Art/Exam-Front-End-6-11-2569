"use client";

import React, { useState } from "react";
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { CreateEmployeeInput, Employee } from "@/types/employee";

interface AddEmployeeFormProps {
  onSuccess?: (newEmployee: Employee) => void;
}

const DEPARTMENTS = ["Engineering", "Production", "IT", "Quality Assurance", "HR"];

/**
 * คอมโพเนนต์ฟอร์มสำหรับเพิ่มข้อมูลพนักงานใหม่ (POST /api/Employee)
 * ออกแบบในธีม Automotive Gray / White สไตล์กระชับและคล่องตัว
 */
export function AddEmployeeForm({ onSuccess }: AddEmployeeFormProps) {
  // State จัดการข้อมูลในฟอร์ม
  const [formData, setFormData] = useState<CreateEmployeeInput>({
    empCode: "",
    fullName: "",
    department: "Engineering",
    salary: 35000,
  });

  // State จัดการสถานะการทำงาน
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdEmp, setCreatedEmp] = useState<Employee | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ฟังก์ชันอัปเดตค่าใน State เมื่อผู้ใช้พิมพ์ในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // ฟังก์ชันสุ่มใส่ข้อมูลตัวอย่าง เพื่อความสะดวกรวดเร็วเวลาทดสอบตอนสัมภาษณ์
  const handleFillDemoData = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const demoDepts = ["Engineering", "Production", "IT", "Quality Assurance"];
    const demoDept = demoDepts[Math.floor(Math.random() * demoDepts.length)];
    const randomSalary = Math.floor(30000 + Math.random() * 50000);

    setFormData({
      empCode: `TYT-${randomNum}`,
      fullName: `ทดสอบ พนักงาน #${randomNum}`,
      department: demoDept,
      salary: randomSalary,
    });
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // ฟังก์ชัน Reset ฟอร์ม
  const handleReset = () => {
    setFormData({
      empCode: "",
      fullName: "",
      department: "Engineering",
      salary: 0,
    });
    setSuccessMessage(null);
    setErrorMessage(null);
    setCreatedEmp(null);
  };

  // ฟังก์ชัน Submit ส่งข้อมูลไปที่ POST /api/Employee
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setCreatedEmp(null);

    try {
      // 1. เรียกใช้งาน Service ส่ง Request แบบ POST (JSON)
      const res = await employeeService.create(formData);

      // 2. เมื่อสำเร็จ แสดงข้อความแจ้งเตือนและเก็บผลลัพธ์
      setSuccessMessage(res.message || "บันทึกข้อมูลพนักงานสำเร็จ");
      setCreatedEmp(res.data);

      if (onSuccess) {
        onSuccess(res.data);
      }

      // 3. ล้างรหัสพนักงานเดิมเพื่อพร้อมคีย์คนต่อไป
      setFormData((prev) => ({
        ...prev,
        empCode: "",
        fullName: "",
      }));
    } catch (err: unknown) {
      // 4. กรณีเกิดข้อผิดพลาด แสดงรายละเอียดจาก Backend
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
      {/* ส่วนหัวของฟอร์ม */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              แบบฟอร์มเพิ่มพนักงาน (POST /api/Employee)
            </h2>
            <p className="text-xs text-slate-500">
              ส่งข้อมูลพนักงานใหม่เข้าระบบผ่าน JSON Body ไปยัง .NET Web API
            </p>
          </div>
        </div>

        {/* ปุ่มลัดใส่ข้อมูลตัวอย่างสำหรับการทดสอบตอนสัมภาษณ์ */}
        <button
          type="button"
          onClick={handleFillDemoData}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-mono font-medium transition-colors cursor-pointer"
          title="สุ่มกรอกข้อมูลตัวอย่างทันทีเพื่อทดสอบ"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Data</span>
        </button>
      </div>

      {/* แจ้งเตือนสถานะสำเร็จ (Success Alert) */}
      {successMessage && createdEmp && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <div className="pl-6 font-mono text-[11px] text-emerald-800 flex flex-wrap gap-x-4 gap-y-1">
            <span>ID: <strong>#{createdEmp.id}</strong></span>
            <span>รหัส: <strong>{createdEmp.empCode}</strong></span>
            <span>ชื่อ: <strong>{createdEmp.fullName}</strong></span>
            <span>แผนก: <strong>{createdEmp.department}</strong></span>
            <span>เงินเดือน: <strong>฿{Number(createdEmp.salary).toLocaleString()}</strong></span>
          </div>
        </div>
      )}

      {/* แจ้งเตือนข้อผิดพลาด (Error Alert) */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">ไม่สามารถเพิ่มข้อมูลได้</div>
            <div className="mt-0.5 text-rose-700 font-mono text-[11px] whitespace-pre-wrap">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* แบบฟอร์มกรอกข้อมูล */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. รหัสพนักงาน */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>รหัสพนักงาน (EmpCode) *</span>
              <span className="text-[10px] text-slate-600 font-mono">เช่น TYT-001</span>
            </label>
            <input
              type="text"
              name="empCode"
              value={formData.empCode}
              onChange={handleChange}
              placeholder="กรอกรหัสพนักงาน..."
              required
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>

          {/* 2. ชื่อ-นามสกุล */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              ชื่อ-นามสกุล (FullName) *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="กรอกชื่อและนามสกุล..."
              required
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>

          {/* 3. แผนก */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              แผนก (Department) *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 4. เงินเดือน */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>เงินเดือน (Salary / THB) *</span>
              <span className="text-[10px] text-slate-600 font-mono">ตัวเลข ≥ 0</span>
            </label>
            <input
              type="number"
              name="salary"
              min="0"
              step="1000"
              value={formData.salary || ""}
              onChange={handleChange}
              placeholder="เช่น 35000"
              required
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
        </div>

        {/* ปุ่ม Action */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>ล้างค่า</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>บันทึกพนักงาน (POST)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
