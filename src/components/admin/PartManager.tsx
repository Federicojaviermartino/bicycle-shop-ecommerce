import React, { useState } from 'react';
import type { PartType, PartOption } from '../../backend/types/domain';
interface UIConstraintRule {
  id: string;
  name: string;
  description?: string;
  constraintType: 'REQUIRED_COMBINATION' | 'FORBIDDEN_COMBINATION' | 'CONDITIONAL_AVAILABILITY';
  isActive: boolean;
  triggerConditions: string[];
  effects: string[];
}
interface UIPricingRule {
  id: string;
  name: string;
  description?: string;
  productCategoryId: string;
  ruleType: 'FLAT_ADDITION' | 'PERCENTAGE_MARKUP' | 'REPLACEMENT_PRICE' | 'CONDITIONAL_PRICE';
  priority: number;
  isActive: boolean;
  conditions: string[];
  effects: string[];
}
interface PricingRuleFormData {
  name: string;
  description: string;
  ruleType: UIPricingRule['ruleType'];
  priority: number;
  isActive: boolean;
}
const mockPartTypes: PartType[] = [
  {
    id: '1',
    name: 'Frame',
    description: 'Bicycle frame types',
    productCategoryId: 'bicycles',
    isRequired: true,
    displayOrder: 1,
  },
  {
    id: '2',
    name: 'Wheels',
    description: 'Wheel sets and tires',
    productCategoryId: 'bicycles',
    isRequired: true,
    displayOrder: 2,
  },
  {
    id: '3',
    name: 'Chain',
    description: 'Drive chain options',
    productCategoryId: 'bicycles',
    isRequired: true,
    displayOrder: 3,
  },
  {
    id: '4',
    name: 'Brakes',
    description: 'Braking systems',
    productCategoryId: 'bicycles',
    isRequired: true,
    displayOrder: 4,
  },
  {
    id: '5',
    name: 'Finish',
    description: 'Paint and coating options',
    productCategoryId: 'bicycles',
    isRequired: false,
    displayOrder: 5,
  },
];
const mockPartOptions: PartOption[] = [
  {
    id: '1',
    name: 'Road Frame',
    description: 'Lightweight racing frame',
    partTypeId: '1',
    basePrice: 800,
    isActive: true,
    inStock: true,
    stockCount: 15,
  },
  {
    id: '2',
    name: 'Mountain Frame',
    description: 'Full-suspension trail frame',
    partTypeId: '1',
    basePrice: 1200,
    isActive: true,
    inStock: true,
    stockCount: 8,
  },
  {
    id: '3',
    name: 'Road Wheels (700c)',
    description: 'Lightweight carbon wheels',
    partTypeId: '2',
    basePrice: 600,
    isActive: true,
    inStock: true,
    stockCount: 12,
  },
  {
    id: '4',
    name: 'Mountain Wheels (29")',
    description: 'Tubeless ready trail wheels',
    partTypeId: '2',
    basePrice: 750,
    isActive: true,
    inStock: false,
    stockCount: 0,
  },
  {
    id: '5',
    name: 'Standard Chain',
    description: '11-speed chain',
    partTypeId: '3',
    basePrice: 120,
    isActive: true,
    inStock: true,
    stockCount: 25,
  },
  {
    id: '6',
    name: 'High-Performance Chain',
    description: 'Ceramic bearing chain',
    partTypeId: '3',
    basePrice: 280,
    isActive: true,
    inStock: true,
    stockCount: 5,
  },
];
interface PartOptionFormData {
  name: string;
  description: string;
  partTypeId: string;
  basePrice: number;
  isActive: boolean;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
}
export function PartManager() {
  const [partTypes] = useState<PartType[]>(mockPartTypes);
  const [partOptions, setPartOptions] = useState<PartOption[]>(mockPartOptions);
  const [selectedPartType, setSelectedPartType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<PartOption | null>(null);
  const [formData, setFormData] = useState<PartOptionFormData>({
    name: '',
    description: '',
    partTypeId: '',
    basePrice: 0,
    isActive: true,
    inStock: true,
    stockCount: 0,
    imageUrl: '',
  });
  const filteredOptions = selectedPartType
    ? partOptions.filter((option) => option.partTypeId === selectedPartType)
    : partOptions;
  const handleOpenModal = (option?: PartOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        name: option.name,
        description: option.description || '',
        partTypeId: option.partTypeId,
        basePrice: option.basePrice,
        isActive: option.isActive,
        inStock: option.inStock,
        stockCount: option.stockCount || 0,
        imageUrl: option.imageUrl || '',
      });
    } else {
      setEditingOption(null);
      setFormData({
        name: '',
        description: '',
        partTypeId: selectedPartType || partTypes[0]?.id || '',
        basePrice: 0,
        isActive: true,
        inStock: true,
        stockCount: 0,
        imageUrl: '',
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOption(null);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOption) {
      setPartOptions((prev) =>
        prev.map((option) => (option.id === editingOption.id ? { ...option, ...formData } : option))
      );
    } else {
      const newOption: PartOption = {
        id: Date.now().toString(),
        ...formData,
      };
      setPartOptions((prev) => [...prev, newOption]);
    }
    handleCloseModal();
  };
  const handleToggleActive = (option: PartOption) => {
    setPartOptions((prev) =>
      prev.map((opt) => (opt.id === option.id ? { ...opt, isActive: !opt.isActive } : opt))
    );
  };
  const getPartTypeName = (partTypeId: string) => {
    return partTypes.find((type) => type.id === partTypeId)?.name || 'Unknown';
  };
  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Parts & Options Management</h2>
        <div className="admin-content__actions">
          <select
            value={selectedPartType}
            onChange={(e) => setSelectedPartType(e.target.value)}
            className="admin-content__filter-select"
          >
            <option value="">All Part Types</option>
            {partTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <button
            className="admin-content__action-btn admin-content__action-btn--primary"
            onClick={() => handleOpenModal()}
          >
            ➕ Add Part Option
          </button>
        </div>
      </div>
      <div className="admin-content__body">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Part Type</th>
                <th>Base Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOptions.map((option) => (
                <tr key={option.id}>
                  <td>
                    <div className="admin-table__primary-text">{option.name}</div>
                    {option.description && (
                      <div className="admin-table__secondary-text">{option.description}</div>
                    )}
                  </td>
                  <td>{getPartTypeName(option.partTypeId)}</td>
                  <td>€{option.basePrice.toFixed(2)}</td>
                  <td>
                    <div className="admin-table__stock">
                      <span
                        className={`admin-table__stock-badge ${option.inStock ? 'in-stock' : 'out-of-stock'}`}
                      >
                        {option.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                      {option.stockCount !== undefined && (
                        <span className="admin-table__stock-count">({option.stockCount})</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-table__status-badge ${option.isActive ? 'active' : 'inactive'}`}
                    >
                      {option.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => handleOpenModal(option)}
                        title="Edit option"
                      >
                        ✏️
                      </button>
                      <button
                        className={`admin-table__action-btn ${option.isActive ? 'admin-table__action-btn--deactivate' : 'admin-table__action-btn--activate'}`}
                        onClick={() => handleToggleActive(option)}
                        title={option.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {option.isActive ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingOption ? 'Edit Part Option' : 'Add New Part Option'}
              </h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Name *</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Part Type *</label>
                  <select
                    className="admin-form__select"
                    value={formData.partTypeId}
                    onChange={(e) => setFormData({ ...formData, partTypeId: e.target.value })}
                    required
                  >
                    <option value="">Select Part Type</option>
                    {partTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Description</label>
                <textarea
                  className="admin-form__textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Base Price (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-form__input"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-form__input"
                    value={formData.stockCount}
                    onChange={(e) =>
                      setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Image URL</label>
                <input
                  type="url"
                  className="admin-form__input"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-form__checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-form__checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    />
                    In Stock
                  </label>
                </div>
              </div>
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-modal__btn admin-modal__btn--cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-modal__btn admin-modal__btn--save">
                  {editingOption ? 'Update Option' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export function PricingRuleManager() {
  const [pricingRules, setPricingRules] = useState<UIPricingRule[]>([
    {
      id: '1',
      name: 'Frame Finish Premium',
      description: 'Matte finish costs more on larger frames',
      productCategoryId: 'bicycles',
      ruleType: 'PERCENTAGE_MARKUP' as const,
      priority: 1,
      isActive: true,
      conditions: ['Frame: Mountain Frame', 'Finish: Matte'],
      effects: ['+15% to Finish price'],
    },
    {
      id: '2',
      name: 'High-Performance Bundle',
      description: 'Discount when selecting all premium components',
      productCategoryId: 'bicycles',
      ruleType: 'FLAT_ADDITION' as const,
      priority: 2,
      isActive: true,
      conditions: ['Chain: High-Performance', 'Wheels: Carbon'],
      effects: ['-€200 total price'],
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UIPricingRule | null>(null);
  const [formData, setFormData] = useState<PricingRuleFormData>({
    name: '',
    description: '',
    ruleType: 'PERCENTAGE_MARKUP',
    priority: 1,
    isActive: true,
  });
  const handleOpenModal = (rule?: UIPricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        ruleType: rule.ruleType,
        priority: rule.priority,
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        ruleType: 'PERCENTAGE_MARKUP',
        priority: 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      setPricingRules((prev) =>
        prev.map((rule) => (rule.id === editingRule.id ? { ...rule, ...formData } : rule))
      );
    } else {
      const newRule: UIPricingRule = {
        id: Date.now().toString(),
        ...formData,
        productCategoryId: 'bicycles',
        conditions: [],
        effects: [],
      };
      setPricingRules((prev) => [...prev, newRule]);
    }
    handleCloseModal();
  };
  const handleToggleActive = (rule: UIPricingRule) => {
    setPricingRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r))
    );
  };
  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Pricing Rules Management</h2>
        <button
          className="admin-content__action-btn admin-content__action-btn--primary"
          onClick={() => handleOpenModal()}
        >
          ➕ Create New Pricing Rule
        </button>
      </div>
      <div className="admin-content__body">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Conditions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <div className="admin-table__primary-text">{rule.name}</div>
                    {rule.description && (
                      <div className="admin-table__secondary-text">{rule.description}</div>
                    )}
                  </td>
                  <td>
                    <span className="admin-table__tag">{rule.ruleType.replace('_', ' ')}</span>
                  </td>
                  <td>{rule.priority}</td>
                  <td>
                    <div className="admin-table__conditions">
                      {rule.conditions.map((condition: string, index: number) => (
                        <span key={index} className="admin-table__condition-tag">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-table__status-badge ${rule.isActive ? 'active' : 'inactive'}`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => handleOpenModal(rule)}
                        title="Edit rule"
                      >
                        ✏️
                      </button>
                      <button
                        className={`admin-table__action-btn ${rule.isActive ? 'admin-table__action-btn--deactivate' : 'admin-table__action-btn--activate'}`}
                        onClick={() => handleToggleActive(rule)}
                        title={rule.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {rule.isActive ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="admin-form__group">
                <label className="admin-form__label">Rule Name *</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Description</label>
                <textarea
                  className="admin-form__textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Rule Type *</label>
                  <select
                    className="admin-form__select"
                    value={formData.ruleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ruleType: e.target.value as UIPricingRule['ruleType'],
                      })
                    }
                    required
                  >
                    <option value="FLAT_ADDITION">Flat Addition</option>
                    <option value="PERCENTAGE_MARKUP">Percentage Markup</option>
                    <option value="REPLACEMENT_PRICE">Replacement Price</option>
                    <option value="CONDITIONAL_PRICE">Conditional Price</option>
                  </select>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Priority</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-form__input"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__checkbox-label">
                  <input
                    type="checkbox"
                    className="admin-form__checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-modal__btn admin-modal__btn--cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-modal__btn admin-modal__btn--save">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export function ConstraintManager() {
  const [constraints, setConstraints] = useState<UIConstraintRule[]>([
    {
      id: '1',
      name: 'Mountain Wheels Compatibility',
      description: 'Mountain wheels require full-suspension frame',
      constraintType: 'REQUIRED_COMBINATION',
      isActive: true,
      triggerConditions: ['Wheels: Mountain Wheels (29")'],
      effects: ['Requires: Mountain Frame'],
    },
    {
      id: '2',
      name: 'Road Frame Restriction',
      description: 'Road frames cannot use mountain wheels',
      constraintType: 'FORBIDDEN_COMBINATION',
      isActive: true,
      triggerConditions: ['Frame: Road Frame'],
      effects: ['Forbids: Mountain Wheels (29")'],
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<UIConstraintRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    constraintType: 'REQUIRED_COMBINATION' as UIConstraintRule['constraintType'],
    isActive: true,
  });
  const handleOpenModal = (constraint?: UIConstraintRule) => {
    if (constraint) {
      setEditingConstraint(constraint);
      setFormData({
        name: constraint.name,
        description: constraint.description || '',
        constraintType: constraint.constraintType,
        isActive: constraint.isActive,
      });
    } else {
      setEditingConstraint(null);
      setFormData({
        name: '',
        description: '',
        constraintType: 'REQUIRED_COMBINATION',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConstraint(null);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConstraint) {
      setConstraints((prev) =>
        prev.map((constraint) =>
          constraint.id === editingConstraint.id ? { ...constraint, ...formData } : constraint
        )
      );
    } else {
      const newConstraint: UIConstraintRule = {
        id: Date.now().toString(),
        ...formData,
        triggerConditions: [],
        effects: [],
      };
      setConstraints((prev) => [...prev, newConstraint]);
    }
    handleCloseModal();
  };
  const handleToggleActive = (constraint: UIConstraintRule) => {
    setConstraints((prev) =>
      prev.map((c) => (c.id === constraint.id ? { ...c, isActive: !c.isActive } : c))
    );
  };
  return (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2 className="admin-content__title">Business Rules & Constraints</h2>
        <button
          className="admin-content__action-btn admin-content__action-btn--primary"
          onClick={() => handleOpenModal()}
        >
          ➕ Add New Constraint
        </button>
      </div>
      <div className="admin-content__body">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Constraint Name</th>
                <th>Type</th>
                <th>Trigger Conditions</th>
                <th>Effects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {constraints.map((constraint) => (
                <tr key={constraint.id}>
                  <td>
                    <div className="admin-table__primary-text">{constraint.name}</div>
                    {constraint.description && (
                      <div className="admin-table__secondary-text">{constraint.description}</div>
                    )}
                  </td>
                  <td>
                    <span className="admin-table__tag">
                      {constraint.constraintType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__conditions">
                      {constraint.triggerConditions.map((condition: string, index: number) => (
                        <span key={index} className="admin-table__condition-tag">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__conditions">
                      {constraint.effects.map((effect: string, index: number) => (
                        <span key={index} className="admin-table__effect-tag">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-table__status-badge ${constraint.isActive ? 'active' : 'inactive'}`}
                    >
                      {constraint.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => handleOpenModal(constraint)}
                        title="Edit constraint"
                      >
                        ✏️
                      </button>
                      <button
                        className={`admin-table__action-btn ${constraint.isActive ? 'admin-table__action-btn--deactivate' : 'admin-table__action-btn--activate'}`}
                        onClick={() => handleToggleActive(constraint)}
                        title={constraint.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {constraint.isActive ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingConstraint ? 'Edit Constraint' : 'Create New Constraint'}
              </h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="admin-form__group">
                <label className="admin-form__label">Constraint Name *</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Description</label>
                <textarea
                  className="admin-form__textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Constraint Type *</label>
                <select
                  className="admin-form__select"
                  value={formData.constraintType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraintType: e.target.value as UIConstraintRule['constraintType'],
                    })
                  }
                  required
                >
                  <option value="REQUIRED_COMBINATION">Required Combination</option>
                  <option value="FORBIDDEN_COMBINATION">Forbidden Combination</option>
                  <option value="CONDITIONAL_AVAILABILITY">Conditional Availability</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__checkbox-label">
                  <input
                    type="checkbox"
                    className="admin-form__checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-modal__btn admin-modal__btn--cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-modal__btn admin-modal__btn--save">
                  {editingConstraint ? 'Update Constraint' : 'Create Constraint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
