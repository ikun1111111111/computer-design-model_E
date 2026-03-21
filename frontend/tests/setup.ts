// 测试设置文件
import { vi } from 'vitest';

// Mock console.error 以避免测试中的警告
vi.spyOn(console, 'error').mockImplementation(() => {});
