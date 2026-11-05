"use client";

import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Loader2,
  Download,
  X
} from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { ImportExcelResponse } from "@/types/employee";

/**
 * คอมโพเนนต์สำหรับทดสอบอัปโหลดไฟล์ Excel (POST /api/Employee/import-excel)
 * รองรับการเลือกไฟล์, แสดงรายละเอียดไฟล์, แสดงผลลัพธ์จำนวนแถวที่นำเข้าสำเร็จ
 */
export function ExcelUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportExcelResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // เมื่อผู้ใช้เลือกไฟล์ผ่าน File Dialog
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResult(null);
      setErrorMessage(null);
    }
  };

  // ยกเลิกไฟล์ที่เลือก
  const handleClearFile = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ฟังก์ชันดาวน์โหลดไฟล์แม่แบบ Excel (Sample Template)
  // สร้างไฟล์ CSV/Excel จำลองที่มีหัวคอลัมน์และข้อมูลตัวอย่างให้ทดสอบทันที
  const handleDownloadTemplate = () => {
    const csvContent =
      "\uFEFF" + // UTF-8 BOM เพื่อให้ภาษาไทยใน Excel แสดงผลถูกต้อง
      "รหัสพนักงาน,ชื่อ-นามสกุล,แผนก,เงินเดือน\n" +
      "TYT-101,สมชาย ใจดี,Engineering,45000\n" +
      "TYT-102,สมหญิง รักงาน,Production,32000\n" +
      "TYT-103,วิชัย สดใส,Quality Assurance,38000\n" +
      "TYT-104,กานดา มานะ,IT,52000\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Employee_Import_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ส่งไฟล์ขึ้น Backend ผ่าน POST /api/Employee/import-excel
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      // 1. เรียกใช้งาน Service นำเข้าไฟล์ Excel
      const res = await employeeService.importExcel(selectedFile);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
      {/* หัวข้อส่วนอัปโหลด */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              นำเข้าพนักงานจากไฟล์ Excel (POST /api/Employee/import-excel)
            </h2>
            <p className="text-xs text-slate-500">
              อ่านไฟล์ผ่าน ClosedXML ใน .NET และบันทึกลงฐานข้อมูล SQL Server
            </p>
          </div>
        </div>

        {/* ปุ่มดาวน์โหลดแม่แบบ */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium transition-colors cursor-pointer"
          title="ดาวน์โหลดไฟล์ตัวอย่างสำหรับทดสอบนำเข้า"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>แม่แบบไฟล์ (.csv/.xlsx)</span>
        </button>
      </div>

      {/* พื้นที่เลือกไฟล์ / Drag and Drop Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mx-auto text-emerald-600">
          <Upload className="w-6 h-6 stroke-[1.75]" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-800">
            คลิกเพื่อเลือกไฟล์ Excel หรือลากไฟล์มาวางที่นี่
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            รองรับไฟล์นามสกุล .xlsx หรือ .xls (คอลัมน์: รหัสพนักงาน, ชื่อ, แผนก, เงินเดือน)
          </p>
        </div>
      </div>

      {/* แสดงไฟล์ที่เลือกอยู่ */}
      {selectedFile && (
        <div className="p-3.5 rounded-lg bg-slate-100/70 border border-slate-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearFile}
              className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              title="ลบไฟล์"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังอัปโหลด...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>เริ่มนำเข้าไฟล์ (POST)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* แจ้งเตือนข้อผิดพลาด (Error Alert) */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">การนำเข้าไฟล์ล้มเหลว</div>
            <div className="mt-0.5 text-rose-700 font-mono text-[11px] whitespace-pre-wrap">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* ผลลัพธ์การนำเข้า (Import Summary Result) */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{result.message}</span>
            </div>
          </div>

          {/* สถิติการนำเข้า */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] text-slate-500 font-mono">ทั้งหมด</div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {result.totalRows}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] text-emerald-700 font-mono">สำเร็จ</div>
              <div className="text-base font-bold text-emerald-700 font-mono">
                {result.successCount}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
              <div className="text-[10px] text-rose-700 font-mono">ผิดพลาด</div>
              <div className="text-base font-bold text-rose-700 font-mono">
                {result.errorCount}
              </div>
            </div>
          </div>

          {/* แสดงรายการ Error หากมีแถวที่อ่านไม่ผ่าน */}
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-rose-700 font-mono">
                รายการข้อผิดพลาดในบางแถว:
              </div>
              <div className="max-h-28 overflow-y-auto bg-white border border-rose-100 rounded-lg p-2 space-y-1 text-[10px] font-mono text-rose-600">
                {result.errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            </div>
          )}

          {/* แสดงข้อมูลพนักงานที่นำเข้าสำเร็จ */}
          {result.data && result.data.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-semibold text-slate-700 font-mono">
                ข้อมูลที่นำเข้าสำเร็จล่าสุด ({result.data.length} รายการ):
              </div>
              <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {result.data.map((emp, index) => (
                  <div
                    key={emp.empCode ? `upload-${emp.empCode}` : `upload-${emp.id}-${index}`}
                    className="p-2 flex items-center justify-between font-mono text-[11px]"
                  >
                    <span className="font-semibold text-slate-800">{emp.empCode}</span>
                    <span className="text-slate-600 font-sans">{emp.fullName}</span>
                    <span className="text-slate-500">{emp.department}</span>
                    <span className="text-emerald-700 font-semibold">
                      ฿{Number(emp.salary).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
