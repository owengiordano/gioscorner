import founderImg from '../assets/tara-founder.png';

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About Gio's Corner</h1>
            <p className="text-xl text-gray-600">
            Family Meals & Catering: Italian Tradition, Modern Nutrition.
            </p>
          </div>

          {/* Story Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
              Welcome to Gio's Corner, where every dish is derived from a heritage rooted in food, family, and health.
              </p>
              <p>
              The name "Gio's Corner" is a nod to our family's heritage—a nickname stemming from our Italian last name.  
              For generations, the dinner table has been the central heart of our lives, filled with from-scratch, 
              quality meals and deep connection.
              </p>
              <p>
              At Gio's Corner, we continue that legacy. We craft delicious, <span className="font-bold">nutritious family meals and small event catering</span>, 
              ensuring you can bring the richness of Italian heritage and the comfort of homemade quality to your own life's 
              gatherings. We handle the cooking so you can focus on the connections.
              </p>
              <p>
              We don't just cook; we honor the past by using generational recipes and elevating them with a focus on wholesome, nutritious ingredients. 
              We believe that whether it's a quiet family dinner or a catered event, every meal should be an opportunity to connect, nourish, and savor life.
              </p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Philosophy: Whole Foods, Wholesome Meals</h2>
            <p>
                Our cooking philosophy is simple: balance rich Italian tradition with modern nutritional focus. 
                We are committed to preparing every dish with <span className="font-bold">whole foods</span>—ingredients that provide the essential 
                nutrients, fiber, and antioxidants often missing from processed items.
                </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Fresh & Balanced
                </h3>
                <p className="text-gray-700">
                We focus on fresh, seasonal produce, healthy fats (like extra virgin olive oil), lean and carefully sourced proteins, 
                fresh herbs, and whole grains.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary-600">
                  Commitment to Community
                </h3>
                <p className="text-gray-700">
                We proudly work with many of our <span className="font-bold">local food suppliers</span>—butcher, baker, produce market and pasta maker—to ensure 
                only the best, quality ingredients go into each of our dishes.
                </p>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="card mb-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4">The Founder: Bringing Professional Expertise Home</h2>
            <p className="text-gray-700">
            For generations, our family table has been the center of our lives. It is where we share from-scratch, 
            quality meals, and where we build strong mental and physical health by simply gathering. I founded Gio's 
            Corner to bring this sacred tradition to your table. After 20+ years in the demanding hospitality and 
            culinary world—working with leaders like Wolfgang Puck Catering, Compass 
            am applying that high-level expertise to crafting nourishing family meals and small event catering.
            </p>
            <p>
            As a busy mother of four, I personally understand the challenge of juggling an intense schedule while 
            ensuring a wholesome meal is on the table each night. That firsthand reality is what drives our mission: 
            to provide nourishing <span className="font-bold">Family Meals and Event Catering</span> rooted in Italian heritage and crafted with modern 
            nutritional focus. We give parents the confidence of quality, homemade food without the time commitment.
            </p>
            <img 
                    src={founderImg} 
                    alt="Gio's Corner - Haddonfield Sandwiches & More" 
                    className="w-full h-auto"
                  />
          </div>
        </div>
      </div>
    </div>
  );
}




