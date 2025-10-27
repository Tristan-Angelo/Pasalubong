# 🚚 Delivery Person Availability System

## Overview
The system has two different views for delivery persons:
1. **Riders Management Section** (Admin Dashboard)
2. **Assign Delivery Modal** (Admin & Seller Dashboards)

## Why Different Numbers?

### Riders Section (Shows ALL riders)
**Location**: Admin Dashboard → Riders
**API Endpoint**: `/api/v1/admin/riders`
**Shows**: All registered delivery persons regardless of status
**Purpose**: Management and administration of all riders

**Example**: Shows 4 riders including:
- Active & Available riders ✅
- Active but Unavailable riders ⏸️
- Inactive riders ❌

### Assign Delivery Modal (Shows ONLY available riders)
**Location**: Admin/Seller Dashboard → Assign Delivery Person
**API Endpoints**: 
- Admin: `/api/v1/admin/delivery-persons`
- Seller: `/api/v1/seller/delivery-persons`

**Shows**: Only riders where **BOTH** conditions are true:
- `isActive: true` ✅
- `isAvailable: true` ✅

**Purpose**: Only show riders who can actually be assigned to deliveries

**Example**: Shows 2 riders (the ones who are both active AND available)

## Delivery Person Status Flags

### `isActive` (Account Status)
- **true**: Rider account is active and can work
- **false**: Rider account is deactivated (by admin or system)
- **Controlled by**: Admin via Activate/Deactivate button

### `isAvailable` (Availability Status)
- **true**: Rider is available to take new deliveries
- **false**: Rider is busy or has marked themselves as unavailable
- **Controlled by**: Rider themselves or system (auto-set when assigned)

## How to Make Riders Available for Assignment

### For Admins:
1. Go to **Admin Dashboard → Riders**
2. Check the status badges on each rider card:
   - 🟢 **Active** / 🔴 **Inactive** (Account status)
   - 🔵 **Available** / ⚪ **Unavailable** (Availability status)
3. To activate a rider:
   - Click the **"Activate"** button if they're inactive
4. To make a rider available:
   - The rider must set themselves as available from their dashboard
   - OR wait for them to complete current deliveries

### For Riders:
1. Go to **Delivery Dashboard**
2. Toggle your availability status
3. When available, you'll appear in assignment modals

## Common Scenarios

### Scenario 1: "I have 4 riders but only 2 show in assignment"
**Reason**: 2 riders are either:
- Inactive (deactivated account)
- Unavailable (busy or marked unavailable)

**Solution**: 
- Check Riders section to see their status
- Activate inactive riders
- Wait for unavailable riders to become available

### Scenario 2: "No delivery persons available"
**Reason**: All riders are either inactive or unavailable

**Solution**:
- Activate at least one rider in Riders section
- Ensure at least one rider marks themselves as available

### Scenario 3: "Rider disappeared from assignment modal"
**Reason**: Rider was just assigned to another order or marked themselves unavailable

**Solution**:
- Refresh the delivery persons list
- Wait for rider to complete current delivery
- Assign a different available rider

## API Filtering Logic

### Get All Riders (Management)
```javascript
// No filtering - shows all
const riders = await Delivery.find()
```

### Get Available Riders (Assignment)
```javascript
// Strict filtering
const riders = await Delivery.find({
  isActive: true,      // Must be active
  isAvailable: true    // Must be available
})
```

## Best Practices

1. **Keep riders active**: Only deactivate riders who should not work
2. **Monitor availability**: Check rider availability regularly
3. **Communicate**: Let riders know to mark themselves available
4. **Plan ahead**: Ensure enough riders are available during peak hours
5. **Status indicators**: Use the color-coded badges to quickly identify status

## Status Badge Colors

### Active Status
- 🟢 Green = Active
- 🔴 Red = Inactive

### Availability Status (Riders only)
- 🔵 Blue = Available
- ⚪ Gray = Unavailable

## Troubleshooting

### Problem: Can't assign any delivery person
**Check**:
1. Are any riders marked as Active? (Green badge)
2. Are any riders marked as Available? (Blue badge)
3. Have you refreshed the delivery persons list?

**Fix**:
- Activate riders in Riders section
- Ask riders to mark themselves available
- Click refresh button in assignment modal

### Problem: Rider count doesn't match
**This is normal!** 
- Riders section = All riders (for management)
- Assignment modal = Only available riders (for assignment)

### Problem: Rider was available but now isn't
**Possible reasons**:
- Just got assigned to another order
- Marked themselves unavailable
- Account was deactivated

**Fix**:
- Check rider's current status in Riders section
- Refresh the list
- Choose another available rider

## Related Files
- `server/routes/api/admin.js` - Admin rider endpoints
- `server/routes/api/seller.js` - Seller delivery person endpoints
- `server/models/Delivery.js` - Delivery person model
- `src/pages/admin/AdminDashboard.jsx` - Admin UI
- `src/pages/seller/SellerDashboard.jsx` - Seller UI