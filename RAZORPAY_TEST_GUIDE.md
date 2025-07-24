# Razorpay Integration Test Guide

## Testing the Payment Integration

### Prerequisites

1. Make sure your server is running on port 5000
2. Make sure your client is running on port 5173
3. Razorpay credentials are set in .env file

### Test Flow

#### 1. Patient Books Appointment

- Login as a patient
- Go to "Book Appointment" page
- Select a doctor and book an appointment
- Doctor should receive notification

#### 2. Doctor Confirms Appointment

- Login as a doctor (different browser/incognito)
- Go to "Scheduled Appointments"
- Find the pending appointment
- Click "Accept" to confirm the appointment
- Patient should receive notification with payment requirement

#### 3. Patient Makes Payment

- As patient, go to "Upcoming Appointments"
- Find the confirmed appointment
- You should see payment section with "Pay Now" button
- Click "Pay Now" to open Razorpay checkout
- Use test card details:
  - Card Number: 4111 1111 1111 1111
  - Expiry: Any future date
  - CVV: Any 3 digits
  - Name: Any name

#### 4. Verify Payment Success

- After successful payment, appointment should show "Paid" status
- Doctor should receive payment notification
- Payment ID should be displayed

### Test Environment Setup

For testing, you can use Razorpay test mode credentials:

- Key ID: rzp_test_xvUeagOeNNxtsg (already in your .env)
- Key Secret: JIFIjSLNqtuTcPbI5VJ7IPOI (already in your .env)

### Troubleshooting

If payment modal doesn't open:

1. Check browser console for errors
2. Ensure Razorpay script is loaded in index.html
3. Verify appointment status is "Confirmed"

If payment verification fails:

1. Check server logs
2. Verify webhook signature calculation
3. Ensure appointment exists and belongs to user

### API Endpoints Added

- POST /api/payment/create-order/:appointmentId - Create payment order
- POST /api/payment/verify/:appointmentId - Verify payment
- GET /api/payment/status/:appointmentId - Get payment status

### Database Changes

Appointment schema now includes:

- paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
- paymentId: Razorpay payment ID
- orderId: Razorpay order ID
- amount: Payment amount
