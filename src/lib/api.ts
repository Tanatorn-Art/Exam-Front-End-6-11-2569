/**
 * Base URL สำหรับเรียกใช้งาน .NET Web API
 * ดึงค่ามาจาก .env.local (NEXT_PUBLIC_API_URL) หรือใช้ค่า default เป็น http://localhost:5000
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

/**
 * URL สำหรับเปิดดูเอกสาร Swagger UI
 */
export const SWAGGER_URL =
  process.env.NEXT_PUBLIC_SWAGGER_URL || `${API_BASE_URL}/swagger`;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Custom Error Class สำหรับจัดการข้อผิดพลาดจากการเรียก API
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * ฟังก์ชันแกนหลักสำหรับส่ง HTTP Request (Fetch Wrapper)
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // จัดการ Query Parameters (ถ้ามี)
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // ส่ง Request ไปยัง Backend
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    ...rest,
  });

  // หาก Response ไม่สำเร็จ (Status >= 400)
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    const errorMessage =
      typeof errorData === "object" && errorData && "message" in errorData
        ? String((errorData as { message: unknown }).message)
        : `API request failed: ${response.status} ${response.statusText}`;

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // กรณี 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

/**
 * API Client Object รวม Methods พื้นฐานที่ใช้งานบ่อย
 */
export const apiClient = {
  // Method GET
  get: <T = unknown>(endpoint: string, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "GET", params }),

  // Method POST (ส่งข้อมูลแบบ JSON Body)
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  // Method PUT
  put: <T = unknown>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  // Method DELETE
  delete: <T = unknown>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),

  /**
   * Method POST สำหรับอัปโหลดไฟล์ผ่าน FormData (multipart/form-data)
   * สำคัญ: ห้ามใส่ Content-Type เป็น multipart/form-data ใน header ด้วยตัวเอง
   * เพราะเบราว์เซอร์ต้องสร้าง boundary header อัตโนมัติ
   */
  async uploadFormData<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const errorMessage =
        typeof errorData === "object" && errorData && "message" in errorData
          ? String((errorData as { message: unknown }).message)
          : `Upload failed: ${response.status} ${response.statusText}`;

      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response.json() as Promise<T>;
  },

  /**
   * ดาวน์โหลดไฟล์จาก Backend (เช่น Export Excel จาก .NET เป็นไฟล์ .xlsx)
   */
  async downloadBlob(endpoint: string, defaultFileName = "export.xlsx"): Promise<void> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new ApiError(`Download failed: ${response.status} ${response.statusText}`, response.status);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },

  /**
   * ฟังก์ชันทดสอบการเชื่อมต่อ API / Swagger (.NET Backend)
   */
  async checkConnection(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE_URL}/swagger/index.html`, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);
      return { ok: true, latencyMs, message: "Connected to Swagger / .NET" };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const message = err instanceof Error ? err.message : "Connection failed";
      return { ok: false, latencyMs, message };
    }
  },
};
