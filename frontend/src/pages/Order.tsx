import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder, getMenu, validatePromoCode } from '../services/api';
import { MenuItem, FoodSelectionItem, PromoCode } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get initial food selection from navigation state
  const initialFoodSelection = (location.state?.foodSelection as FoodSelectionItem[]) || [];
  
  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    address: '',
    date_needed: '',
    notes: '',
  });

  const [foodSelection, setFoodSelection] = useState<FoodSelectionItem[]>(initialFoodSelection);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValidating, setPromoCodeValidating] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [promoCodeError, setPromoCodeError] = useState('');

  // Load menu items
  useEffect(() => {
    loadMenu();
  }, []);

  // Redirect if no items selected
  useEffect(() => {
    if (!loading && foodSelection.length === 0) {
      navigate('/menu');
    }
  }, [foodSelection, loading, navigate]);

  async function loadMenu() {
    try {
      const data = await getMenu();
      setMenuItems(data.menuItems);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  }

  // Format price
  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  // Calculate minimum date based on 3pm cutoff rule
  // Orders must be placed by 3pm the day before
  function getMinDate(): string {
    const now = new Date();
    const cutoffHour = 15; // 3pm
    
    // If it's before 3pm, minimum is tomorrow
    // If it's 3pm or later, minimum is day after tomorrow
    if (now.getHours() < cutoffHour) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } else {
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      return dayAfterTomorrow.toISOString().split('T')[0];
    }
  }

  // Get the next available date considering both cutoff time and available days
  function getNextAvailableDate(): { date: string; message: string } | null {
    const now = new Date();
    const cutoffHour = 15; // 3pm
    const availableDays = getAvailableDaysForSelection();
    
    // Start from minimum date
    let checkDate = new Date(getMinDate() + 'T00:00:00');
    
    // If there are day restrictions, find the next valid day
    if (availableDays && availableDays.length < 7) {
      // Find the next available day within the next 14 days
      for (let i = 0; i < 14; i++) {
        if (availableDays.includes(checkDate.getDay())) {
          break;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
    
    const dateStr = checkDate.toISOString().split('T')[0];
    const formattedDate = checkDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Determine if we're past the cutoff
    const isPastCutoff = now.getHours() >= cutoffHour;
    
    return {
      date: dateStr,
      message: isPastCutoff 
        ? `Orders must be placed by 3:00 PM the day before delivery. The next available date is ${formattedDate}.`
        : `Orders must be placed by 3:00 PM the day before delivery.`
    };
  }

  // Get the intersection of available days from all selected items
  function getAvailableDaysForSelection(): number[] | null {
    if (foodSelection.length === 0) {
      return null;
    }

    const selectedMenuItems = foodSelection
      .map((item) => menuItems.find((m) => m.id === item.menu_item_id))
      .filter((item): item is MenuItem => item !== undefined);

    let availableDays: number[] = [0, 1, 2, 3, 4, 5, 6];

    for (const item of selectedMenuItems) {
      if (item.available_days && item.available_days.length < 7) {
        availableDays = availableDays.filter((day) => item.available_days!.includes(day));
      }
    }

    return availableDays.length > 0 ? availableDays : null;
  }

  // Check if a date is valid based on selected items
  function isDateValid(dateString: string): boolean {
    const availableDays = getAvailableDaysForSelection();
    if (!availableDays) {
      return true;
    }

    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return availableDays.includes(dayOfWeek);
  }

  // Handle date change with validation
  function handleDateChange(dateString: string) {
    setFormData({ ...formData, date_needed: dateString });
    
    if (dateString && !isDateValid(dateString)) {
      const availableDays = getAvailableDaysForSelection();
      const dayNames = availableDays?.map((day) => 
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
      ).join(', ');
      
      setSubmitError(
        `The selected date is not available for all items in your order. Please choose a date that falls on: ${dayNames}`
      );
    } else {
      setSubmitError('');
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (foodSelection.length === 0) {
      setSubmitError('Please select at least one menu item');
      return;
    }

    // Validate the date is available for all selected items
    if (!isDateValid(formData.date_needed)) {
      const availableDays = getAvailableDaysForSelection();
      const dayNames = availableDays?.map((day) => 
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
      ).join(', ');
      
      setSubmitError(
        `The selected date is not available for all items in your order. Please choose a date that falls on: ${dayNames}`
      );
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await createOrder({
        ...formData,
        food_selection: foodSelection,
        promo_code: appliedPromoCode?.code,
      });

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        address: '',
        date_needed: '',
        notes: '',
      });
      setFoodSelection([]);
      setAppliedPromoCode(null);
      setPromoCode('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit order');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate total price
  function calculateTotal(): number {
    return foodSelection.reduce((total, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
      return total + (menuItem ? menuItem.price_cents * item.quantity : 0);
    }, 0);
  }

  // Calculate discounted total
  function calculateDiscountedTotal(): number {
    const total = calculateTotal();
    if (appliedPromoCode) {
      return Math.round(total * (1 - appliedPromoCode.discount_percent / 100));
    }
    return total;
  }

  // Handle promo code validation
  async function handleApplyPromoCode() {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setPromoCodeValidating(true);
    setPromoCodeError('');

    try {
      const result = await validatePromoCode(promoCode.trim());
      if (result.valid && result.promo_code) {
        setAppliedPromoCode(result.promo_code);
        setPromoCodeError('');
      } else {
        setPromoCodeError(result.error || 'Invalid promo code');
        setAppliedPromoCode(null);
      }
    } catch (err) {
      setPromoCodeError('Failed to validate promo code');
      setAppliedPromoCode(null);
    } finally {
      setPromoCodeValidating(false);
    }
  }

  // Remove applied promo code
  function handleRemovePromoCode() {
    setAppliedPromoCode(null);
    setPromoCode('');
    setPromoCodeError('');
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen py-6 sm:py-12">
        <div className="container-custom">
          <div className="card bg-green-50 border-2 border-green-200 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-green-900 mb-4">
              ✅ Order Submitted Successfully!
            </h2>
            <p className="text-green-800 mb-6">
              Thank you for your order! We've received your request and it's currently
              pending review. You'll receive an email confirmation shortly, and we'll
              notify you once your order is accepted or if we need any additional
              information.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/menu')}
                className="btn-primary flex-1"
              >
                Back to Menu
              </button>
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  navigate('/menu');
                }}
                className="btn-secondary flex-1"
              >
                Submit Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Complete Your Order</h1>
          <p className="text-xl text-gray-600">
            Fill out the details below to submit your order request
          </p>
        </div>

        {/* Order Summary */}
        <div className="card bg-primary-50 border-2 border-primary-200 mb-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Your Selection</h3>
          <ul className="space-y-2 mb-4">
            {foodSelection.map((item) => {
              const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
              return (
                <li key={item.menu_item_id} className="flex justify-between">
                  <span>
                    {menuItem?.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">
                    {menuItem && formatPrice(menuItem.price_cents * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Promo Code Section */}
          <div className="border-t pt-4 mb-4">
            <label className="block text-sm font-medium mb-2">
              Promo Code (Optional)
            </label>
            {appliedPromoCode ? (
              <div className="flex items-center justify-between bg-green-100 border-2 border-green-300 rounded-lg p-3">
                <div>
                  <span className="font-semibold text-green-800">
                    ✓ {appliedPromoCode.code}
                  </span>
                  <span className="text-green-700 ml-2">
                    ({appliedPromoCode.discount_percent}% off)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromoCode}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`input-field flex-1 ${promoCodeError ? 'border-red-500' : ''}`}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoCodeError('');
                  }}
                  placeholder="Enter promo code"
                  disabled={promoCodeValidating}
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={promoCodeValidating || !promoCode.trim()}
                  className="btn-secondary px-6"
                >
                  {promoCodeValidating ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}
            {promoCodeError && (
              <p className="text-red-600 text-sm mt-1">{promoCodeError}</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            {appliedPromoCode && (
              <>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal:</span>
                  <span className="line-through">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount ({appliedPromoCode.discount_percent}% off):</span>
                  <span>-{formatPrice(calculateTotal() - calculateDiscountedTotal())}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(calculateDiscountedTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="card max-w-2xl mx-auto">
          {submitError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Delivery Address <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                className="input-field"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street address, city, state, zip code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date Needed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                min={getMinDate()}
                className={`input-field ${
                  formData.date_needed && !isDateValid(formData.date_needed)
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
                value={formData.date_needed}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              {(() => {
                const nextAvailable = getNextAvailableDate();
                return (
                  <p className="text-sm text-gray-600 mt-1">
                    ⏰ {nextAvailable?.message}
                  </p>
                );
              })()}
              {(() => {
                const availableDays = getAvailableDaysForSelection();
                if (availableDays && availableDays.length < 7) {
                  const dayNames = availableDays
                    .sort((a, b) => a - b)
                    .map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day])
                    .join(', ');
                  return (
                    <p className="text-sm text-blue-700 mt-2 font-medium">
                      📅 Based on your selection, delivery is only available on: {dayNames}
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Special Notes (Optional)
              </label>
              <textarea
                rows={4}
                className="input-field"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Dietary restrictions, delivery instructions, etc."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="btn-secondary flex-1"
              >
                Back to Menu
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Order Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}




