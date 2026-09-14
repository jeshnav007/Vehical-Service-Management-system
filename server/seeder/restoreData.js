import dotenv from 'dotenv';
import { auth, db } from '../config/firebase.js';

dotenv.config();

const restoreData = async () => {
  try {
    console.log('--- Starting Cloud Firestore & Firebase Auth Restoration ---');

    // Helper to get or create Firebase user
    const getOrCreateUser = async ({ email, password, displayName, role, phone, address }) => {
      let uid;
      try {
        const existing = await auth.getUserByEmail(email);
        uid = existing.uid;
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          const created = await auth.createUser({
            email,
            password,
            displayName,
          });
          uid = created.uid;
          console.log(`Created Firebase Auth user: ${email}`);
        } else {
          throw err;
        }
      }

      await db.collection('users').doc(uid).set(
        {
          name: displayName,
          email: email.toLowerCase(),
          phone: phone || '',
          address: address || '',
          role,
          isActive: true,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return { uid, email, name: displayName, role };
    };

    // 1. Restore Core Users
    console.log('1. Setting up users across all 4 roles...');
    const customer = await getOrCreateUser({
      email: 'customer@vsm.com',
      password: 'CustomerPassword123!',
      displayName: 'Default Customer',
      role: 'Customer',
      phone: '123-456-7890',
      address: '123 Main St, Tech City',
    });

    const technician = await getOrCreateUser({
      email: 'tech@vsm.com',
      password: 'TechPassword123!',
      displayName: 'Default Technician',
      role: 'Technician',
      phone: '987-654-3210',
    });

    const serviceCenter = await getOrCreateUser({
      email: 'servicecenter@vsm.com',
      password: 'ServiceCenterPassword123!',
      displayName: 'Default Service Center',
      role: 'ServiceCenter',
      phone: '555-010-9999',
    });

    const admin = await getOrCreateUser({
      email: 'admin@vsm.com',
      password: 'AdminPassword123!',
      displayName: 'System Admin',
      role: 'Admin',
      phone: '000-000-0000',
    });

    // 2. Set up Technician profile
    await db.collection('technicians').doc(technician.uid).set(
      {
        user: technician.uid,
        employeeId: 'TECH-RESTORE-1',
        specialization: ['Diagnostics', 'Engine', 'Transmission'],
        availabilityStatus: 'Available',
        rating: 5,
        numReviews: 10,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. Create Sample Vehicle if not exists
    console.log('2. Checking vehicles...');
    let vehicleId;
    const vSnap = await db.collection('vehicles').where('licensePlate', '==', 'VSM-RESTORE-1').limit(1).get();
    if (vSnap.empty) {
      const vRef = await db.collection('vehicles').add({
        user: customer.uid,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'VSM-RESTORE-1',
        vin: 'RESTOREVIN123456',
        mileage: 15000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      vehicleId = vRef.id;
      console.log(`Created Vehicle: Toyota Camry (ID: ${vehicleId})`);
    } else {
      vehicleId = vSnap.docs[0].id;
      console.log(`Vehicle already exists (ID: ${vehicleId})`);
    }

    // 4. Create Sample Appointment if not exists
    console.log('3. Checking appointments...');
    let appointmentId;
    const aSnap = await db.collection('appointments').where('vehicle', '==', vehicleId).limit(1).get();
    if (aSnap.empty) {
      const aRef = await db.collection('appointments').add({
        user: customer.uid,
        vehicle: vehicleId,
        date: new Date().toISOString(),
        time: '10:00 AM',
        serviceType: 'Maintenance',
        status: 'Approved',
        notes: 'Restoration seed appointment.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      appointmentId = aRef.id;
      console.log(`Created Appointment (ID: ${appointmentId})`);
    } else {
      appointmentId = aSnap.docs[0].id;
      console.log(`Appointment already exists (ID: ${appointmentId})`);
    }

    // 5. Create Sample ServiceRecord if not exists
    console.log('4. Checking service records...');
    let serviceRecordId;
    const sSnap = await db.collection('serviceRecords').where('appointment', '==', appointmentId).limit(1).get();
    if (sSnap.empty) {
      const sRef = await db.collection('serviceRecords').add({
        vehicle: vehicleId,
        appointment: appointmentId,
        technician: technician.uid,
        serviceType: 'Maintenance',
        description: 'Initial restoration service record.',
        status: 'Completed',
        invoiceGenerated: true,
        isPaid: false,
        partsUsed: [
          { name: 'Oil Filter', quantity: 1, price: 15 },
          { name: 'Synthetic Oil', quantity: 5, price: 10 },
        ],
        laborHours: 1.5,
        totalCost: 215,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      serviceRecordId = sRef.id;
      console.log(`Created ServiceRecord (ID: ${serviceRecordId})`);
    } else {
      serviceRecordId = sSnap.docs[0].id;
      console.log(`ServiceRecord already exists (ID: ${serviceRecordId})`);
    }

    // 6. Create Sample Invoice if not exists
    console.log('5. Checking invoices...');
    const iSnap = await db.collection('invoices').where('serviceRecord', '==', serviceRecordId).limit(1).get();
    if (iSnap.empty) {
      const partsTotal = 65; // (1*15) + (5*10)
      const laborCost = 1.5 * 100; // 150
      const amount = partsTotal + laborCost; // 215
      const tax = amount * 0.10; // 21.5
      const totalAmount = amount + tax; // 236.5

      const iRef = await db.collection('invoices').add({
        user: customer.uid,
        vehicle: vehicleId,
        serviceRecord: serviceRecordId,
        amount,
        tax,
        totalAmount,
        paymentStatus: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`Created Invoice (ID: ${iRef.id})`);
    } else {
      console.log('Invoice already exists.');
    }

    // 7. Create Notification
    await db.collection('notifications').add({
      user: customer.uid,
      title: 'Database Restored',
      message: 'Your vehicle service data has been successfully initialized in Cloud Firestore.',
      type: 'Alert',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Created Restoration Notification');

    console.log('--- Restoration Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error(`Restoration Failed: ${error.message}`);
    process.exit(1);
  }
};

restoreData();
