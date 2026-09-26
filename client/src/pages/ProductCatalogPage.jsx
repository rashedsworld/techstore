import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { FilterSidebar } from '../components/products/FilterSidebar';
import { ProductCard } from '../components/products/ProductCard';
import { Header } from '../components/layout/header';

const emptyFilters = {
	category: '',
	minPrice: '',
	maxPrice: '',
	rating: '',
};

export const ProductCatalogPage = () => {
	const [searchParams] = useSearchParams();
	const [filters, setFilters] = useState(() => ({
		category: searchParams.get('category') || '',
		minPrice: '',
		maxPrice: '',
		rating: '',
	}));
	const [keyword, setKeyword] = useState(
		searchParams.get('search') || searchParams.get('keyword') || ''
	);
	const [sortBy, setSortBy] = useState('newest');
	const [page, setPage] = useState(1);
	const [products, setProducts] = useState([]);
	const [pages, setPages] = useState(1);
	const [totalProducts, setTotalProducts] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const controller = new AbortController();
		const query = new URLSearchParams({ page: String(page), limit: '12', sortBy });

		if (keyword.trim()) query.set('keyword', keyword.trim());
		Object.entries(filters).forEach(([key, value]) => {
			if (value) query.set(key, value);
		});

		const loadProducts = async () => {
			setLoading(true);
			setError('');

			try {
				const response = await fetch(`/api/products?${query}`, { signal: controller.signal });
				const responseBody = await response.text();
				let data = {};
				try {
					data = responseBody ? JSON.parse(responseBody) : {};
				} catch {
					throw new Error('The product service returned an invalid response.');
				}
				if (!response.ok) throw new Error(data.message || 'Unable to load products.');

				setProducts(Array.isArray(data.products) ? data.products : []);
				setPages(Math.max(1, data.pages || 1));
				setTotalProducts(data.totalProducts || 0);
			} catch (requestError) {
				if (requestError.name !== 'AbortError') {
					setError(requestError.message || 'Unable to load products.');
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		};

		loadProducts();
		return () => controller.abort();
	}, [filters, keyword, page, sortBy]);

	const updateFilters = (nextFilters) => {
		setFilters(nextFilters);
		setPage(1);
	};

	const handleSearch = (event) => {
		event.preventDefault();
		setPage(1);
	};

	const handleReset = () => {
		setFilters(emptyFilters);
		setKeyword('');
		setSortBy('newest');
		setPage(1);
	};

	return (
		<div className="min-h-screen bg-slate-50">
			<Header />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tiny Tome</p>
						<h1 className="mt-1 text-3xl font-bold text-slate-900">Miniature bookshelves</h1>
						<p className="mt-2 text-sm text-slate-500">
							{loading ? 'Loading products...' : `${totalProducts} products available`}
						</p>
					</div>
					<form onSubmit={handleSearch} className="flex w-full sm:max-w-lg">
						<label className="sr-only" htmlFor="product-search">Search products</label>
						<input
							id="product-search"
							type="search"
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
							placeholder="Search shelves by name or code"
							className="min-w-0 flex-1 rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							type="submit"
							aria-label="Search products"
							className="inline-flex items-center justify-center rounded-r-lg bg-indigo-600 px-4 text-white hover:bg-indigo-700"
						>
							<Search className="h-4 w-4" />
						</button>
					</form>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
					<FilterSidebar filters={filters} setFilters={updateFilters} onReset={handleReset} />
					<section aria-label="Product results">
						<div className="mb-5 flex items-center justify-between gap-4">
							<p className="text-sm text-slate-600">
								{loading ? 'Updating results' : `Showing ${products.length} of ${totalProducts}`}
							</p>
							<label className="flex items-center gap-2 text-sm text-slate-600">
								Sort by
								<select
									value={sortBy}
									onChange={(event) => {
										setSortBy(event.target.value);
										setPage(1);
									}}
									className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
								>
									<option value="newest">Newest</option>
									<option value="priceAsc">Price: low to high</option>
									<option value="priceDesc">Price: high to low</option>
									<option value="topRated">Top rated</option>
								</select>
							</label>
						</div>

						{error ? (
							<p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
								{error}
							</p>
						) : loading ? (
							<p role="status" className="py-12 text-center text-sm text-slate-500">Loading products...</p>
						) : products.length === 0 ? (
							<p className="py-12 text-center text-sm text-slate-500">No products match these filters.</p>
						) : (
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
								{products.map((product) => <ProductCard key={product._id} product={product} />)}
							</div>
						)}

						{!loading && !error && pages > 1 && (
							<nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-4">
								<button
									type="button"
									disabled={page <= 1}
									onClick={() => setPage((currentPage) => currentPage - 1)}
									className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
								>
									Previous
								</button>
								<span className="text-sm text-slate-600">Page {page} of {pages}</span>
								<button
									type="button"
									disabled={page >= pages}
									onClick={() => setPage((currentPage) => currentPage + 1)}
									className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
								>
									Next
								</button>
							</nav>
						)}
					</section>
				</div>
			</main>
		</div>
	);
};