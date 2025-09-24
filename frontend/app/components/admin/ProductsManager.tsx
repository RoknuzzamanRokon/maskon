"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataTable, Column } from "./DataTable";
import { getProducts, deleteProduct, updateProduct } from "../../lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  is_active: boolean;
  discount?: number;
  image_url?: string;
  image_urls?: string[];
  images?: Array<{ image_url: string; is_primary: boolean }>;
  created_at: string;
  updated_at?: string;
}

interface ProductsManagerProps {
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  className?: string;
}

export function ProductsManager({
  onEdit,
  onView,
  className = "",
}: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(100); // Get more products for management
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setMessage("Product deleted successfully!");
      setProducts(products.filter((p) => p.id !== product.id));
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage("Error deleting product");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected products?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map((product) => deleteProduct(product.id))
      );
      setMessage(`${selectedProducts.length} products deleted successfully!`);
      const deletedIds = selectedProducts.map((p) => p.id);
      setProducts(products.filter((p) => !deletedIds.includes(p.id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error deleting products:", error);
      setMessage("Error deleting some products");
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedProducts.length === 0) return;

    const action = isActive ? "activate" : "deactivate";
    if (
      !confirm(
        `Are you sure you want to ${action} ${selectedProducts.length} selected products?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map((product) =>
          updateProduct(product.id, { ...product, is_active: isActive })
        )
      );
      setMessage(
        `${selectedProducts.length} products ${action}d successfully!`
      );
      setProducts(
        products.map((product) =>
          selectedProducts.some((selected) => selected.id === product.id)
            ? { ...product, is_active: isActive }
            : product
        )
      );
      setSelectedProducts([]);
    } catch (error) {
      console.error(`Error ${action}ing products:`, error);
      setMessage(`Error ${action}ing some products`);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const updatedProduct = await updateProduct(product.id, {
        ...product,
        is_active: !product.is_active,
      });
      setMessage(
        `Product ${
          product.is_active ? "deactivated" : "activated"
        } successfully!`
      );
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      setMessage("Error updating product status");
    }
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.is_primary);
      return primary ? primary.image_url : product.images[0].image_url;
    } else if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    } else if (product.image_url) {
      return product.image_url;
    }
    return null;
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) =>
        statusFilter === "active" ? product.is_active : !product.is_active
      );
    }

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, categoryFilter, statusFilter, searchValue]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    return uniqueCategories.sort();
  }, [products]);

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (_, product) => (
        <div className="flex items-center">
          {(() => {
            const imageUrl = getProductImage(product);
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="h-12 w-12 rounded-lg object-cover mr-4"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-4">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            );
          })()}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {product.description
                ? product.description.substring(0, 50) + "..."
                : "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (category) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            category === "electronics"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
              : category === "clothing"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
              : category === "books"
              ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300"
              : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300"
          }`}
        >
          {category}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (_, product) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            ${product.price}
          </span>
          {product.discount && (
            <span className="text-xs text-red-600 dark:text-red-400">
              -{product.discount}% off
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (stock) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            stock > 10
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
              : stock > 0
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
          }`}
        >
          {stock} units
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              product.is_active
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            }`}
          >
            {product.is_active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleProductStatus(product)}
            className={`text-xs px-2 py-1 rounded ${
              product.is_active
                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
            }`}
          >
            {product.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onView?.(product)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
          >
            👁️ View
          </button>
          <button
            onClick={() => onEdit?.(product)}
            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(product)}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
          >
            🗑️ Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your products ({filteredProducts.length} total)
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/admin/products/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes("Error")
              ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
              : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedProducts.length} selected
            </span>
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              ✅ Activate
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              ⏸️ Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={paginatedProducts}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
        searchable={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredProducts.length / pageSize),
          pageSize,
          totalItems: filteredProducts.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        emptyMessage="No products found"
      />
    </div>
  );
}
