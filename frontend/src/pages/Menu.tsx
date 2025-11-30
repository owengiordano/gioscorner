import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../services/api';
import { MenuItem, FoodSelectionItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const [foodSelection, setFoodSelection] = useState<FoodSelectionItem[]>([]);

  // Load menu items
  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await getMenu();
      setMenuItems(data.menuItems);
    } catch (err) {
      setError('Failed to load menu. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Format price
  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  // Carousel navigation
  function nextImage(itemId: string, totalImages: number) {
    setCarouselIndices((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalImages,
    }));
  }

  function prevImage(itemId: string, totalImages: number) {
    setCarouselIndices((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalImages) % totalImages,
    }));
  }

  function getCarouselIndex(itemId: string): number {
    return carouselIndices[itemId] || 0;
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  // Handle quantity change for menu items
  function handleQuantityChange(menuItemId: string, quantity: number) {
    setFoodSelection((prev) => {
      const existing = prev.find((item) => item.menu_item_id === menuItemId);
      
      if (quantity === 0) {
        // Remove item if quantity is 0
        return prev.filter((item) => item.menu_item_id !== menuItemId);
      }
      
      if (existing) {
        // Update existing item
        return prev.map((item) =>
          item.menu_item_id === menuItemId ? { ...item, quantity } : item
        );
      } else {
        // Add new item
        return [...prev, { menu_item_id: menuItemId, quantity, notes: '' }];
      }
    });
  }

  // Get quantity for a menu item
  function getQuantity(menuItemId: string): number {
    const item = foodSelection.find((item) => item.menu_item_id === menuItemId);
    return item?.quantity || 0;
  }

  // Filter active and coming soon items
  const activeItems = menuItems.filter(item => item.is_active !== false);
  const comingSoonItems = menuItems.filter(item => item.is_active === false);

  // Navigate to order page with selected items
  function handleContinueToOrder() {
    navigate('/order', { state: { foodSelection } });
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen py-6 sm:py-12">
        <div className="container-custom">
          <div className="card bg-red-50 border-2 border-red-200">
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Error Loading Menu
            </h3>
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadMenu}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Menu Items This Week</h1>
          <p className="text-xl text-gray-600">
            Choose from our delicious catering options
          </p>
        </div>

        {/* Active Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeItems.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              {/* Image Carousel */}
              {item.image_colors && item.image_colors.length > 0 && (
                <div className="mb-4 -mx-6 -mt-6 relative overflow-hidden">
                  <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] bg-gray-50">
                    {/* Current Image */}
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{ backgroundColor: item.image_colors[getCarouselIndex(item.id)] }}
                    />
                    
                    {/* Navigation Buttons */}
                    {item.image_colors.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(item.id, item.image_colors!.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-xl z-10"
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(item.id, item.image_colors!.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-xl z-10"
                        >
                          ›
                        </button>
                      </>
                    )}
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {item.image_colors.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndices((prev) => ({ ...prev, [item.id]: index }));
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            getCarouselIndex(item.id) === index
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Clickable Content Area */}
              <div 
                className="mb-4 cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                
                {/* Bio Section */}
                {item.bio && (
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {item.bio}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(item.price_cents)}
                  </span>
                  {item.serves && (
                    <span className="text-sm text-gray-500">
                      Serves {item.serves}
                    </span>
                  )}
                </div>
                
                {/* Available Days Badge */}
                {item.available_days && item.available_days.length < 7 && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      📅 Available Days:
                    </p>
                    <p className="text-xs text-blue-800">
                      {item.available_days
                        .sort((a, b) => a - b)
                        .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
                        .join(', ')}
                    </p>
                  </div>
                )}
                
                {/* Click to view more indicator */}
                <p className="text-xs text-primary-600 mt-2 font-medium">
                  Click for more details →
                </p>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.id, Math.max(0, getQuantity(item.id) - 1));
                    }}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {getQuantity(item.id)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.id, getQuantity(item.id) + 1);
                    }}
                    className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Continue Button */}
        {foodSelection.length > 0 && (
          <div className="card bg-primary-50 border-2 border-primary-200 mb-12">
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
            <button
              onClick={handleContinueToOrder}
              className="btn-primary w-full"
            >
              Continue to Order Request
            </button>
          </div>
        )}

        {/* Coming Soon Section */}
        {comingSoonItems.length > 0 && (
          <>
            <div className="text-center mb-8 mt-16">
              <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
              <p className="text-lg text-gray-600">
                Check out these exciting items we're preparing for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {comingSoonItems.map((item) => (
                <div key={item.id} className="card overflow-hidden opacity-75">
                  {/* Coming Soon Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    Coming Soon
                  </div>

                  {/* Image Carousel */}
                  {item.image_colors && item.image_colors.length > 0 && (
                    <div className="mb-4 -mx-6 -mt-6 relative overflow-hidden">
                      <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] bg-gray-50">
                        <div
                          className="absolute inset-0 transition-all duration-300"
                          style={{ backgroundColor: item.image_colors[getCarouselIndex(item.id)] }}
                        />
                        
                        {item.image_colors.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage(item.id, item.image_colors!.length);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-xl z-10"
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage(item.id, item.image_colors!.length);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-xl z-10"
                            >
                              ›
                            </button>
                          </>
                        )}
                        
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                          {item.image_colors.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCarouselIndices((prev) => ({ ...prev, [item.id]: index }));
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${
                                getCarouselIndex(item.id) === index
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="mb-4 cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    
                    {item.bio && (
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {item.bio}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(item.price_cents)}
                      </span>
                      {item.serves && (
                        <span className="text-sm text-gray-500">
                          Serves {item.serves}
                        </span>
                      )}
                    </div>
                    
                    {item.available_days && item.available_days.length < 7 && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          📅 Available Days:
                        </p>
                        <p className="text-xs text-blue-800">
                          {item.available_days
                            .sort((a, b) => a - b)
                            .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
                            .join(', ')}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-primary-600 mt-2 font-medium">
                      Click for more details →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Detailed Item Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <div className="min-h-full flex items-start sm:items-center justify-center p-4 pt-6 sm:p-8">
              <div 
                className="bg-white rounded-lg max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
              {/* Modal Header with Image Carousel */}
              {selectedItem.image_colors && selectedItem.image_colors.length > 0 && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] bg-gray-50">
                    {/* Current Image */}
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{ backgroundColor: selectedItem.image_colors[getCarouselIndex(selectedItem.id)] }}
                    />
                    
                    {/* Navigation Buttons */}
                    {selectedItem.image_colors.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(selectedItem.id, selectedItem.image_colors!.length);
                          }}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-2xl z-10"
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(selectedItem.id, selectedItem.image_colors!.length);
                          }}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 font-bold text-lg sm:text-2xl z-10"
                        >
                          ›
                        </button>
                      </>
                    )}
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {selectedItem.image_colors.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndices((prev) => ({ ...prev, [selectedItem.id]: index }));
                          }}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                            getCarouselIndex(selectedItem.id) === index
                              ? 'bg-white w-6 sm:w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Modal Content */}
              <div className="px-6 pb-6 pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedItem.name}</h2>
                    <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                    <div className="flex gap-4 items-center">
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(selectedItem.price_cents)}
                      </span>
                      {selectedItem.serves && (
                        <span className="text-lg text-gray-500">
                          Serves {selectedItem.serves}
                        </span>
                      )}
                    </div>
                    
                    {/* Available Days Badge in Modal */}
                    {selectedItem.available_days && selectedItem.available_days.length < 7 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          📅 Available Days:
                        </p>
                        <p className="text-sm text-blue-800">
                          {selectedItem.available_days
                            .sort((a, b) => a - b)
                            .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
                            .join(', ')}
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                          This item can only be ordered for delivery on these days of the week.
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-light"
                  >
                    ×
                  </button>
                </div>
                
                {/* Bio Section */}
                {selectedItem.bio && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">About This Dish</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedItem.bio}</p>
                  </div>
                )}
                
                {/* Detailed Information */}
                {selectedItem.detailed_info && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">What's Included</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedItem.detailed_info}
                    </div>
                  </div>
                )}
                
                {/* Coming Soon Notice or Quantity Selector */}
                {selectedItem.is_active === false ? (
                  <div className="border-t border-b py-6 mb-4 text-center">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <p className="text-lg font-bold text-yellow-900 mb-2">
                        ⏳ Coming Soon
                      </p>
                      <p className="text-yellow-800">
                        This item is not yet available for ordering. Check back soon!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Quantity Selector in Modal */}
                    <div className="flex items-center justify-between border-t border-b py-4 mb-4">
                      <span className="text-lg font-medium">Quantity:</span>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            handleQuantityChange(selectedItem.id, Math.max(0, getQuantity(selectedItem.id) - 1))
                          }
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-xl">
                          {getQuantity(selectedItem.id)}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(selectedItem.id, getQuantity(selectedItem.id) + 1)
                          }
                          className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={selectedItem.is_active === false ? "btn-primary w-full" : "btn-secondary flex-1"}
                  >
                    Close
                  </button>
                  {selectedItem.is_active !== false && (
                    <button
                      onClick={() => {
                        if (getQuantity(selectedItem.id) === 0) {
                          handleQuantityChange(selectedItem.id, 1);
                        }
                        setSelectedItem(null);
                      }}
                      className="btn-primary flex-1"
                    >
                      {getQuantity(selectedItem.id) > 0 ? 'Update Selection' : 'Add to Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

