# Day-of-Week Scheduling Feature

## Overview

The day-of-week scheduling feature allows you to restrict which days of the week each menu item can be ordered for delivery. This is perfect for items that are only prepared on certain days or for managing your kitchen's weekly schedule.

## How It Works

### For Administrators

When creating or editing a menu item in the admin dashboard, you can select which days of the week the item is available for delivery:

1. Go to **Admin Dashboard** → **Menu Management**
2. Click **Add New Item** or **Edit** an existing item
3. Scroll to the **Available Days** section
4. Check the boxes for the days when this item can be ordered
5. Save the menu item

**Example**: If you make grilled cheese only on Tuesdays and Wednesdays:
- Check only **Tuesday** and **Wednesday**
- Uncheck all other days
- Save the item

### For Customers

When customers browse the menu:

1. **Menu Cards**: Items with restricted schedules show a blue badge indicating which days they're available
   - Example: "📅 Available Days: Tuesday, Wednesday"

2. **Item Details**: When clicking on an item, the modal shows the same information with more detail

3. **Date Selection**: When filling out the order form:
   - The date picker shows a message: "Based on your selection, delivery is only available on: Tue, Wed"
   - If they select an invalid date, they get a clear error message
   - The form won't submit until a valid date is selected

### Smart Intersection Logic

When customers select multiple items with different availability schedules, the system automatically finds the intersection:

**Example**:
- Item A: Available Mon, Tue, Wed, Thu, Fri
- Item B: Available Tue, Wed, Sat
- **Result**: Customer can only order on Tue or Wed (the days both items are available)

## Database Schema

The `available_days` field stores an array of integers:
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

**Default**: `[0,1,2,3,4,5,6]` (all days available)

```sql
available_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6]
```

## Examples

### Example 1: Weekend Special
```json
{
  "name": "Weekend Brunch Box",
  "available_days": [0, 6],  // Sunday and Saturday only
  ...
}
```

### Example 2: Weekday Lunch
```json
{
  "name": "Business Lunch Package",
  "available_days": [1, 2, 3, 4, 5],  // Monday-Friday only
  ...
}
```

### Example 3: Tuesday Special
```json
{
  "name": "Taco Tuesday Fiesta",
  "available_days": [2],  // Tuesday only
  ...
}
```

### Example 4: Always Available
```json
{
  "name": "Classic Pasta",
  "available_days": [0, 1, 2, 3, 4, 5, 6],  // All days
  ...
}
```

## API Usage

### Creating a Menu Item with Day Restrictions

```bash
curl -X POST http://localhost:3001/api/admin/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "grilled-cheese-special",
    "name": "Grilled Cheese Special",
    "description": "Our famous grilled cheese",
    "price_cents": 1200,
    "category": "meals",
    "available_days": [2, 3]
  }'
```

### Updating Available Days

```bash
curl -X PUT http://localhost:3001/api/admin/menu/grilled-cheese-special \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "available_days": [2, 3, 4]
  }'
```

## User Experience Flow

### Scenario: Customer Orders Grilled Cheese (Tue/Wed only)

1. **Browse Menu**
   - Customer sees "Grilled Cheese Special" with badge: "📅 Available Days: Tuesday, Wednesday"

2. **Add to Cart**
   - Customer adds grilled cheese to their order
   - Continues shopping

3. **Fill Order Form**
   - Customer reaches the date picker
   - Sees message: "Based on your selection, delivery is only available on: Tue, Wed"
   - Tries to select Monday → Gets error: "The selected date is not available..."
   - Selects Tuesday → ✅ Valid!

4. **Submit Order**
   - Order is submitted successfully
   - Admin receives order for Tuesday delivery

## Admin Dashboard Features

### Menu Item Card
Shows abbreviated day names when item has restrictions:
```
Category: meals
Available: Tue, Wed
```

### Edit Form
- Visual checkboxes for each day of the week
- Selected days are highlighted in blue
- Must select at least one day
- Changes save immediately when form is submitted

## Validation Rules

### Backend Validation
- `available_days` must be an array
- Array must contain only integers 0-6
- Array must have at least one element
- Constraint: `available_days <@ ARRAY[0,1,2,3,4,5,6]`

### Frontend Validation
- Date picker shows real-time validation
- Error messages are clear and actionable
- Form submission is blocked for invalid dates
- Visual indicators (red border) for invalid selections

## Edge Cases Handled

### 1. No Items Selected
- Date picker has no restrictions
- All future dates are valid

### 2. All Items Available Every Day
- No restrictions shown
- All future dates are valid

### 3. No Common Days
- Example: Item A (Mon-Fri), Item B (Sat-Sun)
- Customer sees: "The selected items have no overlapping available days"
- Must remove one item to proceed

### 4. Single Day Items
- Example: "Taco Tuesday" (Tuesday only)
- Clear badge: "📅 Available Days: Tuesday"
- Only Tuesdays are selectable

## Testing Checklist

- [ ] Create menu item with specific days
- [ ] Edit menu item to change available days
- [ ] View menu item card shows correct days
- [ ] Click menu item modal shows correct days
- [ ] Add item to cart
- [ ] Date picker shows day restrictions
- [ ] Try to select invalid date → Error shown
- [ ] Select valid date → No error
- [ ] Submit order with valid date → Success
- [ ] Add multiple items with different days → Intersection works
- [ ] Add items with no common days → Appropriate error

## Migration Notes

### Existing Menu Items
When you run the updated schema, existing menu items will automatically have `available_days` set to `[0,1,2,3,4,5,6]` (all days available). You can then edit individual items to set specific day restrictions.

### Updating Existing Items
```sql
-- Make an item available only on weekends
UPDATE menu_items 
SET available_days = ARRAY[0, 6] 
WHERE id = 'weekend-special';

-- Make an item available weekdays only
UPDATE menu_items 
SET available_days = ARRAY[1, 2, 3, 4, 5] 
WHERE id = 'business-lunch';
```

## Troubleshooting

### "Please select at least one day" error
- You must select at least one day of the week for each menu item
- Check at least one checkbox in the Available Days section

### Date picker not restricting dates
- Verify the menu item has `available_days` set in the database
- Check browser console for errors
- Ensure you're using the latest version of the frontend code

### Customer can't find valid date
- Check if multiple items have overlapping available days
- Consider adjusting the available days for one or more items
- Or suggest customer split into multiple orders

## Best Practices

1. **Be Clear**: Use descriptive names that hint at day restrictions
   - Good: "Tuesday Taco Special"
   - Less clear: "Taco Platter" (with Tuesday-only restriction)

2. **Group Similar Items**: If you have multiple Tuesday-only items, consider creating a "Tuesday Specials" category

3. **Communicate Clearly**: The system shows day restrictions, but you can also mention them in the item description

4. **Plan Ahead**: Consider your kitchen's capacity when setting day restrictions

5. **Test Combinations**: Make sure customers can actually order common combinations of items

## Future Enhancements

Potential improvements to this feature:

- **Date Range Blackouts**: Block specific date ranges (holidays, vacations)
- **Seasonal Availability**: Items only available during certain months
- **Lead Time Per Item**: Different items require different advance notice
- **Capacity Limits**: Maximum orders per day for specific items
- **Time Slots**: Not just days, but specific time windows




