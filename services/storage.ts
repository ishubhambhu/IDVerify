import { Student, StudentStatus } from '../types';

const STORAGE_KEY = 'safecampus_students';

export const getStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load students", e);
    return [];
  }
};

export const getStudentById = (id: string): Student | undefined => {
  const students = getStudents();
  return students.find(s => s.id === id);
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const deleteStudent = (id: string): void => {
  const students = getStudents();
  const newStudents = students.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
};

// Seed some data if empty
const seedData = () => {
  const existing = getStudents();
  if (existing.length === 0) {
    const mockStudents: Student[] = [
      {
        id: '1',
        fullName: 'Alice Johnson',
        studentId: '2024-CS-001',
        department: 'Computer Science',
        email: 'alice.j@university.edu',
        photoUrl: 'https://picsum.photos/200/200?random=1',
        validUntil: '2025-05-30',
        status: StudentStatus.Active,
        emergencyContact: '555-0101'
      },
      {
        id: '2',
        fullName: 'Bob Smith',
        studentId: '2024-BIO-042',
        department: 'Biology',
        email: 'bob.smith@university.edu',
        photoUrl: 'https://picsum.photos/200/200?random=2',
        validUntil: '2024-12-31',
        status: StudentStatus.Suspended,
        emergencyContact: '555-0202'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents));
  }
};

seedData();

export const saveStudentsFromExcel = (rows: string[][]): void => {
  const students: Student[] = rows.map((row, index) => {
    const [fullName, studentId, department, email, validUntil, status, emergencyContact] = row;
    return {
      id: crypto.randomUUID(),
      fullName: fullName || `Student ${index + 1}`,
      studentId: studentId || '',
      department: department || 'Unknown',
      email: email || '',
      photoUrl: 'https://picsum.photos/200/200?random=' + (index + 1),
      validUntil: validUntil || '',
      status: (status as StudentStatus) || StudentStatus.Inactive,
      emergencyContact: emergencyContact || '',
    };
  });

  const existingStudents = getStudents();
  const updatedStudents = [...existingStudents, ...students];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents));
};