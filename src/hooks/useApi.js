import { useState, useCallback } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Une erreur s'est produite";
      setError(errorMessage);
      if (onError) onError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
}

// Hook spécialisé pour les opérations CRUD
export function useCrud(apiMethods) {
  const { loading, error, execute, setError } = useApi();
  const [data, setData] = useState([]);

  const fetchAll = useCallback(async () => {
    return execute(
      apiMethods.getAll,
      (result) => setData(result),
      (error) => console.error("Erreur lors du chargement:", error)
    );
  }, [execute, apiMethods.getAll]);

  const create = useCallback(async (item) => {
    return execute(
      () => apiMethods.create(item),
      (newItem) => setData(prev => [...prev, newItem]),
      (error) => console.error("Erreur lors de la création:", error)
    );
  }, [execute, apiMethods, apiMethods.create]);

  const update = useCallback(async (id, item) => {
    return execute(
      () => apiMethods.update(id, item),
      (updatedItem) => setData(prev => prev.map(i => i._id === id ? updatedItem : i)),
      (error) => console.error("Erreur lors de la mise à jour:", error)
    );
  }, [execute, apiMethods, apiMethods.update]);

  const remove = useCallback(async (id) => {
    return execute(
      () => apiMethods.delete(id),
      () => setData(prev => prev.filter(i => i._id !== id)),
      (error) => console.error("Erreur lors de la suppression:", error)
    );
  }, [execute, apiMethods, apiMethods.delete]);

  return {
    data,
    loading,
    error,
    setError,
    fetchAll,
    create,
    update,
    remove
  };
}
