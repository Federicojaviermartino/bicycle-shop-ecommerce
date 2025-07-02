    import { useState, useEffect, useCallback } from 'react';
    import type { ConfigurationSelection, PartType, PartOption, ConfigurationValidation } from '../types';
    import { apiService } from '../services/api';
    export function useProductConfiguration(productId: string) {
    const [partTypes, setPartTypes] = useState<PartType[]>([]);
    const [partOptions, setPartOptions] = useState<Record<string, PartOption[]>>({});
    const [selections, setSelections] = useState<ConfigurationSelection[]>([]);
    const [validation, setValidation] = useState<ConfigurationValidation>({
        isValid: false,
        errors: [],
        totalPrice: 0
    });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!productId) return;
        const loadPartTypes = async () => {
        setLoading(true);
        try {
            const productResponse = await apiService.getProduct(productId);
            if (productResponse.success && productResponse.data) {
            const partTypesResponse = await apiService.getPartTypes(productResponse.data.categoryId);
            if (partTypesResponse.success && partTypesResponse.data) {
                setPartTypes(partTypesResponse.data.sort((a, b) => a.displayOrder - b.displayOrder));
            }
            }
        } finally {
            setLoading(false);
        }
        };
        loadPartTypes();
    }, [productId]);
    const loadPartOptions = useCallback(async (partTypeId: string) => {
        const response = await apiService.getPartOptions(partTypeId, selections);
        if (response.success && response.data) {
        setPartOptions(prev => ({
            ...prev,
            [partTypeId]: response.data!
        }));
        }
    }, [selections]);
    useEffect(() => {
        const loadAllOptions = async () => {
        for (const partType of partTypes) {
            await loadPartOptions(partType.id);
        }
        };
        if (partTypes.length > 0) {
        loadAllOptions();
        }
    }, [partTypes, loadPartOptions]);
    useEffect(() => {
        const validateSelections = async () => {
        if (selections.length === 0) {
            setValidation({ isValid: false, errors: [], totalPrice: 0 });
            return;
        }
        const response = await apiService.validateConfiguration(productId, selections);
        if (response.success && response.data) {
            setValidation(response.data);
        }
        };
        if (productId && selections.length > 0) {
        validateSelections();
        }
    }, [productId, selections]);
    const updateSelection = (partTypeId: string, partOptionId: string, quantity: number = 1) => {
        setSelections(prev => {
        const existingIndex = prev.findIndex(s => s.partTypeId === partTypeId);
        if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { partTypeId, partOptionId, quantity };
            return updated;
        } else {
            return [...prev, { partTypeId, partOptionId, quantity }];
        }
        });
    };
    const removeSelection = (partTypeId: string) => {
        setSelections(prev => prev.filter(s => s.partTypeId !== partTypeId));
    };
    const getSelectedOption = (partTypeId: string): string | null => {
        const selection = selections.find(s => s.partTypeId === partTypeId);
        return selection?.partOptionId || null;
    };
    const getAvailableOptions = (partTypeId: string): PartOption[] => {
        return partOptions[partTypeId] || [];
    };
    return {
        partTypes,
        selections,
        validation,
        loading,
        updateSelection,
        removeSelection,
        getSelectedOption,
        getAvailableOptions,
    };
    }
