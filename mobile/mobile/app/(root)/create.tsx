import { styles } from '@/assets/styles/create.styles';
import { COLORS } from '@/constants/colors';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';


// Type d'une catégorie de transaction
interface Category {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "foods",          name: "Food & Drinks",  icon: "fast-food"          },
  { id: "shopping",       name: "Shopping",        icon: "cart"               },
  { id: "transportation", name: "Transportation",  icon: "car"                },
  { id: "entertainment",  name: "Entertainment",   icon: "film"               },
  { id: "bills",          name: "Bills",           icon: "receipt"            },
  { id: "income",         name: "Income",          icon: "cash"               },
  { id: "other",          name: "Other",           icon: "ellipsis-horizontal"},
];

const API_URL = "https://react-native-e-wallet.onrender.com/api";

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  // et non les wrappers objets (String, Number, Boolean)
  const [title, setTitle]                   = useState<string>("");
  const [amount, setAmount]                 = useState<string>("");   
  const [selectedCategory, setSelectedCategory] = useState<string>(""); 
  const [isExpense, setIsExpense]           = useState<boolean>(true);
  const [isLoading, setIsLoading]           = useState<boolean>(false);

  // ─────────────────────────────────────────────
  // Crée une nouvelle transaction
  // ─────────────────────────────────────────────
  const handleCreate = async (): Promise<void> => {

    // Validation des champs avant envoi
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un titre pour la transaction");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Erreur", "Veuillez sélectionner une catégorie");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Création de la transaction...");

      // Montant négatif pour une dépense, positif pour un revenu
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        :  Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          title,
          amount: formattedAmount,
          category: selectedCategory,
        }),
      });

      // Vérifie que la requête a réussi (status 2xx)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création de la transaction");
      }

      console.log("Transaction créée ");
      Alert.alert("Succès", "Transaction créée avec succès");

      // Retourne à la page précédente après succès
      router.back();

    } catch (error: any) {
      console.error("Erreur lors de la création de la transaction :", error);
      Alert.alert("Erreur", error.message || "Échec de la création de la transaction");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Transaction</Text>

        {/* Bouton sauvegarder — désactivé pendant le chargement */}
        <TouchableOpacity
          style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      {/* ── CARD PRINCIPALE ── */}
      <View style={styles.card}>

        {/* Sélecteur Dépense / Revenu */}
        <View style={styles.typeSelector}>

          {/* Bouton Dépense */}
          <TouchableOpacity
            style={[styles.typeButton, isExpense && styles.typeButtonActive]}
            onPress={() => setIsExpense(true)}
          >
            <Ionicons name="arrow-down-circle" size={22} color={isExpense ? COLORS.white : COLORS.expense} />
            <Text style={[styles.typeButtonText, isExpense && styles.typeButtonActive]}>
              Expense
            </Text>
          </TouchableOpacity>

          {/* Bouton Revenu */}
          <TouchableOpacity
            style={[styles.typeButton, !isExpense && styles.typeButtonActive]}
            onPress={() => setIsExpense(false)}
          >
            <Ionicons name="arrow-up-circle" size={22} color={!isExpense ? COLORS.white : COLORS.income} />
            <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Champ montant */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={COLORS.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Champ titre */}
        <View style={styles.inputContainer}>
          <Ionicons name="create-outline" size={22} color={COLORS.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Transaction title"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Titre section catégories */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="pricetag-outline" size={18} color={COLORS.text} /> Category
        </Text>

        {/* Grille des catégories */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.name ? COLORS.white : COLORS.text}
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.name && styles.categoryButtonTextActive,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

export default CreateScreen;