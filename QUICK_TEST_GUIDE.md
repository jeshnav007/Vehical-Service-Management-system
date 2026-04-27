# 🚀 QUICK START - TESTING INVOICE FLOW

## Prerequisites
- Server running on `http://localhost:5000`
- Client running on `http://localhost:3000`
- Database connected (MongoDB)

---

## Test Flow (5 minutes)

### 1️⃣ Create Test Users (if not exists)

**Admin/Service Center Account:**
- Email: `servicecenter@test.com`
- Password: `Test@123`
- Role: `Service Center Staff`

**Technician Account:**
- Email: `tech@test.com`
- Password: `Test@123`
- Role: `Technician`

**Customer Account:**
- Email: `customer@test.com`
- Password: `Test@123`
- Role: `Customer`

---

### 2️⃣ Create Test Appointment

**As Customer:**
1. Login with `customer@test.com`
2. Go to "My Garage" → "+Register Vehicle"
   - Add any vehicle (e.g., 2022 Honda Civic, ABC123)
3. Go to "+Book Service"
   - Select vehicle
   - Service Type: "Repair"
   - Date: Today/Tomorrow
   - Click "Book Service"
4. **Status should be "Pending Approval"**

---

### 3️⃣ Approve Appointment

**As Service Center Staff:**
1. Login with `servicecenter@test.com`
2. Go to "Service Center Desk" → "Master Appointment Queue"
3. Find recent appointment with status "Pending Approval"
4. Click "Approve"
   - **Status changes to "Approved"**

---

### 4️⃣ Assign Technician

**Still as Service Center:**
1. Now same appointment shows "Approved" status
2. Select technician from dropdown
3. Click "Dispatch"
   - **Status changes to "Technician Assigned"**
   - Service record is created

---

### 5️⃣ Complete Service (CRITICAL STEP)

**As Technician:**
1. Login with `tech@test.com`
2. Go to "Technician Workbench" → "My Assigned Tasks"
3. Find your job with status "Technician Assigned"
4. Click "Start Repair"
   - **Status changes to "Repair In Progress"**
5. Fill in form:
   - Labor Hours: `2.5` (required!)
   - Part Used (optional): `Brake Pads`
   - Part Cost (optional): `45`
6. Click "Log Final Metrics & Complete"
   - **Console shows:** ✅ SERVICE RECORD UPDATED
   - **Status changes to "Completed"**
   - **Alert:** "✅ Service marked as Completed! Service Center can now generate invoice."

---

### 6️⃣ Generate Invoice (THE FIX!)

**As Service Center Staff:**
1. Go to "Service Center Desk" → "Live Repair Monitors"
2. Find the service record with status **"Completed"** (should show in green)
3. **BUTTON SHOULD SHOW:** "Generate Invoice" (green button)
   - ✅ This button NOW appears correctly!
4. Click "Generate Invoice"
   - **Console shows:** ✅ Invoice created successfully
   - **Alert:** "Invoice Generated Successfully! Algorithm correctly computed totals."
   - **Button changes to:** "Invoice Created" (in green, italic)

---

### 7️⃣ View & Pay Invoice

**As Customer:**
1. Login with `customer@test.com`
2. Go to "Payment Hub"
3. **Should see new invoice with:**
   - Amount calculation: 
     - Parts: $45.00
     - Labor: $250.00 (2.5 hrs × $100/hr)
     - Subtotal: $295.00
     - Tax (10%): $29.50
     - **Total: $324.50**
4. Status: "Pending"
5. Click "💳 Pay Now"
   - **Console shows:** Payment processing
   - **Status changes to:** "✔ Settled on [date]"

---

## 🔍 Debugging with Console

### Open Browser DevTools
- **Windows/Linux:** `F12` or `Ctrl+Shift+I`
- **Mac:** `Cmd+Option+I`

### Watch Console During Test

**When technician completes (Step 5):**
```
🔷 UPDATING SERVICE RECORD <id>
   New Status: Completed
   Labor Hours: 2.5
   Parts Used: [...]
✅ SERVICE RECORD UPDATED: {...}
```

**When generating invoice (Step 6):**
```
🔷 GENERATING INVOICE FOR SERVICE RECORD: <recordId>
🔷 SERVICE RECORD STATUS: Completed
✅ Invoice created successfully
```

---

## ✅ Success Indicators

- [ ] Service status goes: Pending → Approved → Assigned → In Progress → Completed
- [ ] "Generate Invoice" button appears ONLY for Completed services
- [ ] Invoice generates without error
- [ ] Invoice shows correct calculations
- [ ] Customer can pay invoice
- [ ] Payment status changes to "Paid"

---

## ❌ If Something Goes Wrong

### Issue: "Generate Invoice" button doesn't appear
**Check:**
1. Service status is exactly "Completed" (check in Service Center Dashboard table)
2. Browser console has no errors (F12 → Console tab)
3. Hard refresh (Ctrl+Shift+R)

### Issue: Invoice creation fails
**Check Console:**
- Backend should show: "Service Record Status: Completed"
- If shows different status, service wasn't completed properly
- Go back to Step 5

### Issue: Wrong invoice amount
**Check:**
1. Technician entered labor hours (required)
2. If parts added, both name AND price were filled
3. Calculation: (parts cost) + (labor hours × $100) + (subtotal × 10% tax)

---

## Terminal Debug Commands

### Check if server is running:
```bash
curl http://localhost:5000/
```

### Check if database is connected:
```bash
# In server terminal, should see:
# "Server running in development mode on port 5000"
# "Connected to MongoDB"
```

### Monitor backend console:
```
👀 Watch for these logs:
- 🔷 UPDATING SERVICE RECORD
- ✅ SERVICE MARKED AS COMPLETED
- 🔷 CREATING INVOICE FOR SERVICE RECORD
- ✅ INVOICE CREATED
```

---

## 📊 Full Test Data Summary

| Role | Action | Expected Result |
|------|--------|-----------------|
| Customer | Book Service | Appointment created as "Pending Approval" |
| Service Center | Approve | Appointment becomes "Approved" |
| Service Center | Assign Technician | Appointment becomes "Technician Assigned" + ServiceRecord created |
| Technician | Start Repair | ServiceRecord becomes "Repair In Progress" |
| Technician | Complete with Metrics | ServiceRecord becomes "Completed" ✅ |
| Service Center | Generate Invoice | Invoice created with correct calculations ✅ |
| Customer | Pay Invoice | Invoice status becomes "Paid" ✅ |

---

## Time to Complete Full Test
- **Setup:** 2 minutes
- **Testing:** 3-5 minutes
- **Total:** ~5-7 minutes

