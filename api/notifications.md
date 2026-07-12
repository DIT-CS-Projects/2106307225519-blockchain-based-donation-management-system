# Notifications API

## Purpose

Manage all system notifications for donors and administrators.

---

# Endpoints

## Get Notifications

GET

```http
/api/notifications
```

Returns notifications for the authenticated user.

---

## Mark as Read

PUT

```http
/api/notifications/:id/read
```

Marks one notification as read.

---

## Mark All as Read

PUT

```http
/api/notifications/read-all
```

Marks every notification as read.

---

## Delete Notification

DELETE

```http
/api/notifications/:id
```

Removes notification.

---

# Notification Types

* Donation Successful
* Donation Failed
* Campaign Published
* Campaign Closed
* Campaign Goal Achieved
* Beneficiary Updated
* Password Changed
* System Announcement

---

# Notification Delivery

* In-app notification
* Bell icon badge
* Toast notification
* Email (selected events)

---

# Permissions

Donor

Own notifications only.

Administrator

Own notifications and system broadcasts.
