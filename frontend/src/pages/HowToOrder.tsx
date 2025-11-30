import { Link } from 'react-router-dom';

export default function HowToOrder() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How to Order</h1>
            <p className="text-xl text-gray-600">
              Follow these simple steps to place your catering order
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Browse Our Menu</h2>
                  <p className="text-gray-700 mb-4">
                    Check out our menu page to see all available catering options.
                    Each item includes a description, price, and serving size to help
                    you plan your order.
                  </p>
                  <Link to="/menu" className="text-primary-600 font-semibold hover:text-primary-700">
                    View Menu →
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Fill Out the Order Form</h2>
                  <p className="text-gray-700 mb-4">
                    Complete the order form on our menu page with:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>Your name and contact email</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>Delivery address</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>Date needed (must be at least 24 hours in advance)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>Menu items and quantities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>Any special notes or dietary requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Submit Your Request</h2>
                  <p className="text-gray-700 mb-4">
                    Once you submit your order, you'll receive an immediate
                    confirmation email. Your request will be marked as "pending review"
                    while we review the details.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  4
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Wait for Confirmation</h2>
                  <p className="text-gray-700 mb-4">
                    We'll review your order and get back to you as soon as possible.
                    You'll receive an email with either:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>
                        <strong>Acceptance:</strong> Your order is confirmed! We'll
                        include a payment link in the email.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      <span>
                        <strong>Denial:</strong> If we can't fulfill your request,
                        we'll explain why and suggest alternatives.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  5
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Complete Payment</h2>
                  <p className="text-gray-700 mb-4">
                    Once your order is accepted, you'll receive a secure Stripe
                    invoice link. Simply click the link and complete your payment to
                    finalize your order.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="card">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  6
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold mb-3">Enjoy Your Event!</h2>
                  <p className="text-gray-700 mb-4">
                    We'll deliver your catering order on time to your specified
                    address. All you need to do is enjoy great food with your guests!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="card bg-yellow-50 border-2 border-yellow-200 mt-8">
            <h2 className="text-xl font-bold mb-3 text-yellow-900">
              Important Notes
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span>
                  <strong>24-Hour Minimum:</strong> All orders must be placed at
                  least 24 hours in advance.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span>
                  <strong>Dietary Requirements:</strong> Please mention any dietary
                  restrictions or allergies in the notes section.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span>
                  <strong>Cancellations:</strong> Contact us as soon as possible if
                  you need to cancel or modify your order.
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link to="/menu" className="btn-primary inline-block">
              Start Your Order Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



