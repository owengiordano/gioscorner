export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About Gio's Corner</h1>
            <p className="text-xl text-gray-600">
              Bringing quality catering to your special moments
            </p>
          </div>

          {/* Story Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Gio's Corner started with a simple mission: to bring delicious,
                homemade-quality food to events of all sizes. What began as a passion
                for cooking has grown into a trusted catering service serving our
                community.
              </p>
              <p>
                We believe that great food brings people together. Whether it's a
                family gathering, corporate event, or special celebration, we're
                committed to making your event memorable with exceptional food and
                service.
              </p>
              <p>
                Every dish we prepare is made with care, using fresh ingredients and
                time-tested recipes. We take pride in our attention to detail and our
                commitment to customer satisfaction.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To provide high-quality, delicious catering services that exceed our
              customers' expectations. We strive to make every event special by
              delivering exceptional food, reliable service, and personalized attention
              to detail.
            </p>
          </div>

          {/* Values Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Quality First
                </h3>
                <p className="text-gray-700">
                  We never compromise on the quality of our ingredients or
                  preparation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Customer Focus
                </h3>
                <p className="text-gray-700">
                  Your satisfaction is our top priority. We listen and deliver.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Reliability
                </h3>
                <p className="text-gray-700">
                  You can count on us to deliver on time, every time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Passion
                </h3>
                <p className="text-gray-700">
                  We love what we do, and it shows in every dish we create.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Customizable menu options for any event size</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Fresh, high-quality ingredients in every dish</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Professional service and on-time delivery</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Accommodations for dietary restrictions and preferences</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Competitive pricing with transparent invoicing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



