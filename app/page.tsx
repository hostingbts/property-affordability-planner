import TopBar from "@/components/TopBar";
import CalculatorPanel from "@/components/CalculatorPanel";
import SavedPropertiesList from "@/components/SavedPropertiesList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Property Affordability Planner
          </h1>
          <p className="text-gray-600">
            Calculate loan requirements and monthly savings needed for your dream property
          </p>
        </header>

        {/* TopBar - Always visible */}
        <TopBar />

        {/* Main Content - Stacked vertically */}
        <div className="space-y-6">
          {/* Calculator Panel */}
          <CalculatorPanel />

          {/* Saved Properties List */}
          <SavedPropertiesList />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Property Affordability Planner</p>
        </footer>
      </div>
    </div>
  );
}
