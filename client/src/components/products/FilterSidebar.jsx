import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterSidebar = ({ filters, setFilters, onReset }) => {
  const categories = ['Miniature Bookshelves'];

  const handleCategoryChange = (cat) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === cat ? '' : cat,
    }));
  };

  return (
    <aside className="w-full lg:w-64 space-y-6 bg-white p-5 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={() => handleCategoryChange(cat)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min (৳)"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Max (৳)"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Minimum Rating</h4>
        <select
          value={filters.rating}
          onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
        >
          <option value="">All Ratings</option>
          <option value="4">4 Stars & Above</option>
          <option value="3">3 Stars & Above</option>
        </select>
      </div>
    </aside>
  );
};