# Requisition & Cart Flow for Special Roles

This document outlines the workflow and core logic governing how "Special Roles" (i.e., **Captains** and **Purchasers** belonging to the `tenantadmin_subusers` RoleType) interact with the Catalogue, create Requisitions, and add items to their Cart.

## 1. Identity & Role Detection
When a user logs in, the backend authenticates the user and fetches their profile from the database (`GET /auth/me`), which includes their `roleType`.

In the frontend (`b2b2/pages/Catalogue/list/CataloguePage.tsx`), the session is checked to identify if the current user is a "Special Role":
```typescript
const session = authService.getSession();
const isSpecialRole = session?.roleType === 'tenantadmin_subusers';
```
*Note: This replaces the previous, fragile logic that incorrectly hardcoded specific usernames (`captain01` or `purchaser01`). By checking role-types dynamically, any new captain added to the system automatically inherits the correct UI behaviors.*

## 2. Requisition Initialization Block (The "Disabled" State)
By default, Special Roles **cannot** add items to their shopping cart until they declare the context of their order.
In `CataloguePage.tsx`, the Add to Cart button's disabled state is computed as follows:
```typescript
const disabled = isSpecialRole && !isRequisitionCreated;
```
- If the user is a Captain/Purchaser but they **haven't** created a requisition yet, the button is locked.
- If the user is an Admin (not a special role), they are not blocked by this rule.

## 3. Creating a Requisition (Trigger)
1. The Captain clicks **"Create a Requisition"** at the top right of the Catalogue Grid.
2. The `GenericModal` opens, utilizing configurations pulled from `requisitionModalConfig.json`.
3. The Captain fills in Requisition Name, Delivery Type (Fresh/Dry), Date Ranges, and Agent Details.
4. On clicking **Continue**, the `onClose` / `onClick` handlers resolve the payload:
   ```typescript
   // Save Agent info
   await agentService.saveAgentDetails({...});

   // Unlock the cart and store active requisition context
   setIsRequisitionCreated(true);
   setCurrentRequisitionInfo({
     id: 'REQ-xxxx',
     name: data.requisitionName || 'New Requisition'
   });
   ```

## 4. Purchasing Phase (Cart Unlocked)
Once `isRequisitionCreated` evaluates to `true`:
1. The `disabled` state on the "Add to Cart" buttons becomes `false`.
2. The Captain can now use `+` and `-` controls to manipulate quantities.
3. Every added item updates the globally managed `CartContext` (`useCart`).
4. A top header or combo-box appears indicating the currently active Requisition context (`currentRequisitionInfo`).

## 5. Checkout & Order Placement
Though the final submission phase happens in the Cart/Checkout page, the items submitted will always carry the `requisitionId` context defined during initialization. This ties the ordered catalog items back to the vessel, agent, and specific operational budget block initialized in step 3.
