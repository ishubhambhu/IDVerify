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
  where,
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
    const employees = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        validTill: data.validTill || new Date().toISOString().split('T')[0],
      } as Employee;
    });
    // Cache to localStorage
    try {
      localStorage.setItem('idverify_employees', JSON.stringify(employees));
    } catch (e) {}
    return employees;
  } catch (error) {
    console.error("Failed to load employees from Firestore, trying local cache", error);
    try {
      const local = localStorage.getItem('idverify_employees');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
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
    
    // Also save in local storage cache
    try {
      const local = localStorage.getItem('idverify_employees');
      const list: Employee[] = local ? JSON.parse(local) : [];
      list.unshift({
        ...employee,
        id: docRef.id,
        createdAt: new Date().getTime(),
      } as any);
      localStorage.setItem('idverify_employees', JSON.stringify(list));
    } catch (e) {}

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
    
    if (updates.validTill) {
      updateData.validTill = updates.validTill;
    }
    
    await updateDoc(docRef, updateData);

    try {
      const local = localStorage.getItem('idverify_employees');
      if (local) {
        const list: Employee[] = JSON.parse(local);
        const idx = list.findIndex(e => e.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem('idverify_employees', JSON.stringify(list));
        }
      }
    } catch (e) {}
  } catch (error) {
    console.error("Failed to update employee", error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
    try {
      const local = localStorage.getItem('idverify_employees');
      if (local) {
        const list: Employee[] = JSON.parse(local);
        localStorage.setItem('idverify_employees', JSON.stringify(list.filter(e => e.id !== id)));
      }
    } catch (e) {}
  } catch (error) {
    console.error("Failed to delete employee", error);
    throw error;
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    if (!id) return null;
    const cleanId = id.replace(/\.netlify\.app.*$/i, '').replace(/^[#/]+/, '').trim();
    
    // 1. Try direct Firestore document ID lookup with cleanId
    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, cleanId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          validTill: data.validTill || new Date().toISOString().split('T')[0],
        } as Employee;
      }
    } catch (e) {
      // Continue
    }

    // 2. Try direct Firestore document ID lookup with original id
    try {
      if (id !== cleanId) {
        const docRef = doc(db, EMPLOYEES_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            validTill: data.validTill || new Date().toISOString().split('T')[0],
          } as Employee;
        }
      }
    } catch (e) {
      // Continue
    }

    // 3. Try employee number lookup in Firestore
    try {
      const q = query(collection(db, EMPLOYEES_COLLECTION), where('empNumber', '==', cleanId));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          validTill: data.validTill || new Date().toISOString().split('T')[0],
        } as Employee;
      }
    } catch (e) {
      // Continue
    }

    // 4. Try local storage cache fallback
    try {
      const local = localStorage.getItem('idverify_employees');
      if (local) {
        const list: Employee[] = JSON.parse(local);
        const found = list.find(e => 
          e.id === cleanId || 
          e.id === id || 
          e.empNumber === cleanId || 
          e.empNumber === id ||
          e.id?.includes(cleanId) ||
          cleanId.includes(e.id)
        );
        if (found) return found;
      }
    } catch (e) {
      // Continue
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
