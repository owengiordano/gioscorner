import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder, getMenu } from '../services/api';
import { MenuItem, FoodSelectionItem } from '../types';
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

  // Calculate minimum date (24 hours from now)
  function getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(calculateTotal())}
            </span>
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
              <p className="text-sm text-gray-500 mt-1">
                Orders must be placed at least 24 hours in advance
              </p>
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


