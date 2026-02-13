import { Employee, AdminSettings } from '../types';

const EMPLOYEES_KEY = 'idverify_employees';
const ADMIN_KEY = 'idverify_admin';
const AUTH_KEY = 'idverify_is_authenticated';

export const getEmployees = (): Employee[] => {
  try {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load employees", error);
    return [];
  }
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = (employee: Employee) => {
  const employees = getEmployees();
  employees.unshift(employee);
  saveEmployees(employees);
};

export const updateEmployee = (updatedEmployee: Employee) => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === updatedEmployee.id);
  if (index !== -1) {
    employees[index] = updatedEmployee;
    saveEmployees(employees);
  }
};

export const deleteEmployee = (id: string) => {
  const employees = getEmployees();
  const filtered = employees.filter(e => e.id !== id);
  saveEmployees(filtered);
};

export const getAdminSettings = (): AdminSettings => {
  const data = localStorage.getItem(ADMIN_KEY);
  if (data) return JSON.parse(data);
  // Default credentials
  return { username: 'admin', passwordHash: 'admin123' };
};

export const saveAdminSettings = (settings: AdminSettings) => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(settings));
};

export const getAuthStatus = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const setAuthStatus = (status: boolean) => {
  if (status) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};
