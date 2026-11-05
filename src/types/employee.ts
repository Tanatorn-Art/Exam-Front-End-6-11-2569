/**
 * โมเดลข้อมูลพนักงาน (ตรงกับคลาส Employee ใน .NET Backend)
 */
export interface Employee {
  id: number;
  empCode: string;
  fullName: string;
  department: string;
  salary: number;
  createdAt?: string | null;
}

/**
 * ข้อมูลสำหรับส่งไปสร้างพนักงานใหม่ (POST /api/Employee)
 */
export interface CreateEmployeeInput {
  empCode: string;
  fullName: string;
  department: string;
  salary: number;
}

/**
 * รูปแบบ Response ที่ได้รับจากการสร้างพนักงานสำเร็จ
 */
export interface CreateEmployeeResponse {
  message: string;
  data: Employee;
}

/**
 * รูปแบบ Response ที่ได้รับจากการอัปโหลดและนำเข้าไฟล์ Excel (POST /api/Employee/import-excel)
 */
export interface ImportExcelResponse {
  message: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  data: Employee[];
}

/**
 * สถานะการเชื่อมต่อกับ Backend
 */
export interface ApiStatus {
  isOnline: boolean;
  checkedAt: string;
  latencyMs?: number;
  error?: string;
}
