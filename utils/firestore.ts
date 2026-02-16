import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../src/firebase';
import { Employee, AdminSettings } from '../types';

// Debug Firebase initialization
console.log('Firebase db initialized:', db);

// Collections
const EMPLOYEES_COLLECTION = 'employees';
const SETTINGS_COLLECTION = 'settings';

// Employee operations
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        validTill: data.validTill || new Date().toISOString().split('T')[0], // Keep as string
      } as Employee;
    });
  } catch (error) {
    console.error("Failed to load employees", error);
    return [];
  }
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('Adding employee to Firestore:', employee);
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
      ...employee,
      validTill: employee.validTill, // Keep as string
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    });
    console.log('Employee added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Failed to add employee", error);
    console.error('Error details:', error.code, error.message);
    throw error;
  }
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<void> => {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, id);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Keep validTill as string, don't convert to Timestamp
    if (updates.validTill) {
      updateData.validTill = updates.validTill;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Failed to update employee", error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
  } catch (error) {
    console.error("Failed to delete employee", error);
    throw error;
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        validTill: data.validTill || new Date().toISOString().split('T')[0], // Keep as string
      } as Employee;
    }
    return null;
  } catch (error) {
    console.error("Failed to get employee", error);
    return null;
  }
};

// Settings operations
export const getAdminSettings = async (): Promise<AdminSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'admin');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as AdminSettings;
    }
    
    // Default settings if not found
    const defaultSettings: AdminSettings = { 
      username: 'admin', 
      passwordHash: 'admin123' 
    };
    
    // Create default settings
    await setDoc(docRef, defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error("Failed to load admin settings", error);
    return { username: 'admin', passwordHash: 'admin123' };
  }
};

export const saveAdminSettings = async (settings: AdminSettings): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'admin');
    await updateDoc(docRef, settings as any);
  } catch (error) {
    console.error("Failed to save admin settings", error);
    throw error;
  }
};

// Test function to verify Firestore connectivity
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Test connection',
      timestamp: serverTimestamp()
    });
    console.log('Test document created with ID:', testDoc.id);
    
    // Clean up test document
    await deleteDoc(doc(db, 'test', testDoc.id));
    console.log('Test document deleted successfully');
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};
export const getAuthStatus = (): boolean => {
  return localStorage.getItem('idverify_is_authenticated') === 'true';
};

export const setAuthStatus = (status: boolean): void => {
  if (status) {
    localStorage.setItem('idverify_is_authenticated', 'true');
  } else {
    localStorage.removeItem('idverify_is_authenticated');
  }
};
