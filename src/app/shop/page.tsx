'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ChevronDownIcon, GridIcon, FilterIcon } from '@/components/icons';

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  sizes?: string[];
}

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high';
type CategoryFilter = 'all' | 'tshirts' | 'hoodies' | 'cargos' | 'jackets';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'cargos', label: 'Cargos' },
  { id: 'jackets', label: 'Jackets' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRICE_RANGES = [
  { min: 0, max: 500, label: '₹0 - ₹500' },
  { min: 500, max: 1000, label: '₹500 - ₹1,000' },
  { min: 1000, max: 2000, label: '₹1,000 - ₹2,000' },
  { min: 2000, max: 999999, label: '₹2,000+' },
];

export default function ShopPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Category filter
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Price filter
    if (selectedPrices.length > 0) {
      result = result.filter((p) =>
        selectedPrices.some((priceRange) => {
          const range = PRICE_RANGES[priceRange];
          return p.price >= range.min && p.price <= range.max;
        })
      );
    }

    // Sort
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.reverse();
        break;
      case 'featured':
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, category, sort, selectedSizes, selectedPrices]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const togglePrice = (index: number) => {
    setSelectedPrices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <div className="min-h-screen bg-bjrng-black text-bjrng-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
            <p className="text-white/60 text-sm">
              {filteredProducts.length} products
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id as CategoryFilter);
                  setSelectedPrices([]);
                  setSelectedSizes([]);
                }}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'text-bjrng-orange border-b-2 border-bjrng-orange'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block md:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* Sort */}
                <div>
                  <label className="text-xs font-semibold uppercase text-white/60 mb-3 block">
                    Sort
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Size Filter */}
                <div className="pb-6 border-b border-white/10">
                  <p className="text-xs font-semibold uppercase text-white/60 mb-3">
                    Size
                  </p>
                  <div className="space-y-2">
                    {SIZES.map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                          className="w-4 h-4 bg-white/10 border border-white/20 rounded checked:bg-bjrng-orange checked:border-bjrng-orange"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="pb-6 border-b border-white/10">
                  <p className="text-xs font-semibold uppercase text-white/60 mb-3">
                    Price
                  </p>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPrices.includes(idx)}
                          onChange={() => togglePrice(idx)}
                          className="w-4 h-4 bg-white/10 border border-white/20 rounded checked:bg-bjrng-orange checked:border-bjrng-orange"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                {(selectedSizes.length > 0 || selectedPrices.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedSizes([]);
                      setSelectedPrices([]);
                    }}
                    className="w-full text-xs text-bjrng-orange hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Mobile: Sort & Filter Bar */}
              <div className="flex md:hidden gap-3 mb-6">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <FilterIcon />
                </button>
              </div>

              {/* Mobile Filter Panel */}
              {showFilters && (
                <div className="md:hidden mb-6 p-4 bg-white/5 border border-white/10 rounded space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-white/60 mb-2">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            selectedSizes.includes(size)
                              ? 'bg-bjrng-orange text-black'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-white/60 mb-2">
                      Price
                    </p>
                    <div className="space-y-2">
                      {PRICE_RANGES.map((range, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(idx)}
                            onChange={() => togglePrice(idx)}
                            className="w-4 h-4 bg-white/10 border border-white/20 rounded checked:bg-bjrng-orange"
                          />
                          <span className="text-sm">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-white/60">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-bjrng-orange mb-4">{error}</p>
                  <p className="text-white/60 text-sm">
                    Check your Shopify configuration and try again.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: selectedSize,
    });
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer">
        {/* Image */}
        {product.image && (
          <div className="relative aspect-square mb-4 bg-white/5 rounded overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover group-hover:opacity-80 transition-opacity duration-300"
            />
          </div>
        )}

        {/* Info */}
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-bjrng-orange transition-colors">
          {product.title}
        </h3>
        <p className="text-white/60 text-sm mb-3">₹{product.price.toLocaleString()}</p>

        {/* Add to cart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}
          className="w-full bg-bjrng-orange text-bjrng-black py-2 text-xs font-semibold rounded hover:opacity-90 transition-opacity"
        >
          ADD TO CART
        </button>
      </div>
    </Link>
  );
}
