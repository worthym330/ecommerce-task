# E-Commerce Store with Discount System

A full-featured e-commerce application with cart functionality, checkout process, and an automatic discount code system where every nth order per user generates a discount code.

## Features

### Customer Features
- Browse products in a responsive grid layout
- Add items to cart with real-time updates
- Apply discount codes at checkout
- Automatic discount code generation after every 3rd order
- Order history tracking
- Persistent cart and user data using localStorage

### Admin Features
- Comprehensive dashboard with sales statistics
- User order tracking and analytics
- Discount code management
  - View all discount codes (used and unused)
  - Generate new discount codes
  - Create custom discount codes
  - Filter discount codes by status and type

## Discount System

The application implements a special discount system:

- Every 3rd order placed by a user automatically generates a unique discount code
- The discount code is displayed in the user's cart for their next purchase
- Discount codes provide 10% off the total order value
- Each discount code can only be used once
- Admin-generated discount codes can be used by any user
- User-specific discount codes can only be used by the user they were generated for

## Technical Implementation

### Frontend
- Built with Next.js App Router and React
- Responsive UI using Tailwind CSS and shadcn/ui components
- Client-side state management with React hooks
- User data persistence with localStorage

### Backend
- Server-side logic using Next.js API routes and server actions
- In-memory data store for products, orders, carts, and discount codes
- RESTful API endpoints for all e-commerce operations

### Data Models
- Products: Product catalog with details and pricing
- Cart: User shopping cart with items and quantities
- Orders: Completed purchases with order details
- Discount Codes: Generated and custom discount codes with usage tracking
- User Stats: Per-user order counts and purchase history

## Setup and Usage

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at `http://localhost:3000`

### Testing the Discount System

1. Add products to your cart and complete checkout
2. After your 3rd order, you'll receive a discount code in your cart
3. Use this discount code on your next purchase for 10% off
4. View your order count and discount eligibility in the cart

### Admin Access

1. Navigate to `/admin` to view the admin dashboard
2. See order statistics and user purchase data
3. Go to `/admin/discounts` to manage discount codes
   - Generate new discount codes
   - Create custom discount codes
   - View all discount codes with filtering options

## API Endpoints

### Customer APIs
- `GET /api/products` - Get all products
- `GET /api/cart` - Get cart contents for a user
- `POST /api/cart/add` - Add item to cart
- `POST /api/checkout` - Process checkout
- `POST /api/discount/validate` - Validate discount code

### Admin APIs
- `GET /api/admin/stats` - Get purchase statistics
- `GET /api/admin/discount-codes` - Get all discount codes
- `POST /api/admin/generate-discount` - Generate discount code
- `POST /api/discount/create` - Create custom discount code

## Project Structure

- `app/page.tsx` - Main store page with products and cart
- `app/admin/page.tsx` - Admin dashboard with statistics
- `app/admin/discounts/page.tsx` - Discount code management
- `lib/store.ts` - In-memory data store and business logic
- `lib/actions.ts` - Server actions for cart and checkout functionality
- `lib/types.ts` - TypeScript interfaces for the application
- API Routes:
  - `app/api/products/route.ts` - Get all products
  - `app/api/cart/route.ts` - Get cart contents
  - `app/api/cart/add/route.ts` - Add item to cart
  - `app/api/checkout/route.ts` - Process checkout
  - `app/api/discount/validate/route.ts` - Validate discount code
  - `app/api/admin/stats/route.ts` - Get purchase statistics
  - `app/api/admin/discount-codes/route.ts` - Get all discount codes
  - `app/api/admin/generate-discount/route.ts` - Generate discount code

## Configuration

The following configuration options are available in `lib/store.ts`:

- `DISCOUNT_PERCENTAGE` - The percentage discount to apply (default: 10%)
- `NTH_ORDER_FOR_DISCOUNT` - Generate a discount code every nth order per user (default: 3)

## Future Enhancements

- User authentication and account management
- Persistent database storage
- Payment processing integration
- Product categories and search functionality
- Order fulfillment and shipping tracking
- Email notifications for orders and discount codes