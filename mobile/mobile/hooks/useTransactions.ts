import { useCallback, useState } from "react";
import { Alert } from "react-native";

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

const API = "http://localhost:4000/api";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

// Type d'une transaction individuelle
export interface Transaction {
  id: number;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  created_at: string;
}

// Type du résumé financier
export interface Summary {
  balance: number;
  income: number;
  expenses: number;
}

// ─────────────────────────────────────────────
// HOOK : useTransactions
// Gère la récupération, le chargement et la
// suppression des transactions d'un utilisateur
// ─────────────────────────────────────────────

const useTransactions = (userId: string) => {

  // Liste des transactions de l'utilisateur
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Résumé financier : solde, revenus, dépenses
  const [summary, setSummary] = useState<Summary>({
    balance: 0,
    income: 0,
    expenses: 0,
  });

  // Indicateur de chargement global
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─────────────────────────────────────────────
  // Récupère la liste des transactions
  // useCallback évite de recréer la fonction à
  // chaque re-render si userId n'a pas changé
  // ─────────────────────────────────────────────
  const fetchTransactions = useCallback(async (): Promise<void> => {
    try {
      console.log("Chargement des transactions pour :", userId);

      const response = await fetch(`${API}/transactions/${userId}`);

      // Vérifie que la requête a réussi (status 2xx)
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

      const data: Transaction[] = await response.json();

      setTransactions(data);
      console.log("Transactions chargées ✅", data);

    } catch (err) {
      console.error("Erreur lors du chargement des transactions :", err);
      throw err; // Remonte l'erreur pour que loadData puisse la gérer
    }
  }, [userId]);

  // ─────────────────────────────────────────────
  // Récupère le résumé financier de l'utilisateur
  // ─────────────────────────────────────────────
  const fetchSummary = useCallback(async (): Promise<void> => {
    try {
      console.log("Chargement du résumé financier pour :", userId);

      const response = await fetch(`${API}/transactions/summary/${userId}`);

      // Vérifie que la requête a réussi (status 2xx)
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

      const data: Summary = await response.json();

      setSummary(data);
      console.log("Résumé financier chargé ✅", data);

    } catch (err) {
      console.error("Erreur lors du chargement du résumé :", err);
      throw err; // Remonte l'erreur pour que loadData puisse la gérer
    }
  }, [userId]);

  // ─────────────────────────────────────────────
  // Charge toutes les données en parallèle
  // Promise.all lance les deux requêtes simultanément
  // pour réduire le temps de chargement
  // ─────────────────────────────────────────────
  const loadData = useCallback(async (): Promise<void> => {
    // Ne rien faire si l'userId n'est pas encore disponible
    if (!userId) return;

    setIsLoading(true);

    try {
      console.log("Chargement de toutes les données...");

      // Lance les deux requêtes en même temps (plus rapide qu'en séquence)
      await Promise.all([fetchTransactions(), fetchSummary()]);

      console.log("Toutes les données chargées ✅");

    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      // Toujours désactiver le loader, même en cas d'erreur
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  // ─────────────────────────────────────────────
  // Supprime une transaction par son ID
  // puis rafraîchit les données automatiquement
  // ─────────────────────────────────────────────
  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      console.log("Suppression de la transaction :", id);

      const response = await fetch(`${API}/transactions/${id}`, {
        method: "DELETE",
      });

      // Vérifie que la suppression a réussi (status 2xx)
      if (!response.ok) throw new Error(`Échec de la suppression (status : ${response.status})`);

      console.log("Transaction supprimée ✅ — rechargement des données...");

      // Rafraîchit les données après suppression
      await loadData();

      Alert.alert("Succès", "Transaction supprimée avec succès");

    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error);
      Alert.alert("Erreur", error.message || "Impossible de supprimer la transaction");
    }
  };

  // Expose les données et les actions au composant qui utilise ce hook
  return { transactions, summary, isLoading, loadData, deleteTransaction };
};

export default useTransactions;