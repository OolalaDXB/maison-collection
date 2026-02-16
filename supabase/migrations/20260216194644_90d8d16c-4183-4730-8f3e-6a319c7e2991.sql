-- Clean up test booking and associated data
DELETE FROM availability WHERE booking_id = '37aaca13-b101-493c-8e09-29aa34386adb';
DELETE FROM booking_contracts WHERE booking_id = '37aaca13-b101-493c-8e09-29aa34386adb';
DELETE FROM bookings WHERE id = '37aaca13-b101-493c-8e09-29aa34386adb';