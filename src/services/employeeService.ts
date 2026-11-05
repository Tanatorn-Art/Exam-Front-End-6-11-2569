import { apiClient } from "@/lib/api";
import {
  Employee,
  CreateEmployeeInput,
  CreateEmployeeResponse,
  ImportExcelResponse,
} from "@/types/employee";

/**
 * Service สำหรับจัดการข้อมูลพนักงาน (Employee)
 * เชื่อมต่อไปยัง EmployeeController ใน .NET Web API
 */
export const employeeService = {
  /**
   * [GET] ดึงข้อมูลพนักงานตามแผนก
   * @param department (Optional) ชื่อแผนกที่ต้องการกรอง เช่น "IT", "HR", "Production"
   * @returns Array ของ Employee
   */
  async getByDepartment(department?: string): Promise<Employee[]> {
    return apiClient.get<Employee[]>("/api/Employee/by-department", {
      department: department || undefined,
    });
  },

  /**
   * [GET] ดึงข้อมูลพนักงานที่ได้รับเงินเดือนสูงสุด (จาก View: vw_HighSalaryEmployee)
   * @returns Array ของ Employee ที่มีเงินเดือนสูงสุด
   */
  async getHighestSalary(): Promise<Employee[]> {
    return apiClient.get<Employee[]>("/api/Employee/highest-salary");
  },

  /**
   * [GET] ส่งออกข้อมูลพนักงานเป็นไฟล์ Excel (.xlsx) และสั่งเบราว์เซอร์ให้เริ่มดาวน์โหลดทันที
   */
  async exportExcel(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    await apiClient.downloadBlob("/api/Employee/export-excel", `Employees_${timestamp}.xlsx`);
  },

  /**
   * [POST] เพิ่มพนักงานใหม่ทีละรายการ
   * ส่งข้อมูลในรูปแบบ JSON Body ไปยัง POST /api/Employee
   * @param input ข้อมูลพนักงานใหม่ { empCode, fullName, department, salary }
   * @returns Response พร้อมข้อมูลพนักงานที่เพิ่งสร้างและ ID
   */
  async create(input: CreateEmployeeInput): Promise<CreateEmployeeResponse> {
    // ตรวจสอบความถูกต้องเบื้องต้นก่อนส่ง Request
    if (!input.empCode?.trim()) throw new Error("กรุณากรอกรหัสพนักงาน");
    if (!input.fullName?.trim()) throw new Error("กรุณากรอกชื่อ-นามสกุล");
    if (!input.department?.trim()) throw new Error("กรุณากรอกแผนก");
    if (isNaN(input.salary) || input.salary < 0) throw new Error("เงินเดือนต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0");

    return apiClient.post<CreateEmployeeResponse>("/api/Employee", {
      empCode: input.empCode.trim(),
      fullName: input.fullName.trim(),
      department: input.department.trim(),
      salary: Number(input.salary),
    });
  },

  /**
   * [POST] อัปโหลดไฟล์ Excel (.xlsx) เพื่อนำเข้าพนักงานหลายคนพร้อมกัน
   * ส่งข้อมูลในรูปแบบ multipart/form-data ไปยัง POST /api/Employee/import-excel
   * @param file ไฟล์ Excel (.xlsx หรือ .xls)
   * @returns รายงานสรุปผลการนำเข้า { totalRows, successCount, errorCount, errors, data }
   */
  async importExcel(file: File): Promise<ImportExcelResponse> {
    if (!file) throw new Error("กรุณาเลือกไฟล์ Excel สำหรับอัปโหลด");

    // ตรวจสอบนามสกุลไฟล์
    const validExtensions = [".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));
    if (!isValid) {
      throw new Error("ระบบรองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
    }

    // สร้าง FormData และแนบไฟล์ด้วย key: "file" ให้ตรงกับ IFormFile file ใน .NET
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.uploadFormData<ImportExcelResponse>(
      "/api/Employee/import-excel",
      formData
    );
  },
};
