import { styles } from '@/assets/styles/home.styles';
import BalanceCard from '@/components/BalanceCard';
import PageLoader from '@/components/PageLoader';
import { SignOutButton } from '@/components/SignOutButton';
import TransactionItem from '@/components/TransactionItem';
import useTransactions from '@/hooks/useTransactions';
import { Transaction } from '@/hooks/useTransactions';
import { useSession, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, FlatList, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function Page() {
  // ─────────────────────────────────────────────
  // HOOKS
  // ─────────────────────────────────────────────

  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  // Logs de debug pour suivre la session et l'utilisateur
  console.log("Session courante :", session?.currentTask);
  console.log("User ID :", user?.id);

  // Récupère les données de transactions — userId peut être undefined
  // tant que Clerk n'est pas encore chargé
  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user?.id ?? "");

  // Charge les données au montage du composant et à chaque changement de loadData
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Logs de debug pour suivre les données chargées
  console.log("Transactions :", transactions);
  console.log("Résumé :", summary);

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────

  // Demande confirmation avant de supprimer une transaction
  const handleDelete = (id: number): void => {
    Alert.alert(
      "Supprimer la transaction",
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteTransaction(id) },
      ]
    );
  };

  // ─────────────────────────────────────────────
  // ÉTATS DE CHARGEMENT
  // ─────────────────────────────────────────────

  // Affiche un loader pendant le chargement des données
  if (isLoading) return <PageLoader />;

  // ─────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* ── HEADER ── */}
        <View style={styles.header}>

          {/* Gauche : logo + message de bienvenue */}
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>

          {/* Droite : bouton ajout + déconnexion */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        {/* ── BALANCE CARD ── */}
        <BalanceCard summary={summary} />

        {/* ── TITRE SECTION TRANSACTIONS ── */}
        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
      </View>

      {/* ── LISTE DES TRANSACTIONS ── */}
      <FlatList<Transaction>
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDelete} />
        )}
      />
    </View>
  );
}