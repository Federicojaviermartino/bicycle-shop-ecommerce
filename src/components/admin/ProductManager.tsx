import { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { toast } from '../common';

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 'demo-bicycle-1',
        name: 'Custom Mountain Bike',
        description: 'Build your perfect mountain bike with premium components',
        categoryId: 'bicycles',
        basePrice: 299,
        isActive: true,
      },
      {
        id: 'demo-bicycle-2',
        name: 'City Commuter Bike',
        description: 'Perfect for urban commuting and leisure rides',
        categoryId: 'bicycles',
        basePrice: 249,
        isActive: true,
      },
    ];
    setProducts(mockProducts);
  }, []);
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowCreateForm(true);
  };
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
  };
  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    setLoading(true);
    try {
      if (editingProduct) {
        const updatedProduct = { ...editingProduct, ...productData };
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
      } else {
        const newProduct: Product = {
          ...productData,
          id: `product-${Date.now()}`,
        };
        setProducts((prev) => [...prev, newProduct]);
      }
      setShowCreateForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Product Management</h2>
        <button
          className="admin-content__action-btn admin-content__action-btn--primary"
          onClick={handleCreateProduct}
          disabled={loading}
        >
          ➕ Add New Product
        </button>
      </div>
      {loading && <div className="admin-content__loading">Loading products...</div>}
      <div className="admin-content__body">
        {products.length === 0 ? (
          <div className="admin-content__empty">
            <p>No products found. Create your first product to get started.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Base Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="admin-table__cell--primary">{product.name}</td>
                    <td className="admin-table__cell--description">{product.description}</td>
                    <td className="admin-table__cell--price">€{product.basePrice.toFixed(2)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          product.isActive
                            ? 'admin-status-badge--active'
                            : 'admin-status-badge--inactive'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => handleEditProduct(product)}
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="admin-table__action-btn admin-table__action-btn--delete"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreateForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingProduct(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
interface ProductFormProps {
  product: Product | null;
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  loading: boolean;
}
function ProductForm({ product, onSave, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || 'bicycles',
    basePrice: product?.basePrice || 0,
    isActive: product?.isActive ?? true,
  });

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Product name is required');
      return;
    }
    if (formData.basePrice < 0) {
      toast.warning('Base price must be positive');
      return;
    }
    onSave(formData);
  };
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">{product ? 'Edit Product' : 'Create New Product'}</h3>
          <button className="admin-modal__close" onClick={onCancel}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-form__group">
            <label className="admin-form__label">Product Name *</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Description</label>
            <textarea
              className="admin-form__textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="admin-form__row">
            <div className="admin-form__group">
              <label className="admin-form__label">Category</label>
              <select
                className="admin-form__select"
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                disabled={loading}
              >
                <option value="bicycles">Bicycles</option>
                <option value="skis">Skis</option>
                <option value="surfboards">Surfboards</option>
              </select>
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label">Base Price (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="admin-form__input"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    basePrice: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="admin-form__group">
            <label className="admin-form__checkbox-label">
              <input
                type="checkbox"
                className="admin-form__checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                disabled={loading}
              />
              Active
            </label>
          </div>
          <div className="admin-modal__actions">
            <button
              type="button"
              className="admin-modal__btn admin-modal__btn--cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal__btn admin-modal__btn--save"
              disabled={loading}
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
