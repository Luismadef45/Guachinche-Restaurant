# Permissions Matrix

## Permission keys

- menu.read
- menu.write
- booking.read
- booking.write
- order.read
- order.write
- inventory.read
- inventory.write
- staff.read
- staff.write

## Role mapping

- Customer: menu.read, booking.read, order.read
- Waiter: menu.read, booking.read, booking.write, order.read, order.write
- Chef: menu.read, order.read, order.write, inventory.read
- Shift Manager: all permissions
- General Manager: all permissions
- Admin/Owner: all permissions
- Accountant/Analyst: menu.read, booking.read, order.read, inventory.read, staff.read

## MFA requirement

- Required: Shift Manager, General Manager, Admin/Owner
- Optional: other staff roles
