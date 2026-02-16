// Test script to directly add an employee to Firestore
// Run this in browser console on the admin page

import { db } from './src/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function testAddEmployee() {
  try {
    console.log('Testing direct employee addition...');
    
    const employeeData = {
      name: 'Test Employee',
      empNumber: 'TEST001',
      designation: 'Test Role',
      department: 'Test Department',
      validTill: '2025-12-31',
      photo: '',
      customFields: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'employees'), employeeData);
    console.log('✅ Employee added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to add employee:', error);
    console.error('Error details:', error.code, error.message);
    throw error;
  }
}

// Run the test
testAddEmployee();
