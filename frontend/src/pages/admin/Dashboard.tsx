import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getOrders, 
  approveOrder,
  confirmTimeAndSendInvoice,
  markOrderAsPaid,
  denyOrder, 
  logout, 
  getAdminEmail,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode
} from '../../services/api';
import { Order, MenuItem, PromoCode } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'promos'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showConfirmTimeModal, setShowConfirmTimeModal] = useState(false);
  const [totalPriceCents, setTotalPriceCents] = useState<number>(0);
  const adminEmail = getAdminEmail();

  // Menu management state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    bio: '',
    detailed_info: '',
    price_cents: 0,
    category: 'meals',
    serves: 1,
    available_days: [0, 1, 2, 3, 4, 5, 6], // All days by default
    is_active: true, // Active by default
  });

  // Promo code management state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [promoFormData, setPromoFormData] = useState<Partial<PromoCode>>({
    code: '',
    description: '',
    discount_percent: 10,
    max_uses: undefined,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: undefined,
    is_active: true,
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'menu') {
      loadMenuItems();
    } else if (activeTab === 'promos') {
      loadPromoCodes();
    }
  }, [statusFilter, activeTab]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders(statusFilter);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadMenuItems() {
    setLoading(true);
    setError('');
    try {
      const data = await getMenuItems();
      setMenuItems(data.menuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadPromoCodes() {
    setLoading(true);
    setError('');
    try {
      const data = await getPromoCodes();
      setPromoCodes(data.promoCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo codes');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/admin');
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function openApprovalModal(order: Order) {
    setSelectedOrder(order);
    setShowApprovalModal(true);
    setApprovalMessage('');
  }

  async function handleApprovalSubmit() {
    if (!selectedOrder || !approvalMessage.trim()) {
      return;
    }

    setActionLoading(true);
    try {
      await approveOrder(selectedOrder.id, approvalMessage);
      alert('Order approved successfully! Customer has been notified.');
      setShowApprovalModal(false);
      setApprovalMessage('');
      loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve order');
    } finally {
      setActionLoading(false);
    }
  }

  function openConfirmTimeModal(order: Order) {
    setSelectedOrder(order);
    setShowConfirmTimeModal(true);
    // Calculate suggested price from order
    const suggestedPrice = order.total_price_cents || 0;
    setTotalPriceCents(suggestedPrice);
  }

  async function handleConfirmTimeSubmit() {
    if (!selectedOrder) {
      return;
    }

    if (totalPriceCents <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setActionLoading(true);
    try {
      await confirmTimeAndSendInvoice(selectedOrder.id, totalPriceCents);
      alert('Time confirmed and invoice sent successfully!');
      setShowConfirmTimeModal(false);
      setTotalPriceCents(0);
      loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm time and send invoice');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkAsPaid(order: Order) {
    if (!confirm(`Mark order from ${order.customer_name} as paid?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await markOrderAsPaid(order.id);
      alert('Order marked as paid successfully!');
      loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark order as paid');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDenySubmit() {
    if (!selectedOrder || !denyReason.trim()) {
      return;
    }

    setActionLoading(true);
    try {
      await denyOrder(selectedOrder.id, denyReason);
      alert('Order denied. Customer has been notified.');
      setShowDenyModal(false);
      setDenyReason('');
      loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deny order');
    } finally {
      setActionLoading(false);
    }
  }

  function openDenyModal(order: Order) {
    setSelectedOrder(order);
    setShowDenyModal(true);
    setDenyReason('');
  }

  // Menu management functions
  function handleAddMenuItem() {
    setEditingMenuItem(null);
    setMenuFormData({
      name: '',
      description: '',
      bio: '',
      detailed_info: '',
      price_cents: 0,
      category: 'meals',
      serves: 1,
      available_days: [0, 1, 2, 3, 4, 5, 6], // All days by default
      is_active: true, // Active by default
    });
    setShowMenuForm(true);
  }

  function handleEditMenuItem(item: MenuItem) {
    setEditingMenuItem(item);
    setMenuFormData(item);
    setShowMenuForm(true);
  }

  async function handleDeleteMenuItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await deleteMenuItem(itemId);
      alert('Menu item deleted successfully!');
      loadMenuItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete menu item');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMenuFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setActionLoading(true);
    try {
      if (editingMenuItem) {
        // Update existing item
        await updateMenuItem(editingMenuItem.id, menuFormData);
        alert('Menu item updated successfully!');
      } else {
        // Add new item - generate ID from name
        const id = menuFormData.name?.toLowerCase().replace(/\s+/g, '-') || `item-${Date.now()}`;
        await createMenuItem({ ...menuFormData, id });
        alert('Menu item added successfully!');
      }
      
      setShowMenuForm(false);
      setEditingMenuItem(null);
      loadMenuItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save menu item');
    } finally {
      setActionLoading(false);
    }
  }

  // Promo code management functions
  function handleAddPromoCode() {
    setEditingPromoCode(null);
    setPromoFormData({
      code: '',
      description: '',
      discount_percent: 10,
      max_uses: undefined,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: undefined,
      is_active: true,
    });
    setShowPromoForm(true);
  }

  function handleEditPromoCode(promo: PromoCode) {
    setEditingPromoCode(promo);
    setPromoFormData({
      code: promo.code,
      description: promo.description || '',
      discount_percent: promo.discount_percent,
      max_uses: promo.max_uses,
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : undefined,
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : undefined,
      is_active: promo.is_active,
    });
    setShowPromoForm(true);
  }

  async function handleDeletePromoCode(promoId: string) {
    if (!confirm('Are you sure you want to delete this promo code?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await deletePromoCode(promoId);
      alert('Promo code deleted successfully!');
      loadPromoCodes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete promo code');
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePromoFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setActionLoading(true);
    try {
      if (editingPromoCode) {
        // Update existing promo code
        await updatePromoCode(editingPromoCode.id, promoFormData);
        alert('Promo code updated successfully!');
      } else {
        // Add new promo code
        await createPromoCode(promoFormData);
        alert('Promo code created successfully!');
      }
      
      setShowPromoForm(false);
      setEditingPromoCode(null);
      loadPromoCodes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save promo code');
    } finally {
      setActionLoading(false);
    }
  }

  function formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Logged in as {adminEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container-custom">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders Management
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'promos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Promo Codes
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
        {/* Status Filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved_pending_time')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'approved_pending_time'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Approved (Pending Time)
            </button>
            <button
              onClick={() => setStatusFilter('invoice_sent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'invoice_sent'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Invoice Sent
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('denied')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'denied'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Denied
            </button>
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Orders
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error State */}
        {error && (
          <div className="card bg-red-50 border-2 border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="card text-center text-gray-600">
                No {statusFilter} orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{order.customer_name}</h3>
                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'approved_pending_time'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'invoice_sent'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'approved_pending_time' 
                          ? 'APPROVED (PENDING TIME)'
                          : order.status === 'invoice_sent'
                          ? 'INVOICE SENT'
                          : order.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date Needed</p>
                        <p className="text-gray-900">{formatDate(order.date_needed)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Date</p>
                        <p className="text-gray-900">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-gray-900">{order.address}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Food Selection
                      </p>
                      <ul className="space-y-1">
                        {order.food_selection.map((item, idx) => (
                          <li key={idx} className="text-gray-900">
                            • {item.menu_item_id} x{item.quantity}
                            {item.notes && (
                              <span className="text-gray-600 text-sm">
                                {' '}
                                - {item.notes}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Special Notes - Always visible for all order statuses */}
                    {order.notes && (
                      <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="text-yellow-600">📝</span>
                          Special Notes from Customer
                        </p>
                        <p className="text-gray-900 whitespace-pre-wrap">{order.notes}</p>
                      </div>
                    )}

                    {order.total_price_cents && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Total Price</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatPrice(order.total_price_cents)}
                        </p>
                        {order.discount_percent && order.original_price_cents && (
                          <p className="text-sm text-green-600">
                            {order.discount_percent}% discount applied (was {formatPrice(order.original_price_cents)})
                          </p>
                        )}
                      </div>
                    )}

                    {order.discount_percent && !order.total_price_cents && (
                      <div className="mb-4 bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          🎟️ Promo code applied: <strong>{order.discount_percent}% off</strong>
                        </p>
                      </div>
                    )}

                    {order.stripe_invoice_url && (
                      <div className="mb-4">
                        <a
                          href={order.stripe_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Stripe Invoice →
                        </a>
                      </div>
                    )}

                    {order.admin_reason && (
                      <div className="mb-4 bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Denial Reason
                        </p>
                        <p className="text-gray-900">{order.admin_reason}</p>
                      </div>
                    )}

                    {/* Approval message display */}
                    {order.approval_message && (
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Approval Message
                        </p>
                        <p className="text-gray-900 whitespace-pre-wrap">{order.approval_message}</p>
                      </div>
                    )}

                    {/* Actions for pending orders */}
                    {order.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          onClick={() => openApprovalModal(order)}
                          disabled={actionLoading}
                          className="btn-primary flex-1"
                        >
                          Approve & Propose Time
                        </button>
                        <button
                          onClick={() => openDenyModal(order)}
                          disabled={actionLoading}
                          className="btn-danger flex-1"
                        >
                          Deny Order
                        </button>
                      </div>
                    )}

                    {/* Actions for approved_pending_time orders */}
                    {order.status === 'approved_pending_time' && (
                      <div className="pt-4 border-t">
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-blue-800">
                            ⏳ Waiting for customer to confirm delivery time via email.
                          </p>
                        </div>
                        <button
                          onClick={() => openConfirmTimeModal(order)}
                          disabled={actionLoading}
                          className="btn-primary w-full"
                        >
                          Mark Time Confirmed & Send Invoice
                        </button>
                      </div>
                    )}

                    {/* Actions for invoice_sent orders */}
                    {order.status === 'invoice_sent' && (
                      <div className="pt-4 border-t">
                        <div className="bg-purple-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-purple-800">
                            💳 Invoice sent. Waiting for customer payment.
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkAsPaid(order)}
                          disabled={actionLoading}
                          className="btn-primary w-full"
                        >
                          Mark as Paid (Manual Override)
                        </button>
                      </div>
                    )}

                    {/* Display for paid orders */}
                    {order.status === 'paid' && (
                      <div className="pt-4 border-t">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✅ Order is paid and confirmed!
                          </p>
                          {order.paid_at && (
                            <p className="text-xs text-green-700 mt-1">
                              Paid on: {new Date(order.paid_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
          </>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <>
            {/* Menu Actions */}
            <div className="card mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Menu Items</h2>
                  <p className="text-sm text-gray-600">Manage your menu offerings</p>
                </div>
                <button
                  onClick={handleAddMenuItem}
                  className="btn-primary"
                >
                  + Add New Item
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingSpinner />}

            {/* Error State */}
            {error && (
              <div className="card bg-red-50 border-2 border-red-200">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Menu Items List */}
            {!loading && !error && (
              <>
                {menuItems.length === 0 ? (
                  <div className="card text-center text-gray-600">
                    No menu items found. Click "Add New Item" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                      <div key={item.id} className="card">
                        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(item.price_cents)}
                          </span>
                          {item.serves && (
                            <span className="text-sm text-gray-500">
                              Serves {item.serves}
                            </span>
                          )}
                        </div>

                        <div className="mb-4 pb-4 border-b space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Category:</strong> {item.category}
                          </p>
                          {item.available_days && item.available_days.length < 7 && (
                            <p className="text-sm text-gray-600">
                              <strong>Available:</strong>{' '}
                              {item.available_days
                                .sort((a, b) => a - b)
                                .map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day])
                                .join(', ')}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.is_active ? '✓ Active' : '⏳ Coming Soon'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="btn-secondary flex-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="btn-danger flex-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Promo Codes Tab */}
        {activeTab === 'promos' && (
          <>
            {/* Promo Code Actions */}
            <div className="card mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Promo Codes</h2>
                  <p className="text-sm text-gray-600">Manage discount codes for orders</p>
                </div>
                <button
                  onClick={handleAddPromoCode}
                  className="btn-primary"
                >
                  + Add New Promo Code
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingSpinner />}

            {/* Error State */}
            {error && (
              <div className="card bg-red-50 border-2 border-red-200">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Promo Codes List */}
            {!loading && !error && (
              <>
                {promoCodes.length === 0 ? (
                  <div className="card text-center text-gray-600">
                    No promo codes found. Click "Add New Promo Code" to create one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promoCodes.map((promo) => (
                      <div key={promo.id} className="card">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold font-mono tracking-wider">
                            {promo.code}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            promo.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {promo.is_active ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </div>

                        {promo.description && (
                          <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                        )}
                        
                        <div className="text-3xl font-bold text-primary-600 mb-4">
                          {promo.discount_percent}% OFF
                        </div>

                        <div className="mb-4 pb-4 border-b space-y-2 text-sm">
                          <p className="text-gray-600">
                            <strong>Uses:</strong> {promo.current_uses}
                            {promo.max_uses ? ` / ${promo.max_uses}` : ' (unlimited)'}
                          </p>
                          <p className="text-gray-600">
                            <strong>Valid From:</strong> {formatDateTime(promo.valid_from)}
                          </p>
                          <p className="text-gray-600">
                            <strong>Valid Until:</strong> {promo.valid_until ? formatDateTime(promo.valid_until) : 'No expiration'}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditPromoCode(promo)}
                            className="btn-secondary flex-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePromoCode(promo.id)}
                            className="btn-danger flex-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Menu Item Form Modal */}
      {showMenuForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              
              <form onSubmit={handleMenuFormSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={menuFormData.name}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, name: e.target.value })
                    }
                    placeholder="e.g., Italian Feast"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Description <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={menuFormData.description}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, description: e.target.value })
                    }
                    placeholder="Brief one-line description"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={menuFormData.bio}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, bio: e.target.value })
                    }
                    placeholder="A paragraph about this dish"
                  />
                </div>

                {/* Detailed Info */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Detailed Information (Optional)
                  </label>
                  <textarea
                    rows={6}
                    className="input-field"
                    value={menuFormData.detailed_info}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, detailed_info: e.target.value })
                    }
                    placeholder="What's included, ingredients, preparation details, etc."
                  />
                </div>

                {/* Price and Serves */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (in cents) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      className="input-field"
                      value={menuFormData.price_cents === 0 ? '' : menuFormData.price_cents}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setMenuFormData({ ...menuFormData, price_cents: value === '' ? 0 : parseInt(value) });
                      }}
                      placeholder="e.g., 5000 for $50.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatPrice(menuFormData.price_cents || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Serves (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      value={menuFormData.serves || ''}
                      onChange={(e) =>
                        setMenuFormData({ ...menuFormData, serves: parseInt(e.target.value) || undefined })
                      }
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    className="input-field"
                    value={menuFormData.category}
                    onChange={(e) =>
                      setMenuFormData({ ...menuFormData, category: e.target.value })
                    }
                  >
                    <option value="meals">Meals</option>
                    <option value="appetizers">Appetizers</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                    <option value="sides">Sides</option>
                  </select>
                </div>

                {/* Available Days */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Available Days <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which days of the week this item can be ordered for delivery
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 0, label: 'Sunday' },
                      { value: 1, label: 'Monday' },
                      { value: 2, label: 'Tuesday' },
                      { value: 3, label: 'Wednesday' },
                      { value: 4, label: 'Thursday' },
                      { value: 5, label: 'Friday' },
                      { value: 6, label: 'Saturday' },
                    ].map((day) => (
                      <label
                        key={day.value}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          (menuFormData.available_days || []).includes(day.value)
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(menuFormData.available_days || []).includes(day.value)}
                          onChange={(e) => {
                            const currentDays = menuFormData.available_days || [];
                            if (e.target.checked) {
                              setMenuFormData({
                                ...menuFormData,
                                available_days: [...currentDays, day.value].sort(),
                              });
                            } else {
                              setMenuFormData({
                                ...menuFormData,
                                available_days: currentDays.filter((d) => d !== day.value),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">{day.label}</span>
                      </label>
                    ))}
                  </div>
                  {(menuFormData.available_days?.length || 0) === 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Please select at least one day
                    </p>
                  )}
                </div>

                {/* Is Active Toggle */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Set whether this item is currently available to order or coming soon
                  </p>
                  <div className="flex gap-4">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        menuFormData.is_active
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="is_active"
                        checked={menuFormData.is_active === true}
                        onChange={() => setMenuFormData({ ...menuFormData, is_active: true })}
                        className="rounded-full"
                      />
                      <span className="font-medium">✓ Active (Available Now)</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        menuFormData.is_active === false
                          ? 'border-yellow-600 bg-yellow-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="is_active"
                        checked={menuFormData.is_active === false}
                        onChange={() => setMenuFormData({ ...menuFormData, is_active: false })}
                        className="rounded-full"
                      />
                      <span className="font-medium">⏳ Coming Soon</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingMenuItem(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingMenuItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Form Modal */}
      {showPromoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full my-8">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingPromoCode ? 'Edit Promo Code' : 'Add New Promo Code'}
              </h2>
              
              <form onSubmit={handlePromoFormSubmit} className="space-y-6">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Promo Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field font-mono uppercase"
                    value={promoFormData.code}
                    onChange={(e) =>
                      setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., SUMMER20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Code will be converted to uppercase
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={promoFormData.description}
                    onChange={(e) =>
                      setPromoFormData({ ...promoFormData, description: e.target.value })
                    }
                    placeholder="e.g., Summer sale discount"
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Percentage <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      className="input-field"
                      value={promoFormData.discount_percent || ''}
                      onChange={(e) =>
                        setPromoFormData({ ...promoFormData, discount_percent: parseInt(e.target.value) || 0 })
                      }
                      placeholder="e.g., 20"
                    />
                    <span className="text-xl font-bold">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a value between 1 and 100
                  </p>
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Uses (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={promoFormData.max_uses || ''}
                    onChange={(e) =>
                      setPromoFormData({ 
                        ...promoFormData, 
                        max_uses: e.target.value ? parseInt(e.target.value) : undefined 
                      })
                    }
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited uses
                  </p>
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={promoFormData.valid_from || ''}
                    onChange={(e) =>
                      setPromoFormData({ ...promoFormData, valid_from: e.target.value })
                    }
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={promoFormData.valid_until || ''}
                    onChange={(e) =>
                      setPromoFormData({ 
                        ...promoFormData, 
                        valid_until: e.target.value || undefined 
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no expiration
                  </p>
                </div>

                {/* Is Active Toggle */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        promoFormData.is_active
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promo_is_active"
                        checked={promoFormData.is_active === true}
                        onChange={() => setPromoFormData({ ...promoFormData, is_active: true })}
                        className="rounded-full"
                      />
                      <span className="font-medium">✓ Active</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        promoFormData.is_active === false
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promo_is_active"
                        checked={promoFormData.is_active === false}
                        onChange={() => setPromoFormData({ ...promoFormData, is_active: false })}
                        className="rounded-full"
                      />
                      <span className="font-medium">✗ Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPromoForm(false);
                      setEditingPromoCode(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary flex-1"
                  >
                    {actionLoading ? 'Saving...' : editingPromoCode ? 'Update Promo Code' : 'Create Promo Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Approve Order & Propose Time</h2>
            <p className="text-gray-600 mb-4">
              Approve the order from <strong>{selectedOrder.customer_name}</strong> and propose a delivery window:
            </p>
            <textarea
              className="input-field mb-4"
              rows={4}
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
              placeholder="e.g., I can drop off between 5–6 PM on that day."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalMessage('');
                }}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={actionLoading || !approvalMessage.trim()}
                className="btn-primary flex-1"
              >
                {actionLoading ? 'Approving...' : 'Approve & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Time & Send Invoice Modal */}
      {showConfirmTimeModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Time & Send Invoice</h2>
            <p className="text-gray-600 mb-4">
              Confirm that <strong>{selectedOrder.customer_name}</strong> has agreed to the delivery time via email, and send them the invoice.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Total Price (in cents) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field"
                value={totalPriceCents === 0 ? '' : totalPriceCents}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setTotalPriceCents(value === '' ? 0 : parseInt(value));
                }}
                placeholder="e.g., 5000 for $50.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: ${(totalPriceCents / 100).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmTimeModal(false);
                  setTotalPriceCents(0);
                }}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTimeSubmit}
                disabled={actionLoading || totalPriceCents <= 0}
                className="btn-primary flex-1"
              >
                {actionLoading ? 'Sending...' : 'Confirm & Send Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Deny Order</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for denying this order from{' '}
              <strong>{selectedOrder.customer_name}</strong>:
            </p>
            <textarea
              className="input-field mb-4"
              rows={4}
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="e.g., We're fully booked on that date..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDenyModal(false);
                  setDenyReason('');
                }}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDenySubmit}
                disabled={actionLoading || !denyReason.trim()}
                className="btn-danger flex-1"
              >
                {actionLoading ? 'Denying...' : 'Deny Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

